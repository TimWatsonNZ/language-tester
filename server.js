const express = require('express');
const config = require('config');
const app = express();
const port = config.get("port");

const testsApi = require("./api/tests"); 

app.use(express.json());

app.get("/heartbeat", (req, res) => res.status(200).json({ message: "OK" }));
testsApi.initialize(app);

app.listen(port, () => console.log(`Server listening on port ${port}`));