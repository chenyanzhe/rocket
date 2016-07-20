var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.lastWeek = function(request, response) {

	var async = require('async');

	var accessToken;
	var rateCard;
	var cToken = '';
	var aggregatedUsage = [];
	var usageSegment;

	var rateCardDict = {};
	var aggregatedUsageDict = {};
	var aggregatedUsageClassicDict = {};

	var aggregatedPrices = [];
	var aggregatedClassicPrices = [];

	function getAccessToken(callback) {
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
		  accessToken = JSON.parse(body);
		  console.log("Access token done!");
		  callback(null);
		});
	}

	function getRateCard(innerCallback) {
		var request = require("request");

		var options = { method: 'GET',
		  url: 'https://management.azure.com/subscriptions/c4528d9e-c99a-48bb-b12d-fde2176a43b8/providers/Microsoft.Commerce/RateCard',
		  qs: 
		   { 'api-version': '2015-06-01-preview',
		     '$filter': 'OfferDurableId eq \'MS-AZR-0015P\' and Currency eq \'USD\' and Locale eq \'en-US\' and RegionInfo eq \'US\'' },
		  headers: 
		   { 'postman-token': 'f7687100-0be5-42dd-2d28-96f88fa7b892',
		     'cache-control': 'no-cache',
		     "authorization": accessToken.token_type + " " + accessToken.access_token,
		     'content-type': 'application/json' } };

		request(options, function (error, res, body) {
		  if (error) throw new Error(error);
		  rateCard = JSON.parse(body);
		  console.log("RateCard done!");
		  innerCallback(null);
		});
	}

	function hasNextPage() {
		return cToken != '';
	}

	function getAggregatedUsageHelper(innerCallback2) {
		console.log("Trying get page with cToken: " + cToken);
		var request = require("request");

		var options = { method: 'GET',
		  url: 'https://management.azure.com/subscriptions/c4528d9e-c99a-48bb-b12d-fde2176a43b8/providers/Microsoft.Commerce/UsageAggregates',
		  qs: 
		   { 'api-version': '2015-06-01-preview',
		     reportedStartTime: '2016-07-19T00:00:00+00:00',
		     reportedEndTime: '2016-07-20T00:00:00+00:00',
		     aggregationGranularity: 'Daily',
		     showDetails: 'true' },
		  headers: 
		   { 'postman-token': '5dedff2e-5405-205a-593f-aabf164b6888',
		     'cache-control': 'no-cache',
		     'content-type': 'application/json',
		     'authorization': accessToken.token_type + " " + accessToken.access_token } };

		if (cToken != '') options.qs.continuationToken = cToken;

		request(options, function (error, res, body) {
		  if (error) throw new Error(error);
		  usageSegment = JSON.parse(body);
		  aggregatedUsage.push(usageSegment);
		  if (usageSegment.nextLink) {
		  	var idx = usageSegment.nextLink.lastIndexOf("=");
		  	cToken = usageSegment.nextLink.substr(idx + 1);
		  	cToken = decodeURIComponent(cToken);
		  } else {
		  	cToken = '';
		  }
		  console.log("One page done!");
		  innerCallback2(null);
		});
	}

	function getAggregatedUsage(innerCallback) {
		async.doWhilst(
		    getAggregatedUsageHelper,
		    hasNextPage,
		    function (err) {
		    	console.log("final callback")
				if (err) {
					sendJSONresponse(response, 404, err);
					return;
				}
				innerCallback(null);
			}
		);
	}

	function getData(callback) {
		async.parallel([
		    getRateCard,
		    getAggregatedUsage
		], function (err) {
			if (err) {
				sendJSONresponse(response, 404, err);
				return;
			}
			callback(null);
		});
	}

	function processData(callback) {
		// Create RateCard Dictionary
		for (var i = 0; i < rateCard.Meters.length; i++) {
			rateCardDict[rateCard.Meters[i].MeterId] = rateCard.Meters[i];
		}
		// Create AggregatedUsage Dictionary
		for (var i = 0; i < aggregatedUsage.length; i++) {
			for (var j = 0; j < aggregatedUsage[i].value.length; j++) {
				var item = aggregatedUsage[i].value[j];
				if ("project" in item.properties.infoFields) {
					var key = item.properties.infoFields.project;
					if (key in aggregatedUsageClassicDict) {
						aggregatedUsageClassicDict[key].push(item);
					} else {
						aggregatedUsageClassicDict[key] = new Array(item);
					}
				} else if ("instanceData" in item.properties) {
					var needParse = item.properties.instanceData;
					var instanceDataJson;
					try {
					    instanceDataJson = JSON.parse(needParse);
					}catch(e){
						console.log(needParse);
					}
					var key = instanceDataJson["Microsoft.Resources"].resourceUri;
					if (key in aggregatedUsageDict) {
						aggregatedUsageDict[key].push(item);
					} else {
						aggregatedUsageDict[key] = new Array(item);
					}
				} else {
					console.log("do not have both !!!!!");
				}
			}
		}
		for (key in aggregatedUsageDict) {
			var cost = 0;
			for (var i = 0; i < aggregatedUsageDict[key].length; i++) {
				var quantity = aggregatedUsageDict[key][i].properties.quantity;
				var rateKey = aggregatedUsageDict[key][i].properties.meterId;
				var rates = rateCardDict[rateKey].MeterRates[0]
				// console.log("item = " + key);
				// console.log("quantity = " + quantity);
				// console.log("rates = " + rates);
				cost += quantity * rates;
				// break;
			}
			// break;
			console.log("item = " + key);
			console.log("cost = " + cost);
			break;
		}

		callback(null);
	}

	async.series([
	    getAccessToken,
	    getData,
	    processData
	], function (err) {
		if (err) {
			sendJSONresponse(response, 404, err);
			return;
		}
		var nPages = aggregatedUsage.length;
		console.log("aggregatedUsage have " + nPages + " pages");
		sendJSONresponse(response, 200, aggregatedUsage[0]);
	});
	
};