import { jsPDF, GState } from 'jspdf';
import { CaseBrief, FIRM_DETAILS, PRACTICE_AREAS } from '../data/firmData';
import { formatCaseBriefForPrint } from './printFriendly';

export interface CaseBriefPdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  dateFormatted: string;
  dateIso: string;
  watermarkLabel: string;
  docRef: string;
}

export interface GeneratedCaseBriefPdfResult {
  fileName: string;
  metadata: CaseBriefPdfMetadata;
}

/**
 * Resolves the Lead Partner / Author for a given CaseBrief from firm practice portfolios.
 */
function resolveAuthorForBrief(brief: CaseBrief): string {
  const practice = PRACTICE_AREAS.find((p) => p.id === brief.practiceAreaId);
  if (practice?.leadAdvocate) {
    return `${practice.leadAdvocate} — ${FIRM_DETAILS.name}`;
  }
  return `Milton Angwenyi, SC — ${FIRM_DETAILS.name}`;
}

/**
 * Generates clean, deterministic PDF metadata (Title, Author, Date, Subject, Keywords)
 * for embedded Adobe / OS PDF Document Properties and printed stationery records.
 */
export function buildCaseBriefPdfMetadata(
  brief: CaseBrief,
  docRef: string,
  issuedAt: Date = new Date()
): CaseBriefPdfMetadata {
  const dateFormatted = issuedAt.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const dateIso = issuedAt.toISOString();
  const title = `${brief.matterName} (${brief.year}) — ${docRef}`;
  const author = resolveAuthorForBrief(brief);
  const subject = `Landmark Judicial Precedent Brief · ${brief.forum} · ${brief.clientCategory}`;
  const keywords = [
    FIRM_DETAILS.shortName,
    'Kenyan Jurisprudence',
    brief.forum,
    String(brief.year),
    brief.practiceAreaId,
    docRef,
  ].join(', ');

  return {
    title,
    author,
    subject,
    keywords,
    creator: `${FIRM_DETAILS.name} (${FIRM_DETAILS.lskRoll})`,
    dateFormatted,
    dateIso,
    watermarkLabel: `${FIRM_DETAILS.name.toUpperCase()} · PRIVILEGED PRECEDENT BRIEF`,
    docRef,
  };
}

/**
 * Renders the firm cotton-stationery diagonal watermark and chambers seal emblem
 * onto the currently selected jsPDF page without obstructing legibility.
 */
function applyFirmWatermark(doc: jsPDF, pageWidth: number, pageHeight: number) {
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  doc.saveGraphicsState();

  // Subtle chambers circular seal rings
  doc.setGState(new GState({ opacity: 0.05 }));
  doc.setDrawColor(140, 107, 50);
  doc.setLineWidth(0.75);
  doc.circle(centerX, centerY, 48, 'S');
  doc.setLineWidth(0.3);
  doc.circle(centerX, centerY, 43.5, 'S');

  // Primary diagonal firm watermark
  doc.setGState(new GState({ opacity: 0.068 }));
  doc.setFont('times', 'bold');
  doc.setFontSize(23);
  doc.setTextColor(140, 107, 50);
  doc.text('PETERSONS ANGWENYI & ASSOCIATES', centerX, centerY - 2, {
    align: 'center',
    angle: 38,
  });

  // Secondary sub-caption watermark offset neatly below the diagonal axis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'ADVOCATES OF THE HIGH COURT OF KENYA  ·  NAIROBI CHAMBERS',
    centerX + 5,
    centerY + 7,
    {
      align: 'center',
      angle: 38,
    }
  );

  doc.restoreGraphicsState();
}

/**
 * Generates and downloads a formatted A4 PDF document for the given landmark CaseBrief
 * styled after Petersons Angwenyi & Associates Advocates' formal chambers stationery,
 * complete with auto-generated PDF metadata (Title, Author, Date) and firm watermark.
 */
