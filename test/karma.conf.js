module.exports = function(config){
    config.set({

        basePath : '../',

        preprocessors: {
            'app/partials/*.html': ['ng-html2js']
        },

        files : [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-ui-route/release/angular-ui-route.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'app/js/**/*.js',
            'test/unit/*.js',
            'app/partials/*.html'
        ],

        ngHtml2JsPreprocessor: {
            stripPrefix: 'app/'
        },

        autoWatch : true,

        frameworks: ['jasmine'],

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
