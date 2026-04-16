VM linux mint 8Go de RAM 2CPUs




# Installation
## Docker

https://docs.docker.com/engine/install/ubuntu/

Add Docker's official GPG key:
```sudo apt update`
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

Add the repository to Apt sources:
```sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

Mise à jour du cache du gestionnaire de paquets et installation de la dernière version de docker et des extras recommandés :
```sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Lancement d'une image par défaut qui a pour but de vérifier que notre installation docker fonctionne (le docker local la télécharge directement depuis les serveurs de docker) :
```sudo docker run hello-world
```

On vérifie la version :
```docker --version
```
"Docker version 29.4.0n build 9d7ad9f"




## Minikube

"minikube quickly sets up a local Kubernetes cluster on macOS, Linux, and Windows. We proudly focus on helping application developers and new Kubernetes users."

https://kubernetes.io/fr/docs/tasks/tools/install-minikube/

Téléchargement de la dernière version de l'installateur minikube :
```curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && chmod +x minikube
```
On enlève le \ à la fin de la première commande ci-dessus (voir site) car il cause une erreur et l'échec du curl.

Création (si jamais pour une raison obscure il n'existe pas déjà) du répertoire de binaires de l'utilisateur :
```sudo mkdir -p /usr/local/bin/
```

Lancement de l'installateur minikube en lui renseignant le chemin du répertoire de binaires de l'utilisateur :
```sudo install minikube /usr/local/bin/
```


https://minikube.sigs.k8s.io/docs/drivers/docker/

On démarre minikube :
```minikube start --driver=docker
```
La commande échoue car j'ai oublié d'ajouter mon utilisateur non-root au groupe docker :
```sudo usermod -aG docker user
minikube start --driver=docker
```

On vérifie la version :
```minikube version
```
"minikube version: v1.13.1
commit: La flemme de recopier ça =) "




## Kubectl

"Kubectl is a command-line tool used to interact with Kubernetes clusters, allowing users to manage applications, resources, and configurations. It communicates with the Kubernetes API to perform various operations like deploying applications, scaling them, and troubleshooting issues."

https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/

Téléchargement de la dernière version du binaire kubectl :
```curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```
Ils ont un méchanisme très intéréssant où il ne crée pas de dossier "Latest" qui doit manuellement être mit à jour mais utilisent à la place un fichier texte où est écrit la dernière version.
J'imagine que ça nécessite légèrement moins d'entretion manuel/humain que de créer un dossier latest et de le renommer à chaque nouvelle version tout en créant un nouveau dossier latest, puisque là ils créent un dossier par version (normal) et update le fichier texte sans devoir renommer et recréer.

Téléchargement du checksum de kubectl :
```curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
```

On vérifie le checksum car je ne connaissais pas cet usage de la commande. (Pas fait pour les autres car c'est une VM isolée de l'hôte (Pas d'accès à l'hôte autre que pour internet et même là elle utilise un NAT interne)) :
```echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
```
"kubectl: Réussi"

