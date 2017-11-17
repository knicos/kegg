const assert = require('assert');
const KEGG = require('../');

describe("KEGG Compounds", function() {
	it("finds compounds by name", function(done) {
		KEGG.findCompoundByName("D-Glucono-1,5-lactone", function(c) {
			console.log(c);
			assert.ok(c.length > 0);
			done();
		});
	});

	it("gets compound by id", function(done) {
		KEGG.getCompoundById("C00198", function(c) {
			console.log(c);
			done();
		});
	});
});

