var mock = require('mock-fs');
var expect = require('expect');
var FileSystem = require('../../model/filesystem.js');

describe('FileSystem model', function() {
	beforeEach( function () {
		mock({
			'dir_to_serve/nested_dir_01/file_01_01.txt': 'file_01_01 content'
		})
	});

	describe( '#freaddir', function (done) {
		it('should return directory content', function(done) {
			var fReadDir = FileSystem.freaddir('dir_to_serve/nested_dir_01');
			fReadDir.then( function (files) {
				expect(files).toContain( 'file_01_01.txt');
				done();
			});			
		});
	});

	describe( '#fstat', function (done) {
		it('should return status error', function(done) {
			var fStat = FileSystem.fstat('doesnt_exist_file.txt');

			fStat.fail( function (err) {
				done();
			});
		});

		it('should return file status', function(done) {
			var fStat = FileSystem.fstat('dir_to_serve/nested_dir_01/file_01_01.txt');

			fStat.then( function (stat) {
				expect(stat.isFile()).toBe(true);
				done();
			});
		});

		it('should return directory status', function(done) {
			var fStat = FileSystem.fstat('dir_to_serve/nested_dir_01');

			fStat.then( function (stat) {
				expect(stat.isDirectory()).toBe(true);
				done();
			});
		});
	});
	
	afterEach( mock.restore);
});
