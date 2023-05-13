// gptApi.js
const https = require('https');

function generateText(prompt, callback) {
    const data = JSON.stringify({
        'prompt': prompt,
        'max_tokens': 150,
        'model': 'text-davinci-003'
    });

    const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': 'Bearer ' + process.env.GPT_AI_API_KEY
        }
    };

    const req = https.request(options, (res) => {
        let response = '';

        res.on('data', (chunk) => {
            response += chunk;
        });

        res.on('end', () => {
            const result = JSON.parse(response);
            console.log(response);
            if (result.choices && result.choices[0] && result.choices[0].text) {
                callback(null, result.choices[0].text);
            } else {
                callback(new Error('Unexpected API response format'));
            }
        });
    });

    req.on('error', (error) => {
        callback(error);
    });

    req.write(data);
    req.end();
}

module.exports = generateText;
