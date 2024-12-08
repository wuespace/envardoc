import { exists } from "@std/fs";
import { resolve } from "@std/path";
import { EnvExampleWriter } from "./lib/writers/env-example.ts";
import { DocsWriter } from "./lib/writers/docs.ts";
import { parse } from "$parse";

const WRITERS = {
  md: new DocsWriter(),
  env: new EnvExampleWriter(),
} as const;

if (import.meta.main) {
  if (Deno.args.length !== 2 || !Object.hasOwn(WRITERS, Deno.args[0])) {
    console.error("Usage: $0 <writer> <path>");
    console.info("Available writers: ", Object.keys(WRITERS).join(", "));
    console.info("Example: $0 md ./example.env");
    Deno.exit(1);
  }

  const input = resolve(Deno.args[1]);

  if (!(await exists(input))) {
    console.error(`File not found: ${input}`);
    Deno.exit(1);
  }

  const content = await Deno.readTextFile(input);

  const ast = parse(content);

  const writer = WRITERS[Deno.args[0] as keyof typeof WRITERS];
  console.log(ast.write(writer));
}

export * from "$ast";
export * from "$parse";
export * from "$writers";
