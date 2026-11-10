import { openProtectedHandoff, MAX_PROTECTED_FILE_BYTES } from './protected-handoff.mjs';

const form = document.getElementById('handoffForm');
const fileInput = document.getElementById('handoffFile');
const passInput = document.getElementById('handoffPass');
const unlock = document.getElementById('handoffUnlock');
const result = document.getElementById('handoffResult');
const link = document.getElementById('handoffDownload');
const status = document.getElementById('handoffStatus');
let downloadURL = null, generation = 0;

function clearResult() {
  generation++;
  if (downloadURL) URL.revokeObjectURL(downloadURL);
  downloadURL = null;
  link.removeAttribute('href');
  result.hidden = true;
  passInput.value = '';
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (unlock.disabled) return;
  const file = fileInput.files[0], passphrase = passInput.value;
  clearResult();
  const operation = generation;
  unlock.disabled = true;
  fileInput.disabled = true;
  try {
    if (!file || file.size > MAX_PROTECTED_FILE_BYTES) throw Error('Choose a protected ClarityPath handoff file of up to 270 MB.');
    status.textContent = 'Unlocking on this device…';
    let envelope;
    try { envelope = JSON.parse(await file.text()); }
    catch { throw Error('The selected file is not a supported protected handoff. The source file is unchanged.'); }
    const bytes = await openProtectedHandoff(envelope, passphrase);
    if (operation !== generation) return;
    downloadURL = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }));
    link.href = downloadURL;
    result.hidden = false;
    status.textContent = 'Unlocked on this device. Download the readable ZIP when ready. Nothing was uploaded.';
    link.focus();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    passInput.value = '';
    unlock.disabled = false;
    fileInput.disabled = false;
  }
});

fileInput.addEventListener('change', () => { clearResult(); status.textContent = 'Enter the passphrase for this protected handoff.'; });
document.getElementById('handoffLock').addEventListener('click', () => {
  clearResult();
  form.reset();
  status.textContent = 'Unlocked copy cleared from this page. Previously saved downloads remain on your device.';
  fileInput.focus();
});
addEventListener('pagehide', () => { clearResult(); form.reset(); });
