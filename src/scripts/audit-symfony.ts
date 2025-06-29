#!/usr/bin/env ts-node
import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import { program } from 'commander';
import { JSDOM } from 'jsdom';

program
    .option('--project <string>', 'Dossier du projet Symfony', process.cwd())
    .option('--output <string>', 'Dossier de sortie', './tmp')
    .parse();

const { project, output } = program.opts();

interface AuditResult {
    files: string[];
    issues: { file: string; issue: string }[];
    recommendations: string[];
}

async function auditSymfonyProject(projectDir: string): Promise<AuditResult> {
    try {
        await fs.ensureDir(output);
        const twigFiles = glob.sync('templates/**/*.twig', { cwd: projectDir });
        const cssFiles = glob.sync('assets/**/*.{scss,css}', { cwd: projectDir });
        const jsFiles = glob.sync('assets/**/*.{js,ts}', { cwd: projectDir });
        const files = [...twigFiles, ...cssFiles, ...jsFiles];
        const issues: { file: string; issue: string }[] = [];
        const recommendations: string[] = [];

        // Audit des fichiers Twig
        for (const file of twigFiles) {
            const content = fs.readFileSync(path.join(projectDir, file), 'utf-8');
            const dom = new JSDOM(content, { contentType: 'text/html' });
            const doc = dom.window.document;

            // Vérification des images sans alt
            doc.querySelectorAll('img:not([alt])').forEach(img => {
                issues.push({ file, issue: `Image sans attribut alt : ${img.src || 'sans src'}` });
            });

            // Vérification des titres
            const h1Count = doc.querySelectorAll('h1').length;
            if (h1Count !== 1) {
                issues.push({ file, issue: `Nombre de H1 incorrect : ${h1Count}` });
            }

            // Vérification de la sémantique
            if (!doc.querySelector('main')) {
                issues.push({ file, issue: 'Balise <main> manquante' });
                recommendations.push(`Ajouter une balise <main> dans ${file} pour une meilleure sémantique`);
            }
        }

        // Audit des fichiers CSS
        for (const file of cssFiles) {
            const content = fs.readFileSync(path.join(projectDir, file), 'utf-8');
            if (!content.includes(':root') && !content.includes('--')) {
                issues.push({ file, issue: 'Aucune variable CSS détectée' });
                recommendations.push(`Ajouter des variables CSS (design tokens) dans ${file}`);
            }
        }

        // Audit des fichiers JS
        for (const file of jsFiles) {
            const content = fs.readFileSync(path.join(projectDir, file), 'utf-8');
            if (content.includes('var ') && !content.includes('const ') && !content.includes('let ')) {
                issues.push({ file, issue: 'Utilisation de var au lieu de const/let' });
                recommendations.push(`Moderniser ${file} avec const/let pour une meilleure gestion des variables`);
            }
        }

        // Recommandations générales
        if (issues.length > 0) {
            recommendations.push('Exécuter `ts-node src/scripts/enhance-code.ts` pour corriger automatiquement les problèmes d’accessibilité');
            recommendations.push('Utiliser `prompts/symfony-audit.md` dans Trae ou Cursor pour des optimisations manuelles');
        }

        const result: AuditResult = { files, issues, recommendations };
        await fs.writeJson(path.join(output, 'symfony-audit.json'), result, { spaces: 2 });
        console.log(`✅ Audit Symfony terminé. Résultats dans ${path.join(output, 'symfony-audit.json')}`);
        return result;
    } catch (e) {
        console.error(`❌ Erreurs lors de l’audit Symfony : ${e.message}`);
        process.exit(1);
    }
}

(async () => {
    console.log(`🔍 Audit du projet Symfony dans ${project}`);
    const result = await auditSymfonyProject(project);
    console.log(`📊 Résultats : ${result.issues.length} problèmes détectés, ${result.recommendations.length} recommandations`);
})();