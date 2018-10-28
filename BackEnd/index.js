/**
 * BrainContributors
 * Authors Yann Lederrey and Joel Schär
 *
 * BrainContributor backend puts together users with their contributors.
 * It takes all users having worked together on each of their projects hosted by github and on a public repositry.
 * It stores this information in a node database (neo4j) with the associate links.
 * On a frontend request it will retrive a json payload out of the database so that the Alchemy js
 * plugin with be able to reder a nice node graph.
 */
/* eslint-disable no-console */
// loads environment variables
require('dotenv/config');
const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
const Github = require('./src/Github');
const utils = require('./src/utils');
const tools = require('./src/Tools');
const Neo4j = require('./src/Neo4j');
const service_resetDB = require('./services/ResetDatabase');
const service_fillDB = require('./services/crawler');

const app = express();
const port = process.env.PORT || 3200;
const client = new Github({ token: process.env.OAUTH_TOKEN });

// Enable CORS for the client app
app.use(cors());

/** Start a Crawler who fiels the database
 * The functions probided by the crawler generates a high amount of work and is not
 * really good suported. There by it should rather not be used.
 */
app.get('/fillme', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  service_fillDB.crawlUsers();
  console.warn('Database is fill up !');
  res.send('<h1> Database is filling  </h1>');
});

// reset the database
app.get('/reset', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  service_resetDB.resetDatabase();
  console.warn('Database is reset !');
  res.send('<h1> Database is deleting </h1>');
});

/*
## LONG SEARCH with github
1. Get Contributors from Github
2. Filtering of the github data, test if username is a contributors
of every repos, if he's not the only contributors and lay out the data.
3. Add the informations in the DB if not already exist.
4. lay out the nodes(contributors) data for the frontEnd Alchemy plugin
5. lay out the edges(projects) data for the frontEnd Alchemy plugin
6. Send the data.
 */
app.get('/contributors/:username', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  const data = {};
  data.username = req.params.username;

  client.userContributors(data.username)
    .then((result) => {
      // 1. Get Contributors from the research, then get his repository.
      data.contributors = result;
      return client.repos(data.username);
    })
    .then((newResult) => {
      // 2. Filtering of the github data and layout.
      data.repos = newResult;
      return utils.getContributorsName(data);
    })
    .then((thirdResult) => {
      // 3. Add the informations in the DB if not already exist.
      data.contributorsByRepos = thirdResult;
      return utils.addInDB(data.contributorsByRepos, data.username);
    })
    .then((fourthResult) => {
      // 4. lay out the nodes(contributors) data for the frontEnd Alchemy plugin.
      return utils.alchemyRendering(data.username);
    })
    .then((fifthResult) => {
      // 5. lay out the edges(projects) data for the frontEnd Alchemy plugin.
      return utils.alchemyRenderingEdge(fifthResult, data.username);
    })
    .then((sixthResult) => {
      // 6. Send the data.
      res.send(sixthResult);
    });
});

/*
## QUICK SEARCH only in DB.
4. lay out the nodes(contributors) data for the frontEnd Alchemy plugin
5. lay out the edges(projects) data for the frontEnd Alchemy plugin
6. Send the data.
 */
app.get('/contributors/quick/:username', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  const data = {};
  data.username = req.params.username;
  // 4. lay out the nodes(contributors) data for the frontEnd Alchemy plugin.
  return utils.alchemyRendering(data.username)
    .then((jsonNode) => {
      // 5. lay out the edges(projects) data for the frontEnd Alchemy plugin.
      return utils.alchemyRenderingEdge(jsonNode, data.username);
    })
    .then((sixthResult) => {
      // 6. Send the data.
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

// Reset database every day at 00H00
schedule.scheduleJob({ hour: 0, minute: 0 }, () => {
  console.log('It is time to reset the database !');
  service_resetDB.resetDatabase();
  console.warn(`Database reset at ${tools.getDateTime()}`);
});
