module.exports = function(config){
    config.set({

        basePath : '../',

        files : [
            'bower_components/angular/angular.js',
            'bower_components/angular-ui-route/release/angular-ui-route.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'app/js/**/*.js',
            'test/unit/**/*.js',
            'app/partials/*.html'
        ],

        /*preprocessors: {
            'app/partials*//*.html': 'html2js'
        },
        ngHtml2JsPreprocessor: {
            // strip app from the file path
            stripPrefix: 'app/'
        },*/

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        plugins : [
                'karma-chrome-launcher',
                'karma-firefox-launcher',
                'karma-jasmine',
                'karma-junit-reporter'
                ],

        junitReporter : {
          outputFile: 'test_out/unit.xml',
          suite: 'unit'
        }

    });
};
