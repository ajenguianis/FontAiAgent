#!/usr/bin/env ts-node
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { program } from 'commander';
import { detectProjectType } from './detect-project';
import { v4 as uuidv4 } from 'uuid';
import * as readline from 'readline';

// Configuration CLI
program
    .option('--url <string>', 'URL à analyser')
    .option('--html <string>', 'Fichier HTML local à analyser')
    .option('--project', 'Analyser un projet local (Symfony/JS)')
    .option('--output <string>', 'Dossier de sortie', './tmp')
    .option('--screenshot', 'Capturer des screenshots')
    .option('--performance', 'Analyser les performances')
    .option('--deep', 'Analyse approfondie')
    .option('--stop', 'Arrêter après une itération')
    .option('--confirm', 'Demander une confirmation manuelle après chaque itération')
    .option('--max-iterations <number>', 'Nombre maximum d’itérations', '5')
    .parse();

const { url, html, project, output, screenshot, performance, deep, stop, confirm, maxIterations } = program.opts();
if (!url && !html && !project) {
    console.error('❌ Erreur : URL, fichier HTML, ou --project requis');
    process.exit(1);
}

// Types pour l’analyse
interface AnalysisData {
    meta: { url: string; analyzedAt: string; version: string };
    framework: { name: string; version: string | null; confidence: number; detected: boolean };
    colors: { palette: string; count: number };
    typography: { fonts: string; sizes: string; weights: string };
    generalStyle: { style: string; confidence: string; metrics: any };
    accessibility: { score: number; issues: string[]; categories: any };
    structure: { semantic: any; meta: any; interactive: any };
    context: { type: string; confidence: string; audience: string; objective: string };
    performanceMetrics: { fcp: number; lcp: number; loadTime: number } | null;
    recommendations: { priority: string; urgentFixes: string[]; suggestedFramework: string; creative: string[] };
}

// Type pour les objectifs SMART
interface Objective {
    id: string;
    description: string;
    metric: string;
    target: number | boolean | string;
    current: number | boolean | string;
    priority: number;
    file?: string;
    recommendation?: string;
}

// Exécution de l’analyse UX (Étape Plan du PDCA)
async function runAnalysis(iteration: number): Promise<AnalysisData> {
    const outputDir = path.join(output, `iteration-${iteration}`);
    await fs.ensureDir(outputDir);
    const uxAnalyzerPath = path.join(__dirname, 'ux-analyzer.js');
    if (!fs.existsSync(uxAnalyzerPath)) {
        console.error(`❌ Erreur : Fichier ${uxAnalyzerPath} introuvable`);
        process.exit(1);
    }
    const args = [
        url ? `--url ${url}` : '',
        html ? `--html ${html}` : '',
        project ? '--project' : '',
        `--output ${outputDir}`,
        screenshot ? '--screenshot' : '',
        performance ? '--performance' : '',
        deep ? '--deep' : '',
    ].filter(Boolean).join(' ');
    console.log(`🔍 [PDCA: Plan] Exécution de l’analyse UX (itération ${iteration})...`);
    try {
        execSync(`node ${uxAnalyzerPath} ${args}`, { stdio: 'inherit' });
        const analysisDataPath = path.join(outputDir, 'analysis-data.json');
        if (!fs.existsSync(analysisDataPath)) {
            console.error(`❌ Erreur : Résultat de l’analyse ${analysisDataPath} non généré`);
            process.exit(1);
        }
        const analysisData = await fs.readJson(analysisDataPath);
        return analysisData;
    } catch (e) {
        console.error(`❌ Erreur lors de l’analyse UX : ${e.message}`);
        process.exit(1);
    }
}

