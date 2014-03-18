// Generated by CoffeeScript 1.7.1
var deviceManager, extractCredentials, getCredentialsHeader, getProxy;

deviceManager = require('../models/device');

getProxy = require('../lib/proxy').getProxy;

extractCredentials = function(header) {
  var authDevice;
  authDevice = header.replace('Basic ', '');
  authDevice = new Buffer(authDevice, 'base64').toString('ascii');
  return authDevice.split(':');
};

getCredentialsHeader = function() {
  var basicCredentials, credentials;
  credentials = "" + process.env.NAME + ":" + process.env.TOKEN;
  basicCredentials = new Buffer(credentials).toString('base64');
  return "Basic " + basicCredentials;
};

module.exports.management = function(req, res) {
  var authenticator, password, user, username, _ref;
  authenticator = passport.authenticate('local', (function(_this) {
    return function(err, user) {
      var error;
      if (err) {
        return next(new Error("Server error occured."));
      } else if (user === void 0 || !user) {
        error = new Error("Bad credentials");
        error.status = 401;
        return next(error);
      } else {
        req.headers['authorization'] = getCredentialsHeader();
        res.end = function() {
          return deviceManager.update();
        };
        return getProxy().web(req, res, {
          target: "http://localhost:9101"
        });
      }
    };
  })(this));
  _ref = extractCredentials(req.headers['authorization']), username = _ref[0], password = _ref[1];
  user = {};
  user.body = {
    username: username,
    password: password
  };
  req.headers['authorization'] = void 0;
  return authenticator(user, res);
};

module.exports.replication = function(req, res) {
  var error, password, username, _ref;
  _ref = extractCredentials(req.headers['authorization']), username = _ref[0], password = _ref[1];
  if (deviceManager.isAuthenticated(username, password)) {
    if (process.env.NODE_ENV === "production") {
      req.headers['authorization'] = getCredentialsHeader();
    }
    return getProxy().web(req, res, {
      target: "http://localhost:5984"
    });
  } else {
    error = new Error("Request unauthorized");
    error.status = 401;
    return next(error);
  }
};
