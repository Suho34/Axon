import PDFParser from "pdf2json";

/**
 * Interfaces remain unchanged...
 */
export interface PDFMetadata {
  Title?: string;
  Author?: string;
  Subject?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
}

export interface ExtractedPage {
  number: number;
  text: string;
}

export interface TextExtractionResult {
  pages: ExtractedPage[];
  pageCount: number;
  metadata: PDFMetadata;
  fullText: string;
}

interface TextRun {
  T?: string;
}
interface TextBlock {
  x: number;
  y: number;
  R?: TextRun[];
}
interface PDFPage {
  Texts?: TextBlock[];
}
interface PDFData {
  Pages?: PDFPage[];
  Meta?: PDFMetadata;
}
interface PDFParserError {
  parserError: Error;
}

export class TextExtractor {
  static extractTextFromBuffer(buffer: Buffer): Promise<TextExtractionResult> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (error: PDFParserError) => {
        reject(new Error(`PDF parsing error: ${error.parserError.message}`));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: PDFData) => {
        try {
          const pageCount = pdfData.Pages?.length || 0;
          console.log("✅ Parsed PDF with pages:", pageCount);

          const pages: ExtractedPage[] = [];
          let fullText = "";

          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            pdfData.Pages.forEach((page, index) => {
              let pageText = "";
              let lastY = -9999;

              if (page.Texts && Array.isArray(page.Texts)) {
                console.log(
                  `🔎 Page ${index + 1} text blocks:`,
                  page.Texts.length
                );

                // Sort to preserve reading order
                const sortedTexts = page.Texts.sort((a, b) => {
                  if (a.y !== b.y) return a.y - b.y;
                  return a.x - b.x;
                });

                sortedTexts.forEach((textItem) => {
                  if (textItem.R && Array.isArray(textItem.R)) {
                    // Insert newline if y difference is large (new line detected)
                    if (Math.abs(textItem.y - lastY) > 2) {
                      pageText += "\n";
                    }
                    lastY = textItem.y;

                    textItem.R.forEach((r) => {
                      if (r.T) {
                        try {
                          const decoded = decodeURIComponent(r.T);
                          pageText += decoded + " ";
                        } catch (e) {
                          console.warn("⚠️ Failed to decode text run:", r.T);
                          pageText += r.T + " ";
                        }
                      }
                    });
                  }
                });
              } else {
                console.warn(`⚠️ No text found on page ${index + 1}`);
              }

              const cleanedText = pageText.trim().replace(/\s+/g, " ");
              console.log(
                `📄 Page ${index + 1} extracted text (first 200 chars):`,
                cleanedText.slice(0, 200)
              );

              pages.push({
                number: index + 1,
                text: cleanedText,
              });
              fullText += cleanedText + "\n\n";
            });
          }

          const metadata: PDFMetadata = {
            Title: pdfData.Meta?.Title,
            Author: pdfData.Meta?.Author,
            Subject: pdfData.Meta?.Subject,
            Creator: pdfData.Meta?.Creator,
            Producer: pdfData.Meta?.Producer,
            CreationDate: pdfData.Meta?.CreationDate,
            ModDate: pdfData.Meta?.ModDate,
          };

          console.log("📝 Final fullText length:", fullText.length);
          console.log("📝 Metadata:", metadata);

          resolve({
            pages,
            pageCount,
            metadata,
            fullText: fullText.trim(),
          });
        } catch (error) {
          reject(
            new Error(
              `Failed to process PDF data: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
        }
      });

      console.log(
        "📦 Buffer type:",
        Buffer.isBuffer(buffer),
        "size:",
        buffer.length
      );
      pdfParser.parseBuffer(buffer);
    });
  }
}
