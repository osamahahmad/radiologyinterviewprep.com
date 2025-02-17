export default {

    async fetch(request, env, ctx) {
      const headers = { 'Access-Control-Allow-Origin': '*' }
  
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            ...headers,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }
  
      const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
  
      if (request.method === 'POST') {
        const STRIPE_WEBHOOK_SECRET_KEY = env.STRIPE_WEBHOOK_SECRET_KEY;
  
        const signature = request.headers.get('stripe-signature');
        const rawBody = await request.text();
  
        await env.SUBSCRIPTIONS.put('signature', signature);
        await env.SUBSCRIPTIONS.put('rawBody', rawBody);
  
        const verificationError = new Response(null, { status: 401 });
  
        if (!signature)
          return verificationError;
  
        const signatureParts = signature.split(',');
  
        const timestamp = signatureParts.find((part) => part.startsWith('t='))?.split('=')[1];
        const signatureHeader = signatureParts.find((part) => part.startsWith('v1='))?.split('=')[1];
  
        if (!timestamp || !signatureHeader)
          return verificationError;
  
        const signedPayload = `${timestamp}.${rawBody}`;
  
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(STRIPE_WEBHOOK_SECRET_KEY),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign'],
        );
  
        const givenSignature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload)));
  
        const expectedSignature = new Uint8Array(signatureHeader.length / 2);
        for (let i = 0; i < signatureHeader.length; i += 2) {
          expectedSignature[i / 2] = parseInt(signatureHeader.slice(i, i + 2), 16);
        }
  
        if (givenSignature.length !== expectedSignature.length)
          return verificationError;
  
        for (let i = 0; i < givenSignature.length; i++) {
          if (givenSignature[i] !== expectedSignature[i])
            return verificationError;
        }
  
        try {
          const event = JSON.parse(rawBody);
  
          if (event.type === 'checkout.session.completed') {
            await env.SUBSCRIPTIONS.put(event.data.object.client_reference_id, event.data.object.subscription);
            return new Response(null, { status: 200 });
          }
        } catch (err) {
          return new Response(null, { status: 400 });
        }
      }
  
      if (request.method === 'GET') {
        const url = new URL(request.url);
        const userUid = url.searchParams.get('user-uid');
        const subscriptionId = await env.SUBSCRIPTIONS.get(userUid);
  
        if (subscriptionId) {
          try {
            const subscriptionResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
              headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            });
            const subscriptionData = await subscriptionResponse.json();
  
            const data = {
              'cancel_at_period_end': subscriptionData.cancel_at_period_end,
              'current_period_end': subscriptionData.current_period_end
            };
  
            const subscriptionUpdateResponse = await fetch(`https://api.stripe.com/v1/billing_portal/sessions`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: `customer=${subscriptionData.customer}&return_url=https://radiologyinterviewprep.com/question-bank`,
            });
            const subscriptionUpdateData = await subscriptionUpdateResponse.json();
            data.url = subscriptionUpdateData.url;
  
            if (subscriptionData.status === 'active') {
              data['question-bank'] = await env.DATA.get('question-bank');
            }
  
            const response = new Response(JSON.stringify(data), { headers: headers, status: 200 });
            return response;
          } catch (err) {
            return new Response(null, { headers: headers, status: 400 });
          }
        } else
          return new Response('bad user-uid', { headers: headers, status: 404 });
      }
  
      return new Response('bad method', { headers: headers, status: 405 });
    },
  };