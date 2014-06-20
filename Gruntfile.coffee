
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


    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-contrib-coffee'

    grunt.registerTask 'default', ['coffee']
