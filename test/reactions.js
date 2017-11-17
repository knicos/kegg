const assert = require('assert');
const KEGG = require('../');

describe("KEGG Reactions", function() {
	it("gets reaction by id", function(done) {
		this.timeout(3000);
		KEGG.getReactionById("R04573", function(e) {
			console.log(e);
			done();
		});
	});
});

