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

function getContributorsName(Contributors = []) {
  const name = new Set();
  for (let i = 0; i < Contributors.length; i++) {
    for (let j = 0; j < Contributors[i].length; j++) {
      name.add(Contributors[i][j].login);
    }
  }
  console.log(name);
}

module.exports = {
  getReposLanguagesStats,
  getContributorsName,
};
