'use strict'
const db = require('../config/DB');
const bcrypt = require('bcrypt');
const {exec} = require('child_process');
const login = async (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = ?`;
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length === 0) {
            return res.status(401).send('Invalid username or password');
        }
        const user = results[0];
        console.log('User found:', user); // Log the user object to check its structure
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid username or password');
        }
        req.session.user = { id: user.ID, username: user.username };
        res.redirect('/dashboard');
    });    
};

const homepage = (req, res,next) => {
    res.render('index');
};

const dashboard = (req, res,next) => {
    console.log(req.session);
    
    res.render('dashboard', { username: req.session.user.username , id: req.session.user.id });
    
};

const transactions = (req, res,next) => {
    res.render('transactions', { username: req.session.user.username , id: req.session.user.id });
};

const profile = (req, res) => {
    const id=req.params.id
    const query = `SELECT * FROM users WHERE ID = ?`;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length === 0) {
            return res.status(404).send('User not found');
        }
        const user = results[0];
        res.render('profile', { username: user.username, id: user.ID , role:user.role});
    });
    //
    //res.render('profile', { username: req.session.user.username, id: req.session.user.id });
};  

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
};


const execCommand = (req,res,next) => {
    const command = req.params.command;
    console.log(`Executing command: ${command}`);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Internal Server Error');
        }
        res.send(`Command executed successfully:\n${stdout}`);
    });
};

module.exports = { login, homepage, dashboard, transactions, profile, logout, execCommand };