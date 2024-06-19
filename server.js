require('dotenv').config();
const express = require('express');
const app = require('./src/index.js');
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
