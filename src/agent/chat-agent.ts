#!/usr/bin/env ts-node
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Types pour l'agent conversationnel
interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: {
        action?: string;
        files?: string[];
        code?: string;
    };
}

interface ProjectContext {
    framework: string;
    version: string;
    features: string[];
    structure: {
        hasComponents: boolean;
        hasPages: boolean;
        hasStyles: boolean;
        hasTests: boolean;
    };
    issues: Issue[];
    recommendations: Recommendation[];
}

interface Issue {
    id: string;
    type: 'error' | 'warning' | 'suggestion';
    category: 'performance' | 'accessibility' | 'design' | 'code-quality' | 'seo';
    message: string;
    file?: string;
    line?: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    fix?: string;
}

interface Recommendation {
    id: string;
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    priority: number;
    code?: string;
    files?: string[];
    explanation?: string;
}

interface ActionPlan {
    id: string;
    title: string;
    steps: ActionStep[];
    estimatedTime: string;
    risk: 'low' | 'medium' | 'high';
}

interface ActionStep {
    id: string;
    description: string;
    action: 'create' | 'modify' | 'delete' | 'analyze';
    file?: string;
    code?: string;
    backup?: boolean;
}

// Agent conversationnel expert frontend
export class FrontendChatAgent {
    private projectPath: string;
    private context: ProjectContext;
    private conversation: ChatMessage[] = [];
    private currentAction?: ActionPlan;

    constructor(projectPath: string) {
        this.projectPath = projectPath;
        this.context = this.initializeContext();
    }

    // Point d'entrée principal pour le chat
    async processMessage(userMessage: string): Promise<string> {
        const messageId = uuidv4();
        
        // Ajouter le message utilisateur à la conversation
        this.conversation.push({
            id: messageId,
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        });

        // Analyser l'intention de l'utilisateur
        const intent = this.analyzeIntent(userMessage);
        
        // Générer la réponse appropriée
        const response = await this.generateResponse(intent, userMessage);
        
        // Ajouter la réponse à la conversation
        this.conversation.push({
            id: uuidv4(),
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        });

        return response;
    }

    private initializeContext(): ProjectContext {
        return {
            framework: 'Unknown',
            version: 'Unknown',
            features: [],
            structure: {
                hasComponents: false,
                hasPages: false,
                hasStyles: false,
                hasTests: false
            },
            issues: [],
            recommendations: []
        };
    }

    private analyzeIntent(message: string): {
        action: string;
        confidence: number;
        parameters: Record<string, any>;
    } {
        const lowerMessage = message.toLowerCase();
        
        // Analyse d'intention basée sur les mots-clés
        if (lowerMessage.includes('analyser') || lowerMessage.includes('analyse')) {
            return {
                action: 'analyze',
                confidence: 0.9,
                parameters: { scope: 'full' }
            };
        }
        
        if (lowerMessage.includes('détecter') || lowerMessage.includes('erreur') || lowerMessage.includes('problème')) {
            return {
                action: 'detect_issues',
                confidence: 0.8,
                parameters: { scope: 'issues' }
            };
        }
        
        if (lowerMessage.includes('améliorer') || lowerMessage.includes('optimiser') || lowerMessage.includes('corriger')) {
            return {
                action: 'improve',
                confidence: 0.85,
                parameters: { scope: 'improvements' }
            };
        }
        
        if (lowerMessage.includes('créer') || lowerMessage.includes('ajouter') || lowerMessage.includes('nouveau')) {
            return {
                action: 'create',
                confidence: 0.8,
                parameters: { scope: 'creation' }
            };
        }
        
        if (lowerMessage.includes('supprimer') || lowerMessage.includes('nettoyer') || lowerMessage.includes('inutile')) {
            return {
                action: 'cleanup',
                confidence: 0.8,
                parameters: { scope: 'cleanup' }
            };
        }
        
        if (lowerMessage.includes('documenter') || lowerMessage.includes('readme') || lowerMessage.includes('docs')) {
            return {
                action: 'document',
                confidence: 0.9,
                parameters: { scope: 'documentation' }
            };
        }
        
        // Intention par défaut : analyse générale
        return {
            action: 'general_help',
            confidence: 0.6,
            parameters: {}
        };
    }

