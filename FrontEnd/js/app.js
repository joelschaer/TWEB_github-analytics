
function getUserContributors(username){
    return fetch(`http://localhost:3200/collaborateurs/${username}`)
        .then(res => {
            console.log('1');
            return res.json();
        });
}


function clearAlchemy() {
    return alchemy.begin({
        dataSource: "{}",
        nodeCaption: 'type',
        nodeMouseOver: 'caption',
        cluster: true,
        clusterColours: ["#1B9E77","#D95F02","#7570B3","#E7298A","#66A61E","#E6AB02"]}
    )
}

function requestData() {
    var div = document.createElement("div");
    div.setAttribute("id","alchemyTextDiv");
    var element = document.getElementById("alchemy");
    element.appendChild(div);
    /*
    var alchemySVG = element.getElementsByTagName("svg");
    var elementSVG = alchemySVG[0];
    elementSVG.appendChild(div);*/
        var username = document.getElementById('name').value;
        getUserContributors(username)
            .then(value => {
                var config = {
                    dataSource: value,
                    nodeCaption: 'type',
                    nodeMouseOver: 'caption',
                    cluster: true,
                    clusterColours: ["#1B9E77", "#D95F02", "#7570B3", "#E7298A", "#66A61E", "#E6AB02"],
                    "edgeClick": function (edge) {
                        console.log(edge);
                        div.innerHTML = "List project : " + edge._properties.caption;
                        return edge._properties.source;
                    },
                };
                console.log(value);
                return alchemy.begin(config);
            });
}



