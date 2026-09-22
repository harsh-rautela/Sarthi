# Scheme ingestion

The production-safe pattern is:

1. Fetch only from permitted, authoritative government sources/APIs.
2. Store a raw snapshot and source URL.
3. Normalize data into the `Scheme` schema.
4. Mark imported records `verified: false`.
5. An admin reviews eligibility, benefits, documents and source links.
6. Only verified records appear in citizen recommendations.

Do not use an LLM as the final eligibility authority. AI can extract draft fields from an official document, but a verified structured rule is what the recommendation engine evaluates.
