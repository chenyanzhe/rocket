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
  var params = [{name: "locations", value: req.params.location}];
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

function getFilesWithExtension(srcPath, extName) {
  var fs = require('fs');
  var path = require('path');

  var fileList = fs.readdirSync(srcPath).filter(function(file) {
    var absPath = path.join(srcPath, file);
    var fstats = fs.statSync(absPath);
    return fstats.isFile() && path.extname(absPath) === extName;
  })

  var ret = [];
  for (var i = 0; i < fileList.length; i++) {
    ret.push({
      "name": fileList[i]
    })
  }
  return ret;
}

module.exports.vhdList = function(req, res) {
  var fileList = getFilesWithExtension('uploads/', '.vhd');
  console.log(fileList);
  sendJSONresponse(res, 200, fileList);
};

module.exports.vhdUpload = function(req, res) {
  var path = require('path');
  var localpath = path.join(__dirname, '../../', 'uploads/', req.params.localpath)
  var params = [{name: "localFilePath", value: localpath}];
  var shell = require('node-powershell').Shell;
  shell.executionStringBuilder("./scripts/upload_vhd.ps1", params)
    .then(function(str) {
        var ps = new shell(str);
        console.log("upload_vhd started");
        console.log(Date.now());
        return ps.execute();
    })
    .then(function(data) {
      if (data.code === 0) {
        var feedback = JSON.parse(data.output);
        if (feedback.code == false) {
          console.log("upload_vhd execute fail");
          console.log(Date.now());
          sendJSONresponse(res, 404, feedback.output);
        } else {
          console.log("upload_vhd execute success");
          console.log(Date.now());
          sendJSONresponse(res, 200, "upload success");
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