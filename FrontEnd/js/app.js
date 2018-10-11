var fs = require('fs');

function getUserContributors(username){
    return fetch(`http://localhost:3100/collaborateurs/${username}`)
        .then(res => res.json());
}

function requestData() {

    var username=document.getElementById('name').value;
    getUserContributors(username)
    .then(value => alchemy.begin({
        dataSource: value,
        nodeCaption: 'type',
        nodeMouseOver: 'caption',
        cluster: true,
        clusterColours: ["#1B9E77","#D95F02","#7570B3","#E7298A","#66A61E","#E6AB02"]}
        ))
}
edgeClick(function () {
    console.log("coucou");
});


