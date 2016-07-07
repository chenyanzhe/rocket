var express = require('express');
var router = express.Router();
var ctrlVM = require('../controllers/vm');

router.get('/vm', ctrlVM.vmList);

module.exports = router;
