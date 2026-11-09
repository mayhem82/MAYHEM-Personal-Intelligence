CLARITYPATH OPTIONAL AI / RESEARCH SERVICE

Runtime: Node.js 22 or later. No third-party runtime dependencies.
Start: node service/server.mjs

Set these environment variables through your host's secret/settings interface:
OPENAI_API_KEY — actual provider key; never commit or paste into an AI conversation
OPENAI_MODEL — a model available to your account and supporting the chosen tools
SERVICE_ACCESS_KEY — a random secret of at least 24 characters, supplied privately in ClarityPath settings
ALLOWED_ORIGINS — comma-separated exact site origins, e.g. https://your-account.github.io
MAX_REQUESTS_PER_DAY — default 30; request count control, not a currency spending guarantee
HOST and PORT — host-specific bind settings; defaults 127.0.0.1:8787 for local use

For remote access deploy under your own account with HTTPS. The GitHub Pages deployment only hosts static files; it does not run this server. Never put the provider key in Pages source or public configuration.
Review the provider's current charges, privacy/retention terms and model availability. store:false does not by itself establish zero data retention. Set provider-side budget controls as well as the service request cap.

GET /capabilities and POST /assist require Authorization: Bearer <service access key>.
Only approved selected text is transmitted by /assist. Attachments are not automatically uploaded. The browser previews the actual JSON payload before approval.
The service does not receive a GitHub token, write case records, send messages or submit cases. It returns attributed drafts with source citations. Web retrieval is performed by the provider's supported web_search tool only when the owner selects live research.
No custom arbitrary URL-fetch proxy is exposed. Origin restriction and authentication are both enforced. A request ID is idempotent for the running service process; restarting clears its in-memory request cache and daily counter. Use a persistent gateway/quota store before relying on these controls across restarts or multiple instances.
Daily request caps are per process. No live provider test has occurred until a configured authorised request succeeds and is recorded in the release-status report.

Official API references:
https://developers.openai.com/api/docs/quickstart
https://developers.openai.com/api/docs/guides/tools-web-search

GITHUB STORAGE
The working static client uses an owner-supplied fine-grained token limited to the chosen private repository. This is the advanced static-site method specified in the product document. Automatic GitHub App sign-in is not implemented; do not advertise it. Private save/load uses Git blobs, a base tree, one commit and a non-forced branch update, with encrypted records and original chunks.
