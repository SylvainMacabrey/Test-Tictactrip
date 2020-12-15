const connection = require('../connection');
const mysql = require('mysql');
const tokenController = require('./TokenController');
var jwt = require('jsonwebtoken');

function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    // début de la chaine + ajout + fin de la chaine
    return str.substr(0, index) + chr + str.substr(index + 1);
}

function addSpace(text) {
    var maxLineLength = 80;
    // Division du texte en ligne
    var newLines = text.split(/\n/);
    for (var i = 0; i < newLines.length; i++) {
        // Retrait des espaces en début et fin de ligne
        var line = newLines[i].trim();
        for (var j = 0; j < line.length; j++) {
            // Si le caractère est un espace et que le nombre de caractère n'a pas dépassé la limite de caractère max par ligne:
            // on rajoute un espace
            if (line[j] == " " && line.length < maxLineLength) {
                line = setCharAt(line, j, "  ");
                j++;
            }
        }
        newLines[i] = line;
    }
    return newLines.join("\n");
}

function justify(text, res, user) {

    // Création de paragraphe (séparé par un saut de ligne)
    var lignes = text.split("\n");
    var paragraphes = [];
    var paragraphe = "";
    lignes.forEach((ligne) => {
        paragraphe += ligne;
        if(ligne.length == 0) {
            paragraphes.push(paragraphe);
            paragraphe = "";
        }
    });
    paragraphes.push(paragraphe);

    var newText = "";
    paragraphes.forEach(paragraphe => {
        var cmp = 80;
        var newParagraphe = "";
        var j;
        // Retrait des espaces inutiles
        var text = paragraphe.replace(/\s\s+/g, ' ');
        for (var i = 0; i < text.length; i++) {
            // Ajout de chaque caractères dans le paragraphes
            newParagraphe += text[i];
            // Si le caractère est le 80e de la ligne
            if (i == cmp - 1) {
                // Si le caractère est un espace, une virgule ou un point: on passe à la ligne
                if (text[i] == ' ' || text[i] == ',' || text[i] == '.') {
                    newParagraphe += '\n';
                    cmp = i + 1 + 80;
                }
                // Sinon
                else {
                    j = 0;
                    // Tant que les caractères précédent ne sont pas un espace, une virgule ou un point:
                    // on parcours le mot à l'envers (pour ne pas le couper en deux)
                    while (text[i] !== ' ' && text[i] !== '.' && text[i] !== ',') {
                        i = i - 1;
                        j++;
                    }
                    // Retrait du dernier mot de la ligne car il n'est pas complet
                    newParagraphe = newParagraphe.substr(0, newParagraphe.length - j);
                    newParagraphe += '\n';
                    cmp = i + 80;
                }
            }
        }
        // Ajout du paragraphe dans le texte et ajout des espaces
        newText += '\n';
        newText += addSpace(newParagraphe);
    });
    res.send(newText);
    // Ajout de la taille du texte dans la base de données
    connection.query("INSERT INTO texts (id_user, date, nbCaracteres) VALUES (" + mysql.escape(user.id) + ", NOW(), ?)", text.length, function (err, result) {
        if (err) throw err;
        console.log("1 text inserted");
    });

}

module.exports = {

    justifyText: (req, res) => {

        // Récupération du texte à justifier
        var text = req.body;

        // Récupération user
        var user = tokenController.getUser();

        // Vérification du texte
        if (!text) {
            res.send('');
            return;
        }

        // Obtention la valeur de l'en-tête auth
        const bearerHeader = req.headers['authorization'];
        // Vérification du token
        var authorized = tokenController.verifyToken(bearerHeader);
        if(!authorized) {
            res.sendStatus(403);
            return;
        }

        // Verification rate limit
        connection.query('SELECT SUM(nbCaracteres) as sum FROM texts WHERE id_user = ' + mysql.escape(user.id) + ' AND date = DATE(NOW()) ' + 'GROUP BY id_user', (error, results, fields) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results[0]);
                if(typeof results[0] != 'undefined') {
                    console.log(results[0].sum + text.length)
                    if(results[0].sum + text.length > 80000) {
                        return res.status(402).json({message: '402 Payment Required.'});
                    } else {
                        // Justification du texte
                        justify(text, res, user);
                    }
                } else {
                    justify(text, res, user);
                }
                
            }
        });
    }

};