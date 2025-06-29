# Guide de Contribution

Merci de vouloir contribuer à **FrontAgent** ! Voici les étapes pour participer au projet.

## Comment Contribuer
1. **Forker le dépôt** : Créez une copie du dépôt sur votre compte GitHub.
2. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/votre-utilisateur/FrontAgent.git
   cd FrontAgent
   ```
3. **Installer les dépendances** :
   ```bash
   npm install
   npm install -g ts-node
   sudo apt-get install jq  # Ubuntu/Debian
   brew install jq         # macOS
   ```
4. **Créer une branche** :
   ```bash
   git checkout -b feature/votre-fonctionnalité
   ```
5. **Effectuer vos modifications** : Suivez le guide de style dans `config/style-guide.json`.
6. **Ajouter des tests** : Mettez à jour les tests dans `src/tests/`.
7. **Vérifier le code** :
   ```bash
   npm run lint
   npm test
   ```
8. **Soumettre une Pull Request** : Utilisez le modèle dans `.github/PULL_REQUEST_TEMPLATE.md`.

## Conventions de Code
- **JavaScript/TypeScript** : Utiliser `const`/`let`, camelCase, indentation de 2 espaces.
- **CSS/SCSS** : Mobile-first, variables CSS avec `--prefix`, kebab-case.
- **HTML/Twig** : Sémantique HTML5, maximum 5 niveaux d’imbrication.
- **Tests** : Ajouter des tests unitaires pour chaque nouvelle fonctionnalité.

## Structure du Projet
- `src/scripts/` : Scripts principaux (analyse, optimisation, sauvegarde).
- `src/config/` : Configurations pour design, style, et heuristiques UX.
- `src/rules/` : Règles pour Trae.
- `src/prompts/` : Prompts pour Trae, Cursor, et VS Code.
- `src/tests/` : Tests unitaires.
- `ide-config/` : Configurations pour Trae, Cursor, VS Code, VoidIDE.

## Signaler un Bug
Utilisez le modèle d’issue dans `.github/ISSUE_TEMPLATE.md`.

## Proposer une Fonctionnalité
Décrivez la fonctionnalité dans une issue et proposez une implémentation.

## Questions
Contactez le mainteneur à [votre-email@example.com] ou ouvrez une issue.