    private async generateResponse(intent: any, originalMessage: string): Promise<string> {
        switch (intent.action) {
            case 'analyze':
                return await this.handleAnalyzeRequest(originalMessage);
            
            case 'detect_issues':
                return await this.handleDetectIssuesRequest(originalMessage);
            
            case 'improve':
                return await this.handleImproveRequest(originalMessage);
            
            case 'create':
                return await this.handleCreateRequest(originalMessage);
            
            case 'cleanup':
                return await this.handleCleanupRequest(originalMessage);
            
            case 'document':
                return await this.handleDocumentRequest(originalMessage);
            
            default:
                return this.handleGeneralHelp(originalMessage);
        }
    }

    private async handleAnalyzeRequest(_message: string): Promise<string> {
        // Analyser le projet si pas encore fait
        if (this.context.framework === 'Unknown') {
            await this.analyzeProject();
        }

        return `🔍 **Analyse du Projet**

🎯 **Framework détecté :** ${this.context.framework} ${this.context.version}
📁 **Structure :** ${this.getStructureSummary()}
🚀 **Fonctionnalités :** ${this.context.features.join(', ') || 'Aucune détectée'}

${this.context.issues.length > 0 ? `⚠️ **Problèmes détectés :** ${this.context.issues.length}` : '✅ Aucun problème critique détecté'}

${this.context.recommendations.length > 0 ? `💡 **Recommandations :** ${this.context.recommendations.length} disponibles` : ''}

Que souhaitez-vous que j'analyse plus en détail ? (performance, design, accessibilité, code quality, etc.)`;
    }

    private async handleDetectIssuesRequest(_message: string): Promise<string> {
        // Analyser le projet pour détecter les problèmes
        await this.analyzeProject();
        await this.detectIssues();

        if (this.context.issues.length === 0) {
            return `✅ **Aucun problème détecté !**

Votre projet semble bien structuré. Voulez-vous que je propose des améliorations pour aller plus loin ?`;
        }

        const criticalIssues = this.context.issues.filter(i => i.severity === 'critical');
        const highIssues = this.context.issues.filter(i => i.severity === 'high');
        const mediumIssues = this.context.issues.filter(i => i.severity === 'medium');

        return `🚨 **Problèmes Détectés**

${criticalIssues.length > 0 ? `🔴 **Critiques (${criticalIssues.length}) :**\n${criticalIssues.map(i => `- ${i.message}`).join('\n')}\n` : ''}
${highIssues.length > 0 ? `🟠 **Élevés (${highIssues.length}) :**\n${highIssues.map(i => `- ${i.message}`).join('\n')}\n` : ''}
${mediumIssues.length > 0 ? `🟡 **Moyens (${mediumIssues.length}) :**\n${mediumIssues.map(i => `- ${i.message}`).join('\n')}\n` : ''}

Voulez-vous que je propose des corrections automatiques pour ces problèmes ?`;
    }

    private async handleImproveRequest(_message: string): Promise<string> {
        await this.analyzeProject();
        await this.generateRecommendations();

        const highPriorityRecs = this.context.recommendations.filter(r => r.priority >= 8);
        const mediumPriorityRecs = this.context.recommendations.filter(r => r.priority >= 5 && r.priority < 8);

        return `🚀 **Améliorations Proposées**

${highPriorityRecs.length > 0 ? `🔥 **Priorité Haute (${highPriorityRecs.length}) :**\n${highPriorityRecs.map(r => `- **${r.title}** (Impact: ${r.impact}, Effort: ${r.effort})\n  ${r.description}`).join('\n\n')}\n\n` : ''}
${mediumPriorityRecs.length > 0 ? `⚡ **Priorité Moyenne (${mediumPriorityRecs.length}) :**\n${mediumPriorityRecs.map(r => `- **${r.title}** (Impact: ${r.impact}, Effort: ${r.effort})\n  ${r.description}`).join('\n\n')}\n\n` : ''}

Voulez-vous que j'implémente une de ces améliorations ? Dites-moi laquelle vous intéresse le plus !`;
    }

