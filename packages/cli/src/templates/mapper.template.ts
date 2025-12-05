import { toSnakeCase } from '../utils/string-helpers';

interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
}

export function mapperTemplate(
  resourcePascal: string,
  resourceLower: string,
  fields: FieldDefinition[]
): string {
  const mappings = fields
    .map((f) => {
      const snakeField = toSnakeCase(f.name);
      if (f.name === snakeField) {
        return `    ${f.name}: entity.${f.name},`;
      }
      return `    ${snakeField}: entity.${f.name},`;
    })
    .join('\n');

  return `import { T${resourcePascal}, T${resourcePascal}GetResponse } from "../../core/entities/${resourceLower}/${resourceLower}";

export class ${resourcePascal}ResponseMapper {
  static toResponse(entity: T${resourcePascal}): T${resourcePascal}GetResponse {
    return {
      id: (entity as any).id,
${mappings}
    };
  }

  static toListResponse(entities: T${resourcePascal}[]): T${resourcePascal}GetResponse[] {
    return entities.map(entity => this.toResponse(entity));
  }
}
`;
}
