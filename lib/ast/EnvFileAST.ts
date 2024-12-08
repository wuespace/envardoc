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
        // if any occurrance is required, the variable is required:
        optional: currentVariableDetails.optional && optional,
        // any 2nd+ variable occurrance serves as an example (the first is the default value):
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

    output = this.writeTopLevelDescription(output, writer);
    output = this.writeSections(output, writer);

    return output;
  }

  /**
   * Writes documentation about the registered sections and their variables.
   * @param output the existing output
   * @param writer the writer to use
   * @returns the output including the sections' details
   */
  private writeSections(output: string, writer: Writer) {
    const sortedSectionNames = Object.keys(this.sections).toSorted();

    for (const sectionName of sortedSectionNames) {
      // Section Header
      output = writer.writeSection?.(sectionName, output) ?? output;
      // Variables
      const section = this.sections[sectionName];
      output = this.writeVariables(section, output, writer);
    }

    return output;
  }

  /**
   * Writes the documentation for the variables in the given section.
   * @param section the section to document
   * @param output the pre-existing output
   * @param writer the writer to use
   * @returns the output including the section's variables
   */
  private writeVariables(
    section: Section,
    output: string,
    writer: Writer,
  ) {
    const sortedEnvVarKeys = Object.keys(section.variables).toSorted();

    for (const variableName of sortedEnvVarKeys) {
      const variable = section.variables[variableName];
      output = writer.writeVariable?.(variable, output) ?? output;
    }

    return output;
  }

  /**
   * Writes the top-level description of the file. If there is no description, the output is returned unchanged.
   * @param output the pre-existing output
   * @param writer the writer to use
   * @returns the output including the top-level description
   */
  private writeTopLevelDescription(output: string, writer: Writer) {
    if (!this.topLevelDescription) {
      return output;
    }

    const lines = this.topLevelDescription
      .trimEnd() // Remove trailing newline
      .split("\n"); // Split into lines

    for (const line of lines) {
      output = writer.writeDescriptionLine?.(line, output) ?? output;
    }

    return output;
  }
}
