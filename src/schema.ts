import { z } from 'zod';

const Dkim = z.object({
  domain: z.string(),
  result: z.string(),
  selector: z.string().optional(),
});

const Spf = z.object({
  domain: z.string(),
  result: z.string(),
  scope: z.string().optional(),
});

const AuthResults = z.object({
  dkim: Dkim.optional(),
  spf: Spf.optional(),
});

const PolicyEvaluated = z.object({
  disposition: z.string(),
  dkim: z.string(),
  spf: z.string(),
});

const Row = z.object({
  source_ip: z.string(),
  count: z.string(),
  policy_evaluated: PolicyEvaluated,
});

const Identifiers = z.object({
  header_from: z.string(),
  envelope_from: z.string().optional(),
});

const Record = z.object({
  row: Row,
  identifiers: Identifiers,
  auth_results: AuthResults.optional(),
});

const ReportMetadata = z.object({
  org_name: z.string(),
  email: z.string(),
  report_id: z.string(),
  date_range: z.object({
    begin: z.string(),
    end: z.string(),
  }),
});

const PolicyPublished = z.object({
  domain: z.string(),
  adkim: z.string().optional(),
  aspf: z.string().optional(),
  p: z.string(),
  sp: z.string().optional(),
  pct: z.string().optional(),
  testing: z.string().optional(),
  discovery_method: z.string().optional(),
});

export const Report = z.object({
  feedback: z.object({
    report_metadata: ReportMetadata,
    policy_published: PolicyPublished,
    record: z.union([Record, z.array(Record)]),
  }),
});
