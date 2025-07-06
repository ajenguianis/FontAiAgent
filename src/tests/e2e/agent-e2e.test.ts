import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('Expert Frontend Agent E2E', () => {
  const testProjectPath = path.join(global.testDir, 'e2e-test');

  beforeEach(async () => {
    await fs.ensureDir(testProjectPath);
    
    // Créer un projet de test complet
    await fs.writeJson(path.join(testProjectPath, 'package.json'), {
      name: 'e2e-test-project',
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      }
    });

    await fs.writeFile(path.join(testProjectPath, 'index.html'), `
      <html>
        <head></head>
        <body>
          <img src="test.jpg">
          <h1>Title 1</h1>
          <h1>Title 2</h1>
        </body>
      </html>
    `);

    await fs.writeFile(path.join(testProjectPath, 'styles.css'), `
      body { color: black; }
    `);
  });

  afterEach(async () => {
    await fs.remove(testProjectPath);
  });

  it('should analyze a complete project', () => {
    const result = execSync(
      `ts-node src/agent/index.ts analyze --project ${testProjectPath}`,
      { cwd: process.cwd(), encoding: 'utf-8' }
    );

    expect(result).toContain('Expert Frontend Agent');
    expect(result).toContain('Analyse terminée');
  });

  it('should detect project type', () => {
    const result = execSync(
      `ts-node src/agent/index.ts detect ${testProjectPath}`,
      { cwd: process.cwd(), encoding: 'utf-8' }
    );

    const output = JSON.parse(result);
    expect(output.framework).toBe('React');
  });

  it('should audit UX issues', () => {
    const result = execSync(
      `ts-node src/agent/index.ts audit ux --project ${testProjectPath}`,
      { cwd: process.cwd(), encoding: 'utf-8' }
    );

    expect(result).toContain('Audit terminé');
  });

  it('should enhance accessibility', () => {
    const htmlFile = path.join(testProjectPath, 'index.html');
    
    execSync(
      `ts-node src/agent/index.ts enhance ${htmlFile} accessibility`,
      { cwd: process.cwd(), encoding: 'utf-8' }
    );

    const content = fs.readFileSync(htmlFile, 'utf-8');
    expect(content).toContain('alt=');
  });
});