
function getUserContributors(username){
    return fetch(`http://localhost:3200/collaborateurs/${username}`)
        .then(res => {
            console.log('1');
            return res.json();
        });
}

function requestData(name) {
    var loader = document.getElementById("loading");
    loader.classList.replace("hide", "loading");
    var div = document.createElement("div");
    div.setAttribute("id","alchemyTextDiv");
    var element = document.getElementById("alchemy");
    element.appendChild(div);
    var username;
        if(name) {
            username = name;
        }
        else{
            username = document.getElementById('name').value;
        }
        getUserContributors(username)
            .then(value => {
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
                return alchemy.begin();
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



