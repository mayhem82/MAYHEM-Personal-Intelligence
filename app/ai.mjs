// A successful HTTP response alone does not mean the AI provider is configured.
export async function connectAI(url, token, request = fetch) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname))) {
    throw Error('Use HTTPS, or localhost for your own local service');
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw Error('Use a service URL without credentials, query parameters or a fragment');
  }
  if (typeof token !== 'string' || token.length < 24) throw Error('Enter the service access key (at least 24 characters), not a provider API key');
  const endpoint = parsed.href.replace(/\/$/, '');
  const response = await request(endpoint + '/capabilities', {
    headers: { Authorization: 'Bearer ' + token },
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw Error('Service connection failed (' + response.status + ')');
  const capabilities = await response.json();
  if (capabilities.version !== 1 || typeof capabilities.provider !== 'string' || !capabilities.provider.trim() || typeof capabilities.model !== 'string' || !capabilities.model.trim()) {
    throw Error('This endpoint does not provide the supported ClarityPath AI service');
  }
  if (capabilities.configured !== true || capabilities.model === 'Not configured') {
    throw Error('AI server reached, but its provider key and model are not configured. Complete the host’s private settings, then reconnect. No case information sent.');
  }
  return { url: endpoint, token, capabilities };
}
