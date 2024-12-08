import { getLogger, type Logger } from "@std/log";
import type { Section } from "$ast";
import type { Writer } from "$writers";

export class EnvFileAST {
  /**
   * The top-level description of the file.
   */
  public topLevelDescription: string = "";
  /**
   * The sections of the file, indexed by their names.
   */
  public readonly sections: Record<string, Section> = {};

  private currentSection: string = "Other";
  private pendingDescription: string = "";

  private readonly logger: Logger;

  constructor() {
    this.logger = getLogger("EnvExampleAST");
    this.registerSection(); // Start with a default section
  }

  /**
   * Registers the beginning of a new section with the given name.
   * @param section the name of the section to register. If not provided, the section will be named "Other".
   */
  registerSection(section?: string): void {
    this.logger.debug("registerSection", section);
    this.currentSection = section ?? "Other";
    if (this.pendingDescription) {
      this.logger.debug(
        "registering pending description as top level description",
        this.pendingDescription,
      );
      this.topLevelDescription = this.pendingDescription;
      this.pendingDescription = "";
    }
  }

  /**
   * Registers a variable with the given name, optional status, and value for the current section.
   * @param variable the variable name
   * @param optional whether the variable is optional (`true` if the variable is commented out)
   * @param value the value of the variable
   */
  registerVariable(variable: string, optional = false, value?: string): void {
    this.logger.debug("registerVariable", { variable, optional, value });
    if (!this.sections[this.currentSection]) {
      this.logger.debug("creating new section", this.currentSection);
      this.sections[this.currentSection] = {
        name: this.currentSection,
        variables: {},
      };
    }
    if (!this.sections[this.currentSection].variables[variable]) {
      this.logger.debug("creating new variable", variable);
      this.sections[this.currentSection].variables[variable] = {
        name: variable,
        optional,
        description: this.pendingDescription,
        defaultValue: value,
        examples: [],
      };
    } else {
      this.logger.debug(
        "updating existing variable with new examples",
        variable,
      );
      const currentVariableDetails =
        this.sections[this.currentSection].variables[variable];
      this.sections[this.currentSection].variables[variable] = {
        ...currentVariableDetails,
        optional: currentVariableDetails.optional && optional,
        examples: currentVariableDetails.examples.concat(value || []),
      };
    }

    this.pendingDescription = "";
  }

  /**
   * Registers a line of a description for the next variable (or, at the top of the file, for the file itself).
   * @param description the description to register
   */
  registerDescription(description: string): void {
    this.logger.debug("registerDescription", description);
    this.pendingDescription += description + "\n";
  }

  /**
   * Writes the AST to a string using the provided writer.
   *
   * Sections and their variables are written in hierarchically alphabetical order.
   * @param writer the writer to use
   * @returns the string representation of the AST, as written by the writer
   */
  write(writer: Writer): string {
    this.logger.debug("write");
    let output = writer.writeHeader?.("") || "";

    if (this.topLevelDescription) {
      this.topLevelDescription.split("\n").forEach((line, index, array) => {
        if (index === array.length - 1) {
          return; // omit the last (empty) line
        }
        output = writer.writeDescriptionLine?.(line, output) || output;
      });
    }

    for (const sectionName of Object.keys(this.sections).toSorted()) {
      output = writer.writeSection?.(sectionName, output) || output;

      const section = this.sections[sectionName];

      for (const variableName of Object.keys(section.variables).toSorted()) {
        const variable = section.variables[variableName];
        output = writer.writeVariable?.(variable, output) || output;
      }
    }
    return output;
  }
}
