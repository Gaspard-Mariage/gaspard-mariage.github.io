# Site du mariage de Laure & Gaspard

Site statique hébergé gratuitement sur **GitHub Pages**, avec les réponses des invités enregistrées dans **Supabase** (offre gratuite).

| Page | Adresse | Rôle |
|---|---|---|
| Accueil | `/` | Le faire-part en ligne : programme, lieux, contacts |
| Réponse | `/reponse.html` | Questionnaire de présence. N'apparaît pas dans le menu, on y arrive par les boutons « Répondre à l'invitation ». Non référencé par Google. |
| Espace des mariés | `/admin.html` | Connexion de Gaspard : totaux, liste des réponses, allergies, export Excel |

Temps total de mise en place : environ 20 minutes.

---

## Étapes 1 et 2 — Base Supabase (déjà faites)

Le projet Supabase **Mariage** (organisation Gaspard, région Irlande) contient la table des réponses, la liste des administrateurs (`gaspardmariage18@gmail.com`) et les règles de sécurité. `config.js` est déjà relié à ce projet. Un visiteur peut seulement **ajouter** une réponse, jamais lire celles des autres.

Il reste à faire dans le tableau de bord Supabase :

1. **Authentication** → **Users** → **Add user** → **Create new user** : email `gaspardmariage18@gmail.com`, mot de passe choisi avec Gaspard, cocher **Auto Confirm User**.
2. **Authentication** → **Sign In / Providers** → **Email** : désactiver **Allow new users to sign up**.

> Pour donner aussi l'accès à Laure : créer son utilisateur de la même façon, puis dans **SQL Editor** exécuter
> `insert into public.admins (email) values ('laure.geant@gmail.com');`

## Étape 3 — Mettre en ligne sur GitHub Pages

1. Sur GitHub, créer un dépôt **public** (par ex. `mariage-laure-gaspard`). GitHub Pages gratuit nécessite un dépôt public. Aucune donnée d'invité n'est dans le dépôt : elles sont dans Supabase.
2. **Add file** → **Upload files** → glisser tout le contenu de ce dossier (`index.html`, `reponse.html`, `admin.html`, `.nojekyll`, fichiers `.css`, `.js`, `.svg` et `.sql`) → **Commit changes**.
3. **Settings** → **Pages** → *Source* : **Deploy from a branch** → branche `main`, dossier `/ (root)` → **Save**.
4. Après 1 à 2 minutes, le site est en ligne à l'adresse `https://VOTRE-PSEUDO.github.io/mariage-laure-gaspard/`.

### Nom de domaine (facultatif)
Pour une adresse du type `laure-et-gaspard.fr` (environ 8 €/an chez OVH, Gandi…) : **Settings → Pages → Custom domain**, puis suivre les indications DNS de GitHub.

## Étape 4 — Tester avant d'envoyer le lien

1. Ouvrir le site, cliquer **Répondre à l'invitation**, envoyer une réponse test.
2. Ouvrir `…/admin.html`, se connecter avec le compte de Gaspard : la réponse test apparaît. La supprimer avec le bouton **Supprimer**.
3. Depuis un autre navigateur non connecté, vérifier que `admin.html` demande bien un mot de passe.

## Au quotidien (pour Gaspard)

- Adresse à garder dans ses favoris : `…/admin.html`
- Totaux en haut de page : personnes attendues, réponses reçues, nombre de personnes à la mairie, au dîner et au brunch.
- **Exporter (Excel)** télécharge un fichier `.csv` qui s'ouvre directement dans Excel (pour le traiteur, le plan de table…).
- Mot de passe oublié : le changer dans Supabase → Authentication → Users → `…` → *Send password recovery* ou recréer l'utilisateur.

## Modifier le contenu

Tous les textes sont dans `index.html`. Les horaires du cocktail et du dîner sont marqués « Ensuite » et « Le soir » en attendant les horaires définitifs. Les hortensias sont dessinés par `fleurs.js` (aucune image à télécharger).

## Ancien Google Form

Le formulaire Google n'est plus utilisé par le site. Pensez à le fermer (Réponses → décocher *Accepter les réponses*) pour éviter que des invités répondent aux deux endroits.
