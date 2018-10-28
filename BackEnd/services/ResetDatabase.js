/**
 * BrainContributors
 * Authors Yann Lederrey and Joel Schär
 *
 * Deleting all nodes in the database. Is called when a reset of the databse is requested.
 */

require('dotenv/config');
const Neo4j = require('../src/Neo4j');

const db = new Neo4j(process.env.GRAPHENEDB_BOLT_URL, process.env.GRAPHENEDB_BOLT_USER, process.env.GRAPHENEDB_BOLT_PASSWORD);

function resetDatabase() {
  db.deleteAllNodes();
}

module.exports = {
  resetDatabase,
};
