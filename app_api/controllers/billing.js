var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.lastWeek = function(request, response) {

	var async = require('async');
/*
	var accessToken;
	var rateCard;

	function getToken(callback) {
		var qs = require("querystring");
		var http = require("https");

		var options = {
		  "method": "POST",
		  "hostname": "login.microsoftonline.com",
		  "port": null,
		  "path": "/microsoft.onmicrosoft.com/oauth2/token?api-version=1.0",
		  "headers": {
		    "content-type": "application/x-www-form-urlencoded",
		    "cache-control": "no-cache",
		    "postman-token": "460ef508-d723-8cde-95a1-06b1518f4339"
		  }
		};

		var req = http.request(options, function (res) {
		  var chunks = [];

		  res.on("data", function (chunk) {
		    chunks.push(chunk);
		  });

		  res.on("end", function () {
		    var body = Buffer.concat(chunks);
		    accessToken = JSON.parse(body.toString());
		    console.log("get access token");
		    callback(null);
		  });
		});

		req.write(qs.stringify({ grant_type: 'client_credentials',
		  resource: 'https://management.core.windows.net/',
		  client_id: '8a82026c-0ed3-4023-953e-50a95005c3e0',
		  client_secret: 'tyachen123' }));
		req.end();
	}

	function getRateCard(callback) {
		var http = require("https");

		var options = {
		  "method": "GET",
		  "hostname": "management.azure.com",
		  "port": null,
		  "path": "/subscriptions/c4528d9e-c99a-48bb-b12d-fde2176a43b8/providers/Microsoft.Commerce/RateCard?api-version=2015-06-01-preview&$filter=OfferDurableId%20eq%20'MS-AZR-0015P'%20and%20Currency%20eq%20'USD'%20and%20Locale%20eq%20'en-US'%20and%20RegionInfo%20eq%20'US'",
		  "headers": {
		    "content-type": "application/json",
		    "authorization": accessToken.token_type + " " + accessToken.access_token,
		    "cache-control": "no-cache",
		    "postman-token": "ba488ac6-c8d6-c02a-6e23-38f44ceb2ee6"
		  }
		};

		var req = http.request(options, function (res) {
		  var chunks = [];

		  res.on("data", function (chunk) {
		    chunks.push(chunk);
		  });

		  res.on("end", function () {
		    var body = Buffer.concat(chunks);
		    rateCard = JSON.parse(body.toString());
		    console.log("get rate card");
		    callback(null);
		  });
		});

		req.end();
	}

	async.series([
	    getToken,
	    getRateCard
	], function (err) {
		if (err) {
			sendJSONresponse(response, 404, err);
			return;
		}
	    sendJSONresponse(response, 200, rateCard);
	});

*/
/*

	var gvar1;
	var gvar2;

	function takes5Seconds(callback) {
	    console.log('Starting 5 second task');
	    setTimeout( function() { 
	        console.log('Just finshed 5 seconds');
	        gvar1 = "var1";
	        callback(null, 'five');
	    }, 5000);
	}   

	function takes2Seconds(callback) {
	    console.log('Starting 2 second task');
	    setTimeout( function() { 
	        console.log('Just finshed 2 seconds');
	        gvar2 = "var2";
	        callback(null, 'two');
	    }, 2000); 
	}

	async.series([
	    takes2Seconds,
	    takes5Seconds
	], function (err, results) {
		console.log(gvar1);
		console.log(gvar2);
		var json_data = {"name": results[0], "pass": results[1]};
	    // Here, results is an array of the value from each function
	    sendJSONresponse(response, 200, json_data)
	    // console.log(results); // outputs: ['two', 'five']
	});
*/



	var request = require("request");

	var options = { method: 'POST',
	  url: 'https://login.microsoftonline.com/microsoft.onmicrosoft.com/oauth2/token',
	  qs: { 'api-version': '1.0' },
	  headers: 
	   { 'postman-token': 'ef193fec-bdf3-8d7a-769a-0de8dbe529d5',
	     'cache-control': 'no-cache',
	     'content-type': 'application/x-www-form-urlencoded' },
	  form: 
	   { grant_type: 'client_credentials',
	     resource: 'https://management.core.windows.net/',
	     client_id: '8a82026c-0ed3-4023-953e-50a95005c3e0',
	     client_secret: 'tyachen123' } };

	request(options, function (err, res, body) {
	  if (err) throw new Error(err);

	  console.log(body);
	  sendJSONresponse(response, 200, JSON.parse(body));
	});

};