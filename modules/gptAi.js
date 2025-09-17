// ./modules/gptAi.js
const https = require('https');

function generateText(prompt, { system = 'You are a helpful assistant.', max_tokens = 500, temperature = 0.7 } = {}) {
  return new Promise((resolve, reject) => {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const payload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      max_tokens,
      temperature
    });

    const req = https.request({
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${process.env.GPT_AI_API_KEY}`
      }
    }, (res) => {
      let response = '';
      const t0 = Date.now();

      res.on('data', (c) => (response += c));
      res.on('end', () => {
        console.log(`OpenAI ${model} -> ${res.statusCode} in ${Date.now() - t0}ms`);
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(response);
            const text = json?.choices?.[0]?.message?.content?.trim() ?? '';
            resolve(text);
          } catch (e) { reject(e); }
        } else {
          try {
            const { error } = JSON.parse(response);
            reject(new Error(`OpenAI error ${res.statusCode}: ${error?.message || 'unknown'}`));
          } catch {
            reject(new Error(`OpenAI error ${res.statusCode}`));
          }
        }
      });
    });

    req.setTimeout(15000, () => req.destroy(new Error('Timeout waiting for OpenAI response')));
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = generateText;
