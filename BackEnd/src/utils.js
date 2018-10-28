/**
 * BrainContributors
 * Authors Yann Lederrey and Joel Schär
 *
 * Provides multiple function for the backend work flow.
 */
const Neo4j = require('../src/Neo4j');

const db = new Neo4j(process.env.GRAPHENEDB_BOLT_URL, process.env.GRAPHENEDB_BOLT_USER, process.env.GRAPHENEDB_BOLT_PASSWORD);

/** entry: dictionnary with all repos and contributrors from one user
 * returns a dictionnary with all contributors and their associte contribution repository.
 */
function getContributorsName(data) {
  const repos = data.repos;
  const contributors = data.contributors;
  const listrepos = {};
  // parcours les bloc de contributeurs (correspondant aux repositories)
  for (let i = 0; i < contributors.length; i++) {
    const name = [];

    let ok = false;
    if (contributors[i] === null) {
      continue;
    }
    // parcours les contributeurs de chaque répos
    for (let j = 0; j < contributors[i].length; j++) {
      // on ne met pas le username dans la liste, seulement ses contributeurs
      if (contributors[i][j].login !== data.username) {
        name.push(contributors[i][j].login);
      }

      // si le username choisi apparait dans la liste des contributeurs
      // && que la liste ne contient pas que username
      if ((contributors[i][j].login === data.username) && (contributors[i].length > 1)) {
        ok = true;
      }
    }

    // si le username est dans la liste de contributeurs on crée l'objet avec comme propriété
    // le nom du repos et comme valeur la liste de contributeurs.
    if (ok) {
      const repository = repos[i].full_name;
      listrepos[repository] = name;
    }
  }
  return listrepos;
}

/** Adding contributors to the database creating the right links between the given username */
function addInDB(data, username) {
  // ajoute le username si existe pas.
  const initialPromises = [];
  db.getUser(username).then((node) => {
    if (!node) {
      initialPromises.push(db.creatUser(username));
    }
  });

  const names = new Set();
  const projects = new Set();

  for (const project in data) {
    for (let i = 0; i < data[project].length; i++) {
      names.add(data[project][i]);
      const relation = {};
      relation.username = data[project][i];
      relation.projectName = project;
      projects.add(relation);
    }
  }

  const promisesUser = [];
  names.forEach((name) => {
    db.getUser(name)
      .then((user) => {
        if (!user) {
          promisesUser.push(db.creatUser(name));
        }
      });
  });

  const promisesProject = [];
  projects.forEach((project) => {
    db.getRelation(username, project.username, project.projectName)
      .then((relation) => {
        if (relation.length === 0) {
          const monTableau = Array.from(projects);
          for (let i = 0; i < monTableau.length; i++) {
            promisesProject.push(
              db.newCollaborator(username, monTableau[i].username, monTableau[i].projectName),
            );
          }
        }
      });
  });

  Promise.all(initialPromises).then();
  Promise.all(promisesUser).then();
  Promise.all(promisesProject).then();
}

/** creating the json structure needed by alchemy js to render the graph edges*/
function alchemyRenderingEdge(json, username, res) {
  const promises = [];
  const edges = [];
  for (const node in json.nodes) {
    const name1 = json.nodes[node].caption;

    for (const node in json.nodes) {
      const name2 = json.nodes[node].caption;

      promises.push(db.getAllRelation(name1, name2).then((listRelation) => {
        const relations = listRelation;
        if (relations !== '') {
          const edge = {};
          edge.source = name2;
          edge.target = name1;
          edge.caption = relations;
          edges.push(edge);
        }
      }));
    }
  }
  return Promise.all(promises).then((_) => {
    json.edges = edges;
    return json;
  });
}

/** creating the json payload with the structure needed by alchemy js to render a graph
 * takes three level of association degrees.
*/
function alchemyRendering(username) {
  const json = {};
  const nodes = [];

  const userNames = [];
  db.getUser(username).then((user) => {
    if (user) {
      const name = user.properties.username;
      if (!userNames.includes(name)) {
        userNames.push(name);
        const node = {};
        node.caption = name;
        node.type = name;
        node.id = name;
        node.root = true;
        node.cluster = 1;
        nodes.push(node);
      }
    }
  });

  return db.getUserAllLevel1(username)
    .then((listUser) => {
      for (let i = 0; i < listUser.length; i++) {
        const name = listUser[i];
        if (!userNames.includes(name)) {
          userNames.push(name);
          const node = {};
          node.caption = name;
          node.type = name;
          node.id = name;
          node.cluster = 2;
          nodes.push(node);
        }
      }
    }).then(() => db.getUserAllLevel2(username))
    .then((listUser) => {
      for (let i = 0; i < listUser.length; i++) {
        const name = listUser[i];
        if (!userNames.includes(name)) {
          userNames.push(name);
          const node = {};
          node.caption = name;
          node.type = name;
          node.id = name;
          node.cluster = 3;
          nodes.push(node);
        }
      }
    })
    .then(() => db.getUserAllLevel3(username))
    .then((listUser) => {
      for (let i = 0; i < listUser.length; i++) {
        const name = listUser[i];
        if (!userNames.includes(name)) {
          userNames.push(name);
          const node = {};
          node.caption = name;
          node.type = name;
          node.id = name;
          node.cluster = 4;
          nodes.push(node);
        }
      }
    })
    .then(() => {
      json.nodes = nodes;
      return json;
    })
    .catch(console.log);
}


module.exports = {
  getContributorsName,
  addInDB,
  alchemyRenderingEdge,
  alchemyRendering,
};