    private async handleCreateRequest(_message: string): Promise<string> {
        // Analyser ce que l'utilisateur veut créer
        const lowerMessage = _message.toLowerCase();
        
        if (lowerMessage.includes('composant') || lowerMessage.includes('component')) {
            return this.handleComponentCreation(_message);
        }
        
        if (lowerMessage.includes('page') || lowerMessage.includes('route')) {
            return this.handlePageCreation(_message);
        }
        
        if (lowerMessage.includes('style') || lowerMessage.includes('css') || lowerMessage.includes('scss')) {
            return this.handleStyleCreation(_message);
        }
        
        if (lowerMessage.includes('test') || lowerMessage.includes('spec')) {
            return this.handleTestCreation(_message);
        }
        
        return `🤔 **Création**

Que souhaitez-vous créer exactement ? Je peux vous aider à créer :
- **Composants** (Vue, React, Angular)
- **Pages/Routes** 
- **Styles** (CSS, SCSS, modules)
- **Tests** (unitaires, e2e)
- **Configuration** (build, lint, etc.)

Décrivez-moi ce que vous voulez créer et je vous guiderai !`;
    }

    private async handleCleanupRequest(_message: string): Promise<string> {
        const unusedFiles = await this.findUnusedFiles();
        
        if (unusedFiles.length === 0) {
            return `✅ **Aucun fichier inutile détecté !**

Votre projet semble bien organisé. Voulez-vous que je vérifie autre chose ?`;
        }

        return `🧹 **Nettoyage Proposé**

J'ai détecté ${unusedFiles.length} fichiers potentiellement inutiles :

${unusedFiles.map(file => `- \`${file}\``).join('\n')}

⚠️ **Attention :** Je recommande de vérifier chaque fichier avant suppression.

Voulez-vous que je :
1. **Analyse plus en détail** chaque fichier
2. **Propose une suppression sélective**
3. **Crée un plan de nettoyage** avec sauvegarde

Que préférez-vous ?`;
    }

    private async handleDocumentRequest(_message: string): Promise<string> {
        return `📚 **Documentation**

Je peux vous aider à :

1. **Mettre à jour le README.md** avec les informations actuelles du projet
2. **Créer une documentation technique** (API, composants, etc.)
3. **Générer des commentaires** dans le code
4. **Créer un guide de contribution**

Quel type de documentation souhaitez-vous ?`;
    }

    private handleGeneralHelp(_message: string): string {
        return `🎨 **Expert Frontend Agent - Aide**

Je suis votre assistant IA spécialisé en développement frontend. Voici ce que je peux faire :

🔍 **Analyser** votre projet (framework, structure, problèmes)
🚨 **Détecter** les erreurs et écarts par rapport aux bonnes pratiques
🚀 **Améliorer** le code avec des recommandations personnalisées
➕ **Créer** des composants, pages, styles, tests
🧹 **Nettoyer** les fichiers inutiles
📚 **Documenter** le projet

**Exemples de commandes :**
- "Analyse mon projet Vue.js"
- "Détecte les problèmes d'accessibilité"
- "Améliore les performances"
- "Crée un composant de navigation"
- "Nettoie les fichiers inutiles"

