export interface TextChunk {
  text: string;
  chunkNumber: number;
  startIndex: number;
  endIndex: number;
  tokenCount: number;
  pageNumber?: number;
}

export class ChunkingService {
  /**
   * Normalize input text (removes weird spaces, ensures consistent breaks).
   */
  private static normalizeText(text: string): string {
    if (!text) return "";
    return text
      .replace(/\u00A0/g, " ") // non-breaking space → normal space
      .replace(/\s+/g, " ") // collapse multiple spaces
      .trim();
  }

  /**
   * Word-based chunking with overlap.
   */
  static chunkText(
    rawText: string,
    chunkSize: number = 500,
    overlap: number = 50
  ): TextChunk[] {
    const text = this.normalizeText(rawText);
    const chunks: TextChunk[] = [];

    if (text.length === 0) {
      return [];
    }

    const words = text.split(" ").filter(Boolean);
    if (words.length === 0) {
      // fallback: push entire text as one chunk
      return [
        {
          text,
          chunkNumber: 0,
          startIndex: 0,
          endIndex: text.length,
          tokenCount: text.split(" ").length,
        },
      ];
    }

    let chunkNumber = 0;
    let startIndex = 0;

    while (startIndex < words.length) {
      const endIndex = Math.min(startIndex + chunkSize, words.length);
      const chunkWords = words.slice(startIndex, endIndex);
      const chunkText = chunkWords.join(" ").trim();

      if (chunkText.length > 0) {
        chunks.push({
          text: chunkText,
          chunkNumber: chunkNumber++,
          startIndex,
          endIndex,
          tokenCount: chunkWords.length,
        });
      }

      if (endIndex === words.length) break; // done
      startIndex = Math.max(0, endIndex - overlap);
    }

    return chunks;
  }

  /**
   * Sentence-based chunking with overlap.
   */
  static chunkBySentences(
    rawText: string,
    sentencesPerChunk: number = 5,
    overlapSentences: number = 1
  ): TextChunk[] {
    const text = this.normalizeText(rawText);
    const chunks: TextChunk[] = [];

    if (text.length === 0) {
      return [];
    }

    const sentences = text
      .split(/(?<=[.!?])\s+/) // split on punctuation followed by space
      .filter((s) => s.trim().length > 0);

    if (sentences.length === 0) {
      return [
        {
          text,
          chunkNumber: 0,
          startIndex: 0,
          endIndex: text.length,
          tokenCount: text.split(" ").length,
        },
      ];
    }

    let chunkNumber = 0;
    let startIndex = 0;

    while (startIndex < sentences.length) {
      const endIndex = Math.min(
        startIndex + sentencesPerChunk,
        sentences.length
      );
      const chunkSentences = sentences.slice(startIndex, endIndex);
      const chunkText = chunkSentences.join(" ").trim();

      chunks.push({
        text: chunkText,
        chunkNumber: chunkNumber++,
        startIndex,
        endIndex,
        tokenCount: chunkText.split(" ").length,
      });

      if (endIndex === sentences.length) break;
      startIndex = Math.max(0, endIndex - overlapSentences);
    }

    return chunks;
  }
}
