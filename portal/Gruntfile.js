module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ''
            },
            dist: {
                // the files to concatenate
                src: [
                    'lib/localize.js',
                    'src/muportalapp.js',
                    'src/controllers/main.js'
                ],
                // the location of the resulting JS file
                dest: 'js/<%= pkg.name %>.js'
            }
        },
        watch: {
            files: ['<%= concat.dist.src %>'],
            tasks: ['concat:dist']
        },
        jasmine: {
            test: {
                src: [ '../lib/gl-matrix.js', 'dist/*.js'],
                options: {
                    specs: 'specs/**/*spec.js',
                    helpers: 'specs/helpers/*.js',
                    timeout: 10000
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('make', ['concat:dist']);
    grunt.registerTask('doc', ['jsdoc:dist']);
};
