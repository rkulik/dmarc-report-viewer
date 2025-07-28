#! /usr/bin/env node
import { getSelectableFiles, loadFile, parseXml } from '@app/services/file.js';
import { displayReport, selectFile } from '@app/services/ui.js';

import * as path from 'path';

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
    const report = await parseXml(xml);
    displayReport(report);
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
