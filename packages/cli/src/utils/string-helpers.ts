/**
 * String helper utilities for CLI
 */

export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (char) => char.toUpperCase());
}

export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (char) => char.toLowerCase());
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}
