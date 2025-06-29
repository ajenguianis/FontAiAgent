# FontAiAgent

**FontAiAgent** est un outil d’optimisation frontend alimenté par l’IA, conçu pour améliorer l’UX/UI, la performance et l’accessibilité des projets web. Spécialisé dans **Symfony**, **JavaScript/TypeScript** (React, Vue) et les tendances design 2025 (glassmorphism, micro-interactions, mode sombre), il s’intègre directement dans votre IDE pour optimiser vos interfaces de manière moderne et intuitive.

[![CI/CD](https://github.com/ajenguianis/FontAiAgent/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/ajenguianis/FontAiAgent/actions)

## 🚀 Fonctionnalités

- **Analyse UX/UI** : Évalue l’accessibilité (WCAG 2.1 AA, score ≥ 90/100), la sémantique HTML et les performances (FCP < 1.8s, LCP < 2.5s).
- **Optimisation Automatisée** : Corrige les images sans `alt`, modernise le code JS (`const`/`let`), ajoute des meta viewport, et plus.
- **Sauvegarde Automatique** : Sauvegarde les fichiers modifiés dans `.vscode/.agent_backups/`.
- **Interaction Utilisateur** : Pose des questions pour clarifier vos priorités (accessibilité, performance, etc.) et collecte votre feedback après chaque itération.
- **Support Multi-Technologies** : Compatible avec Symfony (Twig, SCSS), React, Vue, et autres frameworks JS/TS.
- **Tendances 2025** : Intègre glassmorphism, micro-interactions et mode sombre selon vos préférences.
- **Intégration IDE** : Tâches prêtes pour VS Code, Cursor, VoidIDE via `.vscode/tasks.json`.
- **CI/CD** : Tests unitaires et linting via GitHub Actions.
- **Modularité** : Code TypeScript modulaire, règles personnalisables et prompts pour IA.

## 📦 Installation dans Votre Projet

**FontAiAgent** s’utilise comme un outil utilisateur, intégré dans votre IDE via le dossier `.vscode/`. Suivez ces étapes pour l’installer dans votre projet existant :

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/ajenguianis/FontAiAgent.git
   ```

2. **Copier FontAiAgent dans votre projet** :
   - Exécutez le script d’installation pour copier les fichiers dans `.vscode/font-ai-agent/` :
     ```bash
     bash FontAiAgent/install-font-ai-agent.sh FontAiAgent /chemin/vers/votre-projet
     ```
   - Cela crée `.vscode/font-ai-agent/` avec tous les scripts, configurations et dépendances nécessaires.

3. **Prérequis** :
   - Assurez-vous que Node.js, `ts-node` et `jq` sont installés globalement :
     ```bash
     npm install -g ts-node
     sudo apt-get install jq  # Ubuntu/Debian
     brew install jq         # macOS
     ```

4. **Configurer `.vscode/tasks.json`** :
   - Copiez le fichier `.vscode/tasks.json` depuis le dépôt **FontAiAgent** :
     ```bash
     cp FontAiAgent/.vscode/tasks.json /chemin/vers/votre-projet/.vscode/
     ```

## 🛠️ Utilisation dans Votre IDE

**FontAiAgent** suit une méthodologie itérative PDCA (Plan-Do-Check-Act) pour analyser, optimiser, vérifier et finaliser les améliorations de votre projet :
- **Plan** : Analyse initiale, questions pour clarifier vos priorités, et définition des objectifs SMART.
- **Do** : Application des corrections automatiques avec sauvegarde dans `.vscode/.agent_backups/`.
- **Check** : Vérification des progrès, collecte de feedback, et confirmation manuelle (`--confirm`).
- **Act** : Génération d’un rapport final dans `.vscode/final-report.md`.

### Optimiser un Projet Existant dans Votre IDE

1. **Ouvrir votre projet** :
   - Ouvrez le dossier de votre projet (ex. `/mon-projet-symfony/`) dans VS Code, Cursor ou VoidIDE.

2. **Installer FontAiAgent** :
   - Exécutez le script d’installation (voir **Installation** ci-dessus) pour copier **FontAiAgent** dans `.vscode/font-ai-agent/`.

3. **Lancer l’optimisation** :
   - Ouvrez la palette de commandes (`Ctrl+Shift+P` ou `Cmd+Shift+P`).
   - Tapez `Tasks: Run Task` et sélectionnez `FontAiAgent: Optimize Project`.
   - Répondez aux questions interactives pour définir vos priorités (ex. accessibilité, fichiers spécifiques, tendances de design).
   - Cela exécute :
     ```bash
     ts-node .vscode/font-ai-agent/scripts/front-agent-job.ts --project .
     ```
   - Pour une optimisation interactive (confirmation et feedback après chaque itération) :
     - Sélectionnez `FontAiAgent: Optimize Project (Interactive)`.

4. **Vérifier les résultats** :
   - Les rapports sont générés dans `.vscode/iteration-N/` (ex. `.vscode/iteration-1/analysis-data.json`, `.vscode/iteration-1/ux-report.md`).
   - Consultez `.vscode/final-report.md` pour un résumé des améliorations et votre feedback.
   - Les sauvegardes sont stockées dans `.vscode/.agent_backups/`.

5. **Appliquer les recommandations manuelles** (si nécessaire) :
   - Ouvrez `.vscode/iteration-N/ux-report.md` pour les recommandations.
   - Utilisez les prompts dans `.vscode/font-ai-agent/prompts/` avec Trae, Cursor ou VS Code.

**Exemple : Optimiser un projet Symfony** :
- Projet dans `/mon-projet-symfony/`.
- Après installation, ouvrez le projet dans VS Code.
- Lancez `FontAiAgent: Optimize Project` via la palette de commandes.
- Répondez aux questions (ex. "Prioriser l’accessibilité", "Fichiers: templates/home.twig", "Tendances: dark mode").
- Fournissez un feedback après chaque itération (ex. "Focusing more on performance next time").
- Vérifiez `.vscode/final-report.md` pour les améliorations.

### Autres Cas d’Utilisation

#### Analyser une URL
```bash
ts-node .vscode/font-ai-agent/scripts/front-agent-job.ts --url https://example.com --screenshot --performance
```

#### Analyser un fichier HTML
```bash
ts-node .vscode/font-ai-agent/scripts/front-agent-job.ts --html /chemin/vers/fichier.html --deep
```

#### Auditer un projet Symfony
```bash
ts-node .vscode/font-ai-agent/scripts/audit-symfony.ts --project .
```

#### Auditer un projet JS/TS
```bash
ts-node .vscode/font-ai-agent/scripts/audit-js.ts --project .
```

#### Restaurer une sauvegarde
```bash
bash .vscode/font-ai-agent/scripts/rollback.sh 20250629-1304
```

#### Supprimer les sauvegardes
```bash
bash .vscode/font-ai-agent/scripts/clear-backups.sh 20250629-1304
```

## 🧪 Tests

Pour valider l’installation, exécutez les tests depuis `.vscode/font-ai-agent/` :
```bash
cd .vscode/font-ai-agent
npm test
```

Linting du code :
```bash
npm run lint
```

## 🖥️ Intégration avec les IDEs

- **VS Code / Cursor / VoidIDE** : Utilisez `.vscode/tasks.json` pour exécuter les tâches via `Tasks: Run Task`.
- **Trae** : Chargez les fichiers `.vscode/font-ai-agent/rules/*.rules` dans Agents → New Agent.

## 📂 Structure de FontAiAgent dans Votre Projet

Après installation, votre projet contiendra :
```
/chemin/vers/votre-projet/
├── .vscode/
│   ├── font-ai-agent/
│   │   ├── scripts/           # Scripts pour analyse et optimisation
│   │   ├── config/            # Préférences de design et heuristiques UX
│   │   ├── rules/             # Règles pour Trae
│   │   ├── prompts/           # Prompts pour optimisations manuelles
│   │   ├── tests/             # Tests unitaires
│   │   ├── package.json       # Dépendances de l’agent
│   │   ├── node_modules/      # Dépendances installées
│   ├── .agent_backups/        # Sauvegardes automatiques
│   ├── iteration-N/           # Rapports d’itération
│   ├── final-report.md        # Rapport final
│   ├── tasks.json             # Tâches pour l’IDE
├── .gitignore                 # Ajoutez .vscode/font-ai-agent/node_modules/
```

## 🤝 Contribuer

1. Forkez le dépôt et créez une branche :
   ```bash
   git checkout -b feature/votre-fonctionnalité
   ```
2. Suivez le guide de style dans `.vscode/font-ai-agent/config/style-guide.json`.
3. Ajoutez des tests dans `.vscode/font-ai-agent/tests/`.
4. Soumettez une pull request en utilisant le modèle dans `.github/PULL_REQUEST_TEMPLATE.md`.

Consultez `.github/CONTRIBUTING.md` pour plus de détails.

## 📜 Licence

[MIT License](LICENSE)

## 📬 Contact

Pour questions ou suggestions, ouvrez une issue sur [GitHub](https://github.com/ajenguianis/FontAiAgent) ou contactez [votre-email@example.com].

---

**FontAiAgent** : Votre partenaire pour des interfaces modernes, accessibles et performantes. Propulsé par une expertise senior et une créativité sans limite.