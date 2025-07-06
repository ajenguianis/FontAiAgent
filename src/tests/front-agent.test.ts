import { FrontendChatAgent } from '../agent/chat-agent';

describe('FrontendChatAgent', () => {
    let agent: FrontendChatAgent;
    const mockProjectPath = '/test/project';

    beforeEach(() => {
        agent = new FrontendChatAgent(mockProjectPath);
    });

    describe('processMessage', () => {
        it('should handle analyze request', async () => {
            const response = await agent.processMessage('Analyse mon projet');
            
            expect(response).toContain('🔍 **Analyse du Projet**');
        });

        it('should handle detect issues request', async () => {
            const response = await agent.processMessage('Détecte les problèmes');
            
            expect(response).toContain('🚨 **Problèmes Détectés**');
        });

        it('should handle improve request', async () => {
            const response = await agent.processMessage('Améliore le code');
            
            expect(response).toContain('🚀 **Améliorations Proposées**');
        });

        it('should handle create request', async () => {
            const response = await agent.processMessage('Crée un composant');
            
            expect(response).toContain('🎨 **Création de Composant**');
        });

        it('should handle cleanup request', async () => {
            const response = await agent.processMessage('Nettoie les fichiers');
            
            expect(response).toContain('🧹 **Nettoyage Proposé**');
        });

        it('should handle document request', async () => {
            const response = await agent.processMessage('Documente le projet');
            
            expect(response).toContain('📚 **Documentation**');
        });

        it('should handle general help', async () => {
            const response = await agent.processMessage('Bonjour');
            
            expect(response).toContain('🎨 **Expert Frontend Agent - Aide**');
        });
    });

    describe('conversation history', () => {
        it('should maintain conversation history', async () => {
            await agent.processMessage('Analyse mon projet');
            await agent.processMessage('Détecte les problèmes');
            
            const history = agent.getConversationHistory();
            
            expect(history).toHaveLength(4); // 2 user messages + 2 assistant responses
            expect(history[0].role).toBe('user');
            expect(history[1].role).toBe('assistant');
            expect(history[2].role).toBe('user');
            expect(history[3].role).toBe('assistant');
        });
    });

    describe('project context', () => {
        it('should provide project context', () => {
            const context = agent.getCurrentContext();
            
            expect(context).toBeDefined();
            expect(context.framework).toBeDefined();
            expect(context.structure).toBeDefined();
            expect(context.issues).toBeDefined();
            expect(context.recommendations).toBeDefined();
        });
    });
});