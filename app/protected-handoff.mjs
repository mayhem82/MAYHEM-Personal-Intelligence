import { createVault, unlockVault, encrypt, decrypt } from './crypto.mjs';

const FORMAT = 'claritypath-protected-handoff-v1';
const CONTEXT = 'selected-handoff-zip-v1';
export const MAX_HANDOFF_BYTES = 200_000_000;
export const MAX_PROTECTED_FILE_BYTES = 270_000_000;

function checkArchive(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 22 || bytes.length > MAX_HANDOFF_BYTES || bytes[0] !== 0x50 || bytes[1] !== 0x4b || bytes[2] !== 3 || bytes[3] !== 4) {
    throw Error('Choose a selected ZIP handoff of up to 200 MB. Export fewer files if necessary.');
  }
}

export async function protectHandoff(bytes, passphrase) {
  checkArchive(bytes);
  const { header, key } = await createVault(passphrase);
  return { format: FORMAT, header, payload: await encrypt(key, bytes, CONTEXT) };
}

export async function openProtectedHandoff(envelope, passphrase) {
  const header = envelope?.header, payload = envelope?.payload;
  const base64 = (value, length) => typeof value === 'string' && value.length === length && /^[A-Za-z0-9+/]+={0,2}$/.test(value);
  if (envelope?.format !== FORMAT || header?.format !== 'claritypath-vault-v1' || header.iterations !== 600000 ||
      !base64(header.salt, 24) || !base64(header.iv, 16) || !base64(header.wrappedKey, 64) ||
      payload?.format !== 'claritypath-object-v1' || payload.context !== CONTEXT || !base64(payload.iv, 16) ||
      typeof payload.data !== 'string' || payload.data.length < 32 || payload.data.length > Math.ceil((MAX_HANDOFF_BYTES + 16) / 3) * 4 ||
      payload.data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(payload.data)) {
    throw Error('This is not a supported protected ClarityPath handoff, or the file is damaged. The source file is unchanged.');
  }
  const key = await unlockVault(header, passphrase);
  const bytes = await decrypt(key, payload, CONTEXT, true);
  checkArchive(bytes);
  return bytes;
}
