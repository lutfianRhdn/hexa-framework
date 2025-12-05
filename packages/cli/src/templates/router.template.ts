export function routerTemplate(
  resourcePascal: string,
  resourceLower: string,
  resourceCamel: string
): string {
  return `import { Router } from "express";
import ${resourcePascal}Controller from "../../controllers/${resourcePascal}Controller";
import ${resourcePascal}Service from "../../../../core/services/${resourcePascal}Service";
import ${resourcePascal}Repository from "../../../../adapters/postgres/repositories/${resourcePascal}Repository";
import { ${resourcePascal}ResponseMapper } from "../../../../mappers/${resourceLower}/mapper";
import { authMiddleware } from "@hexa-framework/core";
import { create${resourcePascal}Schema, update${resourcePascal}Schema } from "../../validations/${resourceLower}";
import { validateBody } from "@hexa-framework/core";

const router = Router();

// Initialize dependencies
const ${resourceCamel}Repository = new ${resourcePascal}Repository();
const ${resourceCamel}Service = new ${resourcePascal}Service(${resourceCamel}Repository);
const ${resourceCamel}Controller = new ${resourcePascal}Controller();

// Routes
router.get(
  "/",
  authMiddleware,
  ${resourceCamel}Controller.findAll(${resourceCamel}Service, ${resourcePascal}ResponseMapper)
);

router.post(
  "/",
  authMiddleware,
  validateBody(create${resourcePascal}Schema),
  ${resourceCamel}Controller.create(${resourceCamel}Service, ${resourcePascal}ResponseMapper)
);

router.put(
  "/:id",
  authMiddleware,
  validateBody(update${resourcePascal}Schema),
  ${resourceCamel}Controller.update(${resourceCamel}Service, ${resourcePascal}ResponseMapper)
);

router.delete(
  "/:id",
  authMiddleware,
  ${resourceCamel}Controller.delete(${resourceCamel}Service)
);

export default router;
`;
}
