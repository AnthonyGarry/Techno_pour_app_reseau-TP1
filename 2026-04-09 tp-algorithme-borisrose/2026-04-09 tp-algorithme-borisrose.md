# Exercice 1 : Horloges logiques de Lamport

## Calculer la valeur de l’horloge logique pour chaque événement en utilisant l’algorithme de Lamport.

"Chaque processus possède un entier appelé estampille. Il est mis à jour selon les règles suivantes : 
° un évènement interne provoque l'incrémentation de l'estampille ;
° tout message envoyé porte l'estampille courante de l'émetteur ;
° lors de la réception d'un message, l'estampille prend la valeur 1 + max(estampille du message, estampille courante du récepteur)." (https://fr.wikipedia.org/wiki/Horloge_de_Lamport)

- 1. P1 réalise un événement local = 0+1 = **1**
2. P1 envoie un message à P2 = 1 = **1**
3. P2 reçoit le message = 1 + max(1, 0) = 1 + max(1) = 1 + 1 = **2**d
4. P2 envoie un message à P3 = 2 = **2**
5. P3 reçoit le message = 1 + max(2, 0) = 2 + max(2) = 2 + 1 = **3**



# Exercice 2 : Horloges vectorielles

## Donner l’état du vecteur d’horloge après chaque événement.

https://fr.wikipedia.org/wiki/Horloge_vectorielle (Lire l'exemple aide beaucoup !)

Rappel: L'estampille est (p1, p2)

- 1. P1 réalise un événement local = (0+1, 0) = **(1, 0)**
2. P1 envoie un message à P2 = (1+1, 0) = **(2, 0)**
3. P2 reçoit le message = (2, 0+1) = **(2, 1)**
4. P2 réalise un événement local = (2, 1+1) = **(2, 2)**



# Exercice 3 : Algorithme d’élection du leader (Bully)

"The algorithm uses the following message types:

    Election Message: Sent to announce election.
    Answer (Alive) Message: Responds to the Election message.
    Coordinator (Victory) Message: Sent by winner of the election to announce victory.

When a process P recovers from failure, or the failure detector indicates that the current coordinator has failed, P performs the following actions:

    If P has the highest process ID, it sends a Victory message to all other processes and becomes the new Coordinator. Otherwise, P broadcasts an Election message to all other processes with higher process IDs than itself.
    If P receives no Answer after sending an Election message, then it broadcasts a Victory message to all other processes and becomes the Coordinator.
    If P receives an Answer from a process with a higher ID, it sends no further messages for this election and waits for a Victory message. (If there is no Victory message after a period of time, it restarts the process at the beginning.)
    If P receives an Election message from another process with a lower ID it sends an Answer message back and if it has not already started an election, it starts the election process at the beginning, by sending an Election message to higher-numbered processes.
    If P receives a Coordinator message, it treats the sender as the coordinator." (https://en.wikipedia.org/wiki/Bully_algorithm)

# Situation
Le processus P4 est le leader mais il tombe en panne.
Le processus P2 détecte la panne.

## 1. À quels processus P2 envoie-t-il un message ?

- P2 envoie un message à P3 car il s'agit de tout les processus avec un identifiant supérieur à P2. Il ne l'envoie pas à P4 malgré le fait que P4 à un ID supérieur à P2 car P2 sais que P4 est Hors-Service.



## 2. Quel processus devient le nouveau leader ?

- P3 deviens le nouveau leader car il est le processus encore fonctionnel avec l'identifiant le plus élevé.



## 3. Pourquoi cet algorithme s’appelle-t-il “Bully” ?

- Parce que quand le leader meurt (deviens H.S.), les autres processus s'avertissent de la mort du leader et se "tapent" dessus avec leurs IDs jusqu'à ce que celui avec l'ID le plus élevé (les poings les plus gros) gagne et devienne le nouveau leader.



# Exercice 4 : Consensus distribué

Trois serveurs doivent choisir une valeur :
Serveur | Valeur proposée
---------------------------
S1      | 10
S2      | 10
S3      | 20
La valeur choisie est celle qui obtient la majorité.

## 1. Quelle valeur est choisie ?

La valeur 10 est choisie car elle a été votée deux fois (par S1 et S2), ce qui est supérieur (2 > 1) à la valeur 20 qui a été votée une fois (par S3).



## 2. Que se passe-t-il si S2 tombe en panne ?

Le système va probablement se bloquer si S2 tombe en panne car chaque valeur proposée (10 et 20) auront 1 vote, ce qui créera une égalité.



## 3. Combien de serveurs minimum sont nécessaires pour tolérer une panne ?

Trois serveurs minimums sont donc nécessaire pour tolérer une panne, car cela permettra d'assurer l'existence d'une majorité.



# Exercice 5 : Exclusion mutuelle distribuée

## Déterminer l’ordre d’accès à la ressource.

P2 -> P1 -> P3



# Exercice 6 : Réplication et quorum

## 1. Peut-on lire si 3 serveurs sont en panne ?

Oui, lire ne nécessite que 2 réponses donc si 3 serveurs sont hors-ligne, il y en aura encore 2 qui pourront répondre (5 - 3 = 2).



## 2. Peut-on écrire si 2 serveurs sont en panne ?

Oui, écrire ne nécessite que 3 réponses donc si 2 serveurs sont hors-ligne, il y en aura encore 3 qui pourront répondre (5 - 2 = 3).



## 3. Pourquoi l’écriture nécessite-t-elle plus de confirmations que la lecture ?

L'écriture nécessite plus de confirmations que la lecture car une majorité est nécessaire afin de s'assurer que les données écrites ne seront pas jugées comme incorrectes et effacées en faveur des anciennes données. Pour une donnée stockée sur 5 serveurs, la majorité sera de 3 ou plus serveurs.



# Exercice 7 : Détection de panne par heartbeat

## Après combien de temps peut-on suspecter une panne du serveur ?

On peux suspecter une panne du serveur après 6 secondes, car il s'agit de la première fois que le heartbeat n'est pas envoyé.
