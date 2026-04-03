import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogoBase64 } from "./logoBase64";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}

/**
 * Modern minimalist PDF header — small logo, clean typography, neutral tones.
 */
export async function createPDFHeader(doc: jsPDF, title: string, subtitle: string) {
  const logoBase64 = await getLogoBase64();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Subtle top bar
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, pageWidth, 32, "F");

  // Thin accent line
  doc.setFillColor(180, 60, 50);
  doc.rect(0, 32, pageWidth, 0.8, "F");

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", 14, 6, 18, 18, undefined, "FAST");
    } catch {
      // continue without logo
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  doc.text("Lost Wind Churrasqueira", 36, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(title, 36, 21);

  doc.setFontSize(7.5);
  doc.setTextColor(160, 160, 160);
  doc.text(
    `${subtitle}  ·  Gerado em ${new Date().toLocaleDateString("pt-PT")} às ${new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`,
    36,
    27
  );

  doc.setTextColor(40, 40, 40);
  return 42;
}

export function runPDFTable(doc: jsPDF, options: Parameters<typeof autoTable>[1]) {
  autoTable(doc, options);
  return Number(doc.lastAutoTable?.finalY ?? options.startY ?? 20);
}

export function downloadPDF(doc: jsPDF, filename: string) {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function addPDFFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Subtle line
    doc.setDrawColor(220, 220, 220);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFontSize(7);
    doc.setTextColor(170, 170, 170);
    doc.text("Lost Wind Churrasqueira — Documento gerado automaticamente", 14, pageHeight - 8);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 8, { align: "right" });
  }
}

/** Adds a section title in the PDF */
export function addPDFSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(title, 14, y);
  // Underline
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y + 1.5, 80, y + 1.5);
  return y + 6;
}

/** Standard table styles for a clean, modern look */
export const modernTableStyles = {
  headStyles: {
    fillColor: [60, 60, 60] as [number, number, number],
    fontSize: 7.5,
    fontStyle: "bold" as const,
    textColor: [255, 255, 255] as [number, number, number],
    cellPadding: 3,
  },
  bodyStyles: {
    fontSize: 7.5,
    textColor: [50, 50, 50] as [number, number, number],
    cellPadding: 2.5,
  },
  alternateRowStyles: {
    fillColor: [248, 248, 248] as [number, number, number],
  },
  styles: {
    lineColor: [230, 230, 230] as [number, number, number],
    lineWidth: 0.3,
  },
  margin: { left: 14, right: 14 },
};
