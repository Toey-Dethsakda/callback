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

app.post('/callback/checkBalance', async (req, res) => {
    
    const callbackData = {
        ...req
    };
    console.log('Received callback data:', callbackData);

    try {
        await client.connect();
        const db = client.db('gbcp');
        const collection = db.collection('callback');
        const result = await collection.insertOne(callbackData);
        console.log('Saved to database:', result);
        res.status(200).send({ message: 'Callback received and saved successfully' });
    } catch (error) {
        console.error('Error saving to database:', error);
        res.status(500).send({ message: 'Failed to save callback data' });
    } finally {
        await client.close();
    }
});

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

// app.post('/callback/checkBalance', async (req, res) => {
//     // let mockData = {
//     //     "id": "58f0a8b2-0e60-4bf8-9eee-b7528917c01b",
//     //     "statusCode": 0,
//     //     "timestampMillis": 1631120940530,
//     //     "productId": "PRETTY",
//     //     "currency": "THB",
//     //     "balance": 10000,
//     //     "username": "a2uuf13"
//     // }

//     try {
//         const { id, statusCode, timestampMillis, productId, currency, balance, username } = req.body;
//         const response = {
//             id,
//             statusCode,
//             timestampMillis,
//             productId,
//             currency,
//             balance,
//             username
//         };
//         // const response = {
//         //     id: mockData.id,
//         //     statusCode: mockData.statusCode,
//         //     timestampMillis: mockData.timestampMillis,
//         //     productId: mockData.productId,
//         //     currency: mockData.currency,
//         //     balance: mockData.balance,
//         //     username: mockData.username
//         // };
        
//         await client.connect();
//         const db = client.db('gbcp');
//         const collection = db.collection('callback');
//         const result = await collection.insertOne(response);
//         console.log('Saved to database:', result);
//         res.status(200).send({ message: 'Callback received and saved successfully' });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

module.exports = app;