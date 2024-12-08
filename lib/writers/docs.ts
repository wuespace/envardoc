import type { Variable } from "$ast";
import type { Writer } from "$writers";

/**
 * A writer that writes the AST to a markdown file.
 */
export class DocsWriter implements Writer {
  constructor() {}

  writeHeader(prev: string): string {
    return `${prev}# Configuration Environment Variables\n\n`;
  }

  writeSection(section: string, prev: string): string {
    return `${prev}\n## ${section}\n`;
  }

  writeDescriptionLine(line: string, prev: string): string {
    return `${prev}${line}\n`;
  }

  writeVariable(variable: Variable, prev: string): string {
    // Heading
    prev += `\n### \`${variable.name}\`\n\n`;

    // Description
    variable.description?.split("\n").slice(0, -1).forEach((line) => {
      prev = this.writeDescriptionLine(line, prev);
    });

    if ((variable.description?.split("\n").length ?? 0) > 1) {
      // Add a new line after the description
      prev += "\n";
    }

    // Default value
    prev += this.markdownCodeBlock(`${variable.name}=${variable.defaultValue}`);

    // Example values
    if (!variable.examples.length) {
      return prev;
    }

    prev += `\n#### Other Examples\n\n`;
    prev += variable.examples.map((example) => {
      return this.markdownCodeBlock(`${variable.name}=${example}`);
    }).join("\n");

    return prev;
  }

  private markdownCodeBlock(code: string, lang = "env"): string {
    return `\`\`\`${lang}\n${code}\n\`\`\`\n`;
  }
}
