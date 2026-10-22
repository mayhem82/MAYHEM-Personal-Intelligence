# MAYHEM Personal Intelligence

Free, open-source, Android-first universal case intelligence system.

## Current prototype
`index.html` provides a responsive dashboard and synthetic-only evidence, witness, chronology and claims registers, plus a legal information gateway. Records are **in memory only** and disappear on refresh.

## Safety boundary
**Do not enter real case evidence, identities, witness contacts or children's information.** Authentication, encrypted storage, backup, case isolation, professional credential verification and secure AI processing have not been implemented or tested. GitHub contains source code only.

## Development gates
1. Privacy threat model and Australian legal review.
2. Authenticated case isolation and independently tested encrypted evidence storage.
3. Immutable originals, provenance, integrity hashes and append-only audit.
4. Recovery, retention, export and authorised sharing.
5. Evidence-linked analysis and verified legal professional referrals.
6. Security review before real-case deployment.

## Preview
Open `index.html` locally. GitHub Pages deployment has not been enabled or verified.

## Stage 2: encrypted vault laboratory
`vault-lab.html` demonstrates browser-local encrypted test-record persistence using WebCrypto AES-256-GCM and PBKDF2-SHA256 (600,000 iterations), IndexedDB, lock/unlock and encrypted JSON export. This is **not** audited or suitable for real evidence. There is no backup import, cross-device synchronisation, account authentication, server-side isolation or recovery. A passphrase or browser-data loss can make records unrecoverable. Use fictional records only.
