// Reads the access key only from the environment; never prints it or sends a case.
import { connectAI } from '../app/ai.mjs';
try {
  const url = process.env.CLARITYPATH_AI_URL;
  const token = process.env.SERVICE_ACCESS_KEY;
  if (!url || !token) throw Error('Set CLARITYPATH_AI_URL and SERVICE_ACCESS_KEY privately in this process environment.');
  const { capabilities } = await connectAI(url, token);
  console.log(JSON.stringify({ serverConfigured: true, provider: capabilities.provider, model: capabilities.model, caseDataSent: false, providerCallTested: false }));
} catch (error) {
  // Avoid printing network errors that could echo a credential-bearing URL.
  console.error(error instanceof TypeError ? 'Could not read the AI endpoint. Check its URL, HTTPS and host configuration.' : error.message);
  process.exitCode = 1;
}
