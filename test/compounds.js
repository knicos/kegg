const assert = require('assert');
const KEGG = require('../');

describe("KEGG Compounds", function() {
	it("finds compounds by name", function(done) {
		KEGG.findCompound("D-Glucono-1,5-lactone", function(c) {
			assert.ok(c.length > 0);
			done();
		});
	});

	it("gets compound by id", function(done) {
		KEGG.getCompoundById("C00198", function(c) {
			assert.equal('D-Glucono-1,5-lactone', c.names[0]);
			done();
		});
	});

	it("get reactions for compound", function(done) {
		this.timeout(5000);
		KEGG.getReactionsForCompound("C00198", function(data) {
			assert.ok(data.length > 0);
			done();
		});
	});
});

