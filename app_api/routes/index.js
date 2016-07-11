var express = require('express');
var router = express.Router();
var ctrlVMFull = require('../controllers/vm_full');

router.get('/vm_full', ctrlVMFull.vmList);

module.exports = router;
