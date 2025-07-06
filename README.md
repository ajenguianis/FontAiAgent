# 🎨 Expert Frontend Agent v3.0.0

**Votre assistant IA pour créer des expériences frontend exceptionnelles**

Spécialisé Vue.js/Nuxt, Angular, React/Next avec expertise design de première classe.

## ✨ Caractéristiques

### 🎯 **Expertise Framework**
- **Vue.js/Nuxt** - Composition API, composables, optimisations
- **Angular** - Composants standalone, Signals, Material Design
- **React/Next** - Hooks personnalisés, SSR, optimisations

### 🎨 **Expertise Design de Première Classe**
- **HTML/Semantic** - Structure sémantique optimale
- **SCSS/CSS** - Systèmes de design tokens, variables CSS
- **JavaScript/TypeScript** - Code moderne et performant
- **Responsive Design** - Mobile-first, micro-interactions
- **Accessibilité** - WCAG, navigation clavier, ARIA

### 🤖 **Intelligence Artificielle**
- **Questions guidées** - Compréhension de vos objectifs
- **Analyse contextuelle** - Détection automatique + questions ciblées
- **Recommandations personnalisées** - Basées sur votre contexte
- **Code d'exemple** - Implémentations concrètes

### 💬 **Intégration IDE Native**
- **Chat conversationnel** - Interface naturelle dans votre IDE
- **Analyse automatique** - Détection des problèmes en temps réel
- **Génération de code** - Création automatique de composants
- **Suggestions intelligentes** - Recommandations contextuelles

## 🚀 Installation

### 🎯 **Installation dans votre projet (Recommandé)**

#### **Option 1: Installation directe avec chemin**
```bash
# Cloner le repository
git clone https://github.com/ajenguianis/FontAiAgent.git
cd FontAiAgent

# Installer les dépendances
npm install

# Installer dans votre projet spécifique
node install-ide-agent.js /chemin/vers/votre/projet
```

#### **Option 2: Installation depuis n'importe où**
```bash
# Utiliser le script global d'installation
node install-global.js /chemin/vers/votre/projet

# Ou pour le projet courant
node install-global.js .
```

#### **Option 3: Installation automatique**
```bash
# Le script détectera automatiquement le projet courant
node install-ide-agent.js
```

L'agent sera installé dans `.vscode/frontend-expert-agent/` et configuré pour fonctionner avec votre IDE.

### 📝 **Exemples d'installation**

```bash
# Installation dans un projet Vue.js
node install-ide-agent.js /home/user/projects/mon-app-vue

# Installation dans un projet React
node install-global.js /home/user/projects/mon-app-react

# Installation dans le projet courant
node install-ide-agent.js .

# Installation depuis n'importe où
cd /tmp
node install-global.js /home/user/projects/mon-projet
```

### 🌍 **Installation Globale**
```bash
npm install -g expert-frontend-agent
```

## 📋 Utilisation

### 💬 **Mode Chat IDE (Recommandé)**

Une fois installé, l'agent est disponible directement dans le chat de votre IDE (VoidIDE, Cursor, Trae, VS Code) :

#### **Commandes de base :**
```
🔍 "Analyse mon projet"
🚨 "Détecte les problèmes"
🚀 "Améliore le code"
🎨 "Crée un composant"
🧹 "Nettoie les fichiers"
📚 "Mets à jour la documentation"
```

#### **Exemples d'interaction :**
```
Vous: "Analyse mon projet Vue.js"
Agent: 🔍 **Analyse du Projet**
      🎯 Framework détecté : Vue.js 3.3.4
      📁 Structure : Composants, Pages, Styles
      🚀 Fonctionnalités : TypeScript, ESLint, Vite
      ⚠️ Problèmes détectés : 3
      💡 Recommandations : 5 disponibles

Vous: "Détecte les problèmes d'accessibilité"
Agent: 🚨 **Problèmes Détectés**
      🔴 Critiques (1) :
      - Images sans attribut alt dans Header.vue
      🟠 Élevés (2) :
      - Navigation sans focus visible
      - Contraste insuffisant sur les boutons

Vous: "Crée un composant de navigation"
Agent: 🎨 **Création de Composant**
      Je vais vous aider à créer un composant Navigation.
      Pour bien vous guider, j'ai besoin de quelques informations :
      1. Nom du composant (ex: NavigationBar, MainNav)
      2. Type de composant (UI, Layout, etc.)
      3. Fonctionnalités (props, events, slots)
      4. Style (CSS, SCSS, CSS-in-JS)
```

### 🎯 **Mode Analyse Classique**
```bash
npm start                    # Analyse complète du projet actuel
npm start [chemin]           # Analyser un projet spécifique
```

### 🔍 **Mode Audit**
```bash
npm start . audit            # Audit rapide du projet
```

### 🚀 **Mode Amélioration**
```bash
npm start . enhance          # Mode amélioration avec focus sur le code
```

## 💡 Expérience Utilisateur

### 🤖 **Agent Conversationnel Intelligent**

L'agent analyse vos messages et pose des questions pour mieux comprendre vos besoins :

#### **Analyse d'intention automatique :**
- **"Analyser"** → Analyse complète du projet
- **"Détecter"** → Recherche de problèmes et erreurs
- **"Améliorer"** → Recommandations d'optimisation
- **"Créer"** → Génération de code et composants
- **"Nettoyer"** → Suppression de fichiers inutiles
- **"Documenter"** → Mise à jour de la documentation

