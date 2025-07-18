#! /usr/bin/env node
import { select } from '@inquirer/prompts';
import * as unzipper from 'unzipper';
import { Parser } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors.js';
import type z from 'zod';

import type { Report as ReportSchema } from './schema.js';

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

type Report = z.infer<typeof ReportSchema>;

const allowedExtensions = ['.xml', '.gz', '.zip'];

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

const getSelectableFiles = (directory: string): string[] => {
  return fs.readdirSync(directory).filter((file) => {
    const fullPath = path.join(directory, file);

    return fs.statSync(fullPath).isFile() && allowedExtensions.includes(path.extname(file).toLowerCase());
  });
};

const selectFile = async (files: string[]): Promise<string> => {
  const choices = files.map((file) => {
    return { value: file };
  });

  return select({ message: 'Select a DMARC report file', choices, pageSize: 20 });
};

const main = async (): Promise<void> => {
  try {
    const currentDirectory = process.cwd();
    const selectableFiles = getSelectableFiles(currentDirectory);
    if (!selectableFiles.length) {
      // eslint-disable-next-line no-console
      console.error('No DMARC report files to select.');
      return;
    }

    const filePath = await selectFile(selectableFiles);
    const xml = await loadFile(path.join(currentDirectory, filePath));
    const parsedXml = await parseXml(xml);
    displayReport(parsedXml);
  } catch (error) {
    const isErrorInstance = error instanceof Error;
    if (isErrorInstance && error.name === 'ExitPromptError') {
      return;
    }

    // eslint-disable-next-line no-console
    console.error('Unable to view DMARC report.');
  }
};

void main();
