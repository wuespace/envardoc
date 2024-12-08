import type { Variable } from "$ast";
import type { Writer } from "$writers";

/**
 * A writer that writes the AST to an example environment file.
 */
export class EnvExampleWriter implements Writer {
  constructor() {}

  writeSection(section: string, prev: string): string {
    return `${prev}\n# ${section}\n`;
  }

  writeDescriptionLine(line: string, prev: string): string {
    return `${prev}# ${line}\n`;
  }

  writeVariable(variable: Variable, prev: string): string {
    variable.description?.split("\n").slice(0, -1).forEach((line) => {
      prev += `# ${line}\n`;
    });
    // Variable name and default value
    if (variable.optional) {
      prev += "# ";
    }
    prev += `${variable.name}=${variable.defaultValue}\n`;
    // Additional examples
    variable.examples.forEach((example) => {
      prev += `# ${variable.name}=${example}\n`;
    });
    return prev;
  }
}
