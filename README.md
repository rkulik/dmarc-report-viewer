# DMARC Report Viewer

A CLI tool to view DMARC reports directly in your terminal.

## Overview

DMARC (Domain-based Message Authentication, Reporting, and Conformance) is an email authentication protocol. This tool helps you quickly inspect and understand DMARC aggregate reports, making it easier to monitor email security and deliverability.

## Features

- Scans the current directory for DMARC report files (supports .xml, .zip, and .gz)
- Interactive file selection
- Parses and displays DMARC report data in a readable format

## Install

```bash
npm install -g @rkulik/dmarc-report-viewer
```

## Usage

```bash
dmarc-report-viewer
```

### Example Output

```bash
┌─────────┬─────────────┬───────┬────────┬────────┬─────────────┬─────────────────┬────────────┬─────────────┬────────────────┐
│ (index) │ IP          │ Count │ SPF    │ DKIM   │ Disposition │ From            │ SPF Result │ DKIM Result │ Status         │
├─────────┼─────────────┼───────┼────────┼────────┼─────────────┼─────────────────┼────────────┼─────────────┼────────────────┤
│ 0       │ '192.0.2.1' │ '1'   │ 'pass' │ 'pass' │ 'none'      │ '<your-domain>' │ 'pass'     │ 'pass'      │ '✅ Delivered' │
└─────────┴─────────────┴───────┴────────┴────────┴─────────────┴─────────────────┴────────────┴─────────────┴────────────────┘
```

## License

Distributed under the [MIT License](https://github.com/rkulik/dmarc-report-viewer/blob/main/LICENSE), Copyright © 2025-PRESENT [René Kulik](https://www.kulik.io/)
