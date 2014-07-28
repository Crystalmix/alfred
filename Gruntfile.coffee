

coffeePath = "src/coffee"

module.exports = (grunt) ->
    grunt.initConfig

        watch:
            coffeescript:
                files: ["#{coffeePath}/**/*.coffee"],
                tasks: ['default'],
            dev:
                files: ["demo/coffee/**/*.coffee"],
                tasks: ['demo'],

        concat:
            dist:
                src: [
                    "#{coffeePath}/module.coffee",
                    "#{coffeePath}/services/quickConnectParser.coffee"
                    "#{coffeePath}/directives/alfred.coffee",
                    "#{coffeePath}/directives/inactiveList.coffee",
                    "#{coffeePath}/directives/activeList.coffee",
                    "#{coffeePath}/directives/connectionItem.coffee",
                    "#{coffeePath}/directives/whenScrolled.coffee",
                    "#{coffeePath}/filteres/filterConnections.coffee"
                    ],
                dest: "#{coffeePath}/alfred.coffee",

        coffee:
            compile:
                files:
                    "src/js/alfred.js": "#{coffeePath}/alfred.coffee"

            dev:
                files:
                    "demo/js/app.js": "demo/coffee/app.coffee"
                    "demo/js/controllers/alfredController.js": "demo/coffee//controllers/alfredController.coffee"
                    "demo/js/services/httpService.js": "demo/coffee//services/httpService.coffee"

        clean:
            build: "#{coffeePath}/alfred.coffee"

        karma:
            unit:
                configFile: 'test/karma.conf.js',
                singleRun: true,
                logLevel: 'INFO'

    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-karma'
    grunt.loadNpmTasks 'grunt-contrib-concat'
    grunt.loadNpmTasks 'grunt-contrib-clean'

    grunt.registerTask 'default', ['concat', 'coffee', 'clean']
    grunt.registerTask 'demo', ['coffee:dev']
    grunt.registerTask 'test', ['karma']
