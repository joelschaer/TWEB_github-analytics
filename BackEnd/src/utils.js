const Neo4j = require('../src/Neo4j');
//const db = new Neo4j(process.env.GRAPHENEDB_BOLT_URL, process.env.GRAPHENEDB_BOLT_USER, process.env.GRAPHENEDB_BOLT_PASSWORD);
const db = new Neo4j('bolt://localhost:7687', 'neo4j', '1234');

function getContributorsName(data) {
  const repos = data.repos;
  const contributors = data.contributors;

  const listrepos = {};

  // parcours les bloc de contributeurs (correspond aux repositorys)
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

// same function as in index
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
  Promise.all(promisesProject).then(console.log(4));
}

module.exports = {
  getContributorsName,
  addInDB,
};
