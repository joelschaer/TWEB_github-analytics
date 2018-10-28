

function getUserContributors(username, searchType){
    //return fetch(`https://git-contributors.herokuapp.com/collaborateurs/${username}`)
    if(searchType === 'quick'){
        return fetch(`http://localhost:3200/contributors/quick/${username}`)
            .then(res => {
                console.log('1');
                return res.json();
            });
    }
    else{
        return fetch(`http://localhost:3200/contributors/${username}`)
            .then(res => {
                console.log('1');
                return res.json();
            });
    }
}

function requestData(name,searchType) {
    //delete old alchemy div if exist
    var oldAlchemy = document.getElementById("alchemy");
    var oldGraph = oldAlchemy.getElementsByTagName("svg");
    if(oldGraph.length !== 0)
        oldAlchemy.removeChild(oldGraph[0]);
    // element affichant une erreur.
    var error = document.getElementById("error");
    error.classList.replace("error", "hide");

    // element affichant le temps d'attente.
    var loader = document.getElementById("loading");
    loader.classList.replace("hide", "loading");

    // div affichant les noms de projets (edges)
    var div;
    if(document.getElementById("alchemyTextDiv")){
        div = document.getElementById("alchemyTextDiv")
    }
    else {
        div = document.createElement("div");
        div.setAttribute("id","alchemyTextDiv");
    }
    var element = document.getElementById("alchemy");
    element.appendChild(div);

    // récupére le nom et lance la requete
    var username;
        if(name && name !== '') {
            console.log(name);
            username = name;
        }
        else{
            username = document.getElementById('name').value;
        }
        getUserContributors(username, searchType)
            .then(value => {
                if(value.nodes.length === 0){
                    error.classList.replace("hide", "error");
                    error.innerText = 'Error, no nodes in database, perform a long search !!!'
                    loader.classList.replace("loading", "hide");
                }
                else {
                var config = {
                    dataSource: value,
                    nodeCaption: 'type',
                    nodeMouseOver: 'caption',
                    cluster: true,
                    "edgeStyle": {
                            color: "#00fffa",
                            width: 5
                        },
                    clusterColours: ["#1B9E77", "#255D9C", "#EFA129", "#AA3939", "#66A61E", "#E6AB02"],
                    "edgeClick": function (edge) {
                        console.log(edge);
                        div.innerHTML = "List project : " + edge._properties.caption;
                        return edge._properties.source;
                    },
                };
                alchemy = new Alchemy(config);
                loader.classList.replace("loading", "hide");
                bottomFunction();
                return alchemy.updateGraph(config);
                }
            });
}

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("BtnTop").style.display = "block";
    } else {
        document.getElementById("BtnTop").style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function bottomFunction() {
    window.scrollTo(0,document.body.scrollHeight);
}

function showErrors() {
    var x = document.getElementById("errors");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}


