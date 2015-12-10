// Generated by CoffeeScript 1.10.0
var getProxy, router, statusChecker;

getProxy = require('../lib/proxy').getProxy;

router = require('../lib/router');

statusChecker = require('../lib/status_checker');

module.exports.defaultRedirect = function(req, res) {
  var homePort;
  homePort = process.env.DEFAULT_REDIRECT_PORT;
  return getProxy().web(req, res, {
    target: "http://localhost:" + homePort
  });
};

module.exports.showRoutes = function(req, res) {
  return res.send(200, router.getRoutes());
};

module.exports.resetRoutes = function(req, res) {
  return router.reset(function(error) {
    if (error != null) {
      return next(new Error(error));
    } else {
      return res.send(200, {
        success: true
      });
    }
  });
};

module.exports.start = function(req, res) {
  console.log('_________________________START_________________________');
  console.log(req.params);
  return router.startStatic(req.params.id, function(error) {
    if (error != null) {
      return next(new Error(error));
    } else {
      return res.send(200, {
        success: true
      });
    }
  });
};

module.exports.status = function(req, res) {
  return statusChecker.checkAllStatus(function(err, status) {
    if (err) {
      return next(new Error(err));
    } else {
      return res.send(status);
    }
  });
};
