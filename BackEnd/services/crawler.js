/**
 * BrainContributors
 * Authors Yann Lederrey and Joel Schär
 *
 * Creates an additionnal relation level.
 * Getting all nodes already in the database and searching for all collaborators linked to each one of them.
 * Known problem with this function, if we have a lot of nodes it doesn't work properly. We assume that this is caused
 * by asynchronous task not following each other properly. We couldn't find a solution for it.
 */
require('dotenv/config');
const Github = require('../src/Github');
const utils = require('../src/utils');
const Neo4j = require('../src/Neo4j');

const client = new Github({ token: process.env.OAUTH_TOKEN });
const db = new Neo4j(process.env.GRAPHENEDB_BOLT_URL, process.env.GRAPHENEDB_BOLT_USER, process.env.GRAPHENEDB_BOLT_PASSWORD);

function crawlUsers() {
  console.log('crawl');

  const promises = [];

  db.getUserAll().then((userList) => {
    console.log(userList);

    userList.forEach((username) => {
      console.log(`crawl: ${username}`);
      const data = {};
      data.username = username;
      // get users contributors
      client.userContributors(username)
        .then((constributors) => {
          console.log('1');
          data.contributors = constributors;
          // get the repos form username
          return client.repos(username);
        })
        .then((repos) => {
          console.log('2');
          data.repos = repos;
          // group repository and contributors and filter where username is not contributors.
          return utils.getContributorsName(data);
        })
        .then((contributorsByRepos) => {
          console.log('3');
          // add username and collaborators to db
          promises.push(utils.addInDB(contributorsByRepos, username));
        });
    });
    console.log('5');
  });
  console.log('6');
}


module.exports = {
  crawlUsers,
};
