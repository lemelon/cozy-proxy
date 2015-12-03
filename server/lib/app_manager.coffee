Client = require('request-json').JsonClient
logger = require('printit')
    date: false
    prefix: 'lib:app_manager'

class AppManager

    isStarting: []

    constructor: ->
        homePort = process.env.DEFAULT_REDIRECT_PORT
        @client = new Client "http://localhost:#{homePort}/"
        @router = require './router'

    # check if an application's state, start the app if requested
    ensureStarted: (slug, shouldStart, callback) ->
        routes = @router.getRoutes()
        if not routes[slug]?
            callback code: 404, msg: 'app unknown'
            return
        switch routes[slug].state
            when 'broken'
                callback code: 500, msg: 'app broken'
            when 'installing'
                callback code: 404, msg: 'app is still installing'
            when 'installed'
                callback null, routes[slug]
            when 'stopped'
                if shouldStart and not @isStarting[slug]?
                    @isStarting[slug] = true
                    @startApp slug, (err, response) =>
                        delete @isStarting[slug]
                        if err?
                            callback code: 500, msg: "cannot start app : #{err}"
                        else
                            callback null, response
                else
                    callback code: 500, msg: 'wont start'

            else callback code: 500, msg: 'incorrect app state'

    versions: (callback) ->
        @client.get "api/applications/stack", (error, res, apps) ->
            return callback error if error?
            callback null, apps.rows.map (app) ->
                return "#{app.name}: #{app.version}"

module.exports = new AppManager()
