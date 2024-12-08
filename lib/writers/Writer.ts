import { Variable } from "$ast";

/**
 * Interface for writing an {@link EnvFileAST} to a `string`.
 */
/**
 * Interface representing a writer that can write various parts of a file.
 */
export interface Writer {
  /**
   * Writes the header of the file.
   * @param prev The previous line.
   * @returns The resulting `string`.
   */
  writeHeader?(prev: string): string;

  /**
   * Writes a line of a description and adds it to the file.
   * @param line The line to write.
   * @param prev The previous line.
   * @returns The resulting `string`.
   */
  writeDescriptionLine?(line: string, prev: string): string;

  /**
   * Writes a variable and adds it to the file.
   * @param variable The variable to write.
   * @param prev The previous line.
   * @returns The resulting `string`.
   */
  writeVariable?(variable: Variable, prev: string): string;

  /**
   * Writes a section header and adds it to the file.
   * @param section The section to write.
   * @param prev The previous line.
   * @returns The resulting `string`.
   */
  writeSection?(section: string, prev: string): string;

  /**
   * Writes the footer of the file.
   * @param prev The previous line.
   * @returns The resulting `string`.
   */
  writeFooter?(prev: string): string;
}
