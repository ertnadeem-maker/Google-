import { BusinessProfile, Party, Transaction } from '../types';
import { formatCurrency, formatDate } from './i18n';

/**
 * Generates an Excel-compatible CSV file of all transactions
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  parties: Party[],
  profile: BusinessProfile
): void {
  const partyMap = new Map<string, Party>();
  parties.forEach((p) => partyMap.set(p.id, p));

  const headers = [
    'Date & Time',
    'Party Name',
    'Party Type',
    'Phone',
    'Transaction Type',
    'Diye (Debit)',
    'Mile (Credit)',
    'Payment Mode',
    'Bill / Invoice No',
    'Description / Items',
  ];

  const rows = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((tx) => {
      const party = partyMap.get(tx.partyId);
      const isGave = tx.type === 'gave';
      const debit = isGave ? tx.amount : 0;
      const credit = !isGave ? tx.amount : 0;

      return [
        `"${formatDate(tx.date)}"`,
        `"${(party?.name || 'Unknown').replace(/"/g, '""')}"`,
        `"${party?.type === 'buyer' ? 'Grahak (Buyer)' : 'Vikreta (Seller)'}"`,
        `"${party?.phone || ''}"`,
        `"${isGave ? 'Maine Diya (Gave)' : 'Mujhe Mila (Received)'}"`,
        debit,
        credit,
        `"${tx.paymentMode.toUpperCase()}"`,
        `"${(tx.billNumber || '').replace(/"/g, '""')}"`,
        `"${(tx.description || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

  // UTF-8 BOM (\uFEFF) ensures Hindi/special characters open correctly in Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(
    blob,
    `${sanitizeFileName(profile.businessName)}_Transactions_${getDateStamp()}.csv`
  );
}

/**
 * Generates an Excel-compatible CSV file of party balances
 */
