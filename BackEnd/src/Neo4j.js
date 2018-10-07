const neo4j = require('neo4j-driver').v1;


class Neo4j {
  constructor(username, password) {
    this.driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic(`${username}`, `${password}`));
  }

  finalize() {
    this.driver.close();
  }

  creatUser(username) {
    const session = this.driver.session();

    const resultPromise = session.run(
      'CREATE (user:User {username: $name}) RETURN user',
      { name: `${username}` },
    );

    resultPromise.then(result => {
      session.close();

      const record = result.records[0];
      const node = record.get(0);
      console.log(node.properties.username);

      this.finalize();
    }).catch(error => {
      console.log(error);
    });
  }

  getUser(username) {
    const session = this.driver.session();

    const resultPromise = session.run(
      'MATCH (user:User {username:$name}) RETURN user',
      { name: `${username}` },
    );


    resultPromise.then(result => {
      session.close();

      const record = result.records[0];
      const node = record.get(0);
      console.log(node.properties.username);

      this.finalize();
      return (node.properties.username);
    }).catch(error => {
      console.log(error);
    });
  }

  newCollaborator(user, collaborator, repository) {
    const session = this.driver.session();

    const resultPromise = session.run(
      `MATCH (user:User), (collaborator:User)
      WHERE collaborator.username = $user AND user.username = $collaborator
       CREATE (user)-[r:${repository}]->(collaborator)`,
      { user: `${user}`, collaborator: `${collaborator}` },
    );

    resultPromise.then(result => {
      session.close();

      this.finalize();
    }).catch(error => {
      console.log(error);
    });
  }
}

module.exports = Neo4j;


const neo = new Neo4j('neo4j', '1234');

// neo.creatUser('joel');
// neo.creatUser('yann');

neo.newCollaborator('joel', 'yann', 'sym_repo');
