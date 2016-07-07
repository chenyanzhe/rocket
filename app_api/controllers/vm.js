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
  /*
  var params = [];
  var shell = require('node-powershell').Shell;
  shell.executionStringBuilder("./scripts/env.ps1", params)
    .then(function(str) {
        var ps = new shell(str);
        return ps.execute();
    })
    .then(function(data) {
      if (data.code === 0) {
        console.log("ret succesful");
        sendJSONresponse(res, 200, JSON.parse(data.output));
      }
    })
    .catch(function(err) {
      console.log(err);
      sendJSONresponse(res, 404, err);
    });
  */
  sendJSONresponse(res, 200, staticData);
};
