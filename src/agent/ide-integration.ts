#!/usr/bin/env ts-node
import * as fs from 'fs-extra';
import * as path from 'path';
import { FrontendChatAgent } from './chat-agent';

// Interface pour l'intégration IDE
export interface IDEIntegration {
    projectPath: string;
    agent: FrontendChatAgent;
    isActive: boolean;
}

// Configuration pour l'intégration IDE
export interface IDEConfig {
    autoAnalyze: boolean;
    autoBackup: boolean;
    suggestionsEnabled: boolean;
    codeGenerationEnabled: boolean;
}

// Gestionnaire principal pour l'intégration IDE
export class IDEIntegrationManager {
    private integrations: Map<string, IDEIntegration> = new Map();
    private config: IDEConfig;

    constructor(config: IDEConfig = {
        autoAnalyze: true,
        autoBackup: true,
        suggestionsEnabled: true,
        codeGenerationEnabled: true
    }) {
        this.config = config;
    }

    // Initialiser l'agent pour un projet
    async initializeProject(projectPath: string): Promise<IDEIntegration> {
        const resolvedPath = path.resolve(projectPath);
        
        if (this.integrations.has(resolvedPath)) {
            return this.integrations.get(resolvedPath)!;
        }

        // Vérifier que le projet existe
        if (!await fs.pathExists(resolvedPath)) {
            throw new Error(`Le projet n'existe pas: ${resolvedPath}`);
        }

        // Créer l'agent
        const agent = new FrontendChatAgent(resolvedPath);
        
        // Créer l'intégration
        const integration: IDEIntegration = {
            projectPath: resolvedPath,
            agent,
            isActive: true
        };

        this.integrations.set(resolvedPath, integration);

        // Analyse automatique si activée
        if (this.config.autoAnalyze) {
            await this.performInitialAnalysis(integration);
        }

        return integration;
    }

