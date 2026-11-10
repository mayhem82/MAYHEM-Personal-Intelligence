CLARITYPATH required AI / RESEARCH SERVICE

DEPLOY ON THE EXISTING SERVER HOST
The public application remains on GitHub Pages. It calls this separate server over HTTPS; Pages cannot execute Node.js or hold a private provider key.
For a Node.js host, use the repository root, Node.js 22 or later, no dependency install step, and start command: node service/server.mjs
Set HOST=0.0.0.0 and the PORT required by that host. Set the private provider key, model, service access key and ALLOWED_ORIGINS in the host's settings before routing traffic.
For this deployment the allowed public origin is https://mayhem82.github.io (origin only, without the repository path). A replica must use its own exact origin.
For a container host, build from the repository root: docker build -f service/Dockerfile -t claritypath-ai .
The allowlisted .dockerignore and Dockerfile include only server code. Secrets are runtime settings, never build arguments or image files. Container building has not been verified on this workstation.
Configure host health checks to GET /healthz. It returns 200 only when required local settings are present, otherwise 503. The public response contains only a readiness label; it does not test the provider, reveal keys or read case data.
Keep one service process until persistent quota/idempotency storage is configured; process-local caps cannot enforce a global limit across replicas or restarts.

VERIFY THE DEPLOYED CONNECTION
Privately set CLARITYPATH_AI_URL and SERVICE_ACCESS_KEY in a local process environment, then run npm run check:ai. It checks authenticated capabilities without a paid provider request or case data. Redirects are rejected; use the final HTTPS service URL.
In ClarityPath, open Storage & connections, enter the same URL and service access key, then Connect service. An unconfigured endpoint is rejected and any prior connection is cleared. Credentials stay in memory.
Configuration verification is separate from live provider verification. To test a provider call, create a clearly labelled synthetic situation and record, select only that record in Outputs, enter a summary question, review the payload and approve it. Check the returned record citation. Only that explicit request verifies an actual provider response; a health or capabilities check does not.

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

Private build specifications are never automatically included in a provider request. Only the explicitly reviewed selected payload is supplied.
