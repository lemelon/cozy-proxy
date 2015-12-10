// Generated by CoffeeScript 1.10.0
var Client, Router, logger, util;

util = require('util');

Client = require('request-json').JsonClient;

logger = require('printit')({
  date: false,
  prefix: 'lib:router'
});

Router = (function() {
  Router.prototype.routes = {};

  function Router() {
    var homePort;
    homePort = process.env.DEFAULT_REDIRECT_PORT;
    this.client = new Client("http://localhost:" + homePort + "/");
  }

  Router.prototype.getRoutes = function() {
    return this.routes;
  };

  Router.prototype.displayRoutes = function(callback) {
    var ref, route, slug;
    ref = this.routes;
    for (slug in ref) {
      route = ref[slug];
      if (route.type === 'static') {
        logger.info(slug + " (" + route.state + ") on type " + route.type);
      } else {
        logger.info(slug + " (" + route.state + ") on port " + route.port);
      }
    }
    if (callback != null) {
      return callback();
    }
  };

  Router.prototype.reset = function(callback) {
    logger.info('Start resetting routes...');
    this.routes = {};
    return this.client.get("api/applications/", (function(_this) {
      return function(error, res, apps) {
        var app, err, error1, i, len, ref;
        if ((error != null) || (apps.error != null)) {
          logger.error("Cannot retrieve applications list.");
          logger.error(util.inspect(error) || apps.msg);
          return callback(error || apps.msg);
        }
        try {
          ref = apps.rows;
          for (i = 0, len = ref.length; i < len; i++) {
            app = ref[i];
            console.log(app);
            _this.routes[app.slug] = {};
            if (app.type === 'static') {
              _this.routes[app.slug].type = app.type;
              _this.routes[app.slug].path = app.path;
              _this.routes[app.slug].token = app.token;
            } else {
              if (app.port != null) {
                _this.routes[app.slug].port = app.port;
              }
            }
            if (app.state != null) {
              _this.routes[app.slug].state = app.state;
            }
          }
          logger.info("Routes have been successfully reset.");
          return callback();
        } catch (error1) {
          err = error1;
          logger.error("Oops, something went wrong during routes reset.");
          return callback(err);
        }
      };
    })(this));
  };

  Router.prototype.startStatic = function(id, callback) {
    console.log('start static');
    console.log(id);
    logger.info('Start resetting routes...');
    this.routes = {};
    return this.client.get("api/applications/", (function(_this) {
      return function(error, res, apps) {
        var app, err, error1, i, len, ref;
        if ((error != null) || (apps.error != null)) {
          logger.error("Cannot retrieve applications list.");
          logger.error(util.inspect(error) || apps.msg);
          return callback(error || apps.msg);
        }
        try {
          ref = apps.rows;
          for (i = 0, len = ref.length; i < len; i++) {
            app = ref[i];
            console.log(app);
            _this.routes[app.slug] = {};
            if (app.type === 'static') {
              console.log('app name');
              res.redirect("apps/" + app.name + "/*");
            }
            if (app.state != null) {
              _this.routes[app.slug].state = app.state;
            }
          }
          logger.info("Routes have been successfully reset.");
          return callback();
        } catch (error1) {
          err = error1;
          logger.error("Oops, something went wrong during routes reset.");
          return callback(err);
        }
      };
    })(this));
  };

  return Router;

})();

module.exports = new Router();
