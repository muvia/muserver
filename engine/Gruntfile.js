module.exports = function(grunt) {

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
					   'src/header.js',
					   'src/transform.js',
					   'src/cell.js',
					   'src/node.js',
					   'src/camera.js',
					   'src/grid.js',
					   'src/line.js',
					   'src/engine.js'
					 ],
			// the location of the resulting JS file
			dest: 'dist/<%= pkg.name %>.js'
		 }
		},
		watch: {
		  files: ['<%= concat.dist.src %>'],
			tasks: ['concat:dist']
		},
		jasmine: {
			test:{										 
		  	src :[ '../lib/gl-matrix.js', 'dist/*.js'],
		  	options: {
				specs : 'specs/**/*spec.js',
		  		helpers : 'specs/helpers/*.js',
			  	timeout : 10000
				}
	 		}
		}	
	});

grunt.loadNpmTasks('grunt-contrib-jasmine');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-concat');

grunt.registerTask('test', ['jasmine']);
grunt.registerTask('default', ['watch']);

};
