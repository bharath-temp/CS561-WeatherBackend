const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const request = require('request')
const http = require('http')

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(bodyParser.json(), cors(corsOptions));

const accessTokenSecret = 'supersecretaccesstoken';

const users = [
    {
        username: 'bharath',
        password: 'pass'
    }, {
        username: 'jon',
        password: 'pass2'
    }
];



const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            next();
        });
    } else {
        res.sendStatus(401);
    }
};

app.get('/v1/weather', authenticateJWT, (req, res) => {
    var url = "http://api.openweathermap.org/data/2.5/weather?q=corvallis&" +
              "appid=a99f1dbe7d7e7d5b6ce85970a31da042"
    request(url, (error, response, body)=>{
        console.log(body);
        res.send(JSON.parse(body));
    });
});

app.get('/v1/hello', authenticateJWT, (req, res) => {
    const greeting = "Howdy Partner";
    res.json({greeting});
});

app.post('/v1/auth', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => { return u.username === username &&
                                          u.password === password});

    if (user) {
        const accessToken = jwt.sign({username: user.username},
                                      accessTokenSecret,
                                      {expiresIn: '20m'});

        var currDate = new Date();
        currDate.setMinutes(currDate.getMinutes() + 20);
        const expires = currDate.toJSON();

        res.json({
            accessToken,
            expires
        });
    } else {
        res.send('Invalid user credentials');
    }
});

const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
