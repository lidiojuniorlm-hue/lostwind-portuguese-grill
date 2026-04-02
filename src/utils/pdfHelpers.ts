import jsPDF from "jspdf";
import "jspdf-autotable";
import { getLogoBase64 } from "./logoBase64";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

export async function createPDFHeader(doc: jsPDF, title: string, subtitle: string) {
  const logoBase64 = await getLogoBase64();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageWidth, 38, "F");

  // Logo
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 14, 6, 26, 26, undefined, "FAST");
  }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("Lost Wind Churrasqueira", 46, 16);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text(title, 46, 23);

  // Date
  doc.setFontSize(8);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-PT")} às ${new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`, 46, 29);

  // Subtitle bar
  doc.setFillColor(196, 57, 43);
  doc.rect(0, 38, pageWidth, 6, "F");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(subtitle, pageWidth / 2, 42.5, { align: "center" });

  // Reset
  doc.setTextColor(30, 30, 30);
  return 52;
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
