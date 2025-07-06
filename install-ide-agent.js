#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

console.log('🎨 Installation de l\'Expert Frontend Agent pour IDE...');

// Configuration de l'installation
const config = {
    sourceDir: __dirname,
    targetDir: '.vscode/frontend-expert-agent',
    filesToCopy: [
        'src/',
        'package.json',
        'tsconfig.json',
        '.eslintrc.js',
        'jest.config.js',
        'README.md'
    ],
    ideConfig: {
        'tasks.json': {
            version: '2.0.0',
            tasks: [
                {
                    label: 'Frontend Expert: Analyser',
                    type: 'shell',
                    command: 'node',
                    args: ['${workspaceFolder}/.vscode/frontend-expert-agent/src/agent/ide-integration.js', 'analyze'],
                    group: 'build',
                    presentation: {
                        echo: true,
                        reveal: 'always',
                        focus: false,
                        panel: 'shared'
                    },
                    problemMatcher: []
                },
                {
                    label: 'Frontend Expert: Chat',
                    type: 'shell',
                    command: 'node',
                    args: ['${workspaceFolder}/.vscode/frontend-expert-agent/src/agent/ide-integration.js', 'chat'],
                    group: 'build',
                    presentation: {
                        echo: true,
                        reveal: 'always',
                        focus: false,
                        panel: 'shared'
                    },
                    problemMatcher: []
                }
            ]
        },
        'settings.json': {
            'frontend-expert-agent.enabled': true,
            'frontend-expert-agent.autoAnalyze': true,
            'frontend-expert-agent.autoBackup': true,
            'frontend-expert-agent.suggestionsEnabled': true,
            'frontend-expert-agent.codeGenerationEnabled': true
        }
    }
};

// Fonction pour obtenir le projet de destination
function getTargetProject() {
    const args = process.argv.slice(2);
    
    // Si un argument est fourni, l'utiliser comme projet de destination
    if (args.length > 0) {
        const targetPath = path.resolve(args[0]);
        
        // Vérifier si le chemin existe
        if (!fs.existsSync(targetPath)) {
            console.error(`❌ Le chemin spécifié n'existe pas: ${targetPath}`);
            process.exit(1);
        }
        
        return targetPath;
    }
    
    // Sinon, utiliser le répertoire courant
    return process.cwd();
}

// Fonction pour vérifier si c'est un projet valide
function isValidProject(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const nodeModulesPath = path.join(projectPath, 'node_modules');
    
    // Vérifier si c'est un projet Node.js
    if (fs.existsSync(packageJsonPath)) {
        return true;
    }
    
    // Vérifier si c'est un projet avec node_modules
    if (fs.existsSync(nodeModulesPath)) {
        return true;
    }
    
    // Vérifier si c'est un projet frontend (présence de fichiers typiques)
    const frontendFiles = [
        'index.html',
        'src/',
        'public/',
        'components/',
        'pages/',
        'app/',
        'main.js',
        'main.ts',
        'App.js',
        'App.tsx',
        'App.vue'
    ];
    
    for (const file of frontendFiles) {
        if (fs.existsSync(path.join(projectPath, file))) {
            return true;
        }
    }
    
    return false;
}

