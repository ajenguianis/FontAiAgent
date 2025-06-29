#!/usr/bin/env ts-node
import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import { program } from 'commander';

program
    .option('--project <string>', 'Dossier du projet JS/TS', process.cwd())
    .option('--output <string>', 'Dossier de sortie', './tmp')
    .parse();

const { project, output } = program.opts();

interface AuditResult {
    files: string[];
    issues: { file: string; issue: string }[];
    recommendations: string[];
}

async function auditJsProject(projectDir: string): Promise<AuditResult> {
    try {
        await fs.ensureDir(output);
        const files = glob.sync('src/**/*.{js,ts,jsx,tsx,css,scss}', { cwd: projectDir, ignore: '**/node_modules/**' });
        const issues: { file: string; issue: string }[] = [];
        const recommendations: string[] = [];

        for (const file of files) {
            const content = fs.readFileSync(path.join(projectDir, file), 'utf-8');

            // Vérifications JS/TS
            if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
                if (content.includes('var ') && !content.includes('const ') && !content.includes('let ')) {
                    issues.push({ file, issue: 'Utilisation de var au lieu de const/let' });
                    recommendations.push(`Moderniser ${file} avec const/let pour une meilleure gestion des variables`);
                }
                if (!content.includes('useState') && !content.includes('useEffect') && (file.endsWith('.jsx') || file.endsWith('.tsx'))) {
                    issues.push({ file, issue: 'Composant React potentiellement non-fonctionnel (manque useState/useEffect)' });
                    recommendations.push(`Vérifier la structure du composant dans ${file}`);
                }
            }

            // Vérifications CSS
            if (file.endsWith('.css') || file.endsWith('.scss')) {
                if (!content.includes(':root') && !content.includes('--')) {
                    issues.push({ file, issue: 'Aucune variable CSS détectée' });
                    recommendations.push(`Ajouter des variables CSS (design tokens) dans ${file}`);
                }
            }
        }

        // Recommandations générales
        if (issues.length > 0) {
            recommendations.push('Exécuter `ts-node src/scripts/enhance-code.ts` pour moderniser les déclarations de variables');
            recommendations.push('Utiliser `prompts/js-audit.md` dans Trae ou Cursor pour des optimisations manuelles');
        }

        const result: AuditResult = { files, issues, recommendations };
        await fs.writeJson(path.join(output, 'js-audit.json'), result, { spaces: 2 });
        console.log(`✅ Audit JS/TS terminé. Résultats dans ${path.join(output, 'js-audit.json')}`);
        return result;
    } catch (e) {
        console.error(`❌ Erreurs lors de l’audit JS/TS : ${e.message}`);
        process.exit(1);
    }
}

(async () => {
    console.log(`🔍 Audit du projet JS/TS dans ${project}`);
    const result = await auditJsProject(project);
    console.log(`📊 Résultats : ${result.issues.length} problèmes détectés, ${result.recommendations.length} recommandations`);
})();