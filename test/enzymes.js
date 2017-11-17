const assert = require('assert');
const KEGG = require('../');

describe("KEGG Enzymes", function() {
	it("gets enzyme by ec", function(done) {
		this.timeout(3000);
		KEGG.getEnzymeById("6.3.2.10", function(e) {
			console.log(e);
			done();
		});
	});
});

