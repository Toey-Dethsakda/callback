const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/callback', (req, res) => {
    const callbackData = req.body;
    console.log('Received callback data:', callbackData);

    res.status(200).send({ message: 'Callback received successfully', callbackData });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
