/**
 * BrainContributors
 * Authors Yann Lederrey and Joel Schär
 *
 * Tests for functions in utils.js
 */
require('dotenv/config');
const { expect } = require('chai');
const utils = require('../src/utils');

describe('Format json with Node and Relation', () => {
  it('should only keep repository where "username" is a contributor, where "username" is not alone contributor then delete "username" in the json result. functions : [utils.getContributorsName(data)]', () => {
    const reposJson = [];
    const test = {};
    const test1 = {};
    const test2 = {};
    test.full_name = 'test';
    test1.full_name = 'test1';
    test2.full_name = 'test2';
    reposJson.push(test);
    reposJson.push(test1);
    reposJson.push(test2);

    const nodeTest = {};
    const nodeTest1 = {};
    const nodeTest2 = {};
    const nodeTest3 = {};
    nodeTest.login = 'nodeTest';
    nodeTest1.login = 'nodeTest1';
    nodeTest2.login = 'nodeTest2';
    nodeTest3.login = 'nodeTest3';
    const contributorsJson = [];
    const firstRepos = [];
    firstRepos.push(nodeTest1);
    firstRepos.push(nodeTest2);
    firstRepos.push(nodeTest3);
    const secondRepos = [];
    secondRepos.push(nodeTest1);
    secondRepos.push(nodeTest2);
    secondRepos.push(nodeTest3);
    secondRepos.push(nodeTest);
    const thirdRepos = [];
    thirdRepos.push(nodeTest);
    contributorsJson.push(firstRepos);
    contributorsJson.push(secondRepos);
    contributorsJson.push(thirdRepos);

    const data = {};
    data.contributors = contributorsJson;
    data.repos = reposJson;
    data.username = 'nodeTest';

    const result = utils.getContributorsName(data);
    expect(result.test1[0]).to.eql('nodeTest1');
    expect(result.test1[1]).to.eql('nodeTest2');
    expect(result.test1[2]).to.eql('nodeTest3');
    expect(result.test).to.eql(undefined);
    expect(result.test2).to.eql(undefined);
  });
});
