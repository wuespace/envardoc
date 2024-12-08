import { parse } from "$parse";
import { DocsWriter, EnvExampleWriter, type Writer } from "$writers";
import { Command } from "@cliffy/command";
import { exists } from "@std/fs";
import { resolve } from "@std/path";
import metadata from "./deno.json" with { type: "json" };

if (import.meta.main) {
  const docs = new Command()
    .arguments("<path:file>")
    .description("Generate documentation from .env files")
    .action(async (_options, path: string) => {
      console.log(
        await parseAndConvert(
          path,
          new DocsWriter(),
        ),
      );
    });

  const envExample = new Command()
    .arguments("<path:string>")
    .description("Generate example .env file")
    .action(async (_options, path: string) => {
      console.log(
        await parseAndConvert(
          path,
          new EnvExampleWriter(),
        ),
      );
    });

  await new Command()
    .name("envdoc")
    .version(metadata.version)
    .description(metadata.description)
    .meta('Deno', Deno.version.deno)
    .meta('FS Read Permissions', Deno.permissions.querySync({ name: "read" }).state)
    .command("docs", docs)
    .command("example", envExample)
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
