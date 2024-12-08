/**
 * Represents a variable in the `.env` file.
 */
export interface Variable {
  /**
   * The name of the variable.
   */
  name: string;
  /**
   * Whether the variable is optional.
   *
   * A variable is considered optional if all occurrances in the `.env` file are commented out.
   */
  optional: boolean;
  /**
   * The default value of the variable.
   *
   * The first value found in the `.env` file is used as the default value.
   */
  defaultValue?: string;
  /**
   * The description of the variable.
   *
   * Any comments found in the `.env` file above the variable are used as the description.
   */
  description?: string;
  /**
   * Further example values for the variable.
   *
   * Further values found in the `.env` file are used as examples. This does not include the default value.
   */
  examples: string[];
}
