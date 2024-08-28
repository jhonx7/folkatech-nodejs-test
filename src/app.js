const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose')
const redisClient = require("./utils/redisClient")

const globalRouter = require("./routers");

redisClient.connect()
mongoose.connect(process.env.MONGODB_URL).catch(error => console.error(error));

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(cors());

// Routes prefix
app.use('/', globalRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;