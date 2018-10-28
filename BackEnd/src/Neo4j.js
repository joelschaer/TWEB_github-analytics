/**
 * BrainContributors
 * Authors Yann Lederrey and Joel Schär
 *
 * Neo4j access class. Gives the project needed function to access the neo4j database.
 * Initialisation of the database connexion and retriving the needed information.
 */
const neo4j = require('neo4j-driver').v1;
const tools = require('../src/Tools');

class Neo4j {
  constructor(url, username, password) {
    this.driver = neo4j.driver(url, neo4j.auth.basic(`${username}`, `${password}`));
  }

  /** creates a node with the given username */
  creatUser(username) {
    const session = this.driver.session();

    const resultPromise = session.run(
      'MERGE (user:User {username: $name}) RETURN user',
      { name: `${username}` },
    );

    resultPromise.then(result => {
      session.close();

      const record = result.records[0];
      const node = record.get(0);
    }).catch(error => {
      console.log(error);
    });
  }

  /** returns the node for the requested username */
  getUser(username) {
    const session = this.driver.session();

    return session.run(
      'MATCH (user:User {username:$name}) RETURN user',
      { name: `${username}` },
    ).then(result => {
      session.close();

      const record = result.records[0];
      let node = null;
      if (result.records[0]) node = record.get(0);

      return node;
    }).catch(error => {
      console.log(error);
    });
  }

  /** returns a array with all nodes present in the database */
  getUserAll() {
    const session = this.driver.session();

    return session.run(
      'Match (n:User) Return n',
    ).then(result => {
      session.close();

      const listUser = new Set();
      for (let i = 0; i < result.records.length; i++) {
        const record = result.records[i];
        let name = '';
        if (typeof result.records[0] !== 'undefined') name = record.get(0).properties.username;
        listUser.add(name);
      }
      const arrayListUsers = Array.from(listUser);
      return arrayListUsers;
    }).catch(error => {
      console.log(error);
    });
  }

  /** returns an array with all nodes having a link to the given username on the first relationnal
   * degree */
  getUserAllLevel1(username) {
    const session = this.driver.session();

    return session.run(
      // 'MATCH (user) RETURN user',
      `Match (n:User)-[r]-(m) Where n.username='${username}' Return m`,
    ).then(result => {
      session.close();

      const listUser = new Set();
      for (let i = 0; i < result.records.length; i++) {
        const record = result.records[i];
        let name = '';
        if (typeof result.records[0] !== 'undefined') name = record.get(0).properties.username;
        listUser.add(name);
      }
      const arrayListUsers = Array.from(listUser);
      return arrayListUsers;
    }).catch(error => {
      console.log(error);
    });
  }

  /** returns an array with all nodes having a link to the given username on the second relationnal
   * degree */
  getUserAllLevel2(username) {
    const session = this.driver.session();

    return session.run(
      // 'MATCH (user) RETURN user',
      `Match (n:User)-[r]-(m)-[s]-(o) Where n.username='${username}' Return o`,
    ).then(result => {
      session.close();

      const listUser = new Set();
      for (let i = 0; i < result.records.length; i++) {
        const record = result.records[i];
        let name = '';
        if (typeof result.records[0] !== 'undefined') name = record.get(0).properties.username;
        listUser.add(name);
      }
      const arrayListUsers = Array.from(listUser);
      return arrayListUsers;
    }).catch(error => {
      console.log(error);
    });
  }

  /** returns an array with all nodes having a link to the given username on the third relationnal
   * degree */
  getUserAllLevel3(username) {
    const session = this.driver.session();

    return session.run(
      // 'MATCH (user) RETURN user',
      `Match (n:User)-[r]-(m)-[s]-(o)-[t]-(p) Where n.username='${username}' Return p`,
    ).then(result => {
      session.close();

      const listUser = new Set();
      for (let i = 0; i < result.records.length; i++) {
        const record = result.records[i];
        let name = '';
        if (typeof result.records[0] !== 'undefined') name = record.get(0).properties.username;
        listUser.add(name);
      }
      const arrayListUsers = Array.from(listUser);
      return arrayListUsers;
    }).catch(error => {
      console.log(error);
    });
  }

  /** returns an array with the relations between user A and user B and the given relation name */
  getRelation(usernameA, usernameB, relationName) {
    const session = this.driver.session();
    relationName = tools.formatStringForNeo4j(relationName);
    return session.run(
      `MATCH (:User {username: '${usernameA}'})-[r:${relationName}]-(b:User {username: '${usernameB}'}) RETURN r`,
    ).then(result => {
      session.close();

      const listRelation = [];
      for (let i = 0; i < result.records.length; i++) {
        const record = result.records[i];
        const relation = {};
        if (typeof result.records[0] !== 'undefined') relation.name = record.get(0).properties.username;
        listRelation.push(relation);
      }
      return listRelation;
    }).catch(error => {
      console.log(error);
    });
  }

  /** returns a string containing all relation names between the two given users */
  getAllRelation(usernameA, usernameB) {
    const session = this.driver.session();
    return session.run(
      `MATCH (:User {username: '${usernameA}'})-[r]-(:User {username: '${usernameB}'}) RETURN r`,
    ).then(result => {
      session.close();

      let project = '';
      for (let i = 0; i < result.records.length; i++) {
        project += `${result.records[i].get(0).type}  `;
      }
      return project;
    }).catch(error => {
      console.log(error);
    });
  }

  /** create a new node and the relation between the given user and a collaorator for a given 
   * repository */
  newCollaborator(user, collaborator, repository) {
    repository = tools.formatStringForNeo4j(repository);
    const session = this.driver.session();

    const resultPromise = session.run(
      `MATCH (user:User), (collaborator:User)
      WHERE collaborator.username = $user AND user.username = $collaborator
       MERGE (user)-[r:${repository} {username: '${repository}' }]->(collaborator)`,
      { user: `${user}`, collaborator: `${collaborator}` },
    );

    resultPromise.then(result => {
      session.close();
    }).catch(error => {
      console.log(error);
    });
  }

  /** delte the node with the given username */
  deleteOneNode(username) {
    const session = this.driver.session();

    const resultPromise = session.run(
      `MATCH (n { username: "${username}" }) DETACH DELETE n`,
    );
    resultPromise.then(result => {
      session.close();
    }).catch(error => {
      console.log(error);
    });
  }

  /** delete all nodes in the database */
  deleteAllNodes() {
    const session = this.driver.session();
    const resultPromise = session.run('MATCH (n) DETACH DELETE n');

    resultPromise.then(result => {
      session.close();
    }).catch(error => {
      console.log(error);
    });
  }
}

module.exports = Neo4j;
