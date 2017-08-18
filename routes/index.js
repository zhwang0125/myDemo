'use strict';
var router = require('express').Router();
var rechargeControl = require('../controllers/recharge');

router.get('/recharge/stat_128', rechargeControl.statMoney_128);

router.get('/stat/expend_128', rechargeControl.expend_128);

module.exports = router;
