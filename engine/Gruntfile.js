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
		}
	});

grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-concat');

grunt.registerTask('default', ['watch']);

};