Que souhaitez-vous faire ?`;
    }

    private async analyzeProject(): Promise<void> {
        try {
            const files = await fs.readdir(this.projectPath);
            
            // Détecter le framework
            if (files.includes('package.json')) {
                const packageJson = await fs.readJson(path.join(this.projectPath, 'package.json'));
                
                if (packageJson.dependencies?.vue) {
                    this.context.framework = 'Vue.js';
                    this.context.version = packageJson.dependencies.vue;
                    
                    if (packageJson.dependencies?.nuxt) {
                        this.context.framework = 'Nuxt.js';
                        this.context.version = packageJson.dependencies.nuxt;
                    }
                } else if (packageJson.dependencies?.['@angular/core']) {
                    this.context.framework = 'Angular';
                    this.context.version = packageJson.dependencies['@angular/core'];
                } else if (packageJson.dependencies?.react) {
                    this.context.framework = 'React';
                    this.context.version = packageJson.dependencies.react;
                    
                    if (packageJson.dependencies?.next) {
                        this.context.framework = 'Next.js';
                        this.context.version = packageJson.dependencies.next;
                    }
                }
            }

            // Analyser la structure
            this.context.structure = {
                hasComponents: files.includes('src/components') || files.includes('components'),
                hasPages: files.includes('src/pages') || files.includes('pages'),
                hasStyles: files.includes('src/styles') || files.includes('styles') || files.includes('src/assets'),
                hasTests: files.includes('src/tests') || files.includes('tests') || files.includes('__tests__')
            };

            // Analyser les fonctionnalités
            this.context.features = await this.analyzeFeatures();
            
        } catch (error) {
            console.error('Erreur lors de l\'analyse du projet:', error);
        }
    }

    private async analyzeFeatures(): Promise<string[]> {
        const features: string[] = [];
        const files = await fs.readdir(this.projectPath);
        
        if (files.includes('package.json')) {
            const packageJson = await fs.readJson(path.join(this.projectPath, 'package.json'));
            
            if (packageJson.devDependencies?.typescript) features.push('TypeScript');
            if (packageJson.devDependencies?.eslint) features.push('ESLint');
            if (packageJson.devDependencies?.prettier) features.push('Prettier');
            if (packageJson.devDependencies?.vite) features.push('Vite');
            if (packageJson.devDependencies?.webpack) features.push('Webpack');
        }

        return features;
    }

    private async detectIssues(): Promise<void> {
        this.context.issues = [];
        
        // Détecter les problèmes courants
        const files = await fs.readdir(this.projectPath);
        
        // Vérifier la présence de fichiers essentiels
        if (!files.includes('package.json')) {
            this.context.issues.push({
                id: uuidv4(),
                type: 'error',
                category: 'code-quality',
                message: 'Fichier package.json manquant',
                severity: 'critical',
                fix: 'Créer un package.json avec les dépendances nécessaires'
            });
        }

        // Vérifier la structure du projet
        if (!this.context.structure.hasComponents && !this.context.structure.hasPages) {
            this.context.issues.push({
                id: uuidv4(),
                type: 'warning',
                category: 'code-quality',
                message: 'Structure de projet non standard détectée',
                severity: 'medium',
                fix: 'Créer les dossiers src/components et src/pages'
            });
        }

        // Vérifier les outils de développement
        if (!this.context.features.includes('ESLint')) {
            this.context.issues.push({
                id: uuidv4(),
                type: 'suggestion',
                category: 'code-quality',
                message: 'ESLint non configuré',
                severity: 'medium',
                fix: 'Installer et configurer ESLint'
            });
        }
    }

    private async generateRecommendations(): Promise<void> {
        this.context.recommendations = [];
        
        // Recommandations basées sur le framework
        switch (this.context.framework.toLowerCase()) {
            case 'vue.js':
            case 'nuxt.js':
                this.context.recommendations.push({
                    id: uuidv4(),
                    title: 'Migrer vers la Composition API',
                    description: 'Améliorer la réutilisabilité et la performance',
                    impact: 'high',
                    effort: 'medium',
                    priority: 9,
                    code: `// Exemple de composant optimisé
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)
</script>`
                });
                break;
        }

        // Recommandations générales
        if (!this.context.features.includes('TypeScript')) {
            this.context.recommendations.push({
                id: uuidv4(),
                title: 'Ajouter TypeScript',
                description: 'Améliorer la sécurité des types',
                impact: 'high',
                effort: 'medium',
                priority: 8
            });
        }
    }

    private async findUnusedFiles(): Promise<string[]> {
        const unusedFiles: string[] = [];
        const files = await fs.readdir(this.projectPath);
        
        // Logique de détection de fichiers inutiles
        const potentiallyUnused = [
            '.DS_Store',
            'Thumbs.db',
            '*.log',
            'node_modules',
            '.git'
        ];

        for (const file of files) {
            if (potentiallyUnused.some(pattern => file.includes(pattern.replace('*', '')))) {
                unusedFiles.push(file);
            }
        }

        return unusedFiles;
    }

    private getStructureSummary(): string {
        const parts = [];
        if (this.context.structure.hasComponents) parts.push('Composants');
        if (this.context.structure.hasPages) parts.push('Pages');
        if (this.context.structure.hasStyles) parts.push('Styles');
        if (this.context.structure.hasTests) parts.push('Tests');
        
        return parts.length > 0 ? parts.join(', ') : 'Structure non standard';
    }

    private handleComponentCreation(_message: string): string {
        return `🎨 **Création de Composant**

