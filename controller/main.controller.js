'use strict'
const db = require('../config/DB');
const bcrypt = require('bcrypt');



const login = async (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = ?`;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(query, [hashedPassword], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal server error' });
        } else if (result.length === 0) {
            res.status(401).json({ message: 'Invalid username or password' });
        } else {
            res.render('dashboard')
            // res.status(200).json({ message: 'Login successful', user: result[0] });
        }
    });
};

const homepage = (req, res,next) => {
    res.render('index');
};

const dashboard = (req, res,next) => {
    res.render('dashboard');
};

const transactions = (req, res,next) => {
    res.render('transactions');
};

const profile = (req, res) => {
    res.render('profile');
};  

module.exports = { login, homepage, dashboard, transactions, profile };