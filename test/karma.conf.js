module.exports = function(config){
    config.set({

        basePath : '../',

        preprocessors: {
            'app/partials/*.html': ['ng-html2js']
        },

        frameworks: ['jasmine'],

        files: [
            'bower_components/underscore/underscore.js',
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/mousetrap/tests/libs/key-event.js',
            'bower_components/mousetrap/mousetrap.js',
            'bower_components/angular-hotkeys/src/hotkeys.js',
            'bower_components/optparse/lib/optparse.js',
            'src/js/*.js',
            'test/unit/*.js',
            'src/templates/*.html'
        ],

        ngHtml2JsPreprocessor: {
            stripPrefix: 'src/'
        },

        autoWatch : false,
        logLevel: config.LOG_INFO,

        browsers : ['Chrome'],

        plugins : [
                'karma-chrome-launcher',
                'karma-firefox-launcher',
                'karma-jasmine',
                'karma-junit-reporter',
                'karma-ng-html2js-preprocessor'
                ],

        junitReporter : {
          outputFile: 'test_out/unit.xml',
          suite: 'unit'
        }

    });
};
