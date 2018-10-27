require('dotenv/config');
const { expect } = require('chai');
const tools = require('../src/Tools');

describe('formatStringForNeo4j', () => {
  it('should replace "." "-" "/" by "_" . functions : [tools.formatStringForNeo4j]', () => {
    const string = 'this.is-a/test_OK';
    const result = tools.formatStringForNeo4j(string);
    expect(result).to.eql('this_is_a_test_OK');
  });
});
