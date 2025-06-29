#!/usr/bin/env ts-node
import * as fs from 'fs-extra';
import * as path from 'path';
import { program } from 'commander';
import { JSDOM } from 'jsdom';

// Configuration CLI
program
    .option('--file <string>', 'Fichier à optimiser')
    .option('--objective <string>', 'Objectif à atteindre (ex. accessibility-score, viewport-meta)')
    .parse();

const { file, objective } = program.opts();
if (!file || !objective) {
    console.error('❌ Erreur : --file et --objective requis');
    process.exit(1);
}

// Fonction pour optimiser le contenu
async function enhanceCode(filePath: string, objectiveId: string) {
    try {
        let content = await fs.readFile(filePath, 'utf-8');
        let modified = false;

        if (objectiveId.startsWith('accessibility-score')) {
            const dom = new JSDOM(content);
            const doc = dom.window.document;

            // Ajout des attributs alt aux images
            doc.querySelectorAll('img:not([alt])').forEach(img => {
                const src = img.getAttribute('src') || 'image';
                img.setAttribute('alt', `Image: ${src.split('/').pop()?.split('.')[0] || 'description générique'}`);
                modified = true;
            });

            // Ajout de labels aux inputs
            doc.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
                const id = input.id || `input-${Math.random().toString(36).substring(2, 8)}`;
                if (!input.id) input.id = id;
                const label = doc.createElement('label');
                label.setAttribute('for', id);
                label.textContent = `Champ: ${input.type || 'saisie'}`;
                input.before(label);
                modified = true;
            });

            content = dom.serialize();
        }

        if (objectiveId.startsWith('viewport-meta')) {
            if (!content.includes('name="viewport"')) {
                content = content.replace(
                    /<head>/i,
                    '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
                );
                modified = true;
            }
        }

        if (objectiveId.startsWith('semantic-structure')) {
            const dom = new JSDOM(content);
            const doc = dom.window.document;
            const body = doc.querySelector('body');

            if (!doc.querySelector('main')) {
                const main = doc.createElement('main');
                Array.from(body.children).forEach(child => {
                    if (!['header', 'nav', 'footer', 'aside'].includes(child.tagName.toLowerCase())) {
                        main.appendChild(child);
                    }
                });
                body.appendChild(main);
                modified = true;
            }

            if (!doc.querySelector('header')) {
                const header = doc.createElement('header');
                header.innerHTML = '<!-- En-tête du site -->';
                body.prepend(header);
                modified = true;
            }

            content = dom.serialize();
        }

        if (objectiveId.startsWith('color-palette')) {
            if (filePath.endsWith('.css') || filePath.endsWith('.scss')) {
                content = `
/* Palette de couleurs optimisée */
:root {
  --primary: #0059FF;
  --secondary: #1F2A44;
  --accent: #10B981;
  --neutral: #F9FAFB;
  --text: #111827;
}
${content}`;
                modified = true;
            }
        }

        if (modified) {
            await fs.writeFile(filePath, content);
            console.log(`✅ Fichier optimisé : ${filePath}`);
        } else {
            console.log(`ℹ️ Aucune modification nécessaire pour ${filePath}`);
        }
    } catch (e) {
        console.error(`❌ Erreur lors de l’optimisation de ${filePath} : ${e.message}`);
        process.exit(1);
    }
}

// Exécution
(async () => {
    if (!fs.existsSync(file)) {
        console.error(`❌ Fichier introuvable : ${file}`);
        process.exit(1);
    }
    console.log(`🚀 Optimisation de ${file} pour l’objectif ${objective}`);
    await enhanceCode(file, objective);
})();