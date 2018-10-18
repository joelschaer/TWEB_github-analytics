
function getContributorsName(data) {
  const repos = data.repos;
  const contributors = data.contributors;

  const listrepos = {};

  // parcours les bloc de contributeurs (correspond aux repositorys)
  for (let i = 0; i < contributors.length; i++) {
    const name = [];

    let ok = false;
    if (contributors[i] === null) {
      continue;
    }
    // parcours les contributeurs de chaque répos
    for (let j = 0; j < contributors[i].length; j++) {
      // on ne met pas le username dans la liste, seulement ses contributeurs
      if (contributors[i][j].login !== data.username) {
        name.push(contributors[i][j].login);
      }

      // si le username choisi apparait dans la liste des contributeurs
      // && que la liste ne contient pas que username
      if ((contributors[i][j].login === data.username) && (contributors[i].length > 1)) {
        ok = true;
      }
    }

    // si le username est dans la liste de contributeurs on crée l'objet avec comme propriété
    // le nom du repos et comme valeur la liste de contributeurs.
    if (ok) {
      const repository = repos[i].full_name;
      listrepos[repository] = name;
    }
  }
  return listrepos;
}

module.exports = {
  getContributorsName,
};
