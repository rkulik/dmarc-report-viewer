#! /usr/bin/env node
import * as unzipper from 'unzipper';
import { Parser } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors.js';
import type z from 'zod';

import type { Report as ReportSchema } from './schema.js';

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

type Report = z.infer<typeof ReportSchema>;

const parser = new Parser({
  explicitArray: false,
  tagNameProcessors: [stripPrefix],
});

const parseXml = (xml: string): Promise<Report> => {
  return parser.parseStringPromise(xml);
};

const loadFile = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath);

  if (ext === '.zip') {
    const directory = await unzipper.Open.file(filePath);
    const xmlFile = directory.files.find((file) => {
      return file.path.endsWith('.xml');
    });

    if (!xmlFile) {
      throw new Error('No XML file found in ZIP');
    }

    const content = await xmlFile.buffer();

    return content.toString();
  }

  if (ext === '.gz') {
    const buffer = fs.readFileSync(filePath);
    const xml = zlib.gunzipSync(buffer).toString('utf8');

    return xml;
  }

  if (ext === '.xml') {
    return fs.readFileSync(filePath, 'utf8');
  }

  throw new Error('Unsupported file format. Use .xml, .zip or .gz');
};

const displayReport = (report: Report): void => {
  const records = Array.isArray(report.feedback.record) ? report.feedback.record : [report.feedback.record];

  const table = records.map((record) => {
    return {
      IP: record.row.source_ip,
      Count: record.row.count,
      SPF: record.row.policy_evaluated.spf,
      DKIM: record.row.policy_evaluated.dkim,
      Disposition: record.row.policy_evaluated.disposition,
      From: record.identifiers.header_from,
      'SPF Result': record.auth_results?.spf?.result || 'unknown',
      'DKIM Result': record.auth_results?.dkim?.result || 'unknown',
    };
  });

  // eslint-disable-next-line no-console
  console.table(table);
};

const main = async (): Promise<void> => {
  const filePath = process.argv[2];
  if (!filePath) {
    // eslint-disable-next-line no-console
    console.error('Please provide a DMARC report file as an argument.');
    return;
  }

  try {
    const xml = await loadFile(filePath);
    const parsedXml = await parseXml(xml);
    displayReport(parsedXml);
  } catch {
    // eslint-disable-next-line no-console
    console.error('Unable to view DMARC report.');
  }
};

void main();