On lance l'installateur en tant que root en ciblant le répertoire de binaire de tout les utilisateurs :
```sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

On vérifie la version :
```kubectl version --client
```
"Client Version: v1.35.4
Kustomize Version: v5.7.1"
La Client Version est la version de kubectl
La Kustomize Version est la version de Kustomize, l'outil de gestion de configuration de Kubernetes





# Déploiement d'une application distribuée

Création du déploiement d'un serveur web nginx :
```kubectl create deployment web --image=nginx
```

Vérification du déploiement :
```kubectl get deployments
```

On affiche les pods :
```kubectl get pods
```
"Un pod (terme anglo-saxon décrivant un groupe de baleines ou une gousse de pois) est un groupe d'un ou plusieurs conteneurs (comme des conteneurs Docker), ayant du stockage/réseau partagé, et une spécification sur la manière d'exécuter ces conteneurs. Les éléments d'un pod sont toujours co-localisés et co-ordonnancés, et s'exécutent dans un contexte partagé. Un pod modélise un "hôte logique" spécifique à une application - il contient un ou plusieurs conteneurs applicatifs qui sont étroitement liés — dans un monde pré-conteneurs, être exécuté sur la même machine physique ou virtuelle signifierait être exécuté sur le même hôte logique." (https://kubernetes.io/fr/docs/concepts/workloads/pods/pod/)





# Mise à l'échelle (Scaling)

Création de 3 instances répliquées de notre docker web :
```kubectl scale deployment web --replicas=3
```
Est-ce que cela va en faire 3 **nouvelles** ou ammener le **nombre total** de dockers à 3 ?

On vérifie la liste de pods :
```kubectl get pods
```
On voit 3 pods, la commande de scale ammène donc le nombre de réplicas à celui entrer dans la commande. On peux aussi identifier lequel de nos pods était le premier (si on n'a pas noté le nom) à travers l'âge des pods.

On expose le docker web (les 3 réplicas) en mode Nodeport, donc en écoutant sur le port 80 d'une adresse interne qui sera générée par la commande (https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types) :
```kubectl expose deployment web --type=NodePort --port=80
```

On récupère l'URL du service :
```minikube service web --url
```
"http://192.168.49.2:30330"

On charge l'adresse dans firefox et wouaw, ça fonctionne. On accède à la page d'accueil de nginx.

On simule une panne en supprimant un des pods à partir du nom obtenu avec `kubectl get pods`
```kubectl delete pod NOM_DU_POD
```

On vérifie que le pod a bien été supprimé :
```kubectl get pods
```
On remarque que kubernetes à automatiquement créé un nouveau pod pour maintenir le nombre de replicas à 3. Le système est donc tolérant aux fautes puisque si jamais un serveur était passé hors-connexion, kubernetes aurait initialisé un nouveau serveur pour maintenir la disponibilité du service.





# Questions

1. Quelle est la différence entre un système centralisé et distribué ?

Un système centralisé est un système où toutes les ressources sont hébergés sur le même hôte (ex: votre téléphone en mode hors-connexion). Un système distribué, au contraire, utilise des ressources qui sont réparties (distribuées) entre plusieurs hôtes (ex: le cloud ou internet en général.)

La différence est donc la nécessité de connexion pour le fonctionnement d'un système distribué alors qu'un système centralisé peux opérer sans aucune connexion réseau (Sauf si l'on compte le micro-réseau reliant les composants d'un seul ordinateur entre eux).


2. Pourquoi utiliser plusieurs instances d’une application ?

Utiliser plusieurs instances de l'application permet de créer du load-balancing et donc d'assurer une tolérance de pannes pour une application.


3. Que se passe-t-il si un pod tombe en panne ?

Un autre pod prends la relêve pendant que Kubernetes recrée le pod hors-service, tout cela automatiquement.


4. Qu’est-ce que la tolérance aux fautes ?

La tolérance aux fautes est la capacité d'un système ou méchanisme à continuer d'assurer sa fonction même lors d'une panne à un ou plusieurs composants (selon le degré de tolérance). Par exemple, ici c'était la capacité de nos pods Kubernetes à continuer de permettre l'accès à la page d'accueil de nginx.


5. Kubernetes garantit-il la haute disponibilité ?

Oui, Kubernetes garant la haute disponibilité car il fait automatiquement du load balancing quand plusieurs réplicas d'un même service existent, assurant donc la disponibilité du service même si l'un des serveurs deviens injoignable.


6. Quel est le rôle du load balancing ?

Le rôle du load balancing est de répartir la charge entre plusieurs points d'accès à un service pour assurer des performances maximales. Par exemple, si nous avons 3 utilisateurs tentant d'accèder à notre serveur nginx qui est en réalité 3 serveurs derrière un système de load balancing. Ce système de load balancing fera en sorte que chaque utilisateur soit connecté à un de nos trois serveurs pour être sûr que le traffic de l'un ne gène pas l'expérience des autres utilisateurs (exemple: en cas de requête très gourmande en ressource qui pourrait saturé un des serveur.).
