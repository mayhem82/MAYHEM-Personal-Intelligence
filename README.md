# ClarityPath

Owner-controlled personal case workspace using the MAYHEM canonical Solicitors Advocate Engine contract.

## Use
Open index.html or workspace.html through an HTTP(S) server. The workspace starts empty. Read OPERATING-GUIDE.txt for entry, review, qualification, snapshots, analysis, source ingestion, canonical engine workflow, summaries, selected handoff, encryption and private storage.

## Build and replicate
build.html is the separate Build page. Copy or download build-pack.txt for the complete task, 31-section specification, supplied full MAYHEM canon, actual client/service source, included source-library metadata, operating guide, tests, dependency versions and release status. source-manifest.json records exact file hashes. No private case information or credentials are part of the pack.

## Runtime and tests
Node.js 22 or later for service, packaging and tests. The public application is static JavaScript with no remote runtime dependencies.

- node scripts/package-release.mjs — generate the self-contained pack and stage the explicit public file list in site/
- npm test — core, crypto, recovery, service and pack tests
- npm install — install the pinned Playwright development dependency for browser tests
- npx playwright install chromium — install Chromium where a supported browser is not already available
- npm run test:e2e — actual browser workflow and mobile-layout tests; Windows uses installed Edge
- node scripts/serve.mjs — serve the packaged site on localhost:8775
- npm run service — optional authenticated AI/research service; see service/README.txt

## Boundaries
GitHub private storage uses the advanced static-site method: an owner-supplied expiring fine-grained token restricted to the selected private repository. Token and decryption key remain in memory. Public repositories are rejected. Saves encrypt data and original chunks before upload, commit atomically and reject stale branch heads. Automatic GitHub App sign-in is not implemented.

The optional provider service is supplied as code. It must be separately deployed and configured under the actual owner's account. GitHub Pages does not execute a Node server. No real provider call or private repository is configured by this public source release.

The full MAYHEM canonical text is bundled unchanged. Library entries distinguish full included text from metadata-only external entry points. Case-specific legal passages are added to the private case library. No claim is made that every applicable law is already included.

Qualification, analysis provenance, obligation mapping and exposure assessment are operator-recorded. The application enforces the specified ordering and input boundaries and creates recipient-specific source-linked draft artefacts. It does not invent a Factual Strength formula or independently certify the operator's authority.

Selected ZIP handoffs are readable and explicitly approved before download. Encrypted full-workspace backups are separate. Do not confuse functional encryption tests with an independent security audit.

Read release-status.json for the current test evidence, configuration dependencies and incomplete specification items. No physical Android test is implied by desktop mobile-viewport tests.

The public NSW catalogue in app/nsw-catalogue.json is separate from private cases. It includes 729 situation/guide entries, 22 topic groups, 171 legislative reading links and 16 described escalation routes with sources, prerequisites and exceptions. Source titles are attributed; full external guide text is not bundled. Regenerate from the included source metadata with node scripts/build-nsw-catalogue.mjs.

© 2026 Julian Minko · Architect of MAYHEM · ClarityPath. Preserve the creator notice in replicated installations. External source material retains its own attribution.

The separate disclaimer.html page is linked throughout the site and included in the exact replication pack.

Installable app: manifest.webmanifest and sw.js use relative paths for GitHub Pages and replicated destinations. Homepage installation uses browser-native prompts with a manual fallback. Only the explicit public application shell enters Cache Storage. Icon assets are reproduced exactly from base64 blocks in the complete source pack.
