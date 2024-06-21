require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoURI = process.env.MONGO_URI;
const { MongoClient } = require('mongodb');
const app = express();
const client = new MongoClient(mongoURI);

let setBalance = 1000; // เปลี่ยนจาก const เป็น let
let setBalanceBefore = 0; // เปลี่ยนจาก const เป็น let
let setBalanceAfter = 0; // เปลี่ยนจาก const เป็น let

app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send("Hello callback");
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

app.post('/callback/checkBalance', async (req, res) => {
    try {
        const { id, statusCode, timestampMillis, productId, currency, balance, username } = req.body;

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

        let totalBetAmount = txns.reduce((sum, txn) => sum + txn.betAmount, 0);
        setBalanceAfter = setBalance - totalBetAmount;

        const response = {
            id: id,
            statusCode: 0,
            timestampMillis: timestampMillis,
            productId: productId,
            currency: "THB",
            balanceBefore: setBalance,
            balanceAfter: setBalanceAfter,
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

        let totalPayoutAmount = txns.reduce((sum, txn) => sum + txn.payoutAmount, 0);
        let caltotalPayoutAmount = setBalanceAfter + totalPayoutAmount;

        const response = {
            id: id,
            statusCode: 0,
            timestampMillis: timestampMillis,
            productId: productId,
            currency: "THB",
            balanceBefore: setBalanceAfter,
            balanceAfter: caltotalPayoutAmount,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
