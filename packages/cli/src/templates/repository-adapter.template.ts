export function repositoryAdapterTemplate(
  resourcePascal: string,
  resourceLower: string
): string {
  return `import { T${resourcePascal}, T${resourcePascal}WithID } from "../../../core/entities/${resourceLower}/${resourceLower}";
import { ${resourcePascal}Repository as I${resourcePascal}Repository } from "../../../core/repositories/${resourceLower}";
import Repository from "./Repository";

export default class ${resourcePascal}Repository
  extends Repository<T${resourcePascal} | T${resourcePascal}WithID>
  implements I${resourcePascal}Repository
{
  constructor() {
    super("${resourceLower}");
  }
}
`;
}
