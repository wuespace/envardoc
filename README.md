# envdoc

A documentation generator for .env files.

## Usage

```shell
envdoc <writer> <path-to-env-file>
```

### Writers

- `md` - Prints the documentation in markdown format
- `env` - Prints a `.env.example` file with all variables and comments

### With Deno

```shell
deno run --allow-read jsr:@wuespace/envdoc md .env.example
```

### With Docker

```shell
docker run -it -v .:/data envdoc:latest md .env.example
```

## Env File Format

### Sections

Sections are defined by a comment line starting with `#`, followed by the
section name, an empty (commented out) line, and any consecutive commentted out
lines and variables.

Sections are separated by an empty line.

```shell
# A section
#
# This is a comment
# This is another comment
VAR1=value
# This is a comment
VAR2=value
# VAR2=another-value-as-example
#
# Another variable description, still in the same section
VAR3=value

# Another section
#
# This is a comment
# ...

# Yet another section
#
# ...
```

Variables with no section are placed in a section called _Other_.

### Variables

Variables are defined by 0..n comment lines describing the variable, followed by
the variable name and (optionally) value, where

1. for optional variables, the variable is commented out, and
2. for required variables, the variable is not commented out.

Further example values can be provided in commented out name-value pairs below
the initial variable definition.

```shell
# This is a required variable with no default value.
# It includes two example values.
REQUIRED_VAR=
# REQUIRED_VAR=example-value
# REQUIRED_VAR=another-example-value
#
# This is an optional variable with a default value and
# an additional example value.
# OPTIONAL_VAR=default-value
# OPTIONAL_VAR=another-example-value
#
# This is an optional variable with no default value.
# It includes two example values.
# OPTIONAL_VAR2=
# OPTIONAL_VAR2=example-value
# OPTIONAL_VAR2=another-example-value
```
