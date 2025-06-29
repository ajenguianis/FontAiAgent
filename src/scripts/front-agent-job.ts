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
    .option('--output <string>', 'Dossier de sortie', './.vscode')
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
    source: 'analysis' | 'user';
}

// Type pour les préférences utilisateur
interface UserPreferences {
    priorityArea: 'accessibility' | 'performance' | 'semantics' | 'design' | 'none';
    specificFiles: string[];
    designTrends: string[];
}

// Demander des clarifications à l’utilisateur
async function askClarifyingQuestions(): Promise<UserPreferences> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const ask = (question: string, defaultAnswer: string): Promise<string> =>
        new Promise(resolve => {
            rl.question(question, answer => resolve(answer.trim() || defaultAnswer));
        });

    const priorityArea = await ask(
        '🔍 Quelle zone prioriser ? (accessibility/performance/semantics/design) [default: accessibility]: ',
        'accessibility'
    );
    const specificFilesInput = await ask(
        '📂 Quels fichiers ou dossiers spécifiques optimiser ? (ex. /templates/home.twig, laisser vide pour auto-détection): ',
        ''
    );
    const designTrendsInput = await ask(
        '🎨 Appliquer des tendances de design spécifiques ? (ex. dark mode, glassmorphism, none) [default: none]: ',
        'none'
    );

    rl.close();

    return {
        priorityArea: ['accessibility', 'performance', 'semantics', 'design'].includes(priorityArea)
            ? priorityArea as UserPreferences['priorityArea']
            : 'none',
        specificFiles: specificFilesInput ? specificFilesInput.split(',').map(f => f.trim()).filter(f => f) : [],
        designTrends: designTrendsInput === 'none' ? [] : designTrendsInput.split(',').map(t => t.trim()).filter(t => t),
    };
}

// Sauvegarde d’un fichier avant modification
async function backupFile(file: string) {
    const backupDir = path.join('.vscode', '.agent_backups', new Date().toISOString().slice(0, 13).replace(/[-T]/g, ''));
    await fs.ensureDir(backupDir);
    const backupPath = path.join(backupDir, path.basename(file));
    await fs.copy(file, backupPath);
    console.log(`💾 [PDCA: Do] Sauvegarde créée : ${backupPath}`);
}

