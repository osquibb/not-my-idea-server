## TODO:
- Add express server ideas router http methods to match redux Action Creators

157.230.54.50

- express server on :3000
- mongodb server on localhost:27017
(localhost is the droplet)


## MongoDB Server Start
 - Create MongoDB server directory with data sub directory
 - Install MongoDB on Ubuntu (see docs. apt get...)
 - navigate to monogodb dir and run "mongod --dbpath=data --bind_ip 127.0.0.1" to start up mongodb
 
 ## MongoDB Server CLI
 - "mongo"
 - "use notMyIdea"
 - "db.ideas.find().pretty();"

 ## Digital Ocean Droplet Firewall
 - "sudo ufw status"
 - "sudo ufw allow 5000/tcp" (also: "delete allow 5000/tcp, deny 5000/tcp, allow from 5000/tcp, etc...)

## React App client on Express server
- put react app in client/ dir on express server
- For API requests, add "proxy": "http://{...}:3000" to react app's package.json
- "npm run build"
- In Express server app.js :

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

## Not-my-idea-app git submodule
- To initialize: "git submodule init", then "git submodule update"

- To pull from master: "git submodule update --recursive --remote"
 (remember to re-rerun npm run build on app after pull from master)

 ## Not-my-idea-server pull from origin master (github repo)
 - "git pull origin master"

 ## Current tcp ports in use
 - "netstat -ap tcp"
 - or... "netstat -ap tcp | grep -i "listen"" to search for ports with state: LISTEN

 ## MongoDB Update
 - "mongo"
 - "use notMyIdea"
 - Example: "db.users.update({"username": "admin"}, {$set: {"admin": true}})"

 ## OpenSSL (Local only SSL)
- in bin/...
- "openssl genrsa 1024 > private.key"
- "openssl req -new -key private.key -out cert.csr"
- "openssl x509 -req -in cert.csr -signkey private.key -out certificate.pem"

- NOTE: Postman settings SSL Certificate Verification OFF when using OpenSSL self-signed.  Otherwise Postman won't accept.



