var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.vmList = function(req, res) {
  var params = [];
  var shell = require('node-powershell').Shell;
  shell.executionStringBuilder("./scripts/get_vm_info.ps1", params)
    .then(function(str) {
        var ps = new shell(str);
        console.log("get_vm_info started");
        console.log(Date.now());
        return ps.execute();
    })
    .then(function(data) {
      if (data.code === 0) {
        var feedback = JSON.parse(data.output);
        if (feedback.code == false) {
          console.log("get_vm_info execute fail");
          console.log(Date.now());
          sendJSONresponse(res, 404, feedback.output);
        } else {
          console.log("get_vm_info execute success");
          console.log(Date.now());
          sendJSONresponse(res, 200, feedback.output);
        }
      } else {
        console.log("node subprocess abort");
        sendJSONresponse(res, 404, "node subprocess abort");
      }
    })
    .catch(function(err) {
      console.log(err);
      sendJSONresponse(res, 404, err);
    });

  // setTimeout(function(){
  //   sendJSONresponse(res, 200, staticData);
  // }, 2000);
};

module.exports.vmUsage = function(req, res) {
  var params = [req.params.location];
  var shell = require('node-powershell').Shell;
  shell.executionStringBuilder("./scripts/get_vm_usage.ps1", params)
    .then(function(str) {
        var ps = new shell(str);
        console.log("get_vm_usage started");
        console.log(Date.now());
        return ps.execute();
    })
    .then(function(data) {
      if (data.code === 0) {
        var feedback = JSON.parse(data.output);
        if (feedback.code == false) {
          console.log("get_vm_usage execute fail");
          console.log(Date.now());
          sendJSONresponse(res, 404, feedback.output);
        } else {
          console.log("get_vm_usage execute success");
          console.log(Date.now());
          sendJSONresponse(res, 200, feedback.output);
        }
      } else {
        console.log("node subprocess abort");
        sendJSONresponse(res, 404, "node subprocess abort");
      }
    })
    .catch(function(err) {
      console.log(err);
      sendJSONresponse(res, 404, err);
    });

  // setTimeout(function(){
  //   sendJSONresponse(res, 200, staticData);
  // }, 2000);
};

var staticData = [
  {
    "name": "freebsd10.3.vhd"
  },
  {
    "name": "freebsd10.2.vhd"
  },
  {
    "name": "freebsd10.1.vhd"
  }
]

module.exports.vhdList = function(req, res) {
  setTimeout(function(){
    sendJSONresponse(res, 200, staticData);
  }, 2000);
};
