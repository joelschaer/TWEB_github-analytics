// loads environment variables
require('dotenv/config');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const Github = require('./src/Github');
const utils = require('./src/utils');
const Neo4j = require('./src/Neo4j');

const app = express();
const port = process.env.PORT || 3000;
const client = new Github({ token: process.env.OAUTH_TOKEN });
const db = new Neo4j('neo4j', '1234');


// Enable CORS for the client app
app.use(cors());

app.get('/users/:username', (req, res, next) => { // eslint-disable-line no-unused-vars
  client.user(req.params.username)
    .then(user => res.send(user))
    .catch(next);
});

app.get('/languages/:username', (req, res, next) => { // eslint-disable-line no-unused-vars
  client.userLanguages(req.params.username)
    .then(utils.getReposLanguagesStats)
    .then(stats => res.send(stats))
    .catch(next);
});


function addInDB(data) {
  for (const project in data) {
    for (const name in data[project]) {
      for (let i = 0; i < name.length; i++) {
        const user = data[project][i];
        if (!db.getUser(user)) {
          db.creatUser(user);
        }
        db.newCollaborator(data.username, user, project);
      }
    }
  }
}

app.get('/collaborateurs/:username', (req, res, next) => {
  const data = {};
  data.username = req.params.username;

  // get the contributors form username
  client.userContributors(data.username)
    .then(value => {
      data.contributors = value;
      // get the repos form username
      return client.repos(data.username);
    })
    .then(value => {
      data.repos = value;
      // group repository and contributors and filtr where username is not contributors.
      data.contributorsByRepos = utils.getContributorsName(data);
      addInDB(data.contributorsByRepos);
      res.send(data.contributorsByRepos);
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
