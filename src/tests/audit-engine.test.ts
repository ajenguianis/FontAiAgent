import { AuditEngine } from '../agent/audit-engine';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('AuditEngine', () => {
  const testProjectPath = path.join(global.testDir, 'audit-test');

  beforeEach(async () => {
    await fs.ensureDir(testProjectPath);
  });

  afterEach(async () => {
    await fs.remove(testProjectPath);
  });

  it('should audit UX issues', async () => {
    const htmlFile = path.join(testProjectPath, 'index.html');
    await fs.writeFile(htmlFile, `
      <html>
        <head></head>
        <body>
          <img src="test.jpg">
          <h1>Title 1</h1>
          <h1>Title 2</h1>
        </body>
      </html>
    `);

    const outputPath = path.join(testProjectPath, 'output');
    await AuditEngine.audit('ux', testProjectPath, outputPath);

    const resultFile = path.join(outputPath, 'ux-audit.json');
    expect(await fs.pathExists(resultFile)).toBe(true);

    const result = await fs.readJson(resultFile);
    expect(result.type).toBe('ux');
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('should audit Symfony project', async () => {
    const composerFile = path.join(testProjectPath, 'composer.json');
    await fs.writeJson(composerFile, {
      require: {
        'symfony/framework-bundle': '^6.0'
      }
    });

    const twigFile = path.join(testProjectPath, 'templates/base.html.twig');
    await fs.ensureDir(path.dirname(twigFile));
    await fs.writeFile(twigFile, '<img src="test.jpg">');

    const outputPath = path.join(testProjectPath, 'output');
    await AuditEngine.audit('symfony', testProjectPath, outputPath);

    const resultFile = path.join(outputPath, 'symfony-audit.json');
    expect(await fs.pathExists(resultFile)).toBe(true);

    const result = await fs.readJson(resultFile);
    expect(result.type).toBe('symfony');
  });
});