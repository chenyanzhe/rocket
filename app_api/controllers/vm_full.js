var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

staticData = [{
  Name: 'decui-bsd103',
  PowerState: 'Started',
  RoleSize: 'Large',
  DeploymentName: 'Shanghai OSTC Dev',
  InstanceSize: '512 MB',
  IpAddress: '202.30.35.123'
}, {
  Name: 'yanmin-ubun1004',
  PowerState: 'Stopped',
  RoleSize: 'Medium',
  DeploymentName: 'Shanghai OSTC Dev',
  InstanceSize: '4 GB',
  IpAddress: '202.120.35.123'
}, {
  Name: 'honzhan-debian7',
  PowerState: 'Running',
  RoleSize: 'Medium',
  DeploymentName: 'Shanghai OSTC Dev',
  InstanceSize: '4 GB',
  IpAddress: '192.35.25.214'
}]

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
        if (data.output === "False") {
          console.log("script execute fail");
          sendJSONresponse(res, 404, "script execute fail");
        } else {
          console.log(Date.now());
          console.log("get_vm_info ended");
          sendJSONresponse(res, 200, JSON.parse(data.output));
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
