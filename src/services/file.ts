import { Report as ReportSchema } from '@app/schema.js';
import * as unzipper from 'unzipper';
import { Parser } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors.js';
import type z from 'zod';

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

export type Report = z.infer<typeof ReportSchema>;

const allowedExtensions = ['.xml', '.gz', '.zip'];

const parser = new Parser({ explicitArray: false, tagNameProcessors: [stripPrefix] });

const getExtension = (filePath: string): string => {
  return path.extname(filePath).toLowerCase();
};

export const parseXml = async (xml: string): Promise<Report> => {
  const parsedXml = (await parser.parseStringPromise(xml)) as unknown;

  return ReportSchema.parse(parsedXml);
};

export const getSelectableFiles = (directory: string): string[] => {
  return fs.readdirSync(directory).filter((file) => {
    const fullPath = path.join(directory, file);
    const extension = getExtension(fullPath);

    return fs.statSync(fullPath).isFile() && allowedExtensions.includes(extension);
  });
};

export const loadFile = async (filePath: string): Promise<string> => {
  switch (getExtension(filePath)) {
    case '.zip': {
      const directory = await unzipper.Open.file(filePath);
      const xmlFile = directory.files.find((file) => {
        return file.path.endsWith('.xml');
      });

      if (!xmlFile) {
        throw new Error('No XML file found in ZIP.');
      }

      return (await xmlFile.buffer()).toString();
    }
    case '.gz':
      return zlib.gunzipSync(fs.readFileSync(filePath)).toString('utf8');
    case '.xml':
      return fs.readFileSync(filePath, 'utf8');
    default:
      throw new Error(`Unsupported file format. Only ${allowedExtensions.join(', ')} allowed.`);
  }
};
