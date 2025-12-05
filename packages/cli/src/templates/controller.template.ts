export function controllerTemplate(
  resourcePascal: string,
  resourceLower: string
): string {
  return `import { Controller, TMetadataResponse } from "@hexa-framework/core";
import { T${resourcePascal}GetResponse } from "../../core/entities/${resourceLower}/${resourceLower}";

export default class ${resourcePascal}Controller extends Controller<
  T${resourcePascal}GetResponse,
  TMetadataResponse
> {
  // Inherit all CRUD methods from base Controller
  // Add custom methods here if needed
}
`;
}
