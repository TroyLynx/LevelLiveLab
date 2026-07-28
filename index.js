const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const db = require('./config/DB');
const sessions =require('express-session');
const mysqlstore = require('express-mysql-session')(sessions);
const port = process.env.PORT || 7777;
const routes = require('./routes/main.route');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const sessionStore = new mysqlstore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}); 

app.use(sessions({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

app.use('/', routes);


// app.get('/', (req, res) => {
//   res.render('index');
// });

// app.post('/login', routes.);

// app.get('/dashboard', (req, res) => {
//   res.render('dashboard');
// });

// app.get('/transactions', (req, res) => {
//   res.render('transactions');
// });

// app.get('/profile', (req, res) => {
//   res.render('profile');
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});