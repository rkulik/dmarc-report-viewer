import { describe, expect, it } from '@jest/globals';

import { getSelectableFiles, loadFile, parseXml } from '../src/services/file.js';

import * as fs from 'fs';
import * as path from 'path';

describe('file.ts', () => {
  const testDirectory = path.join(__dirname, 'data');

  it('should list only allowed DMARC report files', () => {
    const files = getSelectableFiles(testDirectory);

    expect(files).toContain('dmarc-report.xml');
    expect(files).toContain('invalid-dmarc-report.xml');
    expect(files).not.toContain('no-dmarc-report.txt');
  });

  it('should throw error for unsupported file', async () => {
    await expect(loadFile(path.join(testDirectory, 'no-dmarc-report.txt'))).rejects.toThrow();
  });

  it('should throw error if XML does not match schema', async () => {
    const invalidXml = fs.readFileSync(path.join(testDirectory, 'invalid-dmarc-report.xml'), 'utf8');

    await expect(parseXml(invalidXml)).rejects.toThrow();
  });

  it('should parse DMARC XML report from .xml file', async () => {
    const xml = fs.readFileSync(path.join(testDirectory, 'dmarc-report.xml'), 'utf8');
    const report = await parseXml(xml);
    const records = Array.isArray(report.feedback.record) ? report.feedback.record : [report.feedback.record];

    expect(report.feedback.report_metadata.org_name).toBe('ExampleOrg');
    expect(records[0].row.source_ip).toBe('192.0.2.1');
  });

  it('should parse DMARC XML report from .zip file', async () => {
    const zip = path.join(testDirectory, 'dmarc-report.zip');
    const xml = await loadFile(zip);
    const report = await parseXml(xml);
    const records = Array.isArray(report.feedback.record) ? report.feedback.record : [report.feedback.record];

    expect(report.feedback.report_metadata.org_name).toBe('ExampleOrg');
    expect(records[0].row.source_ip).toBe('192.0.2.1');
  });

  it('should parse DMARC XML report from .gz file', async () => {
    const gz = path.join(testDirectory, 'dmarc-report.gz');
    const xml = await loadFile(gz);
    const report = await parseXml(xml);
    const records = Array.isArray(report.feedback.record) ? report.feedback.record : [report.feedback.record];

    expect(report.feedback.report_metadata.org_name).toBe('ExampleOrg');
    expect(records[0].row.source_ip).toBe('192.0.2.1');
  });
});
