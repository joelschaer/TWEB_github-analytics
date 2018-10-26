
require('dotenv/config');
const { expect } = require('chai');
const Neo4j = require('../src/Neo4j');

const db = new Neo4j(process.env.GRAPHENEDB_BOLT_URL, process.env.GRAPHENEDB_BOLT_USER, process.env.GRAPHENEDB_BOLT_PASSWORD);

describe('Add_Node', () => {
  it('should add node, get it, verify the name and delete it from neo4j database', (done) => {
    const initialNodeName = 'test';
    let nodeName = '';
    const promises = new Promise((resolve) => {
      resolve(db.creatUser(initialNodeName));
    });
    promises.then(
      db.getUser(initialNodeName).then((result) => {
        console.log(result);
        nodeName = result.properties.username;
        expect(initialNodeName).to.equal(nodeName);
        done();
      }),
    );
  });
});

/*
describe('Add_Relation', () => {
  it('should add two nodes, add a relation, get it, verify the name and delete it from neo4j database', () => {
    const nodeName1 = 'test1';
    const nodeName2 = 'test2';
    const edgeName = 'edge';
    const promises = [];
    const promises2 = [];
    promises.push(db.creatUser(nodeName1));
    promises.push(db.creatUser(nodeName2));

    Promise.all(promises).then(
      promises2.push(db.newCollaborator(nodeName1, nodeName2, edgeName)),
    );

    Promise.all(promises2).then(
      db.getRelation(nodeName1, nodeName2, edgeName)
        .then((relation) => {
          db.deleteOneNode(nodeName1);
          db.deleteOneNode(nodeName2);
          expect(relation[0].name).to.eql(edgeName);
        }),
    );
  });
});
*/