#### **Questions contextuelles :**
- **Objectif principal** : Performance, Design, Accessibilité, SEO, Qualité du code
- **Délai** : Immédiat, Court terme, Long terme
- **Niveau d'expertise** : Débutant, Intermédiaire, Expert
- **Style de design** : Minimal, Moderne, Créatif, Corporate, Personnalisé

### 🎨 **Génération de Code Intelligente**

L'agent peut créer automatiquement :

#### **Composants Framework-Spécifiques :**
```vue
<!-- Vue.js/Nuxt -->
<template>
  <nav class="navigation">
    <ul>
      <li v-for="item in menuItems" :key="item.id">
        <a :href="item.href">{{ item.label }}</a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface MenuItem {
  id: string
  label: string
  href: string
}

const menuItems = ref<MenuItem[]>([
  { id: 'home', label: 'Accueil', href: '/' },
  { id: 'about', label: 'À propos', href: '/about' }
])
</script>
```

#### **Styles Modernes :**
```scss
.navigation {
  display: flex;
  align-items: center;
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  
  ul {
    display: flex;
    gap: var(--spacing-6);
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  a {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
    
    &:hover {
      color: var(--color-primary);
    }
  }
}
```

## 📊 Exemple de Sortie

```
🎨 Expert Frontend Agent v3.0.0
Votre assistant IA pour créer des expériences frontend exceptionnelles
Spécialisé Vue.js/Nuxt, Angular, React/Next avec expertise design de première classe

🔄 Analyse du contexte du projet...
🎯 [NUXT.JS] Détecté : Nuxt.js ^3.0.0

Quel système de design utilisez-vous ?
  1. Aucun
  2. Material Design
  3. Ant Design
  4. Chakra UI
  5. Tailwind CSS
  6. Bootstrap
  7. Custom

Votre choix (numéro) : 5

📊 Analyse terminée ! Voici vos résultats :

🎯 Scores actuels :
  🟢 performance: 85/100
  🟢 design: 90/100
  🟡 accessibility: 75/100
  🟡 seo: 78/100
  🟢 codeQuality: 86/100

🚀 Recommandations prioritaires :

  1. Optimiser avec la Composition API
     📝 Migrer vers la Composition API pour une meilleure réutilisabilité et performance
     🎯 Impact: high | Effort: medium

  2. Créer un système de design tokens
     📝 Implémenter un système de design tokens pour la cohérence
     🎯 Impact: high | Effort: medium

  3. Implémenter un design responsive moderne
     📝 Créer une expérience utilisateur fluide sur tous les appareils
     🎯 Impact: high | Effort: medium
```

## 📁 Structure du Projet

```
src/
├── agent/
│   ├── index.ts              # Point d'entrée principal
│   ├── front-agent.ts        # Agent expert intelligent
│   ├── chat-agent.ts         # Agent conversationnel
│   └── ide-integration.ts    # Intégration IDE
├── config/
│   ├── frameworks.json       # Configuration des frameworks
│   ├── standards.json        # Standards de qualité
│   └── design-preferences.json # Préférences design
├── prompts/
│   └── framework-prompts.json # Prompts spécialisés
├── rules/
│   └── framework-rules.json  # Règles par framework
└── tests/
    ├── front-agent.test.ts   # Tests de l'agent principal
    └── e2e/
        └── agent-e2e.test.ts # Tests end-to-end
```

## 🎨 Expertise Design

### **HTML/Semantic**
- Structure sémantique optimale
- Accessibilité intégrée
- SEO-friendly markup

### **SCSS/CSS**
- Systèmes de design tokens
- Variables CSS modernes
- Architecture modulaire
- Responsive design avancé

### **JavaScript/TypeScript**
- Code moderne (ES6+)
- Patterns optimisés
- Performance-first
- Type safety

### **Micro-interactions**
- Animations subtiles
- États de chargement
- Feedback utilisateur
- Transitions fluides

## 🔧 Configuration IDE

### VS Code / Cursor / VoidIDE
L'agent s'installe automatiquement dans `.vscode/` avec :

- **tasks.json** - Commandes rapides
- **settings.json** - Configuration automatique
- **Intégration chat** - Interface conversationnelle

### Configuration automatique
```json
{
  "frontend-expert-agent.enabled": true,
  "frontend-expert-agent.autoAnalyze": true,
  "frontend-expert-agent.autoBackup": true,
  "frontend-expert-agent.suggestionsEnabled": true,
  "frontend-expert-agent.codeGenerationEnabled": true
}
```

## 🧪 Tests

```bash
npm test              # Tous les tests
npm run test:unit     # Tests unitaires
npm run test:e2e      # Tests end-to-end
```

## 📝 Scripts Disponibles

```bash
npm start             # Démarrage de l'agent
npm run analyze       # Analyse complète
npm run audit         # Audit rapide
npm run enhance       # Mode amélioration
npm run build         # Compilation TypeScript
npm run dev           # Mode développement
npm run lint          # Vérification du code
npm run lint:fix      # Correction automatique
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- 📧 Email: support@expert-frontend-agent.com
- 🐛 Issues: [GitHub Issues](https://github.com/ajenguianis/FontAiAgent/issues)
- 📖 Documentation: [Wiki](https://github.com/ajenguianis/FontAiAgent/wiki)

---

**🎨 Expert Frontend Agent v3.0.0** - Créez des expériences frontend exceptionnelles avec l'aide de l'IA !