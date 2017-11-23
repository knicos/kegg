var isnode = false;
var request = null;
let base = "http://rest.kegg.jp";

// Make sure we have ajax in node
if (typeof XMLHttpRequest == "undefined") {
	request = require('request');
	isnode = true;
}

function ajax(options) {

	if (isnode) {
		request(options.url, function(error, response, body) {
			if (error) options.error();
			else options.success(body);
		});
	} else {
		var xhr = new XMLHttpRequest();
		xhr.open(options.type.toUpperCase(), encodeURI(options.url), true);
		xhr.setRequestHeader('Content-Type', 'text/plain');
		xhr.withCredentials = true;
		xhr.onreadystatechange = function() {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					options.success(xhr.responseText);
				} else {
					options.error(xhr, xhr.status, xhr.responseText);
				}
			}
		};

		try {
			if (options.data) {
				xhr.send((options.data) ? JSON.stringify(options.data) : undefined);
			} else {
				xhr.send();
			}
		} catch(e) {
			options.error(e);
		}
	}
}

//-----------------------------------------------------------------------------
//    FIND
//-----------------------------------------------------------------------------

function KEGGfind(database, q, opt, cb) {
	if (!cb) return;
	if (!database || !q) {
		cb(null, "Missing database or query");
		return;
	}

	ajax({
		url: base+"/find/"+database+"/"+q+((opt) ? "/"+opt : ""),
		type: "get",
		dataType: "text/plain",
		success: function(data) {
			//console.log(data);
			let lines = data.split("\n");
			let res = [];
			for (var i=0; i<lines.length; i++) {
				let line = lines[i].split("\t");
				if (line[0] != "") {
					res.push({id: line[0].split(":")[1], names: (line.length > 1) ? line[1].split("; ") : null});
				}
			}

			cb(res);
		},
		error: function(a,b,c) {
			cb(null, c);
		}
	});
}

function KEGGfindCompoundByFormula(q, cb) {
	KEGGfind("compound", q, "formula", cb);
}

function KEGGfindCompoundByMass(q, cb) {
	KEGGfind("compound", q, "exact_mass", cb);
}

function KEGGfindCompoundByWeight(q, cb) {
	KEGGfind("compound", q, "mol_weight", cb);
}

function KEGGfindCompound(q, cb) {
	KEGGfind("compound", q, undefined, cb);
}

function KEGGfindReaction(q, cb) {
	KEGGfind("reaction", q, undefined, cb);
}

function KEGGfindGene(q, cb) {
	KEGGfind("genes", q, undefined, cb);
}

function KEGGfindEnzyme(q, cb) {
	KEGGfind("enzyme", q, undefined, cb);
}

function KEGGfindGene(q, cb) {
	KEGGfind("pathway", q, undefined, cb);
}

//-----------------------------------------------------------------------------
//    GET
//-----------------------------------------------------------------------------

function KEGGget(id, kind, cb) {
	ajax({
		url: base+"/get/"+id+((kind) ? "/"+kind : ""),
		type: "get",
		dataType: "text/plain",
		success: function(data) {
			cb(data);
		},
		error: function() {
			cb(null);
		}
	});
}

//-----------------------------------------------------------------------------
//    GET Compounds
//-----------------------------------------------------------------------------

let kegg_cache = {};

/**
 * Get compound by KEGG identifier. The identifier should start with a "C".
 * The callback function is called with a single parameter which is the JSON
 * data object for the compound or null if there was an error.
 *
 * @param id {string} KEGG Identifier
 * @param cb {Function} Callback
 */
function KEGGgetCompoundById(id, cb) {
	if (kegg_cache.hasOwnProperty(id)) {
		cb(kegg_cache[id]);
	} else {
		KEGGget(id, undefined, function(d) {
			if (!d || d == "") {
				cb(null);
				return;
			}
			let c = {
				id: id,
				names: [],
				formula: null,
				exact_mass: null,
				mol_weight: null,
				reactions: [],
				pathways: [],
				enzymes: [],
				dblinks: {} //,
				//atoms: [],
				//bond: []
			};

			let prevprop = "";
			let lines = d.split("\n");
			let t;
			for (var i=0; i<lines.length; i++) {
				let prop = lines[i].substring(0,12).trim();
				let val = lines[i].substring(12).trim();

				if (prop == "") prop = prevprop;
				prevprop = prop;

				switch (prop) {
				case "ENTRY"		:	break;
				case "NAME"			:	c.names.push(val.replace(";","")); break;
				case "FORMULA"		:	c.formula = val; break;
				case "EXACT_MASS"	:	c.exact_mass = parseFloat(val); break;
				case "MOL_WEIGHT"	:	c.mol_weight = parseFloat(val); break;
				case "REMARK"		:	break;
				case "REACTION"		:	c.reactions.push.apply(c.reactions, val.split(" ")); break;
				case "PATHWAY"		:	break;
				case "ENZYME"		:	c.enzymes.push.apply(c.enzymes, val.split(" ").filter(function(a) { return !a == ""; })); break;
				case "BRITE"		:	break;
				case "DBLINKS"		:	t = val.split(":"); c.dblinks[t[0]] = t[1].trim(); break;
				case "ATOM"			:	break;
				case "BOND"			:	break;
				default				:	break;
				}
			}

			kegg_cache[id] = c;
			cb(c);
		});
	}
}

//-----------------------------------------------------------------------------
//    GET Gene
//-----------------------------------------------------------------------------

function KEGGgetGeneById(id, cb) {
	
}

