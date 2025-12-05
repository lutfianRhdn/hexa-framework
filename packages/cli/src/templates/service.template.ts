export function serviceTemplate(
  resourcePascal: string,
  resourceLower: string
): string {
  return `import ${resourcePascal}Repository from "../../adapters/postgres/repositories/${resourcePascal}Repository";
import { T${resourcePascal}, T${resourcePascal}WithID } from "../entities/${resourceLower}/${resourceLower}";
import { Service } from "@hexa-framework/core";

export default class ${resourcePascal}Service extends Service<T${resourcePascal} | T${resourcePascal}WithID> {
  declare repository: ${resourcePascal}Repository;

  constructor(repository: ${resourcePascal}Repository) {
    super(repository);
  }
}
`;
}
