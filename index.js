var Promise = require('bluebird');
var request = require('request');
request = Promise.promisify(request.defaults({ jar: true }));

var Sensi = function(options) {
  this.username = options.username;
  this.password = options.password;
  this.baseUrl = 'https://bus-serv.sensicomfort.com';
  this.defaultHeaders = {
    'X-Requested-With': 'XMLHttpRequest', // needed to get cookies instead of token
    'Accept': 'application/json; version=1, */*; q=0.01'
  };
}

Sensi.prototype.start = function() {
  return this.authorize().then(function() {
    return this.negotiate();
  }.bind(this));
};

Sensi.prototype.authorize = function() {
  var options = {
    url: this.baseUrl + '/api/authorize',
    method: 'POST',
    headers: this.defaultHeaders,
    json: {
      'UserName': this.username,
      'Password': this.password
    }
  }

  return request(options);
};

Sensi.prototype.negotiate = function() {
  var options = {
    url: this.baseUrl + '/realtime/negotiate',
    method: 'GET',
    headers: this.defaultHeaders
  };

  return request(options).spread(function(_, body) {
    var json = JSON.parse(body);
    this.connectionToken = json['ConnectionToken'];
    return json;
  }.bind(this));
};

// [
//    {
//       "ContractorId" : 0,
//       "Country" : "US",
//       "ICD" : "36-6f-92-ff-fe-01-8c-d7",
//       "TimeZone" : "Eastern Standard Time",
//       "DeviceName" : "4 South",
//       "ZipCode" : "45202"
//    },
//    {
//       "ICD" : "36-6f-92-ff-fe-01-94-d4",
//       "ContractorId" : 0,
//       "Country" : "US",
//       "ZipCode" : "45202",
//       "DeviceName" : "4 North",
//       "TimeZone" : "Eastern Standard Time"
//    },
//    {
//       "TimeZone" : "Eastern Standard Time",
//       "ZipCode" : "45202",
//       "DeviceName" : "5 South",
//       "ICD" : "36-6f-92-ff-fe-01-98-8a",
//       "ContractorId" : 0,
//       "Country" : "US"
//    },
//    {
//       "Country" : "US",
//       "ContractorId" : 0,
//       "ICD" : "36-6f-92-ff-fe-01-9f-cb",
//       "TimeZone" : "Eastern Standard Time",
//       "DeviceName" : "5 North",
//       "ZipCode" : "45202"
//    }
// ]
Sensi.prototype.thermostats = function() {
  var options = {
    url: this.baseUrl + '/api/thermostats',
    method: 'GET',
    headers: this.defaultHeaders
  };

  return request(options).spread(function(_, body) {
    return JSON.parse(body);
  });
};

Sensi.prototype.setHeat = function(options) {
  var httpOptions = {
    url: this.baseUrl + '/realtime/send',
    method: 'POST',
    qs: {
      transport: 'longPolling',
      connectionToken: this.connectionToken,
    },
    form: {
      data: JSON.stringify({
        'H': 'thermostat-v1',
        'M': 'SetHeat',
        'A': [options.icd, options.temperature, options.temperatureScale],
        'I': 1
      })
    }
  };

  return request(httpOptions);
};

module.exports = Sensi;
