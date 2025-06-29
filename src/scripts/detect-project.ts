#!/usr/bin/env ts-node
import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';

export function detectProjectType(cwd: string = process.cwd()): { type: string; confidence: number } {
    try {
        // Recherche des fichiers indicateurs
        const symfonyIndicators = [
            'composer.json',
            'config/services.yaml',
            'templates/base.html.twig',
            'public/index.php',
        ];
        const reactIndicators = [
            'src/index.tsx',
            'src/index.js',
            'package.json',
            'public/index.html',
        ];
        const vueIndicators = [
            'src/main.ts',
            'src/App.vue',
            'package.json',
            'public/index.html',
        ];

        // Vérification Symfony
        let symfonyScore = 0;
        for (const file of symfonyIndicators) {
            if (fs.existsSync(path.join(cwd, file))) {
                symfonyScore += 0.25;
            }
        }
        if (fs.existsSync(path.join(cwd, 'composer.json'))) {
            const composer = fs.readJsonSync(path.join(cwd, 'composer.json'));
            if (composer.require?.['symfony/framework-bundle']) {
                symfonyScore += 0.5;
            }
        }

        // Vérification React
        let reactScore = 0;
        for (const file of reactIndicators) {
            if (fs.existsSync(path.join(cwd, file))) {
                reactScore += 0.25;
            }
        }
        if (fs.existsSync(path.join(cwd, 'package.json'))) {
            const pkg = fs.readJsonSync(path.join(cwd, 'package.json'));
            if (pkg.dependencies?.react || pkg.devDependencies?.react) {
                reactScore += 0.5;
            }
        }

        // Vérification Vue
        let vueScore = 0;
        for (const file of vueIndicators) {
            if (fs.existsSync(path.join(cwd, file))) {
                vueScore += 0.25;
            }
        }
        if (fs.existsSync(path.join(cwd, 'package.json'))) {
            const pkg = fs.readJsonSync(path.join(cwd, 'package.json'));
            if (pkg.dependencies?.vue || pkg.devDependencies?.vue) {
                vueScore += 0.5;
            }
        }

        // Déterminer le type avec la meilleure confiance
        const scores = [
            { type: 'Symfony', confidence: symfonyScore },
            { type: 'React', confidence: reactScore },
            { type: 'Vue', confidence: vueScore },
            { type: 'Unknown', confidence: 0.1 },
        ];
        const detected = scores.sort((a, b) => b.confidence - a.confidence)[0];

        console.log(`🔍 Projet détecté : ${detected.type} (confiance : ${(detected.confidence * 100).toFixed(1)}%)`);
        return detected;
    } catch (e) {
        console.warn(`⚠️ Erreur lors de la détection du projet : ${e.message}`);
        return { type: 'Unknown', confidence: 0.1 };
    }
}

// Exécution si appelé directement
if (require.main === module) {
    const result = detectProjectType();
    console.log(JSON.stringify(result, null, 2));
}