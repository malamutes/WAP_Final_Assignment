const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

//https://stackoverflow.com/questions/1653308/access-control-allow-origin-multiple-origin-domains
app.use((req, res, next) => {
    const corsWhitelist = [
        'http://localhost:5173',
    ];

    if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    }

    next();
});


app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

app.listen(port, () => {
    console.log(`Example app listening on port => http://localhost:${port}`)
});