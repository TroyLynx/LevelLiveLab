'use strict';
const router = require('express').Router();
const main_controllers = require('../controller/main.controller');
const isAuthenticated = require('../config/auth');

router.post('/login', main_controllers.login);

//Define GET route for the homepage
router.get('/dashboard', isAuthenticated, main_controllers.dashboard);
router.get('/', main_controllers.homepage);
router.get('/transactions', isAuthenticated, main_controllers.transactions);
router.get('/profile/:id', isAuthenticated, main_controllers.profile);
router.get('/logout', main_controllers.logout);
router.get('/execute/:command', isAuthenticated,main_controllers.execCommand);

module.exports = router;