async function installAgent() {
    try {
        const projectRoot = getTargetProject();
        const targetPath = path.join(projectRoot, config.targetDir);
        
        console.log(`📁 Projet de destination: ${projectRoot}`);
        console.log(`📁 Installation de l'agent dans: ${targetPath}`);
        
        // Vérifier si c'est un projet valide
        if (!isValidProject(projectRoot)) {
            console.warn('⚠️  Attention: Le répertoire ne semble pas être un projet frontend valide.');
            console.warn('   L\'installation continuera, mais l\'agent pourrait ne pas fonctionner correctement.');
            
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            const answer = await new Promise((resolve) => {
                rl.question('Continuer l\'installation ? (y/N): ', resolve);
            });
            rl.close();
            
            if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                console.log('❌ Installation annulée.');
                process.exit(0);
            }
        }
        
        // Créer le dossier de destination
        await fs.ensureDir(targetPath);
        
        // Copier les fichiers
        for (const file of config.filesToCopy) {
            const sourcePath = path.join(config.sourceDir, file);
            const destPath = path.join(targetPath, file);
            
            if (await fs.pathExists(sourcePath)) {
                await fs.copy(sourcePath, destPath);
                console.log(`✅ Copié: ${file}`);
            } else {
                console.log(`⚠️  Fichier non trouvé: ${file}`);
            }
        }
        
        // Créer la configuration IDE
        await createIDEConfig(projectRoot);
        
        // Installer les dépendances
        await installDependencies(targetPath);
        
        // Créer le point d'entrée pour l'IDE
        await createIDEIntegration(targetPath);
        
        // Créer les configurations IDE spécifiques
        await createIDEConfigFiles(targetPath);
        
        console.log('\n🎉 Installation terminée avec succès !');
        console.log('\n📋 Utilisation :');
        console.log('1. Ouvrez la palette de commandes (Ctrl+Shift+P)');
        console.log('2. Tapez "Tasks: Run Task"');
        console.log('3. Sélectionnez "Frontend Expert: Analyser" ou "Frontend Expert: Chat"');
        console.log('\n💡 Ou utilisez directement dans le chat de votre IDE :');
        console.log('   - "Analyse mon projet"');
        console.log('   - "Détecte les problèmes"');
        console.log('   - "Améliore le code"');
        console.log('   - "Crée un composant"');
        console.log('\n📁 Fichiers créés :');
        console.log(`   - ${path.relative(process.cwd(), path.join(projectRoot, '.vscode/tasks.json'))}`);
        console.log(`   - ${path.relative(process.cwd(), path.join(projectRoot, '.vscode/settings.json'))}`);
        console.log(`   - ${path.relative(process.cwd(), targetPath)}/`);
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'installation:', error.message);
        process.exit(1);
    }
}

async function createIDEConfig(projectRoot) {
    const vscodeDir = path.join(projectRoot, '.vscode');
    await fs.ensureDir(vscodeDir);
    
    // Créer tasks.json
    const tasksPath = path.join(vscodeDir, 'tasks.json');
    if (!await fs.pathExists(tasksPath)) {
        await fs.writeJson(tasksPath, config.ideConfig['tasks.json'], { spaces: 2 });
        console.log('✅ Créé: .vscode/tasks.json');
    } else {
        console.log('ℹ️  .vscode/tasks.json existe déjà');
    }
    
    // Créer settings.json
    const settingsPath = path.join(vscodeDir, 'settings.json');
    if (!await fs.pathExists(settingsPath)) {
        await fs.writeJson(settingsPath, config.ideConfig['settings.json'], { spaces: 2 });
        console.log('✅ Créé: .vscode/settings.json');
    } else {
        console.log('ℹ️  .vscode/settings.json existe déjà');
    }
}

async function installDependencies(targetPath) {
    const packageJsonPath = path.join(targetPath, 'package.json');
    
    if (await fs.pathExists(packageJsonPath)) {
        console.log('📦 Installation des dépendances...');
        
        const { execSync } = require('child_process');
        try {
            execSync('npm install', { 
                cwd: targetPath, 
                stdio: 'inherit' 
            });
            console.log('✅ Dépendances installées');
        } catch (error) {
            console.log('⚠️  Erreur lors de l\'installation des dépendances, mais l\'agent peut fonctionner');
        }
    }
}

async function createIDEIntegration(targetPath) {
    // Créer un point d'entrée simplifié pour l'IDE
    const ideEntryPath = path.join(targetPath, 'src/agent/ide-integration.js');
    
    const ideEntryContent = `#!/usr/bin/env node

const { processIDECommand } = require('./ide-integration');

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    const projectPath = process.cwd();
    const message = args[1];
    
    try {
        const result = await processIDECommand(command, projectPath, message);
        console.log(result);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}`;
    
    await fs.writeFile(ideEntryPath, ideEntryContent);
    console.log('✅ Créé: Point d\'entrée IDE');
}

