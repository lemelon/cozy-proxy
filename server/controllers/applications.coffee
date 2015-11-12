appManager = require '../lib/app_manager'
{getProxy} = require '../lib/proxy'
fs = require 'fs'

module.exports.app = (req, res, next) ->
    appName = req.params.name
    req.url = req.url.substring "/apps/#{appName}".length
    shouldStart = -1 is req.url.indexOf 'socket.io'
    appManager.ensureStarted appName, shouldStart, (err, result) ->
        if err?
            error = new Error err.msg
            error.status = err.code
            error.template =
                name: if err.code is 404 then 'not_found' else 'error_app'
            next error
        else if result.port?
            getProxy().web req, res, target: "http://localhost:#{result.port}"
        else
            # if public repository exists, then redirect to public app
            if fs.existsSync result.path + '/public/index.html'
                req.url = "/public/#{appName}"
                res.redirect "#{req.url}/"
            else
                # showing private static app
                appManager.startStaticApp appName, req.url, result.path, (
                    err, result
                ) ->
                    if err?
                        error = new Error err.msg
                        error.status = err.code
                        next error
                    else
                        res.send result

module.exports.publicApp = (req, res, next) ->
    appName = req.params.name
    req.url = req.url.substring "/public/#{appName}".length
    req.url = "/public#{req.url}"

    shouldStart = -1 is req.url.indexOf 'socket.io'
    appManager.ensureStarted appName, shouldStart, (err, result) ->
        if err?
            error = new Error err.msg
            error.status = err.code
            error.template =
                name: 'error_public'
            next error
        else if result.port?
            getProxy().web req, res, target: "http://localhost:#{result.port}"
        else
            # showing public static app
            appManager.startStaticApp appName, req.url, result.path, (
                err, result
            ) ->
                if err?
                    error = new Error err.msg
                    error.status = err.code
                    next error
                else
                    res.send result

module.exports.appWithSlash = (req, res) -> res.redirect "#{req.url}/"
