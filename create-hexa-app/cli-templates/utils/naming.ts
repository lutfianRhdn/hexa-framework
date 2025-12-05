/**
 * Naming utility functions for consistent naming conventions
 */

export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function toPlural(str: string): string {
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies';
  }
  if (str.endsWith('s') || str.endsWith('x') || str.endsWith('ch') || str.endsWith('sh')) {
    return str + 'es';
  }
  return str + 's';
}

export function toSingular(str: string): string {
  if (str.endsWith('ies')) {
    return str.slice(0, -3) + 'y';
  }
  if (str.endsWith('ses') || str.endsWith('xes') || str.endsWith('ches') || str.endsWith('shes')) {
    return str.slice(0, -2);
  }
  if (str.endsWith('s')) {
    return str.slice(0, -1);
  }
  return str;
}

export interface ResourceNames {
  singular: string;
  plural: string;
  pascalSingular: string;
  pascalPlural: string;
  camelSingular: string;
  camelPlural: string;
  kebabSingular: string;
  kebabPlural: string;
  snakeSingular: string;
  snakePlural: string;
}

export function generateResourceNames(name: string): ResourceNames {
  const singular = toSingular(name.toLowerCase());
  const plural = toPlural(singular);

  return {
    singular,
    plural,
    pascalSingular: toPascalCase(singular),
    pascalPlural: toPascalCase(plural),
    camelSingular: toCamelCase(singular),
    camelPlural: toCamelCase(plural),
    kebabSingular: toKebabCase(singular),
    kebabPlural: toKebabCase(plural),
    snakeSingular: toSnakeCase(singular),
    snakePlural: toSnakeCase(plural)
  };
}
