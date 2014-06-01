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
                    'src/controllers/mainctrl.js',
                    'src/controllers/authctrl.js'
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
        },
        copy: {
            dist: {
            	nonull: true,
                files: [
	                {expand: true, src: ['index.html'], dest: '../../cesarpachon.github.io/muvia/', filter: 'isFile'},
	                {expand: true, src: ['js/*'], dest: '../../cesarpachon.github.io/muvia/', filter: 'isFile'},
	                {expand: true, src: ['css/*'], dest: '../../cesarpachon.github.io/muvia/', filter: 'isFile'},
	                {expand: true, src: ['i18n/*'], dest: '../../cesarpachon.github.io/muvia/', filter: 'isFile'},
	                {expand: true, src: ['partials/*'], dest: '../../cesarpachon.github.io/muvia/', filter: 'isFile'},
	                {expand: true, src: ['img/*'], dest: '../../cesarpachon.github.io/muvia/', filter: 'isFile'}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('make', ['concat:dist']);
    grunt.registerTask('doc', ['jsdoc:dist']);
    grunt.registerTask('deploy', ['copy:dist']);
};
