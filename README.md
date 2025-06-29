# FontAiAgent

**FontAiAgent** est un outil d’optimisation frontend alimenté par l’IA, conçu pour améliorer l’UX/UI, la performance, et l’accessibilité des projets web, avec une expertise équivalente à 20 ans d’expérience. Spécialisé dans **Symfony**, **JavaScript/TypeScript** (React, Vue), et les tendances design 2025 (glassmorphism, micro-interactions, mode sombre), il analyse, audite, et optimise automatiquement vos interfaces pour une expérience utilisateur moderne et intuitive.

[![CI/CD](https://github.com/ajenguianis/FontAiAgent/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/ajenguianis/FontAiAgent/actions)

## 🚀 Fonctionnalités

- **Analyse UX/UI** : Évalue l’accessibilité (WCAG 2.1 AA), la sémantique HTML, et les performances (FCP < 1.8s, LCP < 2.5s).
- **Optimisation Automatisée** : Corrige les problèmes comme les images sans `alt`, modernise le code JS (`const`/`let`), et ajoute des meta viewport.
- **Support Multi-Technologies** : Compatible avec Symfony (Twig, SCSS), React, Vue, et autres frameworks JS/TS.
- **Tendances 2025** : Intègre des recommandations créatives (glassmorphism, micro-interactions, mode sombre).
- **Sauvegarde et Rollback** : Suivi des modifications avec sauvegardes automatiques et restauration facile.
- **Intégration IDE** : Configurations pour VS Code, Cursor, et VoidIDE via `.vscode/tasks.json`.
- **CI/CD** : Tests unitaires et linting via GitHub Actions.
- **Modularité** : Code TypeScript modulaire, règles personnalisables, et prompts pour IA.

## 📦 Installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/ajenguianis/FontAiAgent.git
   cd FontAiAgent
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   npm install -g ts-node
   sudo apt-get install jq  # Ubuntu/Debian
   brew install jq         # macOS
   ```

3. **Configurer TypeScript** (optionnel) :
   Vérifiez `tsconfig.json` pour les paramètres de compilation.

## 🛠️ Utilisation

### 1. Analyser et optimiser un projet local
```bash
ts-node src/scripts/front-agent-job.ts --project /chemin/vers/votre-projet
```
Sorties dans `tmp/iteration-N/` et `tmp/final-report.md`.

### 2. Analyser une URL
```bash
ts-node src/scripts/front-agent-job.ts --url https://example.com --screenshot --performance
```

### 3. Analyser un fichier HTML
```bash
ts-node src/scripts/front-agent-job.ts --html /chemin/vers/fichier.html --deep
```

### 4. Auditer un projet Symfony
```bash
ts-node src/scripts/audit-symfony.ts --project /chemin/vers/projet-symfony
```

### 5. Auditer un projet JS/TS
```bash
ts-node src/scripts/audit-js.ts --project /chemin/vers/projet-js
```

### 6. Suivre et sauvegarder les modifications
```bash
ts-node src/scripts/track-changes.ts --project /chemin/vers/projet
```

### 7. Restaurer une sauvegarde
```bash
bash src/scripts/rollback.sh 20250629-1304
```

### 8. Supprimer les sauvegardes
```bash
bash src/scripts/clear-backups.sh 20250629-1304
```

## 🧪 Tests

Exécutez les tests unitaires pour valider le fonctionnement :
```bash
npm test
```

Linting du code :
```bash
npm run lint
```

## 🖥️ Intégration avec les IDEs

- **VS Code / Cursor / VoidIDE** : Copiez `.vscode/tasks.json` dans votre projet et utilisez le command palette (`Ctrl+Shift+P` ou `Cmd+Shift+P`) pour exécuter les tâches (`Tasks: Run Task`).
- **Trae** : Chargez les fichiers `src/rules/*.rules` dans Agents → New Agent.

## 📂 Structure du Projet

```
FontAiAgent/
├── .github/
│   ├── workflows/         # GitHub Actions pour CI/CD
│   ├── ISSUE_TEMPLATE.md  # Modèle pour issues
│   ├── PULL_REQUEST_TEMPLATE.md # Modèle pour PRs
│   ├── CODE_OF_CONDUCT.md # Code de conduite
│   ├── CONTRIBUTING.md    # Guide de contribution
├── .vscode/
│   ├── tasks.json         # Tâches pour VS Code, Cursor, VoidIDE
├── src/
│   ├── scripts/           # Scripts pour analyse, audit, et optimisation
│   ├── config/            # Préférences de design et heuristiques UX
│   ├── rules/             # Règles pour Trae
│   ├── prompts/           # Prompts pour optimisations manuelles
│   ├── tests/             # Tests unitaires
├── tmp/                   # Sorties temporaires (Git-ignoré)
├── .agent_backups/        # Sauvegardes (Git-ignoré)
├── node_modules/          # Dépendances (Git-ignoré)
├── .gitignore             # Fichiers ignorés par Git
├── LICENSE                # Licence MIT
├── README.md              # Documentation principale
├── package.json           # Dépendances et scripts
├── tsconfig.json          # Configuration TypeScript
```

## 🤝 Contribuer

1. Forkez le dépôt et créez une branche :
   ```bash
   git checkout -b feature/votre-fonctionnalité
   ```
2. Suivez le guide de style dans `src/config/style-guide.json`.
3. Ajoutez des tests dans `src/tests/`.
4. Soumettez une pull request en utilisant le modèle dans `.github/PULL_REQUEST_TEMPLATE.md`.

Consultez `.github/CONTRIBUTING.md` pour plus de détails.

## 📜 Licence

[MIT License](LICENSE)

## 📬 Contact

Pour questions ou suggestions, ouvrez une issue sur [GitHub](https://github.com/ajenguianis/FontAiAgent) ou contactez [votre-email@example.com].

---

**FontAiAgent** : Votre partenaire pour des interfaces modernes, accessibles, et performantes. Propulsé par une expertise senior et une créativité sans limite.