export function downloadCaseBriefPdf(brief: CaseBrief): GeneratedCaseBriefPdfResult {
  const formatted = formatCaseBriefForPrint(brief);
  const issuedAt = new Date();
  const metadata = buildCaseBriefPdfMetadata(brief, formatted.meta.docRef, issuedAt);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Embed formal PDF document properties & creation timestamp
  doc.setProperties({
    title: metadata.title,
    subject: metadata.subject,
    author: metadata.author,
    keywords: metadata.keywords,
    creator: metadata.creator,
  });
  doc.setCreationDate(issuedAt);

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2;
  let cursorY = 18;

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 24) {
      doc.addPage();
      cursorY = 20;
    }
  };

  // --- Top Gold Accent Bar ---
  doc.setFillColor(197, 168, 128); // #C5A880 Gold
  doc.rect(0, 0, pageWidth, 3.2, 'F');

  // --- Chambers Stationery Letterhead ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(140, 107, 50); // Institutional Dark Gold
  doc.text(
    'ADVOCATES  ·  COMMISSIONERS FOR OATHS  ·  NOTARIES PUBLIC',
    pageWidth / 2,
    cursorY,
    { align: 'center' }
  );
  cursorY += 6.5;

  doc.setFont('times', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42); // Slate 950
  doc.text(FIRM_DETAILS.name.toUpperCase(), pageWidth / 2, cursorY, {
    align: 'center',
  });
  cursorY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `${formatted.firmDetails.chambers} · ${formatted.firmDetails.address}`,
    pageWidth / 2,
    cursorY,
    { align: 'center' }
  );
  cursorY += 4.2;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Tel: ${formatted.firmDetails.telephone} · Email: ${formatted.firmDetails.email} · ${formatted.firmDetails.lskRef}`,
    pageWidth / 2,
    cursorY,
    { align: 'center' }
  );
  cursorY += 4.5;

  // Double Stationery Divider Rule (Dark Slate + Hairline Gold)
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.7);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  doc.setDrawColor(197, 168, 128);
  doc.setLineWidth(0.3);
  doc.line(marginX, cursorY + 1.4, pageWidth - marginX, cursorY + 1.4);
  cursorY += 7.5;

  // --- Auto-Generated Document Metadata Grid Box (2 rows x 3 cols) ---
  const boxHeight = 32;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, cursorY, contentWidth, boxHeight, 1.5, 1.5, 'FD');

  const colWidth = contentWidth / 3;
  const metaRows: Array<Array<[string, string]>> = [
    [
      ['DOCUMENT TITLE', `${brief.matterName}`],
      ['AUTHOR / LEAD COUNSEL', metadata.author.split(' — ')[0]],
      ['DATE ISSUED', metadata.dateFormatted],
    ],
    [
      ['DOCUMENT REF', formatted.meta.docRef],
      ['CLIENT SECTOR', brief.clientCategory],
      ['MATTER EXPOSURE', brief.value],
    ],
  ];

  metaRows.forEach((row, rowIdx) => {
    const baseY = cursorY + (rowIdx === 0 ? 5.5 : 19.5);
    row.forEach(([label, val], colIdx) => {
      const colX = marginX + colIdx * colWidth + 3.5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.6);
      doc.setTextColor(100, 116, 139);
      doc.text(label, colX, baseY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(15, 23, 42);
      const wrappedVal = doc.splitTextToSize(val, colWidth - 6);
      doc.text(wrappedVal.slice(0, 2), colX, baseY + 4.3);
    });
  });

  // Subtle horizontal divider inside metadata grid
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(marginX + 3, cursorY + 15.5, pageWidth - marginX - 3, cursorY + 15.5);

  cursorY += boxHeight + 8;

  // --- Document Type Kicker & Landmark Case Heading ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(140, 107, 50);
  doc.text('LANDMARK JUDICIAL PRECEDENT & CASE BRIEF', marginX, cursorY);
  cursorY += 6;

  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(brief.matterName, contentWidth);
  doc.text(titleLines, marginX, cursorY);
  cursorY += titleLines.length * 6 + 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const subtitleLines = doc.splitTextToSize(
    `${brief.forum} · Precedent Year ${brief.year} · ${formatted.meta.citation}`,
    contentWidth
  );
  doc.text(subtitleLines, marginX, cursorY);
  cursorY += subtitleLines.length * 4.5 + 6;

  // --- Structured Legal Briefing Sections ---
  formatted.sections.forEach((section) => {
    const paragraphs = Array.isArray(section.content)
      ? section.content
      : section.content.split('\n').filter(Boolean);

    const measuredLines = paragraphs.map((p) =>
      doc.splitTextToSize(p, section.isHighlight ? contentWidth - 10 : contentWidth)
    );
    const totalTextLines = measuredLines.reduce((sum, arr) => sum + arr.length, 0);
    const blockHeight = 8 + totalTextLines * 4.8 + paragraphs.length * 2.5 + 6;

    ensureSpace(blockHeight);

    if (section.isHighlight) {
      // Gold Accent Callout Panel for Judicial Determination & Impact
      doc.setFillColor(253, 250, 243);
      doc.setDrawColor(235, 222, 198);
      doc.setLineWidth(0.3);
      doc.rect(marginX, cursorY - 2, contentWidth, blockHeight - 2, 'FD');
      doc.setFillColor(197, 168, 128);
      doc.rect(marginX, cursorY - 2, 1.8, blockHeight - 2, 'F');
    }

    const textX = section.isHighlight ? marginX + 5.5 : marginX;

    if (section.heading) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(
        section.isHighlight ? 140 : 15,
        section.isHighlight ? 107 : 23,
        section.isHighlight ? 50 : 42
      );
      doc.text(section.heading, textX, cursorY + 3);
      cursorY += 7.5;
    }

    doc.setFont('times', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);

    measuredLines.forEach((lines) => {
      doc.text(lines, textX, cursorY);
      cursorY += lines.length * 4.8 + 2.2;
    });

    cursorY += section.isHighlight ? 6 : 4;
  });

  // --- Statutory Basis Box ---
  if (formatted.statutoryBasis && formatted.statutoryBasis.length > 0) {
    ensureSpace(28);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
    cursorY += 5.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('GOVERNING STATUTORY FRAMEWORK & KENYAN CITATIONS', marginX, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    formatted.statutoryBasis.forEach((statute) => {
      doc.text(`•  ${statute}`, marginX + 2, cursorY);
      cursorY += 4.3;
    });
    cursorY += 4;
  }

  // --- Formal Senior Counsel Signatory & Privilege Disclaimer ---
  ensureSpace(30);
  doc.setDrawColor(197, 168, 128);
  doc.setLineWidth(0.4);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CERTIFIED CHAMBERS EXTRACT — LITIGATION & ARBITRATION DIVISION', marginX, cursorY);
  cursorY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(formatted.firmDetails.rollNumber, marginX, cursorY);
  cursorY += 5.5;

  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const disclaimer = doc.splitTextToSize(
    'Privilege & Confidentiality Notice: Issued for institutional reference from the Law Reports archive of Petersons Angwenyi & Associates Advocates. Protected under Section 134 of the Evidence Act (Cap 80, Laws of Kenya).',
    contentWidth
  );
  doc.text(disclaimer, marginX, cursorY);

  // --- Apply Firm Watermark & Footer Stamp Across Every Page ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    applyFirmWatermark(doc, pageWidth, pageHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${FIRM_DETAILS.name} · ${formatted.meta.docRef} · ${metadata.dateFormatted}`,
      marginX,
      pageHeight - 10
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 10, {
      align: 'right',
    });
  }

  const safeSlug = brief.id.replace(/[^a-z0-9-_]/gi, '_').toUpperCase();
  const fileName = `PAA_Case_Brief_${brief.year}_${safeSlug}.pdf`;
  doc.save(fileName);

  return { fileName, metadata };
}
