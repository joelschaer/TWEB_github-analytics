const neo4j = require('neo4j-driver').v1;


class Neo4j {
  constructor(url, username, password) {
    this.driver = neo4j.driver(url, neo4j.auth.basic(`${username}`, `${password}`));
  }

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

  getRelation(usernameA, usernameB, relationName) {
    const session = this.driver.session();
    relationName = relationName.replace(/-/g, '_');
    relationName = relationName.replace('/', '_');
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

  newCollaborator(user, collaborator, repository) {
    // Replace '-' and '/' by '_' for the database request.
    repository = repository.replace(/-/g, '_');
    repository = repository.replace('/', '_');
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
}

module.exports = Neo4j;

