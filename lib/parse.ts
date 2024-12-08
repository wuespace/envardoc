import { EnvFileAST } from "$ast";

/**
 * Parse the content of an env file and populates the AST
 * @param content the content of the env file
 * @param ast the AST to populate
 */
export function parse(
  content: string,
  ast: EnvFileAST = new EnvFileAST(),
): EnvFileAST {
  const lines = content
    .split("\r\n")
    .join("\n")
    .split("\n");

  let newSectionFlag = false;

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i].trim();

    // Sections
    if (currentLine === "") {
      // empty line => next block will be a new section
      newSectionFlag = true;
      continue;
    }
    const hasNextLine = i + 1 < lines.length;
    const nextLine = hasNextLine ? lines[i + 1].trim() : "";
    const emptyNextLine = nextLine === "#";
    if (newSectionFlag && emptyNextLine) {
      // Proper section heading
      ast.registerSection(currentLine.slice(2));
      newSectionFlag = false;
      continue;
    }
    if (newSectionFlag) {
      // We have a block of "sectionless" variables
      newSectionFlag = false;
      ast.registerSection("Other");
      continue;
    }

    // Variables
    if (currentLine.match(/^[a-zA-Z_]+[a-zA-Z0-9_]*=.*$/g)) {
      // Variable definition that's not commented out
      const [variable, value] = currentLine.split("=", 2);
      const optional = false; // Didn't begin with a comment
      ast.registerVariable(variable, optional, value);
      continue;
    }
    if (currentLine.match(/^# [a-zA-Z_]+[a-zA-Z0-9_]*=.*$/g)) {
      // Variable definition that's commented out
      const [variable, value] = currentLine.split("=", 2);
      const optional = true; // Didn't begin with a comment
      ast.registerVariable(variable.slice(2), optional, value);
      continue;
    }

    // Descriptions
    if (currentLine.startsWith("#")) {
      // A comment that isn't a variable definition is a description
      ast.registerDescription(currentLine.slice(1).trim());
      continue;
    }
  }

  return ast;
}
