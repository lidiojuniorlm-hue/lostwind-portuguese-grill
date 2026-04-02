import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogoBase64 } from "./logoBase64";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}

export async function createPDFHeader(doc: jsPDF, title: string, subtitle: string) {
  const logoBase64 = await getLogoBase64();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageWidth, 38, "F");

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", 14, 6, 26, 26, undefined, "FAST");
    } catch {
      // Keep PDF generation working even if the logo cannot be embedded.
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("Lost Wind Churrasqueira", 46, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text(title, 46, 23);

  doc.setFontSize(8);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-PT")} às ${new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`, 46, 29);

  doc.setFillColor(196, 57, 43);
  doc.rect(0, 38, pageWidth, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(subtitle, pageWidth / 2, 42.5, { align: "center" });

  doc.setTextColor(30, 30, 30);
  return 52;
}

export function runPDFTable(doc: jsPDF, options: Parameters<typeof autoTable>[1]) {
  autoTable(doc, options);
  return doc.lastAutoTable?.finalY ?? options.startY ?? 20;
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
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Lost Wind Churrasqueira — Documento gerado automaticamente`, 14, pageHeight - 8);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 8, { align: "right" });
  }
}
