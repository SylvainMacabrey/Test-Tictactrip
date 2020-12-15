const express = require('express')
var bodyParser = require('body-parser');
var apiRouter = require('./apiRouter').router;
const connection = require('./connection');

const server = express()

server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
// Utilisation de bodyparser text pour pouvoir utilisé Content text/plain
server.use(bodyParser.text());

connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected ...");
        // Création de la base de données
        connection.query("CREATE DATABASE IF NOT EXISTS tictactrip", function (err, result) {
            if (err) throw err;
            console.log("Database created");
        });
        // Création de la table users
        connection.query("CREATE TABLE IF NOT EXISTS users (id int(11) AUTO_INCREMENT PRIMARY KEY, email varchar(255) DEFAULT NULL)", function (err, result) {
            if (err) throw err;
            console.log("Table USERS created");
        });
        // Création de la table texts
        connection.query("CREATE TABLE IF NOT EXISTS texts (id int(11) AUTO_INCREMENT PRIMARY KEY, id_user int(11) NOT NULL, nbCaracteres int(11) NOT NULL, date date NOT NULL)", function (err, result) {
            if (err) throw err;
            console.log("Table TEXTS created");
        });
    } else {
        console.log(err);
    }
});

server.use('/api', apiRouter);

server.listen(4000, () => {
    console.log("Serveur à l'écoute")
})
  