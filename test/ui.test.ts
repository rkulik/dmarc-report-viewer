import { describe, expect, it, jest } from '@jest/globals';

import { parseXml } from '../src/services/file.js';
import { displayReport } from '../src/services/ui.js';

import * as fs from 'fs';
import * as path from 'path';

describe('ui.ts', () => {
  const testDirectory = path.join(__dirname, 'data');

  it('should display a DMARC report table', async () => {
    const xml = fs.readFileSync(path.join(testDirectory, 'dmarc-report.xml'), 'utf8');
    const report = await parseXml(xml);
    const tableSpy = jest.spyOn(console, 'table').mockImplementation(() => {});
    displayReport(report);

    expect(tableSpy).toHaveBeenCalled();
    tableSpy.mockRestore();
  });
});
