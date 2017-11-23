# KEGG API

A JavaScript wrapper for the KEGG biological database. Results are returned as JSON objects, see below for structure details.

## Installation

```
npm install kegg-db --save
```

## Usage

```javascript
const KEGG = require('kegg-db');

KEGG.getReactionById("R04573", function(data) {
	...
});
```
Due to HTTPS and CORS restrictions in a browser you may need to proxy the database. Set the new database URL using:

```javascript
KEGG.options({url: "http://..."});
```

## Documentation

### findReaction
* query - A string reaction name or partial name
* callback - Function with one parameter for an array of results

Results are an array of objects containing:
* id - KEGG reaction ID number
* name - Human readable reaction name

### findCompound
* query - A string compound name
* callback - Function with one parameter for an array of results

### findCompoundByFormula

### findCompoundByWeight

### findCompoundByMass

### findGene

### findEnzyme

### getReactionById
* id - KEGG reaction ID, eg. "R04573"
* callback - Function with one parameter for returned data

The callback may have a null parameter if there was no match.

Reaction Object:
* names - Array of name strings
* definition - Human readable reaction equation
* equation - Equation using KEGG id's for compounds
* enzyme - EC number
* pathways - Array of associated pathways
* rclasses - Object

### getCompoundById
* id - KEGG compound ID, eg. "C00008"
* callback - Function with one parameter for returned data

Compound Object:
* names - Array of name strings
* formula - Chemical formula
* exact_mass - Float
* mol_weight - Float
* reactions - Array of associated KEGG reaction numbers
* pathways - Array of associated pathways
* enzymes - Array of enyzyme EC numbers
* dblinks - Object to convert ID

### getGeneById
* id - gene ID, eg. "slr1351"
* callback - Function with one parameter for returned data

Gene Object:


### getEnzymeById
* id - Enzyme EC number, eg. "6.3.2.10"
* callback - Function with one parameter for returned data

Enzyme Object:
* names - Array of name strings
* classes - Array of class strings
* sysname - String
* reaction - Human readable reaction
* reactions - Array of associated KEGG reaction IDs
* substrates - Array of substrate compound IDs
* products - Array of product compound IDs
* comment - String
* genes - Object where keys are organism code, values are gene number(s)

