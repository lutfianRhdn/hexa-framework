import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { generateResourceNames, ResourceNames } from '../../utils/naming';
import { getSrcPath, writeFile, fileExists, logSuccess, logError, logWarning, detectProjectConfig } from '../../utils/file-helpers';

export async function generateController(name: string, options: any): Promise<void> {
  try {
    console.log(chalk.cyan('\n🏗️  Generating Controller...\n'));

    const resourceName = options.resource || name;
    const names = generateResourceNames(resourceName);
    const config = detectProjectConfig();
    
    const template = options.template || (config.transports.length === 1 ? config.transports[0] : await promptTemplate());
    
    const controllerPath = path.join(getSrcPath(), 'transports/api/controllers', `${names.pascalSingular}Controller.ts`);
    
    if (fileExists(controllerPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Controller ${names.pascalSingular}Controller already exists. Overwrite?`,
          default: false
        }
      ]);
      
      if (!overwrite) {
        logWarning('Controller generation cancelled');
        return;
      }
    }

    const content = template === 'graphql' ? generateGraphQLController(names) : generateRestController(names);
    
    await writeFile(controllerPath, content);
    
    logSuccess(`Controller created: ${controllerPath}`);
    console.log(chalk.blue('\n📝 Next steps:'));
    console.log(chalk.white(`  1. Update the controller methods with your business logic`));
    console.log(chalk.white(`  2. Register the controller in your router/resolver`));
    console.log(chalk.white(`  3. Create corresponding service if needed\n`));
    
  } catch (error: any) {
    logError(`Failed to generate controller: ${error.message}`);
    process.exit(1);
  }
}

async function promptTemplate(): Promise<string> {
  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Select controller type:',
      choices: ['rest', 'graphql']
    }
  ]);
  return template;
}

function generateRestController(names: ResourceNames): string {
  return `import { Request, Response, NextFunction } from 'express';
import { ${names.pascalSingular}Service } from '@/core/services/${names.pascalSingular}Service';
import { create${names.pascalSingular}Schema, update${names.pascalSingular}Schema } from '@/transports/api/validations/${names.kebabSingular}.schema';

export class ${names.pascalSingular}Controller {
  constructor(private ${names.camelSingular}Service: ${names.pascalSingular}Service) {}

  /**
   * Get all ${names.plural}
   * GET /api/${names.kebabPlural}
   */
  async getAll${names.pascalPlural}(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const result = await this.${names.camelSingular}Service.getAll${names.pascalPlural}({ limit, offset });

      res.status(200).json({
        success: true,
        message: '${names.pascalPlural} retrieved successfully',
        data: result.data,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get ${names.singular} by ID
   * GET /api/${names.kebabPlural}/:id
   */
  async get${names.pascalSingular}ById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const ${names.camelSingular} = await this.${names.camelSingular}Service.get${names.pascalSingular}ById(id);

      if (!${names.camelSingular}) {
        res.status(404).json({
          success: false,
          message: '${names.pascalSingular} not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '${names.pascalSingular} retrieved successfully',
        data: ${names.camelSingular}
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new ${names.singular}
   * POST /api/${names.kebabPlural}
   */
  async create${names.pascalSingular}(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = create${names.pascalSingular}Schema.parse(req.body);
      const ${names.camelSingular} = await this.${names.camelSingular}Service.create${names.pascalSingular}(validatedData);

      res.status(201).json({
        success: true,
        message: '${names.pascalSingular} created successfully',
        data: ${names.camelSingular}
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update ${names.singular}
   * PUT /api/${names.kebabPlural}/:id
   */
  async update${names.pascalSingular}(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = update${names.pascalSingular}Schema.parse(req.body);
      const ${names.camelSingular} = await this.${names.camelSingular}Service.update${names.pascalSingular}(id, validatedData);

      if (!${names.camelSingular}) {
        res.status(404).json({
          success: false,
          message: '${names.pascalSingular} not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '${names.pascalSingular} updated successfully',
        data: ${names.camelSingular}
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete ${names.singular}
   * DELETE /api/${names.kebabPlural}/:id
   */
  async delete${names.pascalSingular}(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.${names.camelSingular}Service.delete${names.pascalSingular}(id);

      res.status(200).json({
        success: true,
        message: '${names.pascalSingular} deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
`;
}

function generateGraphQLController(names: ResourceNames): string {
  return `import { Resolver, Query, Mutation, Arg, Int } from 'type-graphql';
import { ${names.pascalSingular}Service } from '@/core/services/${names.pascalSingular}Service';
import { ${names.pascalSingular}Type, Create${names.pascalSingular}Input, Update${names.pascalSingular}Input } from '@/transports/graphql/types/${names.pascalSingular}Type';

@Resolver(() => ${names.pascalSingular}Type)
export class ${names.pascalSingular}Resolver {
  constructor(private ${names.camelSingular}Service: ${names.pascalSingular}Service) {}

  @Query(() => [${names.pascalSingular}Type])
  async ${names.camelPlural}(
    @Arg('limit', () => Int, { nullable: true, defaultValue: 10 }) limit: number,
    @Arg('offset', () => Int, { nullable: true, defaultValue: 0 }) offset: number
  ): Promise<${names.pascalSingular}Type[]> {
    const result = await this.${names.camelSingular}Service.getAll${names.pascalPlural}({ limit, offset });
    return result.data;
  }

  @Query(() => ${names.pascalSingular}Type, { nullable: true })
  async ${names.camelSingular}(@Arg('id', () => String) id: string): Promise<${names.pascalSingular}Type | null> {
    return await this.${names.camelSingular}Service.get${names.pascalSingular}ById(id);
  }

  @Mutation(() => ${names.pascalSingular}Type)
  async create${names.pascalSingular}(@Arg('input') input: Create${names.pascalSingular}Input): Promise<${names.pascalSingular}Type> {
    return await this.${names.camelSingular}Service.create${names.pascalSingular}(input);
  }

  @Mutation(() => ${names.pascalSingular}Type, { nullable: true })
  async update${names.pascalSingular}(
    @Arg('id', () => String) id: string,
    @Arg('input') input: Update${names.pascalSingular}Input
  ): Promise<${names.pascalSingular}Type | null> {
    return await this.${names.camelSingular}Service.update${names.pascalSingular}(id, input);
  }

  @Mutation(() => Boolean)
  async delete${names.pascalSingular}(@Arg('id', () => String) id: string): Promise<boolean> {
    await this.${names.camelSingular}Service.delete${names.pascalSingular}(id);
    return true;
  }
}
`;
}
