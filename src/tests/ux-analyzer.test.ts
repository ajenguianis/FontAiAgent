import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';

describe('ux-analyzer', () => {
    const outputDir = path.join(__dirname, '../../tmp/test-ux-analyzer');
    beforeEach(async () => {
        await fs.remove(outputDir);
        await fs.ensureDir(outputDir);
    });

    afterEach(async () => {
        await fs.remove(outputDir);
    });

    it('should analyze a local HTML file', async () => {
        const htmlFile = path.join(outputDir, 'test.html');
        await fs.writeFile(htmlFile, '<html><body><h1>Test</h1><img src="test.jpg"></body></html>');
        execSync(`ts-node ${path.join(__dirname, '../scripts/ux-analyzer.ts')} --html ${htmlFile} --output ${outputDir}`, { stdio: 'inherit' });

        const analysisData = await fs.readJson(path.join(outputDir, 'analysis-data.json'));
        expect(analysisData.accessibility.score).toBeLessThanOrEqual(100);
        expect(analysisData.accessibility.issues).toContain('Image sans attribut alt : test.jpg');
        expect(fs.existsSync(path.join(outputDir, 'ux-report.md'))).toBe(true);
    });

    it('should handle invalid input', () => {
        expect(() => {
            execSync(`ts-node ${path.join(__dirname, '../scripts/ux-analyzer.ts')} --output ${outputDir}`, { stdio: 'inherit' });
        }).toThrow();
    });
});