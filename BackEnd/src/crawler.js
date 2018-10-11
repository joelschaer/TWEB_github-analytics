

function firstDegree(username, client, neo) {
  neo.creatUser(username);
  client.user(username)
    .then(client.userCollaborateurs(username))
    .then(collaborators => {
      collaborators.forEach(user => {
        neo.creatUser(user);
        neo.creatCollaboration(username, user);
      });
    });
}
