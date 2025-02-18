This is a simple React project for a Clinical Radiology ST1 interview preparation website, live at https://radiologyinterviewprep.com.

I've used Firebase for auth. and Stripe with a Cloudflare Worker for payments and subscriptions.

The question bank is hidden behind a paywall, and is actually a .docx document. It's maintained in Microsoft Word, converted to a string with a custom function (in Stringify.tsx) and stored in Cloudflare Workers KV. It's then retrieved for subscribers with the aforementioned Worker.

Firestore is optionally used to store each subscriber's progress as they make their way through the question bank.