export function exportPartiesToCSV(
  parties: Party[],
  getBalance: (partyId: string) => { balance: number; statusLabel: string; gaveTotal: number; receivedTotal: number },
  profile: BusinessProfile
): void {
  const headers = [
    'Party Name',
    'Account Type',
    'Phone Number',
    'Address',
    'Opening Balance',
    'Total Diye (Gave)',
    'Total Mile (Received)',
    'Net Balance',
    'Status (Lene/Dene)',
    'Notes',
  ];

  const rows = parties.map((p) => {
    const bal = getBalance(p.id);
    const statusText =
      bal.statusLabel === 'youWillGet'
        ? 'Lene Hain (Receivable)'
        : bal.statusLabel === 'youWillGive'
        ? 'Dene Hain (Payable)'
        : 'Hisab Barabar (Settled)';

    return [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.type === 'buyer' ? 'Grahak (Buyer)' : 'Vikreta (Seller)'}"`,
      `"${p.phone || ''}"`,
      `"${(p.address || '').replace(/"/g, '""')}"`,
      p.openingBalance || 0,
      bal.gaveTotal,
      bal.receivedTotal,
      bal.balance,
      `"${statusText}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(
    blob,
    `${sanitizeFileName(profile.businessName)}_Parties_Khata_${getDateStamp()}.csv`
  );
}

/**
 * Exports complete JSON backup file
 */
export function exportJSONBackup(data: unknown, profile: BusinessProfile): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerDownload(
    blob,
    `${sanitizeFileName(profile.businessName)}_VyaparKhata_Backup_${getDateStamp()}.json`
  );
}

/**
 * Generates and downloads a complete printable standalone HTML report
 */
export function exportHTMLReport(
  parties: Party[],
  transactions: Transaction[],
  profile: BusinessProfile,
  getBalance: (partyId: string) => { balance: number; statusLabel: string; gaveTotal: number; receivedTotal: number }
): void {
  const partyMap = new Map<string, Party>();
  parties.forEach((p) => partyMap.set(p.id, p));

  let totalRec = 0;
  let totalPay = 0;
  parties.forEach((p) => {
    const b = getBalance(p.id);
    if (p.type === 'buyer') {
      if (b.statusLabel === 'youWillGet') totalRec += b.balance;
      else if (b.statusLabel === 'youWillGive') totalPay += b.balance;
    } else {
      if (b.statusLabel === 'youWillGive') totalPay += b.balance;
      else if (b.statusLabel === 'youWillGet') totalRec += b.balance;
    }
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${profile.businessName} - Hisab Kitab Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 30px; color: #1e293b; background: #fff; }
    h1 { margin: 0; color: #0f172a; font-size: 24px; text-transform: uppercase; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .badge { display: inline-block; padding: 4px 10px; background: #f1f5f9; border-radius: 6px; font-size: 12px; font-weight: bold; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
    .card h3 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #64748b; }
    .card p { margin: 0; font-size: 20px; font-weight: 800; }
    .green { color: #16a34a; }
    .red { color: #dc2626; }
    .blue { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; }
    td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${profile.businessName}</h1>
      <p style="margin: 4px 0 0; color: #475569; font-size: 13px;">${profile.ownerName} • ${profile.phone} • ${profile.address}</p>
    </div>
    <div style="text-align: right;">
      <span class="badge">HISAB KITAB COMPLETE LEDGER</span>
      <p style="margin: 6px 0 0; font-size: 12px; color: #64748b;">Generated: ${new Date().toLocaleString('en-IN')}</p>
    </div>
  </div>

  <div class="summary-grid">
    <div class="card">
      <h3>Kul Lene Hain (Receivable)</h3>
      <p class="green">${profile.currencySymbol}${totalRec.toLocaleString('en-IN')}</p>
    </div>
    <div class="card">
      <h3>Kul Dene Hain (Payable)</h3>
      <p class="red">${profile.currencySymbol}${totalPay.toLocaleString('en-IN')}</p>
    </div>
    <div class="card">
      <h3>Net Balance</h3>
      <p class="blue">${profile.currencySymbol}${(totalRec - totalPay).toLocaleString('en-IN')}</p>
    </div>
  </div>

  <h2 style="font-size: 15px; margin: 24px 0 8px;">Party Accounts Summary (${parties.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Party Name</th>
        <th>Type</th>
        <th>Phone</th>
        <th class="text-right">Total Diye</th>
        <th class="text-right">Total Mile</th>
        <th class="text-right">Current Balance</th>
      </tr>
    </thead>
    <tbody>
      ${parties
        .map((p) => {
          const b = getBalance(p.id);
          const isGet = b.statusLabel === 'youWillGet';
          return `<tr>
            <td><strong>${p.name}</strong></td>
            <td>${p.type === 'buyer' ? 'Grahak' : 'Vikreta'}</td>
            <td>${p.phone || '-'}</td>
            <td class="text-right">${profile.currencySymbol}${b.gaveTotal.toLocaleString('en-IN')}</td>
            <td class="text-right">${profile.currencySymbol}${b.receivedTotal.toLocaleString('en-IN')}</td>
            <td class="text-right" style="font-weight:bold; color:${isGet ? '#16a34a' : '#dc2626'}">
              ${profile.currencySymbol}${b.balance.toLocaleString('en-IN')} (${isGet ? 'Lene' : 'Dene'})
            </td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>

  <h2 style="font-size: 15px; margin: 30px 0 8px;">Recent Transactions (${transactions.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Party</th>
        <th>Details</th>
        <th>Mode</th>
        <th class="text-right">Diye (Debit)</th>
        <th class="text-right">Mile (Credit)</th>
      </tr>
    </thead>
    <tbody>
      ${transactions
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((tx) => {
          const party = partyMap.get(tx.partyId);
          const isGave = tx.type === 'gave';
          return `<tr>
            <td>${new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td>${party?.name || 'Unknown'}</td>
            <td>${tx.description || '-'} ${tx.billNumber ? `(Bill #${tx.billNumber})` : ''}</td>
            <td>${tx.paymentMode.toUpperCase()}</td>
            <td class="text-right" style="color: #dc2626; font-weight: 600;">${isGave ? profile.currencySymbol + tx.amount.toLocaleString('en-IN') : '-'}</td>
            <td class="text-right" style="color: #16a34a; font-weight: 600;">${!isGave ? profile.currencySymbol + tx.amount.toLocaleString('en-IN') : '-'}</td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <span>Vyapar Khata - Small Business Bookkeeping with Google Drive Sync</span>
    <span>Signature / Seal: ____________________</span>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  triggerDownload(
    blob,
    `${sanitizeFileName(profile.businessName)}_Complete_Report_${getDateStamp()}.html`
  );
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFileName(name: string): string {
  return (name || 'VyaparKhata').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getDateStamp(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}
