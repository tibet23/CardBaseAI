import { ContactCard } from '../types';

/**
 * Escapes characters for RFC 2426 vCard format (newlines, backslashes, commas, semicolons).
 */
function escapeVCard(text?: string): string {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Formats a contact card into a standard vCard 3.0 text block.
 */
export function generateVCardString(card: ContactCard): string {
  const nameParts = card.fullName.trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const firstName = nameParts[0] || '';

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
    `FN:${escapeVCard(card.fullName)}`,
  ];

  if (card.company) {
    lines.push(`ORG:${escapeVCard(card.company)}${card.department ? ';' + escapeVCard(card.department) : ''}`);
  }

  if (card.jobTitle) {
    lines.push(`TITLE:${escapeVCard(card.jobTitle)}`);
  }

  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${card.email.trim()}`);
  }

  if (card.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${card.phone.trim()}`);
  }

  if (card.mobilePhone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${card.mobilePhone.trim()}`);
  }

  if (card.website) {
    lines.push(`URL:${card.website.trim()}`);
  }

  if (card.address && (card.address.street || card.address.city || card.address.state || card.address.country)) {
    const street = escapeVCard(card.address.street || '');
    const city = escapeVCard(card.address.city || '');
    const state = escapeVCard(card.address.state || '');
    const zip = escapeVCard(card.address.zip || '');
    const country = escapeVCard(card.address.country || '');
    lines.push(`ADR;TYPE=WORK:;;${street};${city};${state};${zip};${country}`);
  }

  if (card.social?.linkedin) {
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${card.social.linkedin.trim()}`);
  }
  if (card.social?.twitter) {
    lines.push(`X-SOCIALPROFILE;TYPE=twitter:${card.social.twitter.trim()}`);
  }

  if (card.tags && card.tags.length > 0) {
    lines.push(`CATEGORIES:${card.tags.map((t) => escapeVCard(t)).join(',')}`);
  }

  const notesCombined = [
    card.notes || '',
    card.category ? `Category: ${card.category}` : '',
    `Digitized with CardBase AI on ${new Date(card.scannedAt).toLocaleDateString()}`
  ].filter(Boolean).join(' | ');

  if (notesCombined) {
    lines.push(`NOTE:${escapeVCard(notesCombined)}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Exports one or multiple cards to a .vcf file and triggers browser download.
 */
export function exportToVCF(cards: ContactCard[], filename?: string): void {
  if (!cards.length) return;

  const vCardsText = cards.map((c) => generateVCardString(c)).join('\r\n\r\n');
  const blob = new Blob([vCardsText], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const finalName = filename || (cards.length === 1
    ? `${cards[0].fullName.toLowerCase().replace(/\s+/g, '_')}_contact.vcf`
    : `business_cards_export_${cards.length}_contacts.vcf`);

  const link = document.createElement('a');
  link.href = url;
  link.download = finalName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes a field for CSV format with anti-formula-injection protection (CWE-1236).
 */
function escapeCSV(value?: string | number): string {
  if (value === undefined || value === null) return '""';
  let str = String(value).replace(/"/g, '""');
  // If string starts with formula trigger characters (=, +, -, @, tab, CR), prepend single quote to neutralize
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str}"`;
}

/**
 * Exports cards to a CSV file and triggers browser download.
 */
export function exportToCSV(cards: ContactCard[], filename?: string): void {
  if (!cards.length) return;

  const headers = [
    'Full Name',
    'Job Title',
    'Company',
    'Department',
    'Email',
    'Phone',
    'Mobile Phone',
    'Website',
    'Street Address',
    'City',
    'State / Province',
    'ZIP / Postal Code',
    'Country',
    'LinkedIn',
    'Twitter/X',
    'Category',
    'Tags',
    'Notes',
    'Confidence Score (%)',
    'Scanned Date',
    'Apollo.io Synced',
    'HubSpot Synced',
    'Salesforce Synced',
    'Google Contacts Synced'
  ];

  const rows = cards.map((c) => [
    escapeCSV(c.fullName),
    escapeCSV(c.jobTitle),
    escapeCSV(c.company),
    escapeCSV(c.department),
    escapeCSV(c.email),
    escapeCSV(c.phone),
    escapeCSV(c.mobilePhone),
    escapeCSV(c.website),
    escapeCSV(c.address?.street),
    escapeCSV(c.address?.city),
    escapeCSV(c.address?.state),
    escapeCSV(c.address?.zip),
    escapeCSV(c.address?.country),
    escapeCSV(c.social?.linkedin),
    escapeCSV(c.social?.twitter),
    escapeCSV(c.category),
    escapeCSV(c.tags?.join(', ')),
    escapeCSV(c.notes),
    escapeCSV(c.confidenceScore),
    escapeCSV(c.scannedAt),
    escapeCSV(c.crmSyncStatus?.Apollo?.synced ? 'Yes' : 'No'),
    escapeCSV(c.crmSyncStatus?.HubSpot?.synced ? 'Yes' : 'No'),
    escapeCSV(c.crmSyncStatus?.Salesforce?.synced ? 'Yes' : 'No'),
    escapeCSV(c.crmSyncStatus?.GoogleContacts?.synced ? 'Yes' : 'No'),
  ].join(','));

  // Prepend UTF-8 Byte Order Mark (BOM) so Microsoft Excel opens special characters correctly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const finalName = filename || `business_cards_export_${new Date().toISOString().slice(0, 10)}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.download = finalName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers a clean printable view of contacts in a formatted sheet.
 */
export function printContactSheet(cards: ContactCard[]): void {
  if (!cards.length) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Business Cards Directory - ${cards.length} Contacts</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
          h1 { font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; page-break-inside: avoid; background: #fff; }
          .name { font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 2px; }
          .title { font-size: 13px; color: #475569; font-weight: 500; }
          .company { font-size: 13px; color: #2563eb; font-weight: 600; margin-bottom: 8px; }
          .detail { font-size: 12px; color: #334155; margin: 3px 0; }
          .tags { margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap; }
          .tag { font-size: 10px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
            Print / Save to PDF
          </button>
        </div>
        <h1>Business Cards Directory (${cards.length} Contacts)</h1>
        <div class="grid">
          ${cards.map((c) => `
            <div class="card">
              <div class="name">${c.fullName}</div>
              <div class="title">${c.jobTitle || ''}</div>
              <div class="company">${c.company || ''}</div>
              ${c.email ? `<div class="detail">✉ ${c.email}</div>` : ''}
              ${c.phone ? `<div class="detail">☎ ${c.phone}</div>` : ''}
              ${c.website ? `<div class="detail">🌐 ${c.website}</div>` : ''}
              ${c.address?.city || c.address?.country ? `<div class="detail">📍 ${[c.address.street, c.address.city, c.address.state, c.address.country].filter(Boolean).join(', ')}</div>` : ''}
              ${c.tags?.length ? `<div class="tags">${c.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export const printCards = printContactSheet;
