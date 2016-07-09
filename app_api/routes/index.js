var express = require('express');
var router = express.Router();
var ctrlVMFull = require('../controllers/vm_full');
var ctrlVMLocs = require('../controllers/vm_locs');

router.get('/vm_full', ctrlVMFull.vmList);
router.get('/vm_locs', ctrlVMLocs.vmLocs);


module.exports = router;
