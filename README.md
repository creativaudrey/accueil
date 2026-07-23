# Site Créativ’Audrey

Site vitrine et bon de commande statique prêt pour GitHub Pages.

## Contenu

- `index.html` : page principale, catalogue et bon de commande
- `merci.html` : récapitulatif et paiement PayPal/Wero
- `styles.css` : mise en page responsive
- `script.js` : configurateur, panier, total et préparation du formulaire
- `assets/` : logo, photos et QR code PayPal optimisés

## Mise en ligne sur GitHub

1. Connectez-vous au compte GitHub `creativaudrey`.
2. Créez un dépôt public nommé `creativaudrey`.
3. Déposez tous les fichiers et le dossier `assets` à la racine du dépôt.
4. Ouvrez **Settings → Pages**.
5. Dans **Build and deployment**, choisissez **Deploy from a branch**.
6. Sélectionnez la branche `main`, le dossier `/ (root)`, puis enregistrez.
7. Le site sera disponible à l’adresse : `https://creativaudrey.github.io/creativaudrey/`.

## Activation des commandes par e-mail

Le formulaire utilise FormSubmit et envoie les commandes à `creativaudrey81@gmail.com`.

Lors du tout premier test :

1. Envoyez une commande test depuis le site publié.
2. Ouvrez le message d’activation reçu sur `creativaudrey81@gmail.com`.
3. Cliquez sur le bouton de confirmation.
4. Refaites un test complet avec PayPal puis avec Wero.

Le récapitulatif automatique ne fonctionne pas si le CAPTCHA de FormSubmit est désactivé ou si le formulaire est transformé en envoi AJAX.

## Paiement

- PayPal : QR code fourni + lien direct extrait du QR code.
- Wero : `06 73 54 28 55`.
- Le site calcule le total mais ne peut pas vérifier automatiquement l’encaissement, car GitHub Pages ne possède pas de serveur sécurisé.
- Audrey doit donc vérifier le paiement avant de lancer la fabrication.

## Point juridique à compléter avant ouverture commerciale

La rubrique CGV contient temporairement : **« médiateur de la consommation en cours de désignation »**. Cette mention doit être remplacée par le nom, l’adresse postale et le site du médiateur réellement choisi par l’entreprise.

## Test local

Le formulaire FormSubmit ne fonctionne pas correctement en ouvrant directement `index.html` avec une adresse `file://`.

Pour tester l’affichage localement :

```bash
python3 -m http.server 8000
```

Puis ouvrez `http://localhost:8000`.
