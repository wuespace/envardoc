import type { Variable } from "$ast";

/**
 * Represents a section in the `.env` file.
 *
 * A section is a group of variables that are related to each other.
 *
 * Sections look like this:
 *
 * ```env
 * # Section name
 * #
 * # Description of Variable A
 * VARIABLE_A=value
 * # ...
 *
 * # Section name 2
 * #
 * # ...
 * ```
 */
export interface Section {
  /**
   * The name of the section.
   */
  name: string;
  /**
   * The variables contained in the section.
   */
  variables: Record<string, Variable>;
}