//-----------------------------------------------------------------------------
//    GET Enzyme
//-----------------------------------------------------------------------------

function extractCPD(s) {
	let start = s.indexOf("[CPD:");
	if (start >= 0) {
		let end = s.indexOf("]");
		return s.substring(start+5,end);
	}
	return s;
}

function KEGGgetEnzymeById(ec, cb, opt) {
	if (kegg_cache.hasOwnProperty("ec"+ec)) {
		cb(kegg_cache["ec"+ec]);
	} else {
		KEGGget("ec:"+ec, undefined, function(d) {
			let c = {
				id: ec,
				names: [],
				classes: [],
				sysname: null,
				reaction: null,
				reactions: [],
				substrates: [],
				products: [],
				comment: null,
				pathways: [],
				genes: {}
			};

			let prevprop = "";
			let lines = d.split("\n");
			let t;
			for (var i=0; i<lines.length; i++) {
				let prop = lines[i].substring(0,12).trim();
				let val = lines[i].substring(12).trim();

				if (prop == "") prop = prevprop;
				prevprop = prop;

				switch (prop) {
				case "ENTRY"		:	break;
				case "NAME"			:	c.names.push(val.replace(";","")); break;
				case "CLASS"		:	c.classes.push(val.replace(";","")); break;
				case "SYSNAME"		:	c.sysname = val; break;
				case "REACTION"		:	c.reaction = val; break;
				case "ALL_REAC"		:	c.reactions.push(val.replace(";","")); break;
				case "SUBSTRATE"	:	c.substrates.push(extractCPD(val.replace(";",""))); break;
				case "PRODUCT"		:	c.products.push(extractCPD(val.replace(";",""))); break;
				case "COMMENT"		:	c.comment = val; break;
				case "PATHWAY"		:	break;
				case "GENES"		:	t = val.split(": "); if (!opt || !opt.organism || opt.organism.toUpperCase() == t[0]) c.genes[t[0]] = t[1].replace("(murF)",""); break;
				default				:	break;
				}
			}

			kegg_cache["ec"+ec] = c;
			cb(c);
		});
	}
}

//-----------------------------------------------------------------------------
//    GET Reaction
//-----------------------------------------------------------------------------

function KEGGgetReactionById(id, cb, opt) {
	if (kegg_cache.hasOwnProperty(id)) {
		cb(kegg_cache[id]);
	} else {
		KEGGget(id, undefined, function(d) {
			let c = {
				id: id,
				names: [],
				definition: null,
				equation: null,
				enzyme: null,
				pathways: [],
				rclasses: {}
			};

			let prevprop = "";
			let lines = d.split("\n");
			let t;
			for (var i=0; i<lines.length; i++) {
				let prop = lines[i].substring(0,12).trim();
				let val = lines[i].substring(12).trim();

				if (prop == "") prop = prevprop;
				prevprop = prop;

				switch (prop) {
				case "ENTRY"		:	break;
				case "NAME"			:	c.names.push(val.replace(";","")); break;
				case "RCLASS"		:	t = val.split(" "); c.rclasses[t[0]] = t[2]; break;
				case "DEFINITION"	:	c.definition = val; break;
				case "EQUATION"		:	c.equation = val; break;
				case "ENZYME"		:	c.enzyme = val; break;
				case "PATHWAY"		:	break;
				default				:	break;
				}
			}

			kegg_cache[id] = c;
			cb(c);
		});
	}
}


//-----------------------------------------------------------------------------

function KEGGlink(target, source, cb) {
	ajax({
		url: base+"/link/"+target+"/"+source,
		type: "get",
		dataType: "text/plain",
		success: function(data) {
			let res = [];
			let lines = data.split("\n");
			for (var i=0; i<lines.length; i++) {
				let line = lines[i].split("	");
				if (line.length < 2) continue;
				res.push({source: line[0], target: line[1]});
			}
			cb(res);
		},
		error: function() {
			cb(null);
		}
	});
}

//-----------------------------------------------------------------------------

function KEGGgetReactionsForCompound(id, cb) {
	KEGGlink("reaction", id, function(data) {
		if (!data) cb(data);
		var rs = [];
		for (var i=0; i<data.length; i++) {
			rs.push(data[i].target.split(":")[1]);
		}
		cb(rs);
	});
}

function KEGGgetReactionsForEnzyme(id, cb) {
	KEGGlink("reaction", "ec:"+id, function(data) {
		if (!data) cb(data);
		var rs = [];
		for (var i=0; i<data.length; i++) {
			rs.push(data[i].target.split(":")[1]);
		}
		cb(rs);
	});
}

//-----------------------------------------------------------------------------

function options(o) {
	for (var x in o) {
		switch(x) {
		case "url"		: base = o.url; break;
		}
	}
}

exports.find = KEGGfind;

exports.findCompound = KEGGfindCompound;
exports.findCompoundByFormula = KEGGfindCompoundByFormula;
exports.findCompoundByWeight = KEGGfindCompoundByWeight;
exports.findCompoundByMass = KEGGfindCompoundByMass;
exports.findReaction = KEGGfindReaction;
exports.findGene = KEGGfindGene;
exports.findEnzyme = KEGGfindEnzyme;

exports.get = KEGGget;

exports.getCompoundById = KEGGgetCompoundById;
exports.getReactionById = KEGGgetReactionById;
exports.getEnzymeById = KEGGgetEnzymeById;

exports.getReactionsForCompound = KEGGgetReactionsForCompound;
exports.getReactionsForEnzyme = KEGGgetReactionsForEnzyme;

exports.options = options;



