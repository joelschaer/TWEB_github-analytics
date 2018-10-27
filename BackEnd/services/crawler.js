require('dotenv/config');
const Github = require('../src/Github');
const utils = require('../src/utils');
const Neo4j = require('../src/Neo4j');

const client = new Github({ token: process.env.OAUTH_TOKEN });
const db = new Neo4j(process.env.GRAPHENEDB_BOLT_URL, process.env.GRAPHENEDB_BOLT_USER, process.env.GRAPHENEDB_BOLT_PASSWORD);

/* asynchrone, but not working, the functions are not folling properly ** */
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

/* not working har unresolved promises.
function crawlUsers() {
  console.log('crawl');

  db.getUserAll().then((userList) => {
    console.log(userList);

    userList.forEach((username) => {
      console.log(`crawl: ${username}`);
      console.log('1');
      const data = {};
      data.username = username;
      console.log('2');
      // get users contributors
      data.contributors = client.userContributors(username);
      console.log('3');
      console.log(data.contributors);
      // get the repos form username
      data.repos = client.repos(username);
      console.log('4');
      console.log(data.repos);
      // group repository and contributors and filter where username is not contributors.
      const contributorsByRepos = utils.getContributorsName(data);
      console.log('5');
      console.log(contributorsByRepos);
      // add username and collaborators to db
      utils.addInDB(contributorsByRepos, username);
    });
  });
  console.log('6');
}
*/


module.exports = {
  crawlUsers,
};
