export function repositoryInterfaceTemplate(
  resourcePascal: string,
  resourceLower: string
): string {
  return `import { T${resourcePascal} } from "../entities/${resourceLower}/${resourceLower}";
import Repository from "./Repository";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ${resourcePascal}Repository extends Repository<T${resourcePascal}> {}
`;
}
