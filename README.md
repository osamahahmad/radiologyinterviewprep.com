This is a simple React project for a Clinical Radiology ST1 interview preparation website, live at https://radiologyinterviewprep.com.

I've used Firebase for auth. and Stripe with a Cloudflare Worker for payments and subscriptions.

The question bank is a .docx document, created in Microsoft Word, converted to a string with a custom function (see Stringify.tsx) and stored on Cloudflare Workers KV.

Firestore is used to store each user's progress as they make their way through the question bank.
