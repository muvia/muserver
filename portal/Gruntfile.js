module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: '//------\n'
      },
      dist: {
        // the files to concatenate
        src: [
          'lib/localize.js',
          'src/world01/world01manager.js',
          'src/muportalapp.js',
          'src/services/*.js',
          'src/directives/*.js',
          'src/controllers/*.js'
        ],
        // the location of the resulting JS file
        dest: 'js/<%= pkg.name %>.js'
      }
    },
    watch: {
      files: ['<%= concat.dist.src %>', 'index.html', 'partials/**/*', 'img/**/*', 'css/**/', 'i18n/**/*'],
      tasks: ['jshint', 'jasmine', 'concat:dist', 'copy:dist']
    },
    jasmine: {
      test: {
        src: [
          'js/gl-matrix.js',
          'js/muengine.js',
          'js/mucontroller.js',
          'src/world01/*.js'
        ],
        options: {
          specs: 'specs/**/*spec.js',
          helpers: 'specs/helpers/*.js',
          timeout: 10000,
          keepRunner: true
        }
      }
    },
    jsdoc: {
      dist: {
        src: ['src/*.js'],
        options: {
          destination: 'jsdoc'
        }
      }
    },

    jshint: {
      options:{
        jshintrc:true
      },
      target:{
        src:['<%= concat.dist.src %>']
      }
    },

    copy: {
      vendor:{
        nonull: true,
        files:[
          {expand: false, src: ['vendor/angular/angular.js'], dest: 'js/angular.js', filter: 'isFile'},
          {expand: false, src: ['vendor/angular-route-unstable/angular-route.js'], dest: 'js/angular-route.js', filter: 'isFile'},
          {expand: false, src: ['vendor/angular-bootstrap/ui-bootstrap-tpls.js'], dest: 'js/ui-bootstrap-tpls.js', filter: 'isFile'},
          {expand: false, src: ['vendor/gl-matrix/dist/gl-matrix.js'], dest: 'js/gl-matrix.js', filter: 'isFile'},
          {expand: false, src: ['vendor/howler/howler.js'], dest: 'js/howler.js', filter: 'isFile'},
          {expand: false, src: ['vendor/bootstrap/dist/css/bootstrap.min.css'], dest: 'css/bootstrap.min.css', filter: 'isFile'},
          {expand: false, src: ['vendor/bootstrap/dist/css/bootstrap-theme.min.css'], dest: 'css/bootstrap-theme.min.css', filter: 'isFile'},
          {expand: false, src: ['vendor/howler/howler.js'], dest: 'js/howler.js', filter: 'isFile'}
        ]
      },
      dist: {
        nonull: true,
        files: [
          {expand: true, src: ['index.html'], dest: '../server/portal/', filter: 'isFile'},
          {expand: true, src: ['js/**/*'], dest: '../server/portal/', filter: 'isFile'},
          {expand: true, src: ['css/**/*'], dest: '../server/portal/', filter: 'isFile'},
          {expand: true, src: ['i18n/**/*'], dest: '../server/portal/', filter: 'isFile'},
          {expand: true, src: ['partials/**/*'], dest: '../server/portal/', filter: 'isFile'},
          {expand: true, src: ['img/**/*'], dest: '../server/portal/', filter: 'isFile'},
          {expand: true, src: ['assets/**/*'], dest: '../server/portal/', filter: 'isFile'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');


  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('make', ['copy:vendor', 'concat:dist', 'copy:dist']);
  grunt.registerTask('doc', ['jsdoc:dist']);
  grunt.registerTask('deploy', ['copy:dist']);
};
