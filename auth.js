const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

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
