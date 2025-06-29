#!/usr/bin/env ts-node
import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import { program } from 'commander';
import { execSync } from 'child_process';

program
    .option('--project <string>', 'Dossier du projet', process.cwd())
    .option('--output <string>', 'Dossier de sortie', './tmp')
    .parse();

const { project, output } = program.opts();

interface ChangeTracking {
    timestamp: string;
    files: string[];
}

async function trackChanges(projectDir: string): Promise<ChangeTracking> {
    try {
        await fs.ensureDir(output);
        const files = glob.sync('**/*.{twig,html,css,scss,js,ts,jsx,tsx}', {
            cwd: projectDir,
            ignore: ['**/node_modules/**', '.agent_backups/**', 'tmp/**'],
        });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
        const trackedFiles: string[] = [];

        for (const file of files) {
            const filePath = path.join(projectDir, file);
            execSync(`bash ${path.join(__dirname, 'backup.sh')} ${filePath}`, { stdio: 'inherit' });
            trackedFiles.push(filePath);
        }

        const result: ChangeTracking = { timestamp, files: trackedFiles };
        await fs.writeJson(path.join(output, `track-changes-${timestamp}.json`), result, { spaces: 2 });
        console.log(`✅ Suivi des modifications terminé. Résultats dans ${path.join(output, `track-changes-${timestamp}.json`)}`);
        return result;
    } catch (e) {
        console.error(`❌ Erreur lors du suivi des modifications : ${e.message}`);
        process.exit(1);
    }
}

(async () => {
    console.log(`🔍 Suivi des modifications dans ${project}`);
    const result = await trackChanges(project);
    console.log(`📊 ${result.files.length} fichiers suivis`);
})();