// Définition des objectifs SMART (Étape Plan du PDCA)
function setSmartObjectives(analysis: AnalysisData, iteration: number): Objective[] {
    const outputDir = path.join(output, `iteration-${iteration}`);
    const filesToBackup = fs.existsSync(path.join(outputDir, 'source.html'))
        ? [path.join(outputDir, 'source.html')]
        : analysis.recommendations.urgentFixes.length > 0
            ? fs.readFileSync(path.join(outputDir, 'ux-report.md'), 'utf-8')
                .match(/Fichiers à modifier\n((?:- .+\n)+)/)?.[1]
                ?.split('\n')
                .filter(Boolean)
                .map((line: string) => line.replace('- ', '').trim()) || []
            : [];

    const objectives: Objective[] = [];
    if (analysis.accessibility.score < 90) {
        objectives.push({
            id: `accessibility-score-${uuidv4()}`,
            description: 'Atteindre un score d’accessibilité de 90/100 (WCAG 2.1 AA)',
            metric: 'accessibility.score',
            target: 90,
            current: analysis.accessibility.score,
            priority: 1,
            file: filesToBackup.find(f => f.endsWith('.twig') || f.endsWith('.html')),
            recommendation: analysis.recommendations.creative.find(r => r.includes('attributs alt') || r.includes('contrastes')),
        });
    }
    if (analysis.performanceMetrics && analysis.performanceMetrics.fcp > 1800) {
        objectives.push({
            id: `performance-fcp-${uuidv4()}`,
            description: 'Réduire le First Contentful Paint à moins de 1.8s',
            metric: 'performanceMetrics.fcp',
            target: 1800,
            current: analysis.performanceMetrics.fcp,
            priority: 2,
            file: filesToBackup.find(f => f.endsWith('.css') || f.endsWith('.scss') || f.endsWith('.js') || f.endsWith('.ts')),
            recommendation: analysis.recommendations.creative.find(r => r.includes('CSS critiques') || r.includes('lazy-loading')),
        });
    }
    if (Object.values(analysis.structure.semantic).filter(Boolean).length < 6) {
        objectives.push({
            id: `semantic-structure-${uuidv4()}`,
            description: 'Ajouter les éléments sémantiques manquants (header, nav, main, etc.)',
            metric: 'structure.semantic',
            target: 6,
            current: Object.values(analysis.structure.semantic).filter(Boolean).length,
            priority: 3,
            file: filesToBackup.find(f => f.endsWith('.twig') || f.endsWith('.html')),
            recommendation: analysis.recommendations.creative.find(r => r.includes('HTML5 sémantique')),
        });
    }
    if (!analysis.structure.meta.viewport) {
        objectives.push({
            id: `viewport-meta-${uuidv4()}`,
            description: 'Ajouter une balise meta viewport responsive',
            metric: 'structure.meta.viewport',
            target: true,
            current: false,
            priority: 4,
            file: filesToBackup.find(f => f.endsWith('.twig') || f.endsWith('.html')),
            recommendation: 'Ajouter <meta name="viewport" content="width=device-width, initial-scale=1.0"> dans <head>',
        });
    }
    if (analysis.colors.count > 10) {
        objectives.push({
            id: `color-palette-${uuidv4()}`,
            description: 'Réduire la palette de couleurs à 5-7 couleurs principales',
            metric: 'colors.count',
            target: 7,
            current: analysis.colors.count,
            priority: 5,
            file: filesToBackup.find(f => f.endsWith('.css') || f.endsWith('.scss')),
            recommendation: analysis.recommendations.creative.find(r => r.includes('design tokens')),
        });
    }
    console.log(`🎯 [PDCA: Plan] Objectifs SMART définis (itération ${iteration}) :`, objectives);
    fs.writeJsonSync(path.join(outputDir, 'objectives.json'), objectives, { spaces: 2 });
    return objectives;
}

