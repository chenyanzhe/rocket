var express = require('express');
var router = express.Router();
var ctrlVM = require('../controllers/vm');
var ctrlBilling = require('../controllers/billing');

var ctrlLocation = require('../controllers/location');
var ctrlSubscription = require('../controllers/subscription');

router.get('/vm_list', ctrlVM.vmList);
router.get('/vm_usage/:location', ctrlVM.vmUsage);
router.get('/vhd_list', ctrlVM.vhdList);
router.get('/vhd_upload/:localpath', ctrlVM.vhdUpload);
router.get('/img_list', ctrlVM.imgList);

router.get('/billing/:start/:end', ctrlBilling.lastWeek);

router.get('/location', ctrlLocation.locationList);
router.get('/subscription', ctrlSubscription.subList);

module.exports = router;
