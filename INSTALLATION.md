# 🚀 Guide d'Installation - Expert Frontend Agent

## 📋 Vue d'ensemble

L'Expert Frontend Agent peut être installé de plusieurs façons selon vos besoins. Choisissez la méthode qui vous convient le mieux.

## 🎯 Méthodes d'Installation

### 1. **Installation Directe (Recommandée)**

#### **Avec chemin spécifique**
```bash
# Cloner le repository
git clone https://github.com/ajenguianis/FontAiAgent.git
cd FontAiAgent

# Installer les dépendances
npm install

# Installer dans votre projet spécifique
node install-ide-agent.js /chemin/vers/votre/projet
```

#### **Dans le projet courant**
```bash
# Depuis le repository FontAiAgent
node install-ide-agent.js .

# Ou depuis n'importe où
node install-global.js .
```

### 2. **Installation Globale**

#### **Avec clonage automatique**
```bash
# Le script clonera automatiquement le repository si nécessaire
node install-global.js /chemin/vers/votre/projet
```

#### **Installation npm globale**
```bash
npm install -g expert-frontend-agent
```

### 3. **Installation Manuelle**

#### **Étapes détaillées**
```bash
# 1. Cloner le repository
git clone https://github.com/ajenguianis/FontAiAgent.git
cd FontAiAgent

# 2. Installer les dépendances
npm install

# 3. Naviguer vers votre projet
cd /chemin/vers/votre/projet

# 4. Exécuter l'installation
node /chemin/vers/FontAiAgent/install-ide-agent.js .
```

## 📝 Exemples Pratiques

### **Projet Vue.js**
```bash
# Depuis le repository FontAiAgent
node install-ide-agent.js /home/user/projects/mon-app-vue

# Ou depuis n'importe où
node install-global.js /home/user/projects/mon-app-vue
```

### **Projet React**
```bash
# Installation dans un projet React
node install-ide-agent.js /home/user/projects/mon-app-react
```

### **Projet Angular**
```bash
# Installation dans un projet Angular
node install-global.js /home/user/projects/mon-app-angular
```

### **Projet Nuxt.js**
```bash
# Installation dans un projet Nuxt
node install-ide-agent.js /home/user/projects/mon-app-nuxt
```

## 🔧 Configuration Automatique

L'installation crée automatiquement :

### **Fichiers de configuration IDE**
- `.vscode/tasks.json` - Commandes rapides
- `.vscode/settings.json` - Configuration de l'agent
- `.vscode/frontend-expert-agent/` - Agent installé

### **Commandes disponibles**
- `Frontend Expert: Analyser` - Analyse complète du projet
- `Frontend Expert: Chat` - Mode conversationnel

## 🧪 Test d'Installation

Pour vérifier que l'installation fonctionne correctement :

```bash
# Test automatique
npm run test:install

# Test manuel
node test-installation.js

# Test avec projet spécifique
node test-installation.js /chemin/vers/projet-test
```

## 🔍 Vérification de l'Installation

Après l'installation, vérifiez que ces fichiers existent :

```bash
# Vérifier la structure
ls -la .vscode/
ls -la .vscode/frontend-expert-agent/

# Vérifier les fichiers de configuration
cat .vscode/tasks.json
cat .vscode/settings.json
```

## 🚨 Dépannage

### **Erreur: "Le chemin spécifié n'existe pas"**
```bash
# Vérifier que le chemin existe
ls -la /chemin/vers/votre/projet

# Utiliser un chemin absolu
node install-ide-agent.js $(pwd)/mon-projet
```

### **Erreur: "Script d'installation non trouvé"**
```bash
# Vérifier que vous êtes dans le bon répertoire
pwd
ls -la install-ide-agent.js

# Ou utiliser le script global
node install-global.js /chemin/vers/votre/projet
```

### **Erreur: "Dépendances non installées"**
```bash
# Installer les dépendances manuellement
cd .vscode/frontend-expert-agent
npm install
```

## 📊 Comparaison des Méthodes

| Méthode | Avantages | Inconvénients | Recommandé pour |
|---------|-----------|---------------|-----------------|
| **Installation Directe** | Simple, contrôle total | Nécessite le repository | Développement local |
| **Installation Globale** | Flexible, clonage auto | Dépendance internet | Utilisation régulière |
| **npm Global** | Installation système | Moins de contrôle | Utilisation système |

## 🎯 Recommandations

### **Pour un projet unique**
```bash
node install-ide-agent.js /chemin/vers/votre/projet
```

### **Pour plusieurs projets**
```bash
# Installer globalement
npm install -g expert-frontend-agent

# Ou utiliser le script global
node install-global.js /chemin/vers/projet1
node install-global.js /chemin/vers/projet2
```

### **Pour le développement**
```bash
# Cloner et développer
git clone https://github.com/ajenguianis/FontAiAgent.git
cd FontAiAgent
npm install
npm run dev
```

## 🔄 Mise à Jour

Pour mettre à jour l'agent dans un projet :

```bash
# Méthode 1: Réinstaller
node install-ide-agent.js /chemin/vers/votre/projet

# Méthode 2: Mettre à jour le repository
cd FontAiAgent
git pull
node install-ide-agent.js /chemin/vers/votre/projet
```

## 🧹 Désinstallation

Pour supprimer l'agent d'un projet :

```bash
# Supprimer les fichiers de configuration
rm -rf .vscode/frontend-expert-agent
rm .vscode/tasks.json
rm .vscode/settings.json

# Ou supprimer tout le dossier .vscode
rm -rf .vscode
```

---

**💡 Conseil** : Commencez par tester l'installation avec `npm run test:install` pour vous familiariser avec le processus. 