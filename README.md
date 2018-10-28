# TWEB_github-analytics

## FrontEnd
FrontEnd contient la partie UI de l'application communiquant avec le serveur.
Le FrontEnd est hébergé sur https://yannled.github.io./
Technologies utilisées :
- Bootstrap
- Alchemy.js

### build de l'application
Vérifier dans la page `app.js`que les requêtes pointe sur votre serveur (`http://localhost:3200/`)
Se trouver dans le dossier FrontEnd et faire un `live-server`

## Backend
Backend contient la partie serveur de l'application communiquant avec l'API de Github et une base de donnée Neo4j.
Le Backend est hebergé sur https://git-contributors.herokuapp.com/
La base de données est hebergée sur GrapenDB via Heroku.

Requête possibles :
- `/contributors/:username` : récupère un Json près formaté pour alchemy.js affichant les contributeurs d'un username github donné à partir de l'API Github.
- `/contributors/quick/:username` : récupère un Json près formaté pour alchemy.js affichant les contributeurs d'un username github donné à partir de la base de donnée.
- `/fillme` : effectues de multiples recherches sur Github afin de remplir la base de données à partir des noeuds existants. (Attention : lorsque il y a trop de données, certains soucis peuvent se déclarer !)
- `/reset` : réinitialise totalement la base de données.

Fonctions supplémentaires :
- Une méthode réinitialise la base de donnée tous les jours à 00h00.

Technologies utilisées :
- express
- neo4j driver
- cors
- dotenv
- node-fetch
- node-schedule
- Test :
  - esLint
  - mocha
  - chai


### build de l'application
Installer la base de données Neo4j https://neo4j.com/
- Mettre les infos de connections de la base de donnée dans le fichier .env
Récupérer un token Github.
- Mettre le votre token Github dans le fichier .env
Se trouver dans le dossier Backend.
- Faire un `npm install`
- Vérifier que le dossier node_modules à été correctement créé.
- Faire un `npm start` pour démarrrer le serveur.
- Faire un `npm test` pour démarrer les tests.
