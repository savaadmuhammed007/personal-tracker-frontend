import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format a number into currency string without special unicode symbols for safe PDF rendering.
 * Uses "INR 1,234.50" or "Rs. 1,234.50" format which renders cleanly in standard PDF fonts.
 */
const formatPdfCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `INR ${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date into "DD MMM YYYY" for PDF
 */
const formatPdfDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = String(dateStr).slice(0, 10).split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${monthNames[monthIdx] || parts[1]} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

/**
 * Generates an official, comprehensive Multi-Account Ledger PDF with:
 * - Executive Portfolio Overview
 * - Dedicated Sections for Each Account (Cash, UPI, Bank, Savings, etc.)
 * - Strict Running Balance calculated and displayed on EACH row
 * - Opening balance -> Transactions -> Closing balance reconciliation
 * - Professional pagination, colors, and headers
 * 
 * @param {Object} params
 * @param {Array} params.accounts - List of user accounts
 * @param {Array} params.transactions - List of all ledger transactions
 * @param {Object} params.filters - Active filters { account, type, date, search }
 * @param {string} params.userName - Logged-in user's display name or username
 */
export const generateLedgerPdf = ({
  accounts = [],
  transactions = [],
  filters = {},
  userName = 'User',
}) => {
  // 1. Initialize Portrait A4 Document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  // Active filter extraction
  const filterAccount = filters.account && filters.account !== 'all' ? String(filters.account) : null;
  const filterType = filters.type && filters.type !== 'all' ? filters.type : null;
  const filterDate = filters.date || null;
  const searchQuery = (filters.search || '').trim().toLowerCase();

  // Determine target accounts list
  let targetAccounts = accounts;
  if (filterAccount) {
    targetAccounts = accounts.filter((a) => String(a.id) === filterAccount);
    if (targetAccounts.length === 0 && accounts.length > 0) {
      targetAccounts = accounts;
    }
  }

  // Calculate Overall Net Worth
  const totalNetWorth = accounts.reduce((sum, a) => sum + (Number(a.current_balance) || 0), 0);
  const totalOpeningLiquidity = accounts.reduce((sum, a) => sum + (Number(a.opening_balance) || 0), 0);

  // Current generation timestamp
  const now = new Date();
  const generatedAt = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // 2. Draw Main Document Header
  // Top Primary Brand Accent Bar
  doc.setFillColor(8, 138, 193); // #088ac1
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Header Title & Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('OFFICIAL GENERAL LEDGER STATEMENT', margin, 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Personal Habit & Financial Expense Tracker - Reconciled Account Book', margin, 21);

  // Right-aligned Metadata Box
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Generated: ${generatedAt}`, pageWidth - margin, 15, { align: 'right' });
  doc.text(`Account Holder: ${userName}`, pageWidth - margin, 19.5, { align: 'right' });
  doc.text(`Total Liquid Net Worth: ${formatPdfCurrency(totalNetWorth)}`, pageWidth - margin, 24, { align: 'right' });

  // Divider Line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(margin, 27, pageWidth - margin, 27);

  // 3. Executive Filter & Period Notice Pill
  let filterText = 'Scope: All Recorded Transactions';
  if (filterDate) filterText = `Scope: Date ${formatPdfDate(filterDate)}`;
  if (filterType) filterText += ` | Type: ${filterType.toUpperCase()}`;
  if (searchQuery) filterText += ` | Search: "${searchQuery}"`;
  if (filterAccount) {
    const accObj = accounts.find((a) => String(a.id) === filterAccount);
    filterText += ` | Filtered by Account: ${accObj ? accObj.name : filterAccount}`;
  }

  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, 30, contentWidth, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(filterText, margin + 3, 34.5);

  let currentY = 41;

  // 4. Executive Overall Accounts Summary Card
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('PORTFOLIO ACCOUNTS OVERVIEW', margin, currentY);
  currentY += 3;

  // Overview Table
  const overviewHeaders = [
    ['Account Name', 'Type / Method', 'Opening Base', 'Total Credits (+)', 'Total Debits (-)', 'Closing Balance']
  ];
  const overviewRows = targetAccounts.map((acc) => {
    const opening = Number(acc.opening_balance) || 0;
    const current = Number(acc.current_balance) || 0;
    const income = Number(acc.total_income) || 0;
    const expense = Number(acc.total_expense) || 0;

    return [
      acc.name,
      (acc.account_type || 'Account').toUpperCase(),
      formatPdfCurrency(opening),
      formatPdfCurrency(income),
      formatPdfCurrency(expense),
      formatPdfCurrency(current),
    ];
  });

  // Summary Row for Overview Table
  overviewRows.push([
    'TOTAL COMBINED PORTFOLIO',
    `${targetAccounts.length} ACCOUNTS`,
    formatPdfCurrency(totalOpeningLiquidity),
    formatPdfCurrency(targetAccounts.reduce((s, a) => s + (Number(a.total_income) || 0), 0)),
    formatPdfCurrency(targetAccounts.reduce((s, a) => s + (Number(a.total_expense) || 0), 0)),
    formatPdfCurrency(totalNetWorth),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: overviewHeaders,
    body: overviewRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [51, 65, 85],
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { fontStyle: 'bold', width: 45 },
      1: { halign: 'center', width: 28 },
      2: { halign: 'right', width: 27 },
      3: { halign: 'right', textColor: [16, 185, 129], width: 27 }, // emerald-600
      4: { halign: 'right', textColor: [225, 29, 72], width: 27 }, // rose-600
      5: { halign: 'right', fontStyle: 'bold', width: 28 },
    },
    didParseCell: (data) => {
      // Highlight total row
      if (data.row.index === overviewRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [225, 243, 253]; // light cyan tint
        data.cell.styles.textColor = [7, 110, 157];
      }
    },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 5. Build SECTIONS FOR EACH ACCOUNT with STRICT RUNNING BALANCE ON EACH ROW
  targetAccounts.forEach((account, accIndex) => {
    // Check if we need a new page for this account section
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 16;
    }

    // Filter transactions relevant to this account
    const accTxs = transactions.filter((t) => {
      const isFrom = t.account === account.id || String(t.account) === String(account.id);
      const isTo = t.to_account === account.id || String(t.to_account) === String(account.id);
      return isFrom || isTo;
    });

    // Apply active date, type, or search filters if provided
    const filteredTxs = accTxs.filter((t) => {
      if (filterDate && t.date !== filterDate) return false;
      if (filterType && t.transaction_type !== filterType) return false;
      if (searchQuery) {
        const text = `${t.category} ${t.notes || ''} ${t.payment_method || ''} ${t.reference_id || ''}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    // Sort chronologically ascending: date ASC, time ASC, id ASC
    filteredTxs.sort((a, b) => {
      const cmpDate = (a.date || '').localeCompare(b.date || '');
      if (cmpDate !== 0) return cmpDate;
      const cmpTime = (a.time || '00:00').localeCompare(b.time || '00:00');
      if (cmpTime !== 0) return cmpTime;
      return (Number(a.id) || 0) - (Number(b.id) || 0);
    });

    // Section Header Box for Account
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, 'FD');

    // Colored Accent Stripe matching account color or cyan
    let barColor = [8, 138, 193]; // default cyan
    if (account.color && account.color.startsWith('#') && account.color.length === 7) {
      const r = parseInt(account.color.slice(1, 3), 16);
      const g = parseInt(account.color.slice(3, 5), 16);
      const b = parseInt(account.color.slice(5, 7), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        barColor = [r, g, b];
      }
    }
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.rect(margin, currentY, 3, 12, 'F');

    // Account Name & Type
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const accTitle = `SECTION ${accIndex + 1}: ${account.name.toUpperCase()} (${(account.account_type || 'Account').toUpperCase()})`;
    doc.text(accTitle, margin + 6, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const subInfo = account.bank_name
      ? `Bank: ${account.bank_name} ${account.account_number_last4 ? `(Ending ${account.account_number_last4})` : ''}`
      : `Liquid Payment Handle - Verified`;
    doc.text(subInfo, margin + 6, currentY + 9.5);

    // Section Opening Balance Badge on right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Opening Base: ${formatPdfCurrency(account.opening_balance || 0)}`, pageWidth - margin - 3, currentY + 5.5, { align: 'right' });
    doc.setFontSize(7.5);
    doc.setTextColor(8, 138, 193);
    doc.text(`Current Bal: ${formatPdfCurrency(account.current_balance || 0)}`, pageWidth - margin - 3, currentY + 9.5, { align: 'right' });

    currentY += 15;

    // Build Rows with Running Balance Calculation
    let runningBalance = Number(account.opening_balance) || 0;
    let totalAccountDebits = 0;
    let totalAccountCredits = 0;

    const tableHeaders = [
      ['#', 'Date & Time', 'Category', 'Notes / Counterparty / Ref', 'Type', 'Debit (-)', 'Credit (+)', 'Balance']
    ];

    const tableRows = [];

    // Row 0: Initial Opening Balance Row
    tableRows.push([
      '•',
      account.opening_balance_date ? formatPdfDate(account.opening_balance_date) : 'Opening',
      'Opening Balance',
      'Account initialization baseline',
      'BASE',
      '-',
      '-',
      formatPdfCurrency(runningBalance),
    ]);

    if (filteredTxs.length === 0) {
      tableRows.push([
        '—',
        '—',
        'No Transactions',
        filterDate ? `No activity on ${formatPdfDate(filterDate)}` : 'No transactions recorded for this period',
        'NONE',
        '-',
        '-',
        formatPdfCurrency(runningBalance),
      ]);
    } else {
      filteredTxs.forEach((tx, idx) => {
        const amt = Number(tx.amount) || 0;
        let debitStr = '-';
        let creditStr = '-';
        let typeLabel = '';
        let descNote = tx.notes || '';

        const isTransfer = tx.transaction_type === 'transfer';
        const isFromThis = tx.account === account.id || String(tx.account) === String(account.id);
        const isToThis = tx.to_account === account.id || String(tx.to_account) === String(account.id);

        if (tx.transaction_type === 'expense') {
          typeLabel = 'DEBIT';
          debitStr = formatPdfCurrency(amt);
          runningBalance -= amt;
          totalAccountDebits += amt;
        } else if (tx.transaction_type === 'income') {
          typeLabel = 'CREDIT';
          creditStr = formatPdfCurrency(amt);
          runningBalance += amt;
          totalAccountCredits += amt;
        } else if (isTransfer) {
          if (isFromThis) {
            typeLabel = 'TRF OUT';
            debitStr = formatPdfCurrency(amt);
            runningBalance -= amt;
            totalAccountDebits += amt;
            descNote = `Transfer to ${tx.to_account_name || 'Account'} ${descNote ? `• ${descNote}` : ''}`;
          } else if (isToThis) {
            typeLabel = 'TRF IN';
            creditStr = formatPdfCurrency(amt);
            runningBalance += amt;
            totalAccountCredits += amt;
            descNote = `Transfer from ${tx.account_name || 'Account'} ${descNote ? `• ${descNote}` : ''}`;
          }
        }

        if (tx.reference_id) {
          descNote = descNote ? `${descNote} (Ref: ${tx.reference_id})` : `Ref: ${tx.reference_id}`;
        }
        if (!descNote) {
          descNote = tx.payment_method ? `Via ${tx.payment_method}` : 'Standard transaction';
        }

        const timeStr = tx.time ? String(tx.time).slice(0, 5) : '';
        const dateTimeStr = timeStr ? `${formatPdfDate(tx.date)} ${timeStr}` : formatPdfDate(tx.date);

        tableRows.push([
          String(idx + 1),
          dateTimeStr,
          tx.category || 'General',
          descNote,
          typeLabel,
          debitStr,
          creditStr,
          formatPdfCurrency(runningBalance), // EXACT RUNNING BALANCE ON EACH ROW!
        ]);
      });
    }

    // Account Summary Footer Row
    const netFlow = totalAccountCredits - totalAccountDebits;
    tableRows.push([
      '∑',
      'ACCOUNT TOTALS',
      `${filteredTxs.length} Transaction(s)`,
      `Net Flow: ${netFlow >= 0 ? '+' : ''}${formatPdfCurrency(netFlow)}`,
      'NET',
      totalAccountDebits > 0 ? formatPdfCurrency(totalAccountDebits) : '-',
      totalAccountCredits > 0 ? formatPdfCurrency(totalAccountCredits) : '-',
      formatPdfCurrency(runningBalance),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: tableHeaders,
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 7.2,
        cellPadding: 1.8,
        textColor: [51, 65, 85],
        font: 'helvetica',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
      },
      columnStyles: {
        0: { halign: 'center', width: 8 },
        1: { width: 23 },
        2: { fontStyle: 'bold', width: 27 },
        3: { width: 44 },
        4: { halign: 'center', fontStyle: 'bold', width: 17 },
        5: { halign: 'right', textColor: [225, 29, 72], width: 21 }, // Red Debits
        6: { halign: 'right', textColor: [16, 185, 129], width: 21 }, // Green Credits
        7: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42], width: 21 }, // Strong Balance Column!
      },
      didParseCell: (data) => {
        // Style opening row (row 0)
        if (data.row.index === 0) {
          data.cell.styles.fillColor = [248, 250, 252];
          data.cell.styles.fontStyle = 'bold';
        }
        // Style summary total row (last row)
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.textColor = [15, 23, 42];
        }
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 8;
  });

  // 6. Professional Page Numbering & Bottom Watermark Footer on Every Page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Footer separator line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);

    // Left footnote
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Yowmi Islamic Habit & Personal Finance • Official Ledger Audit Copy', margin, pageHeight - 7);

    // Right page number
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  // 7. Generate File & Download
  const fileDate = filterDate || now.toISOString().slice(0, 10);
  const fileName = `Ledger_Statement_${fileDate}.pdf`;
  doc.save(fileName);

  return {
    doc,
    fileName,
    totalPages,
  };
};
