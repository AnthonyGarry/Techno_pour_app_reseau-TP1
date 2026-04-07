Chat avec Socket.IO .

Cette application à été réalisée à l'aide du tutoriel (https://socket.io/docs/v4/tutorial/introduction).

---------------------------------------------------------------

Positifs:
- Génère une page web accessible en réseau local (après changement de l'adresse localhost du code par une adresse IP joignable sur le réseau).

- Archivage de message grâce à une base de donnée. Aucune limite ne sont implémentées par défaut.

- Anonymat: l'application ne collecte pas d'informations autres que les messages envoyés.

- Logs en temps réél dans le terminal exécutant l'application (Démarrage du serveur, messages envoyés, connexion et déconnexion d'utilisateurs sans identification possible).

- Pas de duplication de messages dans l'archive grâce à l'attribution d'un ID unique à chaque message lors de sa réception.


Négatifs:
- Bug mineur lors de l'utilisation du bouton "Déconnexion", la reconnexion sera impossible sans rechargement de la page web par l'utilisateur.

- Bug mineur (lié au bug ci-dessus) dans les logs, l'information "Déconnexion manuelle" apparaît pour les déconnexions et connexions manuelles. Elle n'apparaît pas pour les déconnexions non-manuelles (Problèmes de communication divers), gardant donc son utilité de signaler quand un utilisateur se déconnecte volontairement.

- Mélange d'anglais et de français dans le code. Mais cela n'est pas grave car il ne s'agit pas d'une application qui sera vraiment distribuée.

---------------------------------------------------------------

Prérequis:
- Node.js v18 ou supérieur

---------------------------------------------------------------

Fonctionnement:
- Le fichier index.js crée le serveur de chat, le lie à des ports de l'adresse localhost, un port par processeur accessible sur la machine hôte.

- Le fichier index.html génère la structure de la page web qui communiquera avec index.js lors de l'envoi (côté client) et la réception de messages.

- index.js gère la réception (côté serveur), redistribution et archivage des messages. index.js génère également les logs affichés dans le terminal exécutant l'application.

- chat.db contient les messages envoyés et archiver dans l'application.

- Lors d'une nouvelle connexion, index.js interroge chat.db et envoie tout les messages déjà enregistrés à l'utilisateur nouvellement connectés afin qu'il apparraîssent sur son interface web.

---------------------------------------------------------------

Utilisation ( /!\ l'application de chat utilise l'adresse de bouclage si cela n'est pas modifié par l'utilisateur; Consulter la documentation d'express pour changer l'IP de l'application /!\ ):
- Paramétrer l'application si besoin.

- Exécuter "node index.js" dans un terminal localiser dans le dossier Code/Websocket

- Ouvrir un des couples adresse:port lister dans le terminal (Par défaut, l'application ouvre autant de port que la machine hôte à de processeurs)

- Envoyer et recevoir des messages.

---------------------------------------------------------------

Informations supplémentaires:
- Capture d'écran exemplative des logs s'affichant dans le terminal lors de l'utilisation de l'application. (TestingLogs.png)

- Capture Wireshark PacketTracer des communications entre le serveur et deux clients webs.