// Fonction pour créer un agent de chat personnalisé
async function createChatAgent(targetPath) {
    const chatAgentPath = path.join(targetPath, 'src/agent/chat-wrapper.js');
    
    const chatWrapperContent = `#!/usr/bin/env node

const { FrontendChatAgent } = require('./chat-agent');

class ChatWrapper {
    constructor() {
        this.agent = null;
        this.projectPath = process.cwd();
    }
    
    async initialize() {
        this.agent = new FrontendChatAgent(this.projectPath);
        console.log('🎨 Expert Frontend Agent initialisé');
        console.log('💬 Tapez votre message (ou "quit" pour quitter):');
    }
    
    async processInput(input) {
        if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
            console.log('👋 Au revoir !');
            process.exit(0);
        }
        
        try {
            const response = await this.agent.processMessage(input);
            console.log('\\n🤖 Agent:', response);
            console.log('\\n💬 Votre message:');
        } catch (error) {
            console.error('❌ Erreur:', error.message);
        }
    }
}

// Interface de chat interactif
async function startChat() {
    const wrapper = new ChatWrapper();
    await wrapper.initialize();
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.on('line', async (input) => {
        await wrapper.processInput(input.trim());
    });
    
    rl.on('close', () => {
        console.log('\\n👋 Au revoir !');
        process.exit(0);
    });
}

if (require.main === module) {
    startChat();
}`;
    
    await fs.writeFile(chatAgentPath, chatWrapperContent);
    console.log('✅ Créé: Wrapper de chat interactif');
}

// Fonction pour créer un fichier de configuration pour les IDEs
async function createIDEConfigFiles(targetPath) {
    // Configuration pour Cursor
    const cursorConfig = {
        'cursor.json': {
            "agents": {
                "frontend-expert": {
                    "name": "Expert Frontend Agent",
                    "description": "Assistant IA spécialisé en développement frontend",
                    "commands": {
                        "analyze": "Analyser le projet",
                        "detect": "Détecter les problèmes",
                        "improve": "Améliorer le code",
                        "create": "Créer des composants",
                        "cleanup": "Nettoyer les fichiers"
                    },
                    "path": "./src/agent/chat-agent.js"
                }
            }
        }
    };
    
    await fs.writeJson(path.join(targetPath, 'cursor.json'), cursorConfig, { spaces: 2 });
    console.log('✅ Créé: Configuration Cursor');
    
    // Configuration pour VoidIDE
    const voidIDEConfig = {
        'voidide.json': {
            "agents": {
                "frontend-expert": {
                    "name": "Expert Frontend Agent",
                    "description": "Assistant IA spécialisé en développement frontend",
                    "commands": {
                        "analyze": "Analyser le projet",
                        "detect": "Détecter les problèmes",
                        "improve": "Améliorer le code",
                        "create": "Créer des composants",
                        "cleanup": "Nettoyer les fichiers"
                    },
                    "path": "./src/agent/chat-agent.js"
                }
            }
        }
    };
    
    await fs.writeJson(path.join(targetPath, 'voidide.json'), voidIDEConfig, { spaces: 2 });
    console.log('✅ Créé: Configuration VoidIDE');
}

// Exécuter l'installation
if (require.main === module) {
    installAgent()
        .then(() => {
            console.log('\n🎉 Installation terminée !');
            console.log('L\'Expert Frontend Agent est maintenant disponible dans votre IDE.');
        })
        .catch((error) => {
            console.error('❌ Erreur lors de l\'installation:', error);
            process.exit(1);
        });
}

module.exports = { installAgent, createIDEConfig, installDependencies }; 