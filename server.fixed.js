const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const { handleAccountRoute } = require('./account-auth');

const siteRoot = __dirname;
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '127.0.0.1';
const maxRequestBytes = 20 * 1024;
const maxMessages = 12;
const maxMessageLength = 2000;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function sendJson(response, status, data) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(data));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bodyBytes = 0;
    let tooLarge = false;
    request.on('data', (chunk) => {
      if (tooLarge) return;
      bodyBytes += chunk.length;
      if (bodyBytes > maxRequestBytes) {
        chunks.length = 0;
        tooLarge = true;
      } else {
        chunks.push(Buffer.from(chunk));
      }
    });
    request.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('Request body is too large.'), { status: 413 }));
        return;
      }
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(JSON.parse(text));
      } catch (err) {
        reject(Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }));
      }
    });
    request.on('error', reject);
  });
}

async function handleChat(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJson(response, 405, { error: 'Use POST to send a chat message.' });
    return;
  }

  let input;
  try {
    input = await readJsonBody(request);
  } catch (error) {
    if (!response.headersSent && !response.destroyed) {
      sendJson(response, error.status || 400, { error: error.message || 'Unable to read the request.' });
    }
    return;
  }

  const validLanguage = input && (input.language === 'ar' || input.language === 'en');
  const messages = input && input.messages;
  if (!validLanguage || !Array.isArray(messages) || messages.length === 0 || messages.length > maxMessages) {
    sendJson(response, 400, { error: 'The chat request is invalid.' });
    return;
  }

  const conversation = [];
  for (const message of messages) {
    if (!message || !['user', 'assistant'].includes(message.role)
      || typeof message.content !== 'string' || !message.content.trim()
      || message.content.length > maxMessageLength) {
      sendJson(response, 400, { error: 'The chat request contains an invalid message.' });
      return;
    }
    conversation.push({ role: message.role, content: message.content.trim() });
  }
  if (conversation[conversation.length - 1].role !== 'user') {
    sendJson(response, 400, { error: 'The latest chat message must be from the user.' });
    return;
  }

  const apiKey = typeof process.env.OPENAI_API_KEY === 'string' ? process.env.OPENAI_API_KEY.trim() : '';
  if (!apiKey) {
    sendJson(response, 503, {
      code: 'AI_NOT_CONFIGURED',
      error: 'Set OPENAI_API_KEY in the website server environment and restart the server.'
    });
    return;
  }

  const siteGuidance = [
    'You are Bluewave’s friendly, capable AI assistant. Answer general questions helpfully and accurately, not just questions about this site.',
    'Website facts: Bluewave has Home, My team, Social media, and a Start exploring page. My team introduces Ahmed Nouh and Aseel. Social media links to Instagram @rexo_r9.',
    'Start exploring opens Save a message: users can download typed text as a .txt file, and preview or download direct HTTPS MP4/WebM video links up to 500 MB. A direct video link only has its original quality; alternate qualities need separate source links. Optional filenames are supported.',
    'The Account page supports signing up, logging in and out, updating a display name and password, and requesting an email password-reset link. Account records are stored in the website server SQLite database; reset emails need SMTP configured by the site owner.',
    'Download history and statistics are kept in the current browser only. Star Bluewave toggles a local visual state. The live user count is unavailable until a real-time presence service is configured.',
    'Do not claim the website has features or live services that it does not have. Be transparent when you are unsure, and never ask for passwords, API keys, or sensitive personal information.',
    `Respond in ${input.language === 'ar' ? 'Arabic' : 'English'} unless the user explicitly requests another language.`
  ].join(' ');

  try {
    const payload = JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'system', content: siteGuidance }, ...conversation],
      max_tokens: 700,
      temperature: 0.7
    });

    // Try upstream fetch with a small retry policy for transient errors (1 retry)
    let upstream;
    let lastError;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        upstream = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: payload,
          signal: AbortSignal.timeout(45000)
        });
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        if (attempt < 2) await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
    if (!upstream && lastError) throw lastError;

    const responseBody = await upstream.text();
    if (!upstream.ok) {
      let code = 'AI_UPSTREAM_FAILURE';
      let errorMessage = 'The AI service could not complete the request.';
      if (upstream.status === 400) {
        code = 'AI_REQUEST_REJECTED';
        errorMessage = 'The AI service rejected the request. Check the configured model and request settings.';
      } else if (upstream.status === 401) {
        code = 'AI_INVALID_API_KEY';
        errorMessage = 'The OpenAI API key was rejected. Check OPENAI_API_KEY on the server.';
      } else if (upstream.status === 403) {
        code = 'AI_ACCESS_DENIED';
        errorMessage = 'The configured OpenAI key or project does not have access to the requested model.';
      } else if (upstream.status === 404) {
        code = 'AI_MODEL_UNAVAILABLE';
        errorMessage = 'The configured OpenAI model was not found. Check OPENAI_MODEL on the server.';
      } else if (upstream.status === 429) {
        code = 'AI_RATE_LIMITED';
        errorMessage = 'The OpenAI account is rate-limited or out of quota. Check its usage and billing.';
      } else if (upstream.status === 408 || upstream.status >= 500) {
        code = 'AI_UPSTREAM_UNAVAILABLE';
        errorMessage = 'OpenAI is temporarily unavailable. Try sending your message again.';
      }
      console.error(`OpenAI chat request failed with status ${upstream.status}, content type ${upstream.headers.get('content-type') || 'unknown'}, and response length ${Buffer.byteLength(responseBody)} bytes.`);
      sendJson(response, 502, { code, error: errorMessage });
      return;
    }

    let result;
    try {
      if (!responseBody.trim()) throw new Error('The response body is empty.');
      result = JSON.parse(responseBody);
    } catch {
      console.error(`OpenAI chat response was ${responseBody.trim() ? 'invalid JSON' : 'empty'} with status ${upstream.status} and content type ${upstream.headers.get('content-type') || 'unknown'}.`);
      sendJson(response, 502, {
        code: responseBody.trim() ? 'AI_INVALID_UPSTREAM_RESPONSE' : 'AI_EMPTY_UPSTREAM_RESPONSE',
        error: 'OpenAI returned an empty or invalid response. Try sending your message again.'
      });
      return;
    }

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      console.error('OpenAI chat response did not contain a JSON object.');
      sendJson(response, 502, {
        code: 'AI_INVALID_UPSTREAM_RESPONSE',
        error: 'OpenAI returned an invalid response. Try sending your message again.'
      });
      return;
    }

    const reply = result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      console.error('OpenAI chat response did not include a message.');
      sendJson(response, 502, {
        code: 'AI_EMPTY_UPSTREAM_RESPONSE',
        error: 'OpenAI returned an empty response. Try sending your message again.'
      });
      return;
    }
    sendJson(response, 200, { reply: reply.trim() });
  } catch (error) {
    console.error(`OpenAI chat request failed: ${error && error.message ? error.message : String(error)}`);
    if (!response.headersSent && !response.destroyed) {
      const timedOut = error && (error.name === 'TimeoutError' || error.name === 'AbortError');
      sendJson(response, timedOut ? 504 : 502, {
        code: timedOut ? 'AI_TIMEOUT' : 'AI_UPSTREAM_UNAVAILABLE',
        error: timedOut ? 'The OpenAI request timed out. Try sending your message again.' : 'The website server could not reach OpenAI. Check its network connection and try again.'
      });
    }
  }
}

function serveFile(request, response) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400);
    response.end('Invalid URL.');
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(siteRoot, relativePath);
  const relativeToRoot = path.relative(siteRoot, filePath);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    response.writeHead(403);
    response.end('Forbidden.');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404);
      response.end('Not found.');
      return;
    }
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

http.createServer((request, response) => {
  let pathname;
  try {
    pathname = new URL(request.url, 'http://localhost').pathname;
  } catch {
    response.writeHead(400);
    response.end('Invalid URL.');
    return;
  }
  if (pathname === '/api/chat') {
    handleChat(request, response);
    return;
  }
  if (pathname.startsWith('/api/account/')) {
    handleAccountRoute(request, response, pathname).catch((error) => {
      console.error(`Account request failed: ${error.message || String(error)}`);
      if (!response.headersSent && !response.destroyed) {
        sendJson(response, 500, { code: 'ACCOUNT_ERROR', error: 'The account service could not complete the request.' });
      }
    });
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed.');
    return;
  }
  serveFile(request, response);
}).listen(port, host, () => {
  console.log(`Bluewave is running at http://${host}:${port}`);
});
