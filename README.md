Pour pouvoir tester ce code:

1 - Créer une base de données SQL qui à pour nom : tictactrip

2 - Installer les différentes librairies avec la commande : npm i

3 - Pour tester l'API, utiliser Postman :

    3.1 - Faite une requête POST avec l'url "localhost:4000/api/token" et un json body {"email": "foo@bar.com"}
        - Si le mail n'hésiste pas dans la base de données, il sera rajouté autamatiquement
        - Copier le token qui sera affiché 

    3.2 - Dans un nouvel onglet de Postman, faite un rêquete POST avec l'url "localhost:4000/api/justify"
        - Allez dans Headers et ajouter "autorisation" comme clé et "bearer token" comme value
        - Allez dans body puis Raw et insérer votre texte.
