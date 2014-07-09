
jsPath = "app/js"
coffeePath = "app/coffee"

module.exports = (grunt) ->
    grunt.initConfig

        watch:
            coffeescript:
                files: ["#{coffeePath}/**/*.coffee"],
                tasks: ['default'],

        coffee:
            compile:
                files:
                    "app/js/app.js": "#{coffeePath}/app.coffee"
                    "app/js/controllers/alfredController.js": "#{coffeePath}/controllers/alfredController.coffee"
                    "app/js/services/httpService.js": "#{coffeePath}/services/httpService.coffee"
                    "app/js/directives/scroll.js": "#{coffeePath}/directives/scroll.coffee"
                    "app/js/directives/alfred.js": "#{coffeePath}/directives/alfred.coffee"

        karma:
            unit:
                configFile: 'test/karma.conf.js',
                singleRun: true,
                logLevel: 'DEBUG'

    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-karma'

    grunt.registerTask 'default', ['coffee']
    grunt.registerTask 'test', ['karma']
