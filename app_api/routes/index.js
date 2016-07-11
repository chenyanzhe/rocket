var express = require('express');
var router = express.Router();
var ctrlVM = require('../controllers/vm');

router.get('/vm_list', ctrlVM.vmList);
router.get('/vm_usage/:location', ctrlVM.vmUsage);

module.exports = router;
