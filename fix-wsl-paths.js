#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

console.log('🔧 Correction des chemins WSL pour l\'Expert Frontend Agent...');

// Fonction pour corriger les tâches VS Code
async function fixVSCodeTasks(projectPath) {
    const tasksPath = path.join(projectPath, '.vscode/tasks.json');
    
    if (!await fs.pathExists(tasksPath)) {
        console.log('❌ Fichier tasks.json non trouvé');
        return;
    }
    
    try {
        const tasks = await fs.readJson(tasksPath);
        let modified = false;
        
        // Parcourir toutes les tâches
        if (tasks.tasks) {
            tasks.tasks.forEach(task => {
                if (task.label && task.label.includes('Frontend Expert')) {
                    // Ajouter l'option shell bash si elle n'existe pas
                    if (!task.options) {
                        task.options = {};
                    }
                    if (!task.options.shell) {
                        task.options.shell = {
                            executable: 'bash'
                        };
                        modified = true;
                        console.log(`✅ Corrigé: ${task.label}`);
                    }
                }
            });
        }
        
        if (modified) {
            await fs.writeJson(tasksPath, tasks, { spaces: 2 });
            console.log('✅ Fichier tasks.json mis à jour');
        } else {
            console.log('ℹ️  Aucune correction nécessaire');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la correction:', error.message);
    }
}

// Fonction pour créer un script de wrapper
async function createWrapperScript(projectPath) {
    const agentDir = path.join(projectPath, '.vscode/frontend-expert-agent');
    const wrapperPath = path.join(agentDir, 'run-agent.sh');
    
    const wrapperContent = `#!/bin/bash

# Wrapper script pour l'Expert Frontend Agent
# Résout les problèmes de chemins WSL

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"

# Convertir le chemin Windows en chemin Linux si nécessaire
if [[ "$PROJECT_DIR" == *"wsl.localhost"* ]]; then
    PROJECT_DIR=$(wslpath "$PROJECT_DIR")
fi

cd "$PROJECT_DIR"

# Exécuter l'agent avec les arguments
node "$SCRIPT_DIR/src/agent/ide-integration.js" "$@"
`;
    
    try {
        await fs.writeFile(wrapperPath, wrapperContent);
        await fs.chmod(wrapperPath, '755'); // Rendre exécutable
        console.log('✅ Script wrapper créé: run-agent.sh');
        
        // Mettre à jour les tâches pour utiliser le wrapper
        await updateTasksToUseWrapper(projectPath);
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du wrapper:', error.message);
    }
}

// Fonction pour mettre à jour les tâches pour utiliser le wrapper
async function updateTasksToUseWrapper(projectPath) {
    const tasksPath = path.join(projectPath, '.vscode/tasks.json');
    
    if (!await fs.pathExists(tasksPath)) {
        return;
    }
    
    try {
        const tasks = await fs.readJson(tasksPath);
        let modified = false;
        
        if (tasks.tasks) {
            tasks.tasks.forEach(task => {
                if (task.label && task.label.includes('Frontend Expert')) {
                    // Remplacer la commande node par le wrapper bash
                    if (task.command === 'node' && task.args && task.args[0] && task.args[0].includes('ide-integration.js')) {
                        task.command = 'bash';
                        task.args = [
                            '${workspaceFolder}/.vscode/frontend-expert-agent/run-agent.sh',
                            task.args[1] || 'help'
                        ];
                        modified = true;
                        console.log(`✅ Mis à jour: ${task.label} pour utiliser le wrapper`);
                    }
                }
            });
        }
        
        if (modified) {
            await fs.writeJson(tasksPath, tasks, { spaces: 2 });
            console.log('✅ Tâches mises à jour pour utiliser le wrapper');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des tâches:', error.message);
    }
}

// Fonction principale
async function main() {
    const args = process.argv.slice(2);
    const projectPath = args[0] || process.cwd();
    
    console.log(`📁 Projet: ${projectPath}`);
    
    try {
        // Vérifier que c'est un projet valide
        if (!await fs.pathExists(path.join(projectPath, '.vscode/frontend-expert-agent'))) {
            console.error('❌ Expert Frontend Agent non trouvé dans ce projet');
            console.log('💡 Exécutez d\'abord: node install-ide-agent.js [chemin-du-projet]');
            process.exit(1);
        }
        
        // Corriger les tâches VS Code
        await fixVSCodeTasks(projectPath);
        
        // Créer un script wrapper
        await createWrapperScript(projectPath);
        
        console.log('\n🎉 Correction terminée !');
        console.log('\n📋 Prochaines étapes :');
        console.log('1. Redémarrez VS Code');
        console.log('2. Testez les commandes "Frontend Expert:"');
        console.log('3. Si le problème persiste, utilisez le terminal intégré de VS Code');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    main();
}

module.exports = { fixVSCodeTasks, createWrapperScript, updateTasksToUseWrapper }; 