// Exécution de l’analyse UX (Étape Plan du PDCA)
async function runAnalysis(iteration: number): Promise<AnalysisData> {
    const outputDir = path.join(output, `iteration-${iteration}`);
    await fs.ensureDir(outputDir);
    const uxAnalyzerPath = path.join(__dirname, 'ux-analyzer.ts');
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
        execSync(`ts-node ${uxAnalyzerPath} ${args}`, { stdio: 'inherit' });
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
function setSmartObjectives(analysis: AnalysisData, iteration: number, preferences: UserPreferences): Objective[] {
    const outputDir = path.join(output, `iteration-${iteration}`);
    const filesToBackup = preferences.specificFiles.length > 0
        ? preferences.specificFiles.filter(f => fs.existsSync(f))
        : fs.existsSync(path.join(outputDir, 'source.html'))
            ? [path.join(outputDir, 'source.html')]
            : analysis.recommendations.urgentFixes.length > 0
                ? fs.readFileSync(path.join(outputDir, 'ux-report.md'), 'utf-8')
                    .match(/Fichiers à modifier\n((?:- .+\n)+)/)?.[1]
                    ?.split('\n')
                    .filter(Boolean)
                    .map((line: string) => line.replace('- ', '').trim()) || []
                : [];

    const objectives: Objective[] = [];

    // Prioriser en fonction des préférences utilisateur
    const priorityWeights = {
        accessibility: preferences.priorityArea === 'accessibility' ? 1 : 2,
        performance: preferences.priorityArea === 'performance' ? 1 : 2,
        semantics: preferences.priorityArea === 'semantics' ? 1 : 2,
        design: preferences.priorityArea === 'design' ? 1 : 2,
    };

    // Objectifs basés sur l’analyse
    if (analysis.accessibility.score < 90) {
        objectives.push({
            id: `accessibility-score-${uuidv4()}`,
            description: 'Atteindre un score d’accessibilité de 90/100 (WCAG 2.1 AA)',
            metric: 'accessibility.score',
            target: 90,
            current: analysis.accessibility.score,
            priority: priorityWeights.accessibility,
            file: filesToBackup.find(f => f.endsWith('.twig') || f.endsWith('.html')),
            recommendation: analysis.recommendations.creative.find(r => r.includes('attributs alt') || r.includes('contrastes')),
            source: 'analysis',
        });
    }
    if (analysis.performanceMetrics && analysis.performanceMetrics.fcp > 1800) {
        objectives.push({
            id: `performance-fcp-${uuidv4()}`,
            description: 'Réduire le First Contentful Paint à moins de 1.8s',
            metric: 'performanceMetrics.fcp',
            target: 1800,
            current: analysis.performanceMetrics.fcp,
            priority: priorityWeights.performance,
            file: filesToBackup.find(f => f.endsWith('.css') || f.endsWith('.scss') || f.endsWith('.js') || f.endsWith('.ts')),
            recommendation: analysis.recommendations.creative.find(r => r.includes('CSS critiques') || r.includes('lazy-loading')),
            source: 'analysis',
        });
    }
    if (Object.values(analysis.structure.semantic).filter(Boolean).length < 6) {
        objectives.push({
            id: `semantic-structure-${uuidv4()}`,
            description: 'Ajouter les éléments sémantiques manquants (header, nav, main, etc.)',
            metric: 'structure.semantic',
            target: 6,
            current: Object.values(analysis.structure.semantic).filter(Boolean).length,
            priority: priorityWeights.semantics,
            file: filesToBackup.find(f => f.endsWith('.twig') || f.endsWith('.html')),
            recommendation: analysis.recommendations.creative.find(r => r.includes('HTML5 sémantique')),
            source: 'analysis',
        });
    }
    if (!analysis.structure.meta.viewport) {
        objectives.push({
            id: `viewport-meta-${uuidv4()}`,
            description: 'Ajouter une balise meta viewport responsive',
            metric: 'structure.meta.viewport',
            target: true,
            current: false,
            priority: priorityWeights.semantics,
            file: filesToBackup.find(f => f.endsWith('.twig') || f.endsWith('.html')),
            recommendation: 'Ajouter <meta name="viewport" content="width=device-width, initial-scale=1.0"> dans <head>',
            source: 'analysis',
        });
    }
    if (analysis.colors.count > 10) {
        objectives.push({
            id: `color-palette-${uuidv4()}`,
            description: 'Réduire la palette de couleurs à 5-7 couleurs principales',
            metric: 'colors.count',
            target: 7,
            current: analysis.colors.count,
            priority: priorityWeights.design,
            file: filesToBackup.find(f => f.endsWith('.css') || f.endsWith('.scss')),
            recommendation: analysis.recommendations.creative.find(r => r.includes('design tokens')),
            source: 'analysis',
        });
    }

    // Objectifs basés sur les préférences utilisateur (design trends)
    if (preferences.designTrends.length > 0) {
        preferences.designTrends.forEach(trend => {
            if (trend.toLowerCase() === 'dark mode') {
                objectives.push({
                    id: `dark-mode-${uuidv4()}`,
                    description: 'Implémenter un mode sombre avec prefers-color-scheme',
                    metric: 'generalStyle.darkMode',
                    target: true,
                    current: analysis.generalStyle.metrics.darkMode || false,
                    priority: priorityWeights.design,
                    file: filesToBackup.find(f => f.endsWith('.css') || f.endsWith('.scss')),
                    recommendation: 'Ajouter @media (prefers-color-scheme: dark) avec des styles adaptés',
                    source: 'user',
                });
            } else if (trend.toLowerCase() === 'glassmorphism') {
                objectives.push({
                    id: `glassmorphism-${uuidv4()}`,
                    description: 'Appliquer un style glassmorphism (fond flou, transparence)',
                    metric: 'generalStyle.glassmorphism',
                    target: true,
                    current: analysis.generalStyle.metrics.glassmorphism || false,
                    priority: priorityWeights.design,
                    file: filesToBackup.find(f => f.endsWith('.css') || f.endsWith('.scss')),
                    recommendation: 'Utiliser backdrop-filter: blur et background: rgba pour les éléments',
                    source: 'user',
                });
            }
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

// Collecter le feedback utilisateur après chaque itération
async function collectFeedback(iteration: number): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const ask = (question: string): Promise<string> =>
        new Promise(resolve => {
            rl.question(question, answer => resolve(answer.trim()));
        });

    const satisfaction = await ask(`[PDCA: Check] Êtes-vous satisfait des changements de l’itération ${iteration} ? (y/N) : `);
    const comments = await ask(`[PDCA: Check] Commentaires ou suggestions pour améliorer l’itération suivante ? : `);
    rl.close();

    const feedback = {
        iteration,
        satisfied: satisfaction.toLowerCase() === 'y',
        comments,
        timestamp: new Date().toISOString(),
    };
    const outputDir = path.join(output, `iteration-${iteration}`);
    await fs.writeJson(path.join(outputDir, 'feedback.json'), feedback, { spaces: 2 });
    console.log(`📝 [PDCA: Check] Feedback enregistré : ${path.join(outputDir, 'feedback.json')}`);
    return comments;
}

// Application des corrections avec sauvegarde automatique (Étape Do du PDCA)
async function actOnObjectives(objectives: Objective[], iteration: number) {
    const outputDir = path.join(output, `iteration-${iteration}`);
    for (const obj of objectives) {
        console.log(`🔧 [PDCA: Do] Application de l’objectif : ${obj.description} (${obj.source})`);
        if (obj.file && fs.existsSync(obj.file)) {
            // Sauvegarde automatique avant modification
            await backupFile(obj.file);
            try {
                if (['accessibility-score', 'semantic-structure', 'viewport-meta'].includes(obj.id.split('-')[0])) {
                    console.log(`🚀 Application automatique pour ${obj.id} sur ${obj.file}`);
                    execSync(`ts-node ${path.join(__dirname, 'enhance-code.ts')} --file ${obj.file} --objective ${obj.id}`, {
                        stdio: 'inherit',
                    });
                } else if (obj.id.startsWith('dark-mode') || obj.id.startsWith('glassmorphism')) {
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
async function generateFinalReport(analyses: AnalysisData[], iterations: number, feedbacks: string[]) {
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

## Feedback Utilisateur
${feedbacks.map((f, i) => `- Itération ${i + 1}: ${f || 'Aucun commentaire'}`).join('\n')}

## Prochaines Étapes
- Consultez les sorties dans .vscode/iteration-${iterations}/
- Appliquez les corrections manuelles avec prompts/ux-audit.md dans Trae, Cursor, ou VS Code
- Relancez avec la tâche "FontAiAgent: Optimize Project" depuis votre IDE
`;
    const finalReportPath = path.join(output, 'final-report.md');
    await fs.writeFile(finalReportPath, finalReport);
    console.log(`📄 [PDCA: Act] Rapport final généré : ${finalReportPath}`);
}

// Fonction principale
(async () => {
    console.log(`🚀 Démarrage du job FontAiAgent pour un projet ${detectProjectType().type || 'web'}`);
    await fs.ensureDir(output);

    // Collecter les préférences utilisateur
    const preferences = await askClarifyingQuestions();
    console.log(`🛠️ Préférences utilisateur :`, preferences);

    let iteration = 1;
    const analyses: AnalysisData[] = [];
    const feedbacks: string[] = [];

    while (iteration <= parseInt(maxIterations)) {
        console.log(`🔄 Itération ${iteration}`);
        // Étape Plan : Analyse initiale et définition des objectifs
        const analysis = await runAnalysis(iteration);
        analyses.push(analysis);
        const objectives = setSmartObjectives(analysis, iteration, preferences);
        if (objectives.length === 0) {
            console.log('🎉 [PDCA: Check] Tous les objectifs atteints !');
            break;
        }
        // Étape Do : Application des corrections avec sauvegarde automatique
        await actOnObjectives(objectives, iteration);
        // Étape Check : Vérification des progrès
        const newAnalysis = await runAnalysis(iteration);
        analyses.push(newAnalysis);
        const allMet = await checkProgress(newAnalysis, objectives, iteration);
        // Collecter le feedback utilisateur
        const feedback = await collectFeedback(iteration);
        feedbacks.push(feedback);
        // Ajuster les préférences en fonction du feedback
        if (feedback.toLowerCase().includes('performance')) {
            preferences.priorityArea = 'performance';
        } else if (feedback.toLowerCase().includes('accessibility')) {
            preferences.priorityArea = 'accessibility';
        } else if (feedback.toLowerCase().includes('semantics') || feedback.toLowerCase().includes('semantic')) {
            preferences.priorityArea = 'semantics';
        } else if (feedback.toLowerCase().includes('design') || feedback.toLowerCase().includes('dark mode') || feedback.toLowerCase().includes('glassmorphism')) {
            preferences.priorityArea = 'design';
            if (feedback.toLowerCase().includes('dark mode') && !preferences.designTrends.includes('dark mode')) {
                preferences.designTrends.push('dark mode');
            }
            if (feedback.toLowerCase().includes('glassmorphism') && !preferences.designTrends.includes('glassmorphism')) {
                preferences.designTrends.push('glassmorphism');
            }
        }
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
    await generateFinalReport(analyses, iteration, feedbacks);
    console.log('✅ Job FontAiAgent terminé !');
})();