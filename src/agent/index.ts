#!/usr/bin/env ts-node
import * as fs from 'fs-extra';
import * as path from 'path';
import { FrontendExpertAgent } from './front-agent';

// Fonction principale simplifiée
async function main() {
    const args = process.argv.slice(2);
    const projectPath = args[0] || '.';
    const mode = args[1] || 'analyze';
    
    try {
        const resolvedPath = path.resolve(projectPath);
        
        if (!await fs.pathExists(resolvedPath)) {
            console.error('❌ Le chemin du projet n\'existe pas:', resolvedPath);
            process.exit(1);
        }
        
        const agent = new FrontendExpertAgent(resolvedPath);
        
        switch (mode) {
            case 'analyze':
            case 'start':
                await agent.start();
                break;
            case 'audit':
                await agent.audit();
                break;
            case 'enhance':
                await agent.enhance();
                break;
            default:
                console.log('🎨 Expert Frontend Agent v3.0.0');
                console.log('Votre assistant IA pour créer des expériences frontend exceptionnelles');
                console.log('Spécialisé Vue.js/Nuxt, Angular, React/Next avec expertise design de première classe\n');
                console.log('📋 Modes disponibles:');
                console.log('  analyze  - Analyse complète avec questions guidées (défaut)');
                console.log('  audit    - Audit rapide du projet');
                console.log('  enhance  - Mode amélioration avec focus sur le code');
                console.log('');
                console.log('🚀 Usage:');
                console.log('  npm start                    # Analyse complète du projet actuel');
                console.log('  npm start [chemin]           # Analyser un projet spécifique');
                console.log('  npm start . audit            # Audit rapide');
                console.log('  npm start . enhance          # Mode amélioration');
                console.log('');
                console.log('💡 L\'agent vous posera des questions pour personnaliser ses recommandations !');
                break;
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    main();
}