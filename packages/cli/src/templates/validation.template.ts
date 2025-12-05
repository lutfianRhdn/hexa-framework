interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
}

export function validationTemplate(
  resourcePascal: string,
  fields: FieldDefinition[]
): string {
  const createFields = fields
    .filter((f) => !['isActive', 'createdAt', 'updatedAt'].includes(f.name))
    .map((f) => {
      const zodType = getZodType(f.type);
      const optional = f.required ? '' : '.optional()';
      return `  ${f.name}: z.${zodType}${optional},`;
    })
    .join('\n');

  return `import { z } from "zod";

export const create${resourcePascal}Schema = z.object({
${createFields}
});

export const update${resourcePascal}Schema = create${resourcePascal}Schema.partial();
`;
}

function getZodType(type: string): string {
  switch (type) {
    case 'string':
      return 'string()';
    case 'number':
      return 'number()';
    case 'boolean':
      return 'boolean()';
    case 'Date':
      return 'date()';
    case 'array':
      return 'array(z.any())';
    case 'object':
      return 'object({})';
    default:
      return 'any()';
  }
}
