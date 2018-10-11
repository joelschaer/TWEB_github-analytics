// loads environment variables
require('dotenv/config');
const express = require('express');
const cors = require('cors');
const Github = require('./src/Github');
const utils = require('./src/utils');
const Neo4j = require('./src/Neo4j');

const app = express();
const port = process.env.PORT || 3100;
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
  db.getUser(username).then((node) => {
    if (!node) {
      db.creatUser(username);
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
  names.forEach((userName) => {
    promisesUser.push(
      db.getUser(userName),
    );
  });

  const promisesProject = [];
  projects.forEach((project) => {
    promisesProject.push(
      db.getRelation(username, project.username, project.projectName),
    );
  });

  Promise.all(promisesUser).then((nodes) => {
    for (let i = 0; i < nodes.length; i++) {
      const monTableau = Array.from(names);
      if (!nodes[i]) {
        db.creatUser(monTableau[i]);
      }
    }
  });

  Promise.all(promisesProject).then((relations) => {
    for (let i = 0; i < relations.length; i++) {
      const monTableau = Array.from(projects);
      if (relations[i].length === 0) {
        db.newCollaborator(username, monTableau[i].username, monTableau[i].projectName);
        console.log(4);
      }
    }
  });
}

function alchemyRenderingEdge(json, username, res) {
  const promises = [];
  const edges = [];
  for (const node in json.nodes) {
    const name = json.nodes[node].caption;

    promises.push(db.getAllRelation(username, name).then((listRelation) => {
      const relations = listRelation;
      if (relations !== '') {
        const edge = {};
        edge.source = name;
        edge.target = username;
        edge.caption = relations;
        edges.push(edge);
      }
    }));
  }
  return Promise.all(promises).then((_) => {
    json.edges = edges;
    console.log(`Result de alchemyRenderingEdge : ${json}`);
    return json;
  });
}

function alchemyRendering(username) {
  const json = {};
  const nodes = [];

  db.getUser(username).then((user) => {
    if (user) {
      const name = user.properties.username;
      const node = {};
      node.caption = name;
      node.type = name;
      node.id = name;
      nodes.push(node);
    }
  });

  return db.getUserAllLevel1(username).then((listUser) => {
    for (let i = 0; i < listUser.length; i++) {
      const node = {};
      const name = listUser[i];
      node.caption = name;
      node.type = name;
      node.id = name;
      nodes.push(node);
    }
    json.nodes = nodes;
    console.log(`Result de alchemyRendering : ${json}`);
    return json;
  });
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
      console.log(sixthResult);
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
