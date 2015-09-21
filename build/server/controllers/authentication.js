// Generated by CoffeeScript 1.9.3
var Instance, User, helpers, localization, passport, passwordKeys, randomstring, request;

passport = require('passport');

randomstring = require('randomstring');

request = require('request-json');

User = require('../models/user');

Instance = require('../models/instance');

helpers = require('../lib/helpers');

localization = require('../lib/localization_manager');

passwordKeys = require('../lib/password_keys');

module.exports.registerIndex = function(req, res, next) {
  return User.first(function(err, user) {
    var error;
    if (err != null) {
      error = new Error("[Error to access cozy user] " + err.code);
      error.status = 500;
      error.template = {
        name: 'error'
      };
      return next(error);
    } else if (user != null) {
      return res.redirect('/login');
    } else {
      localization.setLocale(req.headers['accept-language']);
      return res.render("index");
    }
  });
};

module.exports.register = function(req, res, next) {
  var error, hash, instanceData, passwdValidationError, userData, validationErrors;
  hash = helpers.cryptPassword(req.body.password);
  userData = {
    email: req.body.email,
    owner: true,
    password: hash.hash,
    salt: hash.salt,
    public_name: req.body.public_name,
    timezone: req.body.timezone,
    activated: true,
    allow_stats: req.body.allow_stats,
    docType: "User"
  };
  instanceData = {
    locale: req.body.locale
  };
  passwdValidationError = User.validatePassword(req.body.password);
  validationErrors = User.validate(userData, passwdValidationError);
  if (!Object.keys(validationErrors).length) {
    return User.all(function(err, users) {
      var error;
      if (err != null) {
        return next(new Error(err));
      } else if (users.length !== 0) {
        error = new Error("User already registered.");
        error.status = 409;
        return next(error);
      } else {
        return Instance.createOrUpdate(instanceData, function(err) {
          if (err) {
            return next(new Error(err));
          }
          return User.createNew(userData, function(err) {
            if (err) {
              return next(new Error(err));
            }
            localization.setLocale(req.body.locale);
            return next();
          });
        });
      }
    });
  } else {
    error = new Error('Errors in validation');
    error.errors = validationErrors;
    error.status = 400;
    return next(error);
  }
};

module.exports.loginIndex = function(req, res) {
  return User.first(function(err, user) {
    var name, ref, words;
    if (user == null) {
      return res.redirect('/register');
    }
    if (((ref = user.public_name) != null ? ref.length : void 0) > 0) {
      name = user.public_name;
    } else {
      name = helpers.hideEmail(user.email);
      words = name.split(' ');
      name = words.map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    }
    return res.render("index", {
      name: name
    });
  });
};

module.exports.forgotPassword = function(req, res, next) {
  return User.first(function(err, user) {
    var key;
    if (err != null) {
      return next(new Error(err));
    } else if (user == null) {
      err = new Error("No user registered.");
      err.status = 400;
      err.headers = {
        'Location': '/register/'
      };
      return next(err);
    } else {
      key = randomstring.generate();
      Instance.setResetKey(key);
      return Instance.first(function(err, instance) {
        if (err != null) {
          next(new Error(err));
        } else if (instance == null) {
          instance = {
            domain: "domain.not.set"
          };
        }
        return helpers.sendResetEmail(instance, user, key, function(err, result) {
          if (err != null) {
            return next(new Error("Email cannot be sent"));
          } else {
            return res.send(204);
          }
        });
      });
    }
  });
};

module.exports.resetPasswordIndex = function(req, res) {
  if (Instance.getResetKey() === req.params.key) {
    return res.render("index", {
      resetKey: req.params.key
    });
  } else {
    return res.redirect('/');
  }
};

module.exports.resetPassword = function(req, res, next) {
  var key, newPassword;
  key = req.params.key;
  newPassword = req.body.password;
  return User.first(function(err, user) {
    var data, error, validationErrors;
    if (err != null) {
      return next(new Error(err));
    } else if (user == null) {
      err = new Error(localization.t("reset error no user"));
      err.status = 400;
      err.headers = {
        'Location': '/register/'
      };
      return next(err);
    } else {
      if (Instance.getResetKey() === req.params.key) {
        validationErrors = User.validatePassword(newPassword);
        if (!Object.keys(validationErrors).length) {
          data = {
            password: helpers.cryptPassword(newPassword).hash
          };
          return user.merge(data, function(err) {
            if (err != null) {
              return next(new Error(err));
            } else {
              Instance.resetKey = null;
              return passwordKeys.resetKeys(function(err) {
                if (err != null) {
                  return next(new Error(err));
                } else {
                  passport.currentUser = null;
                  return res.send(204);
                }
              });
            }
          });
        } else {
          error = new Error('Errors in validation');
          error.errors = validationErrors;
          error.status = 400;
          return next(error);
        }
      } else {
        error = new Error(localization.t("reset error invalid key"));
        error.status = 400;
        return next(error);
      }
    }
  });
};

module.exports.logout = function(req, res) {
  req.logout();
  return res.send(204);
};

module.exports.authenticated = function(req, res) {
  return res.send(200, {
    isAuthenticated: req.isAuthenticated()
  });
};
