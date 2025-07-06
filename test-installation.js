#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

console.log('🧪 Test d\'installation de l\'Expert Frontend Agent...');

// Fonction pour tester l'installation
async function testInstallation() {
    const args = process.argv.slice(2);
    const testProject = args[0] || path.join(process.cwd(), 'test-project');
    
    console.log(`📁 Projet de test: ${testProject}`);
    
    try {
        // Créer un projet de test
        await createTestProject(testProject);
        
        // Installer l'agent
        await installAgent(testProject);
        
        // Vérifier l'installation
        await verifyInstallation(testProject);
        
        console.log('\n✅ Test d\'installation réussi !');
        console.log(`📁 Projet de test créé: ${testProject}`);
        console.log('🧹 Pour nettoyer: rm -rf test-project');
        
    } catch (error) {
        console.error('❌ Test d\'installation échoué:', error.message);
        process.exit(1);
    }
}

// Créer un projet de test
async function createTestProject(projectPath) {
    console.log('📝 Création du projet de test...');
    
    await fs.ensureDir(projectPath);
    
    // Créer package.json
    const packageJson = {
        name: "test-frontend-project",
        version: "1.0.0",
        description: "Projet de test pour l'Expert Frontend Agent",
        main: "index.js",
        scripts: {
            "dev": "echo 'Development server'",
            "build": "echo 'Build project'",
            "test": "echo 'Run tests'"
        },
        dependencies: {},
        devDependencies: {}
    };
    
    await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
    
    // Créer un fichier HTML de base
    const indexHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Frontend Project</title>
</head>
<body>
    <div id="app">
        <h1>Test Frontend Project</h1>
        <p>Ce projet est utilisé pour tester l'installation de l'Expert Frontend Agent.</p>
    </div>
</body>
</html>`;
    
    await fs.writeFile(path.join(projectPath, 'index.html'), indexHtml);
    
    // Créer un dossier src
    await fs.ensureDir(path.join(projectPath, 'src'));
    
    console.log('✅ Projet de test créé');
}

// Installer l'agent
async function installAgent(projectPath) {
    console.log('🔧 Installation de l\'agent...');
    
    const { execSync } = require('child_process');
    
    try {
        // Utiliser le script d'installation local
        const installScript = path.join(__dirname, 'install-ide-agent.js');
        execSync(`node "${installScript}" "${projectPath}"`, {
            stdio: 'inherit',
            cwd: __dirname
        });
    } catch (error) {
        throw new Error(`Erreur lors de l'installation: ${error.message}`);
    }
}

// Vérifier l'installation
async function verifyInstallation(projectPath) {
    console.log('🔍 Vérification de l\'installation...');
    
    const requiredFiles = [
        '.vscode/frontend-expert-agent/package.json',
        '.vscode/frontend-expert-agent/src/',
        '.vscode/tasks.json',
        '.vscode/settings.json'
    ];
    
    const missingFiles = [];
    
    for (const file of requiredFiles) {
        const filePath = path.join(projectPath, file);
        if (!await fs.pathExists(filePath)) {
            missingFiles.push(file);
        }
    }
    
    if (missingFiles.length > 0) {
        throw new Error(`Fichiers manquants: ${missingFiles.join(', ')}`);
    }
    
    console.log('✅ Tous les fichiers requis sont présents');
    
    // Vérifier la configuration
    const tasksPath = path.join(projectPath, '.vscode/tasks.json');
    const tasks = await fs.readJson(tasksPath);
    
    if (!tasks.tasks || tasks.tasks.length === 0) {
        throw new Error('Configuration tasks.json invalide');
    }
    
    console.log('✅ Configuration IDE valide');
}

// Exécuter le test
if (require.main === module) {
    testInstallation();
}

module.exports = { testInstallation, createTestProject, installAgent, verifyInstallation }; 