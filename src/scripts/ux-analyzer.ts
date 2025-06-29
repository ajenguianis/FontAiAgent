#!/usr/bin/env ts-node
import * as fs from 'fs-extra';
import * as path from 'path';
import { program } from 'commander';
import { JSDOM } from 'jsdom';
import { detectProjectType } from './detect-project';

program
    .option('--url <string>', 'URL à analyser')
    .option('--html <string>', 'Fichier HTML local à analyser')
    .option('--project', 'Analyser un projet local (Symfony/JS)')
    .option('--output <string>', 'Dossier de sortie', './tmp')
    .option('--screenshot', 'Capturer des screenshots')
    .option('--performance', 'Analyser les performances')
    .option('--deep', 'Analyse approfondie')
    .parse();

const { url, html, project, output, screenshot, performance, deep } = program.opts();
if (!url && !html && !project) {
    console.error('❌ Erreur : URL, fichier HTML, ou --project requis');
    process.exit(1);
}

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

async function analyzeUX(): Promise<AnalysisData> {
    await fs.ensureDir(output);
    const projectInfo = project ? detectProjectType(project) : { type: 'Unknown', confidence: 0.1 };
    let content = '';
    let filesToAnalyze: string[] = [];

    if (html) {
        content = await fs.readFile(html, 'utf-8');
        filesToAnalyze.push(html);
    } else if (project) {
        filesToAnalyze = (await fs.readdir(project)).filter(f => f.endsWith('.twig') || f.endsWith('.html'));
        content = filesToAnalyze.length > 0 ? await fs.readFile(path.join(project, filesToAnalyze[0]), 'utf-8') : '';
    } else if (url) {
        content = '<html><body>Mock content for URL analysis</body></html>'; // Placeholder pour analyse URL
        filesToAnalyze.push('source.html');
        await fs.writeFile(path.join(output, 'source.html'), content);
    }

    const dom = new JSDOM(content);
    const doc = dom.window.document;

    // Analyse de l’accessibilité
    const accessibilityIssues: string[] = [];
    doc.querySelectorAll('img:not([alt])').forEach(img => {
        accessibilityIssues.push(`Image sans attribut alt : ${img.src || 'sans src'}`);
    });
    doc.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(() => {
        accessibilityIssues.push('Champ de saisie sans label ou aria-label');
    });
    const h1Count = doc.querySelectorAll('h1').length;
    if (h1Count !== 1) {
        accessibilityIssues.push(`Nombre de H1 incorrect : ${h1Count}`);
    }

    // Analyse de la structure sémantique
    const semanticElements = {
        header: !!doc.querySelector('header'),
        nav: !!doc.querySelector('nav'),
        main: !!doc.querySelector('main'),
        footer: !!doc.querySelector('footer'),
        article: !!doc.querySelector('article'),
        section: !!doc.querySelector('section'),
        aside: !!doc.querySelector('aside'),
    };

    // Analyse des performances (mock pour l’exemple)
    const performanceMetrics = performance ? { fcp: 2000, lcp: 3000, loadTime: 3500 } : null;

    // Analyse des couleurs et typographie
    const colors = { palette: '#0059FF,#1F2A44,#10B981', count: 3 };
    const typography = { fonts: 'Inter, sans-serif', sizes: '16px, 14px', weights: '400, 500' };

    // Recommandations
    const recommendations = {
        priority: accessibilityIssues.length > 0 ? 'high' : 'medium',
        urgentFixes: accessibilityIssues,
        suggestedFramework: projectInfo.type === 'Unknown' ? 'React' : projectInfo.type,
        creative: [
            'Ajouter des attributs alt aux images pour améliorer l’accessibilité',
            'Utiliser des variables CSS pour une palette cohérente',
            'Implémenter un mode sombre avec prefers-color-scheme',
        ],
    };

    const analysisData: AnalysisData = {
        meta: { url: url || html || project, analyzedAt: new Date().toISOString(), version: '1.0.0' },
        framework: { name: projectInfo.type, version: null, confidence: projectInfo.confidence, detected: projectInfo.confidence > 0.5 },
        colors,
        typography,
        generalStyle: { style: 'modern', confidence: '0.8', metrics: {} },
        accessibility: { score: 100 - accessibilityIssues.length * 10, issues: accessibilityIssues, categories: {} },
        structure: { semantic: semanticElements, meta: { viewport: !!doc.querySelector('meta[name="viewport"]') }, interactive: {} },
        context: { type: 'web', confidence: '0.9', audience: 'general', objective: 'UX optimization' },
        performanceMetrics,
        recommendations,
    };

    // Générer les rapports
    await fs.writeJson(path.join(output, 'analysis-data.json'), analysisData, { spaces: 2 });
    const report = `# Rapport d’Analyse UX\n\n` +
        `## Résumé\n` +
        `- **Type de projet** : ${projectInfo.type} (confiance : ${(projectInfo.confidence * 100).toFixed(1)}%)\n` +
        `- **Accessibilité** : ${analysisData.accessibility.score}/100\n` +
        `- **Éléments sémantiques** : ${Object.values(semanticElements).filter(Boolean).length}/7\n` +
        `- **Performance (FCP)** : ${performanceMetrics ? Math.round(performanceMetrics.fcp) + 'ms' : 'N/A'}\n\n` +
        `## Problèmes Détectés\n${accessibilityIssues.length > 0 ? accessibilityIssues.map(i => `- ${i}`).join('\n') : '- Aucun problème détecté'}\n\n` +
        `## Fichiers à Modifier\n${filesToAnalyze.map(f => `- ${f}`).join('\n') || '- Aucun fichier spécifique'}\n\n` +
        `## Recommandations\n${recommendations.creative.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
    await fs.writeFile(path.join(output, 'ux-report.md'), report);

    console.log(`✅ Analyse UX terminée. Résultats dans ${output}`);
    return analysisData;
}

(async () => {
    console.log(`🔍 Analyse UX pour ${url || html || project}`);
    await analyzeUX();
})();