const express = require('express');
const app = express();
const axios = require('axios');

app.use(express.json());

app.post('/callback', (req, res) => {
    const callbackData = req.body;
    console.log('Received callback data:', callbackData);

    res.status(200).send({ message: 'Callback received successfully' });
});

app.get('/invoke-callback', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3000/callback', {
            key: 'value'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Error invoking callback:', error);
        res.status(500).send({ message: 'Failed to invoke callback' });
    }
});

module.exports = app;
