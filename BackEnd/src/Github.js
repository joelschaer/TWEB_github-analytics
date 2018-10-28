/**
 * BrainContributors
 * Authors Yann Lederrey and Joel Schär
 *
 * Github access class. Has the project needed functions to retrieve information from github.
 */
const fetch = require('node-fetch');

class ResponseError extends Error {
  constructor(res, body) {
    super(`${res.status} error requesting ${res.url}: ${res.statusText}`);
    this.status = res.status;
    this.path = res.url;
    this.body = body;
  }
}

class Github {
  constructor({ token, baseUrl = 'https://api.github.com' } = {}) {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  setToken(token) {
    this.token = token;
  }

  /** used by local methodes to get information from github */
  request(path, opts = {}) {
    const url = `${this.baseUrl}${path}`;
    const options = {
      ...opts,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${this.token}`,
      },
    };

    return fetch(url, options)
      .then(res => res.json()
        .then((data) => {
          if (!res.ok) {
            throw new ResponseError(res, data);
          }

          return data;
        }));
  }

  /** retrive the user information for a given username */
  user(username) {
    return this.request(`/users/${username}`);
  }

  /** retrives all repositories for a given username */
  repos(username) {
    return this.request(`/users/${username}/repos`);
  }

  /** retrives all contributors for a given repository */
  repoContributor(reponame) {
    return this.request(`/repos/${reponame}/contributors`);
  }

  /** retrives all contributors to a given username
   *  Those are all users having donne a contribution on the same repo than the given username
   */
  userContributors(username) {
    return this.repos(username)
      .then((repos) => {
        const getCollabo = repo => {
          return this.repoContributor(repo.full_name)
            .catch(() => null);
        };
        return Promise.all(repos.map(getCollabo));
      });
  }
}

module.exports = Github;
