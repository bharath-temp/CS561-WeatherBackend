const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const request = require('request')
const http = require('http')

app.use(bodyParser.json());

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

app.listen(3000, () => {
    console.log('Auth service')
});

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
    res.json(greeting);
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
