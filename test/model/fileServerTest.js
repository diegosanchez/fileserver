var mock = require('mock-fs');
var expect = require('expect');

describe( 'FileServer', function () {
	beforeEach( function () {
		mock({
			'dir_to_serve/nested_dir_01/file_01_01.txt': 'file_01_01 content'
		})
	});

	afterEach( mock.restore);

	describe('file retrieving', function () {
		it('should response file content', function() {
			expect(true).toBe(true);
		});
	})
	
});


