// loads environment variables
require('dotenv/config');
const express = require('express');
const cors = require('cors');
const Github = require('./src/Github');
const utils = require('./src/utils');
const Neo4j = require('./src/Neo4j');

const app = express();
const port = process.env.PORT || 3200;
const client = new Github({ token: process.env.OAUTH_TOKEN });
const db = new Neo4j('neo4j', '1234');


// Enable CORS for the client app
app.use(cors());

app.get('/users/:username', (req, res, next) => { // eslint-disable-line no-unused-vars
  client.user(req.params.username)
    .then(user => res.send(user))
    .catch(next);
});

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

app.get('/collaborateurs/:username', (req, res, next) => {
  const data = {};
  data.username = req.params.username;

  // get the contributors form username
  client.userContributors(data.username)
    .then((result) => {
      console.log(1);
      data.contributors = result;
      // get the repos form username
      return client.repos(data.username);
    })
    .then((newResult) => {
      console.log(2);
      data.repos = newResult;
      // group repository and contributors and filter where username is not contributors.
      return utils.getContributorsName(data);
    })
    .then((thirdResult) => {
      console.log(3);
      data.contributorsByRepos = thirdResult;
      return addInDB(data.contributorsByRepos, data.username);
    })
    .then((fourthResult) => {
      console.log(5);
      return alchemyRendering(data.username);
    })
    .then((fifthResult) => {
      console.log(6);
      return alchemyRenderingEdge(fifthResult, data.username);
    })
    .then((sixthResult) => {
      console.log(7);
      res.send(sixthResult);
    });
});


// Forward 404 to error handler
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening at http://localhost:${port}`);
});
