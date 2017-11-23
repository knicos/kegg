# KEGG API

A JavaScript wrapper for the KEGG biological database. Results are returned as JSON objects, see below for structure details.
There are license restrictions on the use of KEGG, along with other guidelines. Please check at http://www.kegg.jp/kegg/ to make sure you use the system appropriately.

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

### `.findReaction(query {string}, callback {function (data)})`
Result data is an array of objects with:
* `id` - KEGG reaction ID number
* `name` - Human readable reaction name

### `.findCompound(query {string}, callback {function (data)})`
Result data is an array of objects with:
* `id` - KEGG compound ID number
* `name` - Human readable compound name

### `.findCompoundByFormula(query {string}, callback {function (data)})`
Result data is an array of objects with:
* `id` - KEGG compound ID number
* `name` - Human readable compound name

### `.findCompoundByWeight(query {string}, callback {function (data)})`
Result data is an array of objects with:
* `id` - KEGG compound ID number
* `name` - Human readable compound name

### `.findCompoundByMass(query {string}, callback {function (data)})`
Result data is an array of objects with:
* `id` - KEGG compound ID number
* `name` - Human readable compound name

### `.findGene(query {string}, callback {function (data)})`

### `.findEnzyme(query {string}, callback {function (data)})`
Result data is an array of objects with:
* `id` - EC enzyme number
* `name` - Human readable enzyme name

### `.getReactionById(id {string}, callback {function (data)})`
Reaction data object:
* `names` - Array of name strings
* `definition` - Human readable reaction equation
* `equation` - Equation using KEGG id's for compounds
* `enzyme` - EC number
* `pathways` - Array of associated pathways
* `rclasses` - Object

### `.getCompoundById(id {string}, callback {function (data)})`
Compound data object:
* `names` - Array of name strings
* `formula` - Chemical formula
* `exact_mass` - Float
* `mol_weight` - Float
* `reactions` - Array of associated KEGG reaction numbers
* `pathways` - Array of associated pathways
* `enzymes` - Array of enyzyme EC numbers
* `dblinks` - Object to convert ID

### `.getGeneById(id {string}, callback {function (data)})`


### `.getEnzymeById(ec {string}, callback {function (data)})`
Enzyme data object:
* `names` - Array of name strings
* `classes` - Array of class strings
* `sysname` - String
* `reaction` - Human readable reaction
* `reactions` - Array of associated KEGG reaction IDs
* `substrates` - Array of substrate compound IDs
* `products` - Array of product compound IDs
* `comment` - String
* `genes` - Object where keys are organism code, values are gene number(s)

