import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';

describe('enhance-code', () => {
    const testDir = path.join(__dirname, '../../tmp/test-enhance-code');
    beforeEach(async () => {
        await fs.remove(testDir);
        await fs.ensureDir(testDir);
    });

    afterEach(async () => {
        await fs.remove(testDir);
    });

    it('should add viewport meta tag', async () => {
        const htmlFile = path.join(testDir, 'test.html');
        await fs.writeFile(htmlFile, '<html><head></head><body><h1>Test</h1></body></html>');
        execSync(`ts-node ${path.join(__dirname, '../scripts/enhance-code.ts')} --file ${htmlFile} --objective viewport-meta`, { stdio: 'inherit' });

        const content = await fs.readFile(htmlFile, 'utf-8');
        expect(content).toContain('name="viewport"');
    });

    it('should add alt attributes to images', async () => {
        const htmlFile = path.join(testDir, 'test.html');
        await fs.writeFile(htmlFile, '<html><body><img src="test.jpg"></body></html>');
        execSync(`ts-node ${path.join(__dirname, '../scripts/enhance-code.ts')} --file ${htmlFile} --objective accessibility-score`, { stdio: 'inherit' });

        const content = await fs.readFile(htmlFile, 'utf-8');
        expect(content).toContain('alt="Image: test"');
    });
});