Je vais vous aider à créer un composant ${this.context.framework}.

Pour bien vous guider, j'ai besoin de quelques informations :

1. **Nom du composant** (ex: NavigationBar, UserCard)
2. **Type de composant** (UI, Layout, Page, etc.)
3. **Fonctionnalités** (props, events, slots)
4. **Style** (CSS, SCSS, CSS-in-JS)

Pouvez-vous me décrire le composant que vous voulez créer ?`;
    }

    private handlePageCreation(_message: string): string {
        return `📄 **Création de Page**

Je vais vous aider à créer une page pour ${this.context.framework}.

Dites-moi :
1. **Nom de la page** (ex: Home, About, Contact)
2. **Route** (ex: /, /about, /contact)
3. **Contenu** (layout, composants, données)
4. **SEO** (meta tags, title)

Que souhaitez-vous créer ?`;
    }

    private handleStyleCreation(_message: string): string {
        return `🎨 **Création de Styles**

Je vais vous aider à créer des styles pour ${this.context.framework}.

Options disponibles :
1. **CSS Modules** - Styles encapsulés
2. **SCSS/Sass** - Préprocesseur CSS
3. **Styled Components** - CSS-in-JS
4. **Utility Classes** - Approche utility-first

Quel type de style préférez-vous ?`;
    }

    private handleTestCreation(_message: string): string {
        return `🧪 **Création de Tests**

Je vais vous aider à créer des tests pour ${this.context.framework}.

Types de tests :
1. **Tests unitaires** - Composants individuels
2. **Tests d'intégration** - Interactions entre composants
3. **Tests e2e** - Flux utilisateur complets
4. **Tests de régression** - Vérification des fonctionnalités

Quel type de test souhaitez-vous créer ?`;
    }

    // Méthodes pour l'implémentation automatique
    async implementRecommendation(recommendationId: string): Promise<string> {
        const recommendation = this.context.recommendations.find(r => r.id === recommendationId);
        
        if (!recommendation) {
            return '❌ Recommandation non trouvée';
        }

        // Créer un plan d'action
        this.currentAction = {
            id: uuidv4(),
            title: `Implémentation: ${recommendation.title}`,
            steps: this.generateActionSteps(recommendation),
            estimatedTime: '15-30 minutes',
            risk: 'low'
        };

        return `🚀 **Plan d'Implémentation**

**${recommendation.title}**

${this.currentAction.steps.map((step, index) => `${index + 1}. ${step.description}`).join('\n')}

⏱️ **Temps estimé :** ${this.currentAction.estimatedTime}
⚠️ **Risque :** ${this.currentAction.risk}

Voulez-vous que je procède à l'implémentation ? (oui/non)`;
    }

    private generateActionSteps(recommendation: Recommendation): ActionStep[] {
        const steps: ActionStep[] = [];
        
        // Étapes génériques
        steps.push({
            id: uuidv4(),
            description: 'Analyser le code existant',
            action: 'analyze',
            backup: true
        });

        if (recommendation.files && recommendation.files[0]) {
            const step: ActionStep = {
                id: uuidv4(),
                description: `Modifier ${recommendation.files.join(', ')}`,
                action: 'modify',
                file: recommendation.files[0]
            };
            if (recommendation.code) step.code = recommendation.code;
            steps.push(step);
        } else {
            const step: ActionStep = {
                id: uuidv4(),
                description: 'Modifier les fichiers recommandés',
                action: 'modify'
            };
            if (recommendation.code) step.code = recommendation.code;
            steps.push(step);
        }

        steps.push({
            id: uuidv4(),
            description: 'Tester les modifications',
            action: 'analyze'
        });

        return steps;
    }

    // Méthode pour obtenir l'historique de conversation
    getConversationHistory(): ChatMessage[] {
        return this.conversation;
    }

    // Méthode pour obtenir le contexte actuel
    getCurrentContext(): ProjectContext {
        return this.context;
    }
} 