    // Traiter un message du chat IDE
    async processChatMessage(projectPath: string, message: string): Promise<string> {
        const integration = await this.getOrCreateIntegration(projectPath);
        
        if (!integration.isActive) {
            return "❌ L'agent n'est pas actif pour ce projet. Utilisez 'reactiver' pour le réactiver.";
        }

        try {
            // Sauvegarde automatique si activée
            if (this.config.autoBackup) {
                await this.createBackup(integration);
            }

            // Traiter le message
            const response = await integration.agent.processMessage(message);
            
            return response;
        } catch (error) {
            console.error('Erreur lors du traitement du message:', error);
            return `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
        }
    }

    // Obtenir l'historique de conversation
    getConversationHistory(projectPath: string): any[] {
        const integration = this.integrations.get(path.resolve(projectPath));
        if (!integration) {
            return [];
        }
        return integration.agent.getConversationHistory();
    }

    // Obtenir le contexte du projet
    getProjectContext(projectPath: string): any {
        const integration = this.integrations.get(path.resolve(projectPath));
        if (!integration) {
            return null;
        }
        return integration.agent.getCurrentContext();
    }

    // Désactiver l'agent pour un projet
    deactivateProject(projectPath: string): boolean {
        const integration = this.integrations.get(path.resolve(projectPath));
        if (integration) {
            integration.isActive = false;
            return true;
        }
        return false;
    }

    // Réactiver l'agent pour un projet
    reactivateProject(projectPath: string): boolean {
        const integration = this.integrations.get(path.resolve(projectPath));
        if (integration) {
            integration.isActive = true;
            return true;
        }
        return false;
    }

    // Supprimer l'intégration d'un projet
    removeProject(projectPath: string): boolean {
        return this.integrations.delete(path.resolve(projectPath));
    }

    // Lister tous les projets actifs
    getActiveProjects(): string[] {
        const activeProjects: string[] = [];
        for (const [projectPath, integration] of this.integrations) {
            if (integration.isActive) {
                activeProjects.push(projectPath);
            }
        }
        return activeProjects;
    }

    // Obtenir des suggestions automatiques
    async getSuggestions(projectPath: string): Promise<string[]> {
        const integration = await this.getOrCreateIntegration(projectPath);
        
        if (!this.config.suggestionsEnabled) {
            return [];
        }

        const context = integration.agent.getCurrentContext();
        const suggestions: string[] = [];

        // Suggestions basées sur le contexte
        if (context.framework === 'Unknown') {
            suggestions.push('🔍 "Analyse mon projet pour détecter le framework"');
        }

        if (context.issues.length > 0) {
            suggestions.push('🚨 "Détecte et corrige les problèmes"');
        }

        if (context.recommendations.length > 0) {
            suggestions.push('🚀 "Propose des améliorations"');
        }

        // Suggestions générales
        suggestions.push('📚 "Mets à jour la documentation"');
        suggestions.push('🧹 "Nettoie les fichiers inutiles"');
        suggestions.push('🎨 "Crée un nouveau composant"');

        return suggestions;
    }

    // Générer du code automatiquement
    async generateCode(projectPath: string, request: string): Promise<string> {
        const integration = await this.getOrCreateIntegration(projectPath);
        
        if (!this.config.codeGenerationEnabled) {
            return "❌ La génération de code automatique est désactivée.";
        }

        try {
            // Analyser la demande de génération
            const codeRequest = this.analyzeCodeRequest(request);
            
            // Générer le code approprié
            const generatedCode = await this.generateCodeBasedOnRequest(codeRequest, integration);
            
            return `💻 **Code Généré**

\`\`\`${codeRequest.language}
${generatedCode}
\`\`\`

Voulez-vous que je l'implémente dans votre projet ?`;
        } catch (error) {
            return `❌ Erreur lors de la génération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
        }
    }

    // Méthodes privées
    private async getOrCreateIntegration(projectPath: string): Promise<IDEIntegration> {
        const resolvedPath = path.resolve(projectPath);
        let integration = this.integrations.get(resolvedPath);
        
        if (!integration) {
            integration = await this.initializeProject(projectPath);
        }
        
        return integration;
    }

    private async performInitialAnalysis(integration: IDEIntegration): Promise<void> {
        try {
            // Analyse initiale silencieuse
            await integration.agent.processMessage('analyse silencieuse');
        } catch (error) {
            console.warn('Erreur lors de l\'analyse initiale:', error);
        }
    }

    private async createBackup(integration: IDEIntegration): Promise<void> {
        try {
            const backupDir = path.join(integration.projectPath, '.vscode', 'frontend-agent-backups');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(backupDir, timestamp);
            
            await fs.ensureDir(backupPath);
            
            // Sauvegarder les fichiers importants
            const importantFiles = [
                'package.json',
                'tsconfig.json',
                'vite.config.ts',
                'nuxt.config.ts',
                'next.config.js',
                'angular.json'
            ];

            for (const file of importantFiles) {
                const filePath = path.join(integration.projectPath, file);
                if (await fs.pathExists(filePath)) {
                    await fs.copy(filePath, path.join(backupPath, file));
                }
            }
        } catch (error) {
            console.warn('Erreur lors de la sauvegarde:', error);
        }
    }

    private analyzeCodeRequest(request: string): {
        type: 'component' | 'page' | 'style' | 'test' | 'config';
        language: string;
        framework: string;
        details: Record<string, any>;
    } {
        const lowerRequest = request.toLowerCase();
        
        // Détecter le type de code
        if (lowerRequest.includes('composant') || lowerRequest.includes('component')) {
            return {
                type: 'component',
                language: 'vue',
                framework: 'vue',
                details: { name: this.extractComponentName(request) }
            };
        }
        
        if (lowerRequest.includes('page') || lowerRequest.includes('route')) {
            return {
                type: 'page',
                language: 'vue',
                framework: 'vue',
                details: { name: this.extractPageName(request) }
            };
        }
        
        if (lowerRequest.includes('style') || lowerRequest.includes('css') || lowerRequest.includes('scss')) {
            return {
                type: 'style',
                language: 'scss',
                framework: 'generic',
                details: { type: 'module' }
            };
        }
        
        if (lowerRequest.includes('test') || lowerRequest.includes('spec')) {
            return {
                type: 'test',
                language: 'typescript',
                framework: 'jest',
                details: { type: 'unit' }
            };
        }
        
        // Par défaut
        return {
            type: 'component',
            language: 'vue',
            framework: 'vue',
            details: {}
        };
    }

    private extractComponentName(request: string): string {
        // Logique simple pour extraire le nom du composant
        const words = request.split(' ');
        for (let i = 0; i < words.length; i++) {
            if (words[i].toLowerCase().includes('composant') || words[i].toLowerCase().includes('component')) {
                if (i + 1 < words.length) {
                    return words[i + 1].charAt(0).toUpperCase() + words[i + 1].slice(1);
                }
            }
        }
        return 'NewComponent';
    }

    private extractPageName(request: string): string {
        // Logique simple pour extraire le nom de la page
        const words = request.split(' ');
        for (let i = 0; i < words.length; i++) {
            if (words[i].toLowerCase().includes('page')) {
                if (i + 1 < words.length) {
                    return words[i + 1].charAt(0).toUpperCase() + words[i + 1].slice(1);
                }
            }
        }
        return 'NewPage';
    }

    private async generateCodeBasedOnRequest(codeRequest: any, integration: IDEIntegration): Promise<string> {
        const context = integration.agent.getCurrentContext();
        
        switch (codeRequest.type) {
            case 'component':
                return this.generateComponentCode(codeRequest, context);
            
            case 'page':
                return this.generatePageCode(codeRequest, context);
            
            case 'style':
                return this.generateStyleCode(codeRequest, context);
            
            case 'test':
                return this.generateTestCode(codeRequest, context);
            
            default:
                return '// Code à générer';
        }
    }

    private generateComponentCode(codeRequest: any, context: any): string {
        const componentName = codeRequest.details.name || 'NewComponent';
        
        switch (context.framework.toLowerCase()) {
            case 'vue.js':
            case 'nuxt.js':
                return `<template>
  <div class="${componentName.toLowerCase()}">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '${componentName}',
  description: 'Description du composant'
})
</script>

<style scoped lang="scss">
.${componentName.toLowerCase()} {
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--color-background);
  
