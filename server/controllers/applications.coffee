appManager = require '../lib/app_manager'
{getProxy} = require '../lib/proxy'
send = require 'send'
lockedpath = require 'lockedpath'
logger = require('printit')
    date: false
    prefix: 'controllers:applications'

# get path to start a static app
getPathForStaticApp = (appName, path, root, callback) ->
    logger.info "Starting static app #{appName}"

    path += 'index.html' if path is '/' or path is '/public/'
    callback lockedpath(root).join path

module.exports.app = (req, res, next) ->
    console.log 'APPLICATION OPEN'
    console.log req.params
    appName = req.params.name
    req.url = req.url.substring "/apps/#{appName}".length
    console.log req.url
    shouldStart = -1 is req.url.indexOf 'socket.io'
    console.log 'ensureStarted'
    appManager.ensureStarted appName, shouldStart, (err, result) ->
        console.log 'ensure started result'
        console.log result
        if err?
            error = new Error err.msg
            error.status = err.code
            error.template =
                name: if err.code is 404 then 'not_found' else 'error_app'
            next error
        else if result.type is 'static'
            console.log result.type
            if req.query.token is result.token
                req.url = '/'
                req.isAuthenticated() = true
                return res.redirect "/apps/#{appName}/*"
            # else
            #     error = new Error 'Not authorized to access static app'
            #     error.status = 401
            #     next error
            # showing private static app
            getPathForStaticApp appName, req.url, result.path, (url) ->
                console.log '///////////////'
                console.log url
                console.log '//////////////////'
                send(req, url).pipe res
        else
            getProxy().web req, res, target: "http://localhost:#{result.port}"

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
        else if result.type is 'static'
            # showing public static app
            getPathForStaticApp appName, req.url, result.path, (url) ->
                send(req, url).pipe res
        else
            getProxy().web req, res, target: "http://localhost:#{result.port}"

module.exports.appWithSlash = (req, res) -> res.redirect "#{req.url}/"
