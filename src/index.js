require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoURI = process.env.MONGO_URI;
const { MongoClient } = require('mongodb');
const app = express();
const client = new MongoClient(mongoURI);

const setBalance = 1000;
const balanceBefore = 0;
const balanceAfter = 0;


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
            balance: setBalance,
            username: username
        };

        let callbackData = {
            "request_body": req.body,
            "response": response
        }
        
        await client.connect();
        const db = client.db('gbcp');
        const collection = db.collection('check_balance');
        const result = await collection.insertOne(callbackData);
        console.log('Saved to database:', result);
        res.status(200).send(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/callback/placeBets', async (req, res) => {

    try {
        const { id, txns, statusCode, timestampMillis, productId, currency, balanceBefore, balanceAfter, username } = req.body;
        // const response = {
        //     "id": "279478c1-c870-407e-91be-b70bf6a623f9",
        //     "statusCode": 0,
        //     "timestampMillis": 1631514418144,
        //     "productId": "PRETTY",
        //     "currency": "THB",
        //     "balanceBefore": 10000,
        //     "balanceAfter": 9800,
        //     "username": "xo0001"
        // }

        const totalBetAmount = txns.reduce((sum, txn) => sum + txn.betAmount, 0);
        let calBalanceBefore = balanceBefore - totalBetAmount;

        const response = {
            id: id,
            statusCode: 0,
            timestampMillis: timestampMillis,
            productId: productId,
            currency: "THB",
            balanceBefore: balanceBefore,
            balanceAfter: calBalanceBefore,
            username: username
        };

        let callbackData = {
            "request_body": req.body,
            "response": response
        }
        
        await client.connect();
        const db = client.db('gbcp');
        const collection = db.collection('place_bets');
        const result = await collection.insertOne(callbackData);
        console.log('Saved to database:', result);
        res.status(200).send(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/callback/settleBets', async (req, res) => {

    try {
        const { id, statusCode, txns, timestampMillis, productId, currency, balanceBefore, balanceAfter, username } = req.body;
        // const response = {
        //     "id": "279478c1-c870-407e-91be-b70bf6a623f9",
        //     "statusCode": 0,
        //     "timestampMillis": 1631514418144,
        //     "productId": "PRETTY",
        //     "currency": "THB",
        //     "balanceBefore": 10000,
        //     "balanceAfter": 9800,
        //     "username": "xo0001"
        // }
        
        const response = {
            id: id,
            statusCode: 0,
            timestampMillis: timestampMillis,
            productId: productId,
            currency: "THB",
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
            username: username
        };

        let callbackData = {
            "request_body": req.body,
            "response": response
        }
        
        await client.connect();
        const db = client.db('gbcp');
        const collection = db.collection('settle_bets');
        const result = await collection.insertOne(callbackData);
        console.log('Saved to database:', result);
        res.status(200).send(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = app;