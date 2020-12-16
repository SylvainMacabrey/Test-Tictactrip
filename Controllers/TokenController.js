var jwt = require('jsonwebtoken');
const mysql = require('mysql');
const connection = require('../connection');

const JWT_SIGN_SECRET = '0sjs6gf9nwxq22pzn5hvpxmpgtty34tfx8gz17sy6djnm0xuc65bi9rcc';

var user;
var token;

module.exports = {

    getUser: (bearerHeader) => {
        // Vérifier si le porteur est indéfini
        if(typeof bearerHeader !== 'undefined') {
            // split à l'espace , Quand on envois le token bearer #token
            const bearer = bearerHeader.split(' ');
            // Obtenir le jeton d'un tableau
            token = bearer[1];
            if(token != null) {
                try {
                    var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                    return jwtToken.user;
                    
                } catch (err) {
                    console.log(err.message);
                    return;
                }
            }
        }
    },

    createToken: (req, res) => {

        email = req.body.email;

        // Vérification de l'existence du mail
        checkMail = (callback) => {
            connection.query('SELECT * FROM users WHERE email = ' + mysql.escape(email), (error, results, fields) => {
                if (error) {
                    console.log(error);
                    callback();
                } else {
                    callback(results[0]);
                }
            });
        } 

        checkMail(authorized => {
            // Si le mail n'existe pas: on le crée
            if (!authorized) {
                connection.query("INSERT INTO users (email) VALUES (" + mysql.escape(email) + ")", function (err, result) {
                    if (err) throw err;
                    console.log("1 user inserted");
                });
                // Récupération dernier user inséré
                connection.query("SELECT MAX(id) FROM users", function (err, result) {
                    if (err) throw err;
                    user = { id: result[0].id, email: result[0].email}
                    // Création du token
                    jwt.sign({ user }, JWT_SIGN_SECRET, { expiresIn: '24h' }, (err, token) => {
                        res.json({ token });
                    });
                });
            } else {
                user = { id: authorized.id, email: authorized.email}
                // Création du token
                jwt.sign({ user }, JWT_SIGN_SECRET, { expiresIn: '24h' }, (err, token) => {
                    res.json({ token });
                });
            }
        });
        
    },

    verifyToken: (bearerHeader) => {
        var response = false;
        // Vérifier si le porteur est indéfini
        if(typeof bearerHeader !== 'undefined') {
            // split à l'espace , Quand on envois le token bearer #token
            const bearer = bearerHeader.split(' ');
            // Obtenir le jeton d'un tableau
            token = bearer[1];
            if(token != null) {
                try {
                    var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                    console.log(jwtToken.user);
                    if(jwtToken != null) {
                        response = true;
                    } else {
                        response = false;
                    }
                } catch (err) {
                    console.log(err.message);
                }
            }
        } else {
            response = false;
        }
        return response;
    }

}
