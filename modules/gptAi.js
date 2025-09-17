// gpt.js
const https = require('https');

function generateText(prompt) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', // pick a modern model
      // “instructions” replaces your system message
      instructions: 'You are a helpful assistant.',
      input: prompt,               // simplest form; can also use [{ role, content }]
      max_output_tokens: 200       // replaces max_tokens
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/responses',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || process.env.GPT_AI_API_KEY}`
      }
    };

    const apiCallStartTime = Date.now();
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const ms = Date.now() - apiCallStartTime;
        console.log(`OpenAI API call took: ${ms}ms`);

        let data;
        try { data = JSON.parse(body); } catch (e) {
          return reject(new Error(`Invalid JSON from OpenAI: ${e.message}. Raw: ${body.slice(0,200)}…`));
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Prefer the convenience field:
          if (typeof data.output_text === 'string' && data.output_text.length) {
            return resolve(data.output_text);
          }
          // Fallback: stitch any text parts:
          try {
            const text = (data.output || [])
              .flatMap(item => (item.content || []))
              .filter(c => c.type === 'output_text' && typeof c.text === 'string')
              .map(c => c.text)
              .join('\n')
              .trim();
            if (text) return resolve(text);
          } catch {}
          return reject(new Error('OpenAI response had no text payload'));
        }

        // Nice error surface
        const msg = data?.error?.message || data?.message || `Status ${res.statusCode}`;
        reject(new Error(`OpenAI error: ${msg}`));
      });
    });

    req.setTimeout(15000, () => {
      req.destroy(new Error('Timeout waiting for OpenAI response'));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = generateText;
