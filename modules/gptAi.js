// gptApi.js
const https = require('https');

function generateText(prompt, callback) {
    const data = JSON.stringify({
        'messages': [
            {
                'role': 'system',
                'content': 'You are a helpful assistant.'
            },
            {
                'role': 'user',
                'content': prompt
            }
        ],
        'max_tokens': 200,
        'engine': 'gpt-3.5-turbo' // Updated engine
    });

    const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/chat/completions', // Updated path
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
            try {
                const result = JSON.parse(response);
                if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
                    callback(null, result.choices[0].message.content);
                } else {
                    callback(new Error('Unexpected API response format'));
                }
            } catch (err) {
                callback(err);
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