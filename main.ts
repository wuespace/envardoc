import { parse } from "$parse";
import {
  DocsWriter,
  EnvarWriter,
  EnvExampleWriter,
  type Writer,
} from "$writers";
import { Command } from "@cliffy/command";
import { exists } from "@std/fs";
import { resolve } from "@std/path";
import metadata from "./deno.json" with { type: "json" };

if (import.meta.main) {
  const docs = new Command()
    .arguments("<path:file>")
    .description("Generate documentation from .env files")
    .option("-o, --output <path:string>", "Output file path")
    .action(async ({ output }, path) => {
      const markdown = await parseAndConvert(
        path,
        new DocsWriter(),
      );
      if (output) {
        await Deno.writeTextFile(output, markdown);
        console.log(`File written: ${output}`);
      } else {
        console.log(markdown);
      }
    });

  const envar = new Command()
    .arguments("<path:file>")
    .description("Generate jsr:@wuespace/envar source code from a .env file")
    .option("-o, --output <path:string>", "Output file path")
    .action(async ({ output }, path) => {
      const sourceCode = await parseAndConvert(
        path,
        new EnvarWriter(),
      );
      if (output) {
        await Deno.writeTextFile(output, sourceCode);
        console.log(`File written: ${output}`);
      } else {
        console.log(sourceCode);
      }
    });

  const envExample = new Command()
    .arguments("<path:string>")
    .description("Generate example .env file")
    .option("-r, --replace", "Replace existing .env file")
    .option("-o, --output <path:string>", "Output file path")
    .action(async ({ replace, output }, path: string) => {
      const fileContents = await parseAndConvert(
        path,
        new EnvExampleWriter(),
      );
      if (replace || output) {
        await Deno.writeTextFile(output ?? path, fileContents);
        console.log(`File written: ${output ?? path}`);
      } else {
        console.log(fileContents);
      }
    });

  await new Command()
    .name("envardoc")
    .version(metadata.version)
    .description(metadata.description)
    .meta("Deno", Deno.version.deno)
    .meta(
      "FS Read Permissions",
      Deno.permissions.querySync({ name: "read" }).state,
    )
    .command("docs", docs)
    .command("example", envExample)
    .command("envar", envar)
    .parse(Deno.args);
}

export * from "$ast";
export * from "$parse";
export * from "$writers";

async function parseAndConvert(path: string, writer: Writer) {
  path = resolve(path);
  if (!(await exists(path))) {
    console.error(`File not found: ${path}`);
    Deno.exit(1);
  }

  const content = await Deno.readTextFile(path);

  const ast = parse(content);

  const output = ast.write(writer);
  return output;
}
