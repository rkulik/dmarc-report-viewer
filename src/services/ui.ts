import type { Report } from '@app/services/file.js';
import { select } from '@inquirer/prompts';

const statusMap: Record<string, { emoji: string; text: string }> = {
  none: { emoji: '✅', text: 'Delivered' },
  quarantine: { emoji: '🔒', text: 'Quarantined' },
  reject: { emoji: '❌', text: 'Rejected' },
  unknown: { emoji: '❓', text: 'Unknown' },
};

export const selectFile = async (files: string[]): Promise<string> => {
  const choices = files.map((file) => {
    return { value: file };
  });

  return select({ message: 'Select a DMARC report file', choices, pageSize: 20 });
};

export const displayReport = (report: Report): void => {
  const records = Array.isArray(report.feedback.record) ? report.feedback.record : [report.feedback.record];

  const table = records.map((record) => {
    const disposition = record.row.policy_evaluated.disposition;
    const status = statusMap[disposition] ?? statusMap.unknown;

    return {
      IP: record.row.source_ip,
      Count: record.row.count,
      SPF: record.row.policy_evaluated.spf,
      DKIM: record.row.policy_evaluated.dkim,
      Disposition: disposition,
      From: record.identifiers.header_from,
      'SPF Result': record.auth_results?.spf?.result || 'unknown',
      'DKIM Result': record.auth_results?.dkim?.result || 'unknown',
      Status: `${status.emoji} ${status.text}`,
    };
  });

  // eslint-disable-next-line no-console
  console.table(table);
};
