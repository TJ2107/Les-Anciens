import { jsPDF } from 'jspdf';
import { COTISATION_PAYMENT_CHANNEL } from '../data/demoData';
import { AppSettings, Cotisation, EventFund, UserProfile } from '../types';

function formatStatusLabel(status: Cotisation['status']): string {
  switch (status) {
    case 'paid':
      return 'Payé';
    case 'awaiting_confirmation':
      return 'Attente confirmation';
    case 'pending':
      return 'À payer';
    case 'overdue':
      return 'En retard';
    default:
      return status;
  }
}

function formatAmount(amount: number): string {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
}

function slugifyFilePart(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function escapeCsvCell(value: string | number | undefined): string {
  const str = value === undefined ? '' : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportCotisationsToCSV(cotisations: Cotisation[], appName: string): void {
  const headers = [
    'ID',
    'Événement',
    'Contribuable',
    'Montant (FCFA)',
    'Statut',
    'Date déclaration',
    'Référence MTN Mobile Money',
    'Confirmé par',
    'Date confirmation',
  ];

  const rows = cotisations.map(c => [
    escapeCsvCell(c.id),
    escapeCsvCell(c.event),
    escapeCsvCell(c.contributorName || '—'),
    escapeCsvCell(c.amount),
    escapeCsvCell(formatStatusLabel(c.status)),
    escapeCsvCell(c.date),
    escapeCsvCell(c.transactionRef || '—'),
    escapeCsvCell(c.confirmedBy || '—'),
    escapeCsvCell(c.confirmedAt || '—'),
  ]);

  const csvContent =
    '\uFEFF' + [headers.map(escapeCsvCell).join(';'), ...rows.map(r => r.join(';'))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `cotisations_${slugifyFilePart(appName)}_${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCotisationsToPDF(
  cotisations: Cotisation[],
  eventFunds: EventFund[],
  appSettings: AppSettings,
  user: UserProfile
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Header band
  doc.setFillColor(15, 17, 23);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setTextColor(212, 168, 67);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(appSettings.appName, 14, 15);
  doc.setTextColor(232, 224, 208);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Relevé officiel des cotisations et contributions', 14, 23);
  doc.setFontSize(8.5);
  doc.setTextColor(160, 152, 136);
  doc.text(`Édité le ${today} · Par ${user.name}`, pageWidth - 14, 23, { align: 'right' });

  // Financial summary box
  const paidList = cotisations.filter(c => c.status === 'paid');
  const awaitingList = cotisations.filter(c => c.status === 'awaiting_confirmation');
  const pendingList = cotisations.filter(
    c => c.status === 'pending' || c.status === 'overdue'
  );
  const totalPaid = paidList.reduce((sum, c) => sum + c.amount, 0);
  const totalAwaiting = awaitingList.reduce((sum, c) => sum + c.amount, 0);

  let y = 44;
  doc.setFillColor(246, 247, 250);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'F');
  doc.setDrawColor(212, 168, 67);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 85, 100);
  doc.text('TOTAL CONFIRMÉ', 20, y + 8);
  doc.text('EN ATTENTE VALIDATION', 82, y + 8);
  doc.text('DOSSIERS À RÉGLER', 145, y + 8);

  doc.setFontSize(13);
  doc.setTextColor(15, 17, 23);
  doc.text(formatAmount(totalPaid), 20, y + 17);
  doc.text(`${awaitingList.length} (${formatAmount(totalAwaiting)})`, 82, y + 17);
  doc.text(`${pendingList.length}`, 145, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 105, 120);
  doc.text(
    `Canal unique officiel : ${COTISATION_PAYMENT_CHANNEL.provider} ${COTISATION_PAYMENT_CHANNEL.number} (${COTISATION_PAYMENT_CHANNEL.recipientName})`,
    20,
    y + 23
  );

  y += 35;

  // Table header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 17, 23);
  doc.text(`Détail des cotisations (${cotisations.length})`, 14, y);
  y += 5;

  const drawTableHeader = (startY: number) => {
    doc.setFillColor(26, 29, 46);
    doc.rect(14, startY, pageWidth - 28, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Événement', 17, startY + 5.3);
    doc.text('Contribuable', 74, startY + 5.3);
    doc.text('Montant', 114, startY + 5.3);
    doc.text('Statut', 142, startY + 5.3);
    doc.text('Date / Réf', 174, startY + 5.3);
  };

  drawTableHeader(y);
  y += 10;

  cotisations.forEach((c, idx) => {
    if (y > pageHeight - 25) {
      doc.addPage();
      y = 18;
      drawTableHeader(y);
      y += 10;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 249, 252);
      doc.rect(14, y - 4, pageWidth - 28, 9, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(20, 22, 30);

    const eventName = doc.splitTextToSize(c.event, 54)[0] || c.event;
    const contributor = doc.splitTextToSize(c.contributorName || '—', 37)[0] || '—';
    const status = formatStatusLabel(c.status);
    const refText = c.transactionRef ? `${c.date} (${c.transactionRef})` : c.date;

    doc.text(eventName, 17, y + 1);
    doc.text(contributor, 74, y + 1);
    doc.text(formatAmount(c.amount), 114, y + 1);

    if (c.status === 'paid') {
      doc.setTextColor(22, 163, 74);
    } else if (c.status === 'overdue') {
      doc.setTextColor(220, 38, 38);
    } else if (c.status === 'awaiting_confirmation') {
      doc.setTextColor(2, 132, 199);
    } else {
      doc.setTextColor(180, 120, 20);
    }
    doc.text(status, 142, y + 1);

    doc.setTextColor(90, 95, 110);
    doc.text(doc.splitTextToSize(refText, 24)[0] || c.date, 174, y + 1);

    y += 9;
  });

  if (eventFunds.length > 0 && y < pageHeight - 40) {
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 17, 23);
    doc.text(`Résumé des cagnottes événementielles (${eventFunds.length})`, 14, y);
    y += 6;

    eventFunds.forEach(ef => {
      if (y > pageHeight - 18) {
        doc.addPage();
        y = 18;
      }
      const pct = ef.target > 0 ? Math.min(100, Math.round((ef.collected / ef.target) * 100)) : 0;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 34, 48);
      doc.text(
        `• ${ef.name} : ${formatAmount(ef.collected)} / ${formatAmount(ef.target)} (${pct}%) · Échéance : ${ef.deadline}`,
        16,
        y
      );
      y += 6;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(130, 135, 145);
    doc.text(
      `${appSettings.appName} · Document généré automatiquement — Page ${p}/${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const fileDate = new Date().toISOString().split('T')[0];
  doc.save(`releve_cotisations_${slugifyFilePart(appSettings.appName)}_${fileDate}.pdf`);
}

export function exportSingleReceiptPDF(
  cotisation: Cotisation,
  appSettings: AppSettings,
  user: UserProfile
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Top Header
  doc.setFillColor(15, 17, 23);
  doc.rect(0, 0, pageWidth, 38, 'F');
  doc.setTextColor(212, 168, 67);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(appSettings.appName, 16, 16);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('REÇU OFFICIEL DE COTISATION', 16, 26);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 195, 185);
  doc.text(`N° REC-${cotisation.id}`, pageWidth - 16, 16, { align: 'right' });
  doc.text(`Émis le ${today}`, pageWidth - 16, 26, { align: 'right' });

  // Status badge banner
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(16, 48, pageWidth - 32, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text(
    cotisation.status === 'paid'
      ? 'STATUT : PAIEMENT CONFIRMÉ ET VALIDÉ'
      : `STATUT : ${formatStatusLabel(cotisation.status).toUpperCase()}`,
    pageWidth / 2,
    58,
    { align: 'center' }
  );

  // Details card
  let y = 74;
  doc.setFillColor(248, 249, 252);
  doc.setDrawColor(220, 224, 232);
  doc.roundedRect(16, y, pageWidth - 32, 86, 3, 3, 'FD');

  const details: [string, string][] = [
    ['Contribuable', cotisation.contributorName || user.name],
    ['Événement / Motif', cotisation.event],
    ['Montant réglé', formatAmount(cotisation.amount)],
    ['Canal de perception', `${COTISATION_PAYMENT_CHANNEL.provider} (${COTISATION_PAYMENT_CHANNEL.number})`],
    ['Référence de transaction', cotisation.transactionRef || 'Non renseignée'],
    ['Date de déclaration', cotisation.date],
    ['Confirmé par', cotisation.confirmedBy || COTISATION_PAYMENT_CHANNEL.recipientName],
    ['Date de validation', cotisation.confirmedAt || cotisation.date],
  ];

  y += 11;
  details.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 105, 120);
    doc.text(label, 22, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 17, 23);
    doc.text(val, pageWidth - 22, y, { align: 'right' });

    doc.setDrawColor(235, 238, 244);
    doc.line(22, y + 3, pageWidth - 22, y + 3);
    y += 9.5;
  });

  // Attestation note
  y += 14;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(90, 95, 110);
  const note = doc.splitTextToSize(
    `Ce reçu atteste la bonne prise en compte de la cotisation au sein du réseau ${appSettings.appName}. La validation financière est effectuée exclusivement par ${COTISATION_PAYMENT_CHANNEL.recipientName} sur le compte ${COTISATION_PAYMENT_CHANNEL.provider} ${COTISATION_PAYMENT_CHANNEL.number}.`,
    pageWidth - 32
  );
  doc.text(note, 16, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 145, 155);
  doc.text(
    `${appSettings.appName} · Document officiel à conserver`,
    pageWidth / 2,
    280,
    { align: 'center' }
  );

  doc.save(`recu_cotisation_${cotisation.id}.pdf`);
}