// Confirmation manuelle (Étape Check du PDCA)
async function confirmIteration(iteration: number): Promise<boolean> {
    if (!confirm) return true;
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => {
        rl.question(`[PDCA: Check] Continuer avec l’itération ${iteration + 1} ? (y/N) : `, answer => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}

// Application des corrections (Étape Do du PDCA)
async function actOnObjectives(objectives: Objective[], iteration: number) {
    const outputDir = path.join(output, `iteration-${iteration}`);
    for (const obj of objectives) {
        console.log(`🔧 [PDCA: Do] Application de l’objectif : ${obj.description}`);
        if (obj.file && fs.existsSync(obj.file)) {
            console.log(`📥 Sauvegarde de ${obj.file}`);
            try {
                execSync(`bash ${path.join(__dirname, 'backup.sh')} ${obj.file}`, { stdio: 'inherit' });
                if (['accessibility-score', 'semantic-structure', 'viewport-meta'].includes(obj.id.split('-')[0])) {
                    console.log(`🚀 Application automatique pour ${obj.id} sur ${obj.file}`);
                    execSync(`ts-node ${path.join(__dirname, 'enhance-code.ts')} --file ${obj.file} --objective ${obj.id}`, {
                        stdio: 'inherit',
                    });
                } else {
                    console.log(`📝 Action manuelle requise pour ${obj.id}. Utilisez prompts/ux-audit.md avec ${obj.recommendation || 'recommandations générales'}.`);
                }
            } catch (e) {
                console.warn(`⚠️ Erreur lors de l’application automatique pour ${obj.id} : ${e.message}`);
            }
        } else {
            console.log(`📝 Action manuelle requise pour ${obj.id}. Aucun fichier spécifique identifié.`);
        }
    }
}

// Vérification des progrès (Étape Check du PDCA)
async function checkProgress(analysis: AnalysisData, objectives: Objective[], iteration: number): Promise<boolean> {
    const outputDir = path.join(output, `iteration-${iteration}`);
    const achieved: string[] = [];
    const remaining: Objective[] = [];
    for (const obj of objectives) {
        const [category, metric] = obj.metric.split('.');
        const currentValue = metric.split('.').reduce((o, k) => o?.[k], analysis);
        const achievedObjective = typeof obj.target === 'number'
            ? currentValue <= obj.target
            : currentValue === obj.target;
        if (achievedObjective) {
            achieved.push(obj.id);
        } else {
            remaining.push({ ...obj, current: currentValue });
        }
    }
    const checkResults = { achieved, remaining, allMet: remaining.length === 0 };
    console.log(`✅ [PDCA: Check] Résultats de vérification (itération ${iteration}) :`, checkResults);
    fs.writeJsonSync(path.join(outputDir, 'check-results.json'), checkResults, { spaces: 2 });
    return checkResults.allMet;
}

// Génération du rapport final (Étape Act du PDCA)
async function generateFinalReport(analyses: AnalysisData[], iterations: number) {
    const finalReport = `# 📋 Rapport Final FontAiAgent

## Résumé
- **Total des itérations** : ${iterations}
- **Métriques initiales** (Itération 1) :
  - Accessibilité : ${analyses[0].accessibility.score}/100
  - Structure sémantique : ${Object.values(analyses[0].structure.semantic).filter(Boolean).length}/7
  - Performance (FCP) : ${analyses[0].performanceMetrics ? Math.round(analyses[0].performanceMetrics.fcp) + 'ms' : 'N/A'}
- **Métriques finales** (Itération ${iterations}) :
  - Accessibilité : ${analyses[iterations - 1].accessibility.score}/100
  - Structure sémantique : ${Object.values(analyses[iterations - 1].structure.semantic).filter(Boolean).length}/7
  - Performance (FCP) : ${analyses[iterations - 1].performanceMetrics ? Math.round(analyses[iterations - 1].performanceMetrics.fcp) + 'ms' : 'N/A'}

## Réalisations
${analyses[iterations - 1].recommendations.urgentFixes.length === 0
            ? '- Tous les problèmes urgents résolus.'
            : `- Problèmes restants :\n${analyses[iterations - 1].recommendations.urgentFixes.map((issue: string) => `  - ${issue}`).join('\n')}`}

## Recommandations Créatives
${analyses[iterations - 1].recommendations.creative.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Prochaines Étapes
- Consultez les sorties dans tmp/iteration-${iterations}/
- Appliquez les corrections manuelles avec prompts/ux-audit.md dans Trae, Cursor, ou VS Code
- Relancez avec \`ts-node src/scripts/front-agent-job.ts\` si nécessaire
`;
    const finalReportPath = path.join(output, 'final-report.md');
    await fs.writeFile(finalReportPath, finalReport);
    console.log(`📄 [PDCA: Act] Rapport final généré : ${finalReportPath}`);
}

// Fonction principale
(async () => {
    console.log(`🚀 Démarrage du job FontAiAgent pour un projet ${detectProjectType().type || 'web'}`);
    await fs.ensureDir(output);
    let iteration = 1;
    const analyses: AnalysisData[] = [];

    while (iteration <= parseInt(maxIterations)) {
        console.log(`🔄 Itération ${iteration}`);
        // Étape Plan : Analyse initiale et définition des objectifs
        const analysis = await runAnalysis(iteration);
        analyses.push(analysis);
        const objectives = setSmartObjectives(analysis, iteration);
        if (objectives.length === 0) {
            console.log('🎉 [PDCA: Check] Tous les objectifs atteints !');
            break;
        }
        // Étape Do : Application des corrections
        await actOnObjectives(objectives, iteration);
        // Étape Check : Vérification des progrès
        const newAnalysis = await runAnalysis(iteration);
        analyses.push(newAnalysis);
        const allMet = await checkProgress(newAnalysis, objectives, iteration);
        if (allMet || stop) {
            console.log(`🛑 [PDCA: Act] Arrêt : ${allMet ? 'Tous les objectifs atteints' : 'Option --stop spécifiée'}`);
            break;
        }
        // Étape Check : Confirmation manuelle si --confirm est activé
        if (!(await confirmIteration(iteration))) {
            console.log('🛑 [PDCA: Act] Arrêt par l’utilisateur');
            break;
        }
        iteration++;
    }

    // Étape Act : Génération du rapport final
    await generateFinalReport(analyses, iteration);
    console.log('✅ Job FontAiAgent terminé !');
})();