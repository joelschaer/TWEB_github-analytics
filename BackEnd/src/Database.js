const neo4j = require('neo4j');

class Database {
  constructor({ baseUrl = 'http://localhost:7474' } = {}) {
    this.baseUrl = baseUrl;
    this.db = new neo4j.GraphDatabase(this.baseUrl);
  }

  createNode() {
    const node = this.db.createNode({ hello: 'world' });
    node.save((err, node) => {
      if (err) {
        console.error('Error saving new node to database:', err);
      } else {
        console.log('Node saved to database with id:', node.id);
      }
    });
  }
}


module.exports = Database;
