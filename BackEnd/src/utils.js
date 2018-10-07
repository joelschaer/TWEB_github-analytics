function getReposLanguagesStats(reposLanguages = []) {
  const stats = {};
  const countLanguages = o => {
    Object.keys(o).forEach(key => {
      const value = o[key];
      const current = stats[key] || 0;
      stats[key] = current + value;
    });
  };
  reposLanguages.forEach(countLanguages);
  return stats;
}

function getContributorsName(data) {
  const repos = data.repos;
  const contributors = data.contributors;

  const listrepos = {};

  for (let i = 0; i < contributors.length; i++) {
    const name = [];
    let ok = false;
    for (let j = 0; j < contributors[i].length; j++) {
      name.push(contributors[i][j].login);

      if (contributors[i][j].login === data.username) {
        ok = true;
      }
    }
    if (ok) {
      const repository = repos[i].full_name;
      listrepos[repository] = name;
    }
  }
  return listrepos;
}

module.exports = {
  getReposLanguagesStats,
  getContributorsName,
};
