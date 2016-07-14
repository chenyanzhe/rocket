var express = require('express');
var router = express.Router();
var ctrlVM = require('../controllers/vm');

router.get('/vm_list', ctrlVM.vmList);
router.get('/vm_usage/:location', ctrlVM.vmUsage);
router.get('/vhd_list', ctrlVM.vhdList);
router.get('/vhd_upload/:localpath', ctrlVM.vhdUpload);

module.exports = router;
