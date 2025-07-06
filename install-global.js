#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 Installation globale de l\'Expert Frontend Agent...');

// Fonction pour obtenir le chemin du script d'installation
function getInstallScriptPath() {
    // Si le script est exécuté depuis le projet FontAiAgent
    const currentDir = process.cwd();
    const installScript = path.join(currentDir, 'install-ide-agent.js');
    
    if (fs.existsSync(installScript)) {
        return installScript;
    }
    
    // Si installé globalement, chercher dans node_modules
    try {
        const globalPath = execSync('npm root -g', { encoding: 'utf8' }).trim();
        const globalScript = path.join(globalPath, 'expert-frontend-agent', 'install-ide-agent.js');
        
        if (fs.existsSync(globalScript)) {
            return globalScript;
        }
    } catch (error) {
        // Ignorer les erreurs
    }
    
    return null;
}

// Fonction pour cloner le repository si nécessaire
async function cloneRepositoryIfNeeded() {
    const currentDir = process.cwd();
    const fontAiAgentDir = path.join(currentDir, 'FontAiAgent');
    
    // Vérifier si le repository existe déjà
    if (fs.existsSync(fontAiAgentDir)) {
        console.log('📁 Repository FontAiAgent trouvé localement');
        return fontAiAgentDir;
    }
    
    console.log('📥 Clonage du repository FontAiAgent...');
    
    try {
        execSync('git clone https://github.com/ajenguianis/FontAiAgent.git', {
            stdio: 'inherit',
            cwd: currentDir
        });
        
        console.log('✅ Repository cloné avec succès');
        return fontAiAgentDir;
    } catch (error) {
        console.error('❌ Erreur lors du clonage:', error.message);
        console.log('💡 Vous pouvez aussi :');
        console.log('   1. Cloner manuellement: git clone https://github.com/ajenguianis/FontAiAgent.git');
        console.log('   2. Naviguer dans le dossier: cd FontAiAgent');
        console.log('   3. Exécuter: node install-ide-agent.js [chemin-du-projet]');
        process.exit(1);
    }
}

// Fonction principale
async function main() {
    const args = process.argv.slice(2);
    const targetProject = args[0];
    
    if (!targetProject) {
        console.log('📋 Utilisation:');
        console.log('   node install-global.js [chemin-du-projet]');
        console.log('');
        console.log('📝 Exemples:');
        console.log('   node install-global.js /path/to/my-vue-project');
        console.log('   node install-global.js ../my-react-app');
        console.log('   node install-global.js .  # Projet courant');
        console.log('');
        console.log('💡 Si vous n\'avez pas le repository localement, il sera cloné automatiquement.');
        process.exit(0);
    }
    
    try {
        // Vérifier si le projet de destination existe
        const targetPath = path.resolve(targetProject);
        if (!fs.existsSync(targetPath)) {
            console.error(`❌ Le projet de destination n'existe pas: ${targetPath}`);
            process.exit(1);
        }
        
        console.log(`📁 Projet de destination: ${targetPath}`);
        
        // Chercher le script d'installation
        let installScript = getInstallScriptPath();
        
        if (!installScript) {
            // Cloner le repository si nécessaire
            const repoPath = await cloneRepositoryIfNeeded();
            installScript = path.join(repoPath, 'install-ide-agent.js');
        }
        
        if (!fs.existsSync(installScript)) {
            console.error('❌ Script d\'installation non trouvé');
            process.exit(1);
        }
        
        console.log(`🔧 Exécution du script d'installation: ${installScript}`);
        
        // Exécuter le script d'installation avec le projet de destination
        execSync(`node "${installScript}" "${targetPath}"`, {
            stdio: 'inherit',
            cwd: path.dirname(installScript)
        });
        
        console.log('\n🎉 Installation terminée avec succès !');
        console.log(`📁 L'agent est maintenant installé dans: ${path.join(targetPath, '.vscode/frontend-expert-agent')}`);
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'installation:', error.message);
        process.exit(1);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    main();
}

module.exports = { main, getInstallScriptPath, cloneRepositoryIfNeeded }; 