const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

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
        execSync(`node ${path.join(__dirname, '../scripts/ux-analyzer.js')} --html ${htmlFile} --output ${outputDir}`, { stdio: 'inherit' });

        const analysisData = await fs.readJson(path.join(outputDir, 'analysis-data.json'));
        expect(analysisData.accessibility.score).toBeLessThanOrEqual(100);
        expect(analysisData.accessibility.issues).toContainEqual(expect.stringContaining('Image sans alt'));
        expect(fs.existsSync(path.join(outputDir, 'ux-report.md'))).toBe(true);
        expect(fs.existsSync(path.join(outputDir, 'uxui-prompt-advanced.md'))).toBe(true);
    });

    it('should handle invalid input', () => {
        expect(() => {
            execSync(`node ${path.join(__dirname, '../scripts/ux-analyzer.js')} --output ${outputDir}`, { stdio: 'inherit' });
        }).toThrow();
    });
});