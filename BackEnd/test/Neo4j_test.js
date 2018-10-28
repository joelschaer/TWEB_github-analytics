/**
 * BrainContributors
 * Authors Yann Lederrey and Joel Schär
 *
 * Tests for functions in Neo4j.js
 */
require('dotenv/config');

const chai = require('chai');
const assertArrays = require('chai-arrays');
const assertStrings = require('chai-string');

chai.use(assertArrays);
chai.use(assertStrings);
const expect = chai.expect;

const Neo4j = require('../src/Neo4j');

const db = new Neo4j(process.env.GRAPHENEDB_BOLT_URL, process.env.GRAPHENEDB_BOLT_USER, process.env.GRAPHENEDB_BOLT_PASSWORD);

describe('Test Neo4j functions, use of timeout definition to have the time to insert in DB', function () {
  this.timeout(10000);

  // define const values
  const node_test = 'test';
  const node_test1 = 'test1';
  const node_test2 = 'test2';
  const edge_test = 'edge_test';

  // prepare the test with test values
  const promisesBefore = [];
  promisesBefore.push(db.creatUser(node_test));
  promisesBefore.push(db.creatUser(node_test1));
  promisesBefore.push(db.creatUser(node_test2));
  Promise.all(promisesBefore).then(setTimeout(() => {
    db.newCollaborator(node_test1, node_test2, edge_test);
  }, 1000));

  it('should get all node: the third nodes test should appear in the result. functions : [db.getUserAll()]', (done) => {
    setTimeout(done, 1000);
    setTimeout(() => {
      db.getUserAll().then((result) => {
        expect(result).to.be.containingAllOf([node_test, node_test1, node_test2]);
      });
    }, 1000);
  });

  it('should get all relations : the result of should '
      + 'contain the string edge_test. functions : [db.getAllRelation(node_test1, node_test2)]', (done) => {
    setTimeout(done, 1000);
    setTimeout(() => {
      db.getAllRelation(node_test1, node_test2).then((result) => {
        expect(result).to.be.containIgnoreCase(edge_test);
      });
    }, 1000);
  });

  it('should get the node node_test, previously add and delete it. functions : [db.getUser(node_test), db.deleteOneNode(node_test)]', (done) => {
    let finalNodeName = '';
    setTimeout(done, 1000);
    setTimeout(() => {
      db.getUser(node_test).then((result) => {
        // console.log(result);
        finalNodeName = result.properties.username;
        db.deleteOneNode(node_test);
        expect(finalNodeName).to.equal(node_test);
      });
    }, 1000);
  });

  it('should get the relation edge_test, previously add and delete the nodes and his relations, functions : [db.getRelation(node_test1, node_test2, edge_test), db.deleteOneNode(node_test1)]', (done) => {
    let finalRelationName = '';
    setTimeout(done, 1000);
    setTimeout(() => {
      db.getRelation(node_test1, node_test2, edge_test).then((result) => {
        finalRelationName = result[0].name;
        db.deleteOneNode(node_test1);
        db.deleteOneNode(node_test2);
        expect(finalRelationName).to.equal(edge_test);
      });
    }, 1000);
  });
});
