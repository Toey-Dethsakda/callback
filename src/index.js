require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoURI = process.env.MONGO_URI;
const { MongoClient } = require('mongodb');
const app = express();
const client = new MongoClient(mongoURI);

app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send("Hello callback");
});

// app.post('/callback/checkBalance', async (req, res) => {
//     const callbackData = req.body;
//     console.log('Received callback data:', callbackData);

//     try {
//         await client.connect();
//         const db = client.db('gbcp');
//         const collection = db.collection('callback');
//         const result = await collection.insertOne(callbackData);
//         console.log('Saved to database:', result);
//         res.status(200).send({ message: 'Callback received and saved successfully' });
//     } catch (error) {
//         console.error('Error saving to database:', error);
//         res.status(500).send({ message: 'Failed to save callback data' });
//     } finally {
//         await client.close();
//     }
// });

app.get('/invoke-callback', async (req, res) => {
    try {
        const response = await axios.post('https://callback-one.vercel.app/callback', {
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

app.post('/callback/checkBalance', async (req, res) => {

    try {
        const { id, statusCode, timestampMillis, productId, currency, balance, username } = req.body;
        // const response = {
        //     id,
        //     statusCode,
        //     timestampMillis,
        //     productId,
        //     currency,
        //     balance,
        //     username
        // };
        
        const response = {
            id: id,
            statusCode: 0,
            timestampMillis: timestampMillis,
            productId: productId,
            currency: "THB",
            balance: 1000,
            username: username
        };

        let callbackData = {
            "request_body": req.body,
            "response": response
        }
        
        await client.connect();
        const db = client.db('gbcp');
        const collection = db.collection('callback');
        const result = await collection.insertOne(callbackData);
        console.log('Saved to database:', result);
        res.status(200).send(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = app;