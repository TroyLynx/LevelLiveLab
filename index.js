const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 7777;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');



app.get('/', (req, res) => {
  res.render('index');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/transactions', (req, res) => {
  res.render('transactions');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});