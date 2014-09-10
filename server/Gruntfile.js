module.exports = function(grunt) {

  grunt.initConfig({

    jasmine_node: {
      options: {
        forceExit: true,
        match: '.',
        matchall: false,
        extensions: 'js',
        specNameMatcher: 'spec',
        useHelpers: true,
        helperNameMatcher: 'helpers',
        jUnit: {
          report: true,
          savePath : "./build/reports/jasmine/",
          useDotNotation: true,
          consolidate: true
        }
      },
      all: ['spec/'],
      api: ['spec/api'],
      unit: ['spec/unit']
    },

    jshint: {
      options:{
        jshintrc:true
      },
      target:{
        src:[
          'api/**/*.js',
          'models/**/*.js',
          'services/**/*.js',
          'tools/**/*.js'
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-jshint');


  grunt.registerTask('make', ['jshint', 'jasmine_node']);
  grunt.registerTask('test:api', ['jasmine_node:api']);
  grunt.registerTask('test:unit', ['jasmine_node:unit']);

  grunt.registerTask('default', 'make');
};
