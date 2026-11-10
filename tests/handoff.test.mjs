import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../app/core.mjs';
import { makeHandoff, zip } from '../app/output.mjs';
import { protectHandoff, openProtectedHandoff } from '../app/protected-handoff.mjs';

test('protected selected handoff hides content, preserves exact ZIP bytes and records its revision', async () => {
  const state = C.empty(), caseId = C.id('CASE');
  await C.append(state, 'case.created', caseId, { id: caseId, title: 'Synthetic private case', background: 'Selected background', outcome: 'Selected outcome' });
  const original = new Uint8Array([0, 255, 17, 99, 0, 231]);
  const file = await C.addAttachment(new File([original], 'selected-original.bin'), caseId);
  state.attachments.push(file);
  const selectedId = C.id('ER'), excludedId = C.id('ER');
  for (const [id, text, attachments] of [[selectedId, 'Selected synthetic account', [file.id]], [excludedId, 'EXCLUDED PRIVATE ACCOUNT CANARY', []]]) {
    await C.append(state, 'record.created', caseId, { id, title: text, text, source: 'Synthetic source', date: '', precision: 'Unknown', certainty: 'Certain', corroboration: 'Unknown', dispute: 'Unknown', attachments, links: [] });
  }
  const otherId = C.id('CASE');
  await C.append(state, 'case.created', otherId, { id: otherId, title: 'OTHER CASE PRIVATE CANARY' });
  const view = C.caseView(state, caseId);
  view.records = view.records.filter(record => record.id === selectedId);
  view.sources = []; view.tasks = [];
  const bytes = await makeHandoff(state, view), readable = C.decode.decode(bytes);
  assert(readable.includes('Selected synthetic account'));
  assert(readable.includes(state.events.at(-1).hash));
  assert(readable.includes('sourceRevision'));
  assert(Buffer.from(bytes).includes(Buffer.from(original)));
  assert(!readable.includes('EXCLUDED PRIVATE ACCOUNT CANARY'));
  assert(!readable.includes('OTHER CASE PRIVATE CANARY'));
  const envelope = await protectHandoff(bytes, 'synthetic handoff passphrase');
  const serialized = JSON.stringify(envelope);
  for (const text of ['Synthetic private case', 'Selected background', 'selected-original.bin', 'Selected synthetic account', state.events.at(-1).hash]) assert(!serialized.includes(text));
  assert.deepEqual(await openProtectedHandoff(envelope, 'synthetic handoff passphrase'), bytes);
});

test('protected handoff rejects wrong passphrases, ciphertext changes and unsupported envelopes', async () => {
  const bytes = zip([{ name: 'README.txt', data: 'Synthetic protected handoff' }]);
  const envelope = await protectHandoff(bytes, 'synthetic handoff passphrase');
  await assert.rejects(openProtectedHandoff(envelope, 'wrong synthetic passphrase'), /unlock/);
  const damaged = structuredClone(envelope);
  damaged.payload.data = (damaged.payload.data[0] === 'A' ? 'B' : 'A') + damaged.payload.data.slice(1);
  await assert.rejects(openProtectedHandoff(damaged, 'synthetic handoff passphrase'), /authentication/);
  for (const invalid of [null, { ...envelope, format: 'future-format' }, { ...envelope, header: { ...envelope.header, iterations: 1e9 } }, { ...envelope, payload: { ...envelope.payload, context: 'portable-workspace' } }]) {
    await assert.rejects(openProtectedHandoff(invalid, 'synthetic handoff passphrase'), /supported protected/);
  }
  await assert.rejects(protectHandoff(new Uint8Array(30), 'synthetic handoff passphrase'), /ZIP handoff/);
  assert.deepEqual(await openProtectedHandoff(envelope, 'synthetic handoff passphrase'), bytes);
});
