import { App, TFile, CachedMetadata, getAllTags } from 'obsidian';
import { TrainerSettings, ParsedNote, NoteChunk } from './types';

export class NoteParser {
  constructor(private app: App) {}

  scanVault(settings: TrainerSettings): TFile[] {
    const allFiles = this.app.vault.getMarkdownFiles();
    const hasFolderFilter = settings.scanFolders.length > 0;
    const hasTagFilter = settings.scanTags.length > 0;

    // If no filters configured, return all markdown files
    if (!hasFolderFilter && !hasTagFilter) {
      return allFiles;
    }

    const matchedFiles: TFile[] = [];

    for (const file of allFiles) {
      let matches = false;

      // Check folder filter
      if (hasFolderFilter) {
        for (const folder of settings.scanFolders) {
          const normalizedFolder = folder.endsWith('/') ? folder : folder + '/';
          if (file.path.startsWith(normalizedFolder) || file.path.startsWith(folder)) {
            matches = true;
            break;
          }
        }
      }

      // Check tag filter
      if (!matches && hasTagFilter) {
        const cache: CachedMetadata | null = this.app.metadataCache.getFileCache(file);
        if (cache) {
          const fileTags = getAllTags(cache);
          if (fileTags) {
            for (const tag of fileTags) {
              // Tags from getAllTags come with # prefix, e.g. "#study"
              const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
              if (settings.scanTags.includes(cleanTag)) {
                matches = true;
                break;
              }
            }
          }
        }
      }

      if (matches) {
        matchedFiles.push(file);
      }
    }

    return matchedFiles;
  }

  async parseNote(file: TFile): Promise<ParsedNote> {
    const content = await this.app.vault.cachedRead(file);
    const title = file.basename;

    // Extract headings from lines starting with #
    const headings: string[] = [];
    const lines = content.split('\n');
    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        headings.push(headingMatch[2].trim());
      }
    }

    const hash = this.computeHash(content);

    return {
      path: file.path,
      title,
      headings,
      content,
      hash,
    };
  }

  chunkByHeadings(note: ParsedNote): NoteChunk[] {
    const lines = note.content.split('\n');
    const chunks: NoteChunk[] = [];

    // Find all h2 heading positions
    const h2Positions: { index: number; heading: string }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^##\s+(.+)$/);
      if (match) {
        h2Positions.push({ index: i, heading: match[1].trim() });
      }
    }

    // If no h2 headings, return entire content as one chunk
    if (h2Positions.length === 0) {
      const cleanedContent = this.stripHtmlTags(note.content);
      if (cleanedContent.trim().length > 0) {
        chunks.push({
          noteTitle: note.title,
          notePath: note.path,
          heading: note.title,
          content: cleanedContent,
        });
      }
      return chunks;
    }

    // Content before the first h2 heading
    if (h2Positions[0].index > 0) {
      const preContent = lines.slice(0, h2Positions[0].index).join('\n');
      const cleanedPreContent = this.stripHtmlTags(preContent);
      if (cleanedPreContent.trim().length > 0) {
        chunks.push({
          noteTitle: note.title,
          notePath: note.path,
          heading: note.title,
          content: cleanedPreContent,
        });
      }
    }

    // Each h2 section
    for (let i = 0; i < h2Positions.length; i++) {
      const startLine = h2Positions[i].index;
      const endLine = i + 1 < h2Positions.length ? h2Positions[i + 1].index : lines.length;
      const sectionLines = lines.slice(startLine + 1, endLine);
      const sectionContent = sectionLines.join('\n');
      const cleanedContent = this.stripHtmlTags(sectionContent);

      if (cleanedContent.trim().length > 0) {
        chunks.push({
          noteTitle: note.title,
          notePath: note.path,
          heading: h2Positions[i].heading,
          content: cleanedContent,
        });
      }
    }

    return chunks;
  }

  private stripHtmlTags(text: string): string {
    // Remove common HTML tags like <aside>, </aside>, <div>, etc.
    return text.replace(/<\/?[^>]+(>|$)/g, '');
  }

  private computeHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash | 0; // Convert to 32-bit integer
    }
    // Convert to unsigned hex string
    return (hash >>> 0).toString(16);
  }
}