  h2 {
    color: var(--color-primary);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--color-text);
    line-height: 1.6;
  }
}
</style>`;
            
            case 'react':
            case 'next.js':
                return `import React from 'react'

interface ${componentName}Props {
  title?: string
  description?: string
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${componentName}',
  description = 'Description du composant'
}) => {
  return (
    <div className="${componentName.toLowerCase()}">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}

export default ${componentName}`;
            
            case 'angular':
                return `import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-${componentName.toLowerCase()}',
  template: \`
    <div class="${componentName.toLowerCase()}">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
  \`,
  styles: [\`
    .${componentName.toLowerCase()} {
      padding: 1rem;
      border-radius: 0.5rem;
      background: var(--color-background);
    }
    
    h2 {
      color: var(--color-primary);
      margin-bottom: 0.5rem;
    }
    
    p {
      color: var(--color-text);
      line-height: 1.6;
    }
  \`]
})
export class ${componentName}Component {
  @Input() title = '${componentName}'
  @Input() description = 'Description du composant'
}`;
            
            default:
                return `// Composant ${componentName} - Framework non reconnu`;
        }
    }

    private generatePageCode(codeRequest: any, context: any): string {
        const pageName = codeRequest.details.name || 'NewPage';
        
        switch (context.framework.toLowerCase()) {
            case 'vue.js':
            case 'nuxt.js':
                return `<template>
  <div class="page-${pageName.toLowerCase()}">
    <header>
      <h1>{{ pageTitle }}</h1>
    </header>
    
    <main>
      <section>
        <h2>Contenu de la page</h2>
        <p>Bienvenue sur la page ${pageName}</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const pageTitle = '${pageName}'

// Meta tags pour le SEO
useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: 'Description de la page ${pageName}' }
  ]
})
</script>

<style scoped lang="scss">
.page-${pageName.toLowerCase()} {
  min-height: 100vh;
  
  header {
    background: var(--color-primary);
    color: white;
    padding: 2rem;
    text-align: center;
  }
  
  main {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
</style>`;
            
            default:
                return `// Page ${pageName} - Framework non reconnu`;
        }
    }

    private generateStyleCode(codeRequest: any, context: any): string {
        return `/* Variables CSS modernes */
:root {
  /* Couleurs */
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --color-accent: #f59e0b;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  
  /* Typography */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  
  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  
  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Reset et base */
* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-background);
}

/* Utilitaires */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: none;
  
  &--primary {
    background: var(--color-primary);
    color: white;
    
    &:hover {
      background: color-mix(in srgb, var(--color-primary) 90%, black);
    }
  }
  
  &--secondary {
    background: var(--color-secondary);
    color: white;
    
    &:hover {
      background: color-mix(in srgb, var(--color-secondary) 90%, black);
    }
  }
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-2);
  }
}`;
    }

    private generateTestCode(codeRequest: any, context: any): string {
        const componentName = codeRequest.details.name || 'Component';
        
        return `import { describe, it, expect } from '@jest/globals'
import { mount } from '@vue/test-utils'
import ${componentName} from './${componentName}.vue'

describe('${componentName}', () => {
  it('renders correctly', () => {
    const wrapper = mount(${componentName})
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the title prop', () => {
    const title = 'Test Title'
    const wrapper = mount(${componentName}, {
      props: { title }
    })
    expect(wrapper.text()).toContain(title)
  })

  it('has correct CSS classes', () => {
    const wrapper = mount(${componentName})
    expect(wrapper.classes()).toContain('${componentName.toLowerCase()}')
  })
})`;
    }
}

// Instance globale pour l'intégration IDE
export const ideManager = new IDEIntegrationManager();

// Fonction d'export pour l'utilisation dans l'IDE
export async function processIDECommand(command: string, projectPath: string, message?: string): Promise<string> {
    switch (command) {
        case 'chat':
            if (!message) return '❌ Message requis pour la commande chat';
            return await ideManager.processChatMessage(projectPath, message);
        
        case 'analyze':
            return await ideManager.processChatMessage(projectPath, 'analyse mon projet');
        
        case 'suggestions':
            const suggestions = await ideManager.getSuggestions(projectPath);
            return suggestions.length > 0 ? suggestions.join('\n') : 'Aucune suggestion disponible';
        
        case 'history':
            const history = ideManager.getConversationHistory(projectPath);
            return history.length > 0 ? JSON.stringify(history, null, 2) : 'Aucun historique disponible';
        
        case 'context':
            const context = ideManager.getProjectContext(projectPath);
            return context ? JSON.stringify(context, null, 2) : 'Contexte non disponible';
        
        default:
            return `❌ Commande inconnue: ${command}. Commandes disponibles: chat, analyze, suggestions, history, context`;
    }
} 