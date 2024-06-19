require('dotenv').config();
const express = require('express');
const app = express();
const axios = require('axios');
const mongoURI = process.env.MONGO_URI;
const { MongoClient } = require('mongodb');
const client = new MongoClient(mongoURI);

app.use(express.json());

client.connect((err) => {
    if (err) {
        console.error('Failed to connect to MongoDB:', err);
    } else {
        console.log('Connected to MongoDB');
    }
});

app.get('/', async (req, res) => {
    res.status(200).send("Hello callback");
});

app.post('/callback', async (req, res) => {
    const callbackData = req.body;
    // console.log('callbackData = ', JSON.stringify(callbackData));
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
        // const response = await axios.post('localhost:3000/callback', {
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
