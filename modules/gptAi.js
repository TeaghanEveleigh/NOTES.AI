const https = require('https');

function generateText(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200, 
      model: 'gpt-3.5-turbo' 
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${process.env.GPT_AI_API_KEY}`  
      }
    };

    const req = https.request(options, (res) => {
      let response = '';

      res.on('data', (chunk) => {
        response += chunk;
      });

      res.on('end', () => {
        const apiCallEndTime = Date.now(); 
        console.log(`OpenAI API call took: ${apiCallEndTime - apiCallStartTime}ms`);

        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(response);
            resolve(result.choices[0].message.content);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error(`API request failed with status code: ${res.statusCode}`));
        }
      });
    });

    const apiCallStartTime = Date.now(); // Start measuring time before the API call

    req.setTimeout(15000); // Timeout after 15 seconds

    req.on('timeout', () => {
      req.destroy(); // Abort the request
      reject(new Error('Timeout waiting for OpenAI response'));  
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

module.exports = generateText; 
