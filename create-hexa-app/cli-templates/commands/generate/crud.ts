import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { generateResourceNames, ResourceNames } from '../../utils/naming';
import { 
  getSrcPath, writeFile, fileExists, logSuccess, logError, logWarning,
  detectProjectConfig, parseFields, mapTypeToPrisma, mapTypeToZod, mapTypeToTypeScript
} from '../../utils/file-helpers';

interface CrudOptions {
  fields?: string;
  transport?: string;
  database?: string;
}

export async function generateCrud(name: string, options: CrudOptions): Promise<void> {
  try {
    console.log(chalk.cyan.bold('\n🚀 Generating Complete CRUD System...\n'));

    const names = generateResourceNames(name);
    const config = detectProjectConfig();
    
    // Prompt for fields if not provided
    const fields = options.fields || await promptFields();
    const parsedFields = parseFields(fields);
    
    // Prompt for transport if not provided
    const transport = options.transport || config.transports[0] || await promptTransport();
    const database = options.database || config.database;

    console.log(chalk.blue(`\n📋 Resource: ${chalk.white(names.pascalSingular)}`));
    console.log(chalk.blue(`📦 Transport: ${chalk.white(transport)}`));
    console.log(chalk.blue(`🗄️  Database: ${chalk.white(database)}`));
    console.log(chalk.blue(`📝 Fields: ${chalk.white(parsedFields.length)}\n`));

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Generate complete CRUD?',
        default: true
      }
    ]);

    if (!confirm) {
      logError('CRUD generation cancelled');
      return;
    }

    // Generate all files
    let spinner = ora('Generating entity...').start();
    await generateEntity(names, parsedFields);
    spinner.succeed('Entity generated');

    spinner = ora('Generating DTOs...').start();
    await generateDTOs(names, parsedFields);
    spinner.succeed('DTOs generated');

    spinner = ora('Generating repository interface...').start();
    await generateRepositoryInterface(names);
    spinner.succeed('Repository interface generated');

    spinner = ora('Generating repository implementation...').start();
    await generateRepositoryImpl(names, database);
    spinner.succeed('Repository implementation generated');

    spinner = ora('Generating service...').start();
    await generateService(names);
    spinner.succeed('Service generated');

    spinner = ora('Generating validation schemas...').start();
    await generateValidationSchemas(names, parsedFields);
    spinner.succeed('Validation schemas generated');

    if (transport === 'rest') {
      spinner = ora('Generating controller...').start();
      await generateController(names);
      spinner.succeed('Controller generated');

      spinner = ora('Generating router...').start();
      await generateRouter(names);
      spinner.succeed('Router generated');
    } else if (transport === 'graphql') {
      spinner = ora('Generating GraphQL types...').start();
      await generateGraphQLTypes(names, parsedFields);
      spinner.succeed('GraphQL types generated');

      spinner = ora('Generating resolver...').start();
      await generateResolver(names);
      spinner.succeed('Resolver generated');
    }

    spinner = ora('Updating Prisma schema...').start();
    await updatePrismaSchema(names, parsedFields, database);
    spinner.succeed('Prisma schema updated');

    console.log(chalk.green.bold('\n✅ CRUD System Generated Successfully!\n'));
    console.log(chalk.blue('📝 Next steps:'));
    console.log(chalk.white('  1. Run: npx prisma generate'));
    console.log(chalk.white('  2. Run: npx prisma migrate dev --name add_' + names.snakeSingular));
    if (transport === 'rest') {
      console.log(chalk.white(`  3. Register router in src/transports/api/routers/index.ts`));
    } else if (transport === 'graphql') {
      console.log(chalk.white(`  3. Register resolver in src/transports/graphql/index.ts`));
    }
    console.log(chalk.white('  4. npm run build'));
    console.log(chalk.white('  5. npm run dev\n'));

  } catch (error: any) {
    logError(`Failed to generate CRUD: ${error.message}`);
    process.exit(1);
  }
}

async function promptFields(): Promise<string> {
  const { fields } = await inquirer.prompt([
    {
      type: 'input',
      name: 'fields',
      message: 'Enter fields (name:type,email:string,age:number):',
      default: 'name:string,description:string'
    }
  ]);
  return fields;
}

async function promptTransport(): Promise<string> {
  const { transport } = await inquirer.prompt([
    {
      type: 'list',
      name: 'transport',
      message: 'Select transport:',
      choices: ['rest', 'graphql', 'websocket']
    }
  ]);
  return transport;
}

async function generateEntity(names: ResourceNames, fields: Array<{ name: string; type: string; optional?: boolean }>): Promise<void> {
  const fieldsStr = fields.map(f => `  ${f.name}: ${mapTypeToTypeScript(f.type, f.optional)};`).join('\n');
  
  const content = `export interface ${names.pascalSingular} {
  id: string | number;
${fieldsStr}
  createdAt: Date;
  updatedAt: Date;
}

export interface Create${names.pascalSingular}DTO {
${fieldsStr}
}

export interface Update${names.pascalSingular}DTO {
${fields.map(f => `  ${f.name}?: ${mapTypeToTypeScript(f.type, false)};`).join('\n')}
}
`;

  await writeFile(path.join(getSrcPath(), 'core/entities', names.kebabSingular, `${names.pascalSingular}.ts`), content);
}

async function generateDTOs(names: ResourceNames, fields: Array<{ name: string; type: string; optional?: boolean }>): Promise<void> {
  const content = `export * from './${names.pascalSingular}';
`;
  await writeFile(path.join(getSrcPath(), 'core/entities', names.kebabSingular, 'index.ts'), content);
}

async function generateRepositoryInterface(names: ResourceNames): Promise<void> {
  const content = `import { ${names.pascalSingular}, Create${names.pascalSingular}DTO, Update${names.pascalSingular}DTO } from '@/core/entities/${names.kebabSingular}';

export interface I${names.pascalSingular}Repository {
  findAll(params: { limit: number; offset: number }): Promise<{ data: ${names.pascalSingular}[]; total: number }>;
  findById(id: string | number): Promise<${names.pascalSingular} | null>;
  create(data: Create${names.pascalSingular}DTO): Promise<${names.pascalSingular}>;
  update(id: string | number, data: Update${names.pascalSingular}DTO): Promise<${names.pascalSingular} | null>;
  delete(id: string | number): Promise<void>;
}
`;

  await writeFile(path.join(getSrcPath(), 'core/interfaces', `I${names.pascalSingular}Repository.ts`), content);
}

async function generateRepositoryImpl(names: ResourceNames, database: string): Promise<void> {
  const isMongoDb = database === 'mongodb';
  const idType = isMongoDb ? 'string' : 'number';
  
  const content = `import { PrismaClient } from '@prisma/client';
import { I${names.pascalSingular}Repository } from '@/core/interfaces/I${names.pascalSingular}Repository';
import { ${names.pascalSingular}, Create${names.pascalSingular}DTO, Update${names.pascalSingular}DTO } from '@/core/entities/${names.kebabSingular}';

export class ${names.pascalSingular}Repository implements I${names.pascalSingular}Repository {
  constructor(private prisma: PrismaClient) {}

  async findAll(params: { limit: number; offset: number }): Promise<{ data: ${names.pascalSingular}[]; total: number }> {
    const [data, total] = await Promise.all([
      this.prisma.${names.camelSingular}.findMany({
        take: params.limit,
        skip: params.offset,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.${names.camelSingular}.count()
    ]);

    return { data: data as ${names.pascalSingular}[], total };
  }

  async findById(id: string | number): Promise<${names.pascalSingular} | null> {
    const ${names.camelSingular} = await this.prisma.${names.camelSingular}.findUnique({
      where: { id: id as ${idType} }
    });

    return ${names.camelSingular} as ${names.pascalSingular} | null;
  }

  async create(data: Create${names.pascalSingular}DTO): Promise<${names.pascalSingular}> {
    const ${names.camelSingular} = await this.prisma.${names.camelSingular}.create({
      data
    });

    return ${names.camelSingular} as ${names.pascalSingular};
  }

  async update(id: string | number, data: Update${names.pascalSingular}DTO): Promise<${names.pascalSingular} | null> {
    try {
      const ${names.camelSingular} = await this.prisma.${names.camelSingular}.update({
        where: { id: id as ${idType} },
        data
      });

      return ${names.camelSingular} as ${names.pascalSingular};
    } catch (error) {
      return null;
    }
  }

  async delete(id: string | number): Promise<void> {
    await this.prisma.${names.camelSingular}.delete({
      where: { id: id as ${idType} }
    });
  }
}
`;

  await writeFile(path.join(getSrcPath(), 'adapters/repositories', `${names.pascalSingular}Repository.ts`), content);
}

async function generateService(names: ResourceNames): Promise<void> {
  const content = `import { I${names.pascalSingular}Repository } from '@/core/interfaces/I${names.pascalSingular}Repository';
import { ${names.pascalSingular}, Create${names.pascalSingular}DTO, Update${names.pascalSingular}DTO } from '@/core/entities/${names.kebabSingular}';

export class ${names.pascalSingular}Service {
  constructor(private ${names.camelSingular}Repository: I${names.pascalSingular}Repository) {}

  async getAll${names.pascalPlural}(params: { limit: number; offset: number }): Promise<{ data: ${names.pascalSingular}[]; total: number }> {
    return await this.${names.camelSingular}Repository.findAll(params);
  }

  async get${names.pascalSingular}ById(id: string | number): Promise<${names.pascalSingular} | null> {
    return await this.${names.camelSingular}Repository.findById(id);
  }

  async create${names.pascalSingular}(data: Create${names.pascalSingular}DTO): Promise<${names.pascalSingular}> {
    // Add business logic validation here
    return await this.${names.camelSingular}Repository.create(data);
  }

  async update${names.pascalSingular}(id: string | number, data: Update${names.pascalSingular}DTO): Promise<${names.pascalSingular} | null> {
    // Add business logic validation here
    return await this.${names.camelSingular}Repository.update(id, data);
  }

  async delete${names.pascalSingular}(id: string | number): Promise<void> {
    await this.${names.camelSingular}Repository.delete(id);
  }
}
`;

  await writeFile(path.join(getSrcPath(), 'core/services', `${names.pascalSingular}Service.ts`), content);
}

async function generateValidationSchemas(names: ResourceNames, fields: Array<{ name: string; type: string; optional?: boolean }>): Promise<void> {
  const createFields = fields.map(f => `  ${f.name}: ${mapTypeToZod(f.type, f.optional)}`).join(',\n');
  const updateFields = fields.map(f => `  ${f.name}: ${mapTypeToZod(f.type, true)}`).join(',\n');
  
  const content = `import { z } from 'zod';

export const create${names.pascalSingular}Schema = z.object({
${createFields}
});

export const update${names.pascalSingular}Schema = z.object({
${updateFields}
});

export type Create${names.pascalSingular}Input = z.infer<typeof create${names.pascalSingular}Schema>;
export type Update${names.pascalSingular}Input = z.infer<typeof update${names.pascalSingular}Schema>;
`;

  await writeFile(path.join(getSrcPath(), 'transports/api/validations', `${names.kebabSingular}.schema.ts`), content);
}

async function generateController(names: ResourceNames): Promise<void> {
  const content = `import { Request, Response, NextFunction } from 'express';
import { ${names.pascalSingular}Service } from '@/core/services/${names.pascalSingular}Service';
import { create${names.pascalSingular}Schema, update${names.pascalSingular}Schema } from '@/transports/api/validations/${names.kebabSingular}.schema';

export class ${names.pascalSingular}Controller {
  constructor(private ${names.camelSingular}Service: ${names.pascalSingular}Service) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const result = await this.${names.camelSingular}Service.getAll${names.pascalPlural}({ limit, offset });

      res.status(200).json({
        success: true,
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
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const ${names.camelSingular} = await this.${names.camelSingular}Service.get${names.pascalSingular}ById(id);

      if (!${names.camelSingular}) {
        res.status(404).json({ success: false, message: '${names.pascalSingular} not found' });
        return;
      }

      res.status(200).json({ success: true, data: ${names.camelSingular} });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = create${names.pascalSingular}Schema.parse(req.body);
      const ${names.camelSingular} = await this.${names.camelSingular}Service.create${names.pascalSingular}(validatedData);

      res.status(201).json({ success: true, data: ${names.camelSingular} });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = update${names.pascalSingular}Schema.parse(req.body);
      const ${names.camelSingular} = await this.${names.camelSingular}Service.update${names.pascalSingular}(id, validatedData);

      if (!${names.camelSingular}) {
        res.status(404).json({ success: false, message: '${names.pascalSingular} not found' });
        return;
      }

      res.status(200).json({ success: true, data: ${names.camelSingular} });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.${names.camelSingular}Service.delete${names.pascalSingular}(id);

      res.status(200).json({ success: true, message: '${names.pascalSingular} deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
`;

  await writeFile(path.join(getSrcPath(), 'transports/api/controllers', `${names.pascalSingular}Controller.ts`), content);
}

async function generateRouter(names: ResourceNames): Promise<void> {
  const content = `import { Router } from 'express';
import { ${names.pascalSingular}Controller } from '../controllers/${names.pascalSingular}Controller';
import { ${names.pascalSingular}Service } from '@/core/services/${names.pascalSingular}Service';
import { ${names.pascalSingular}Repository } from '@/adapters/repositories/${names.pascalSingular}Repository';
import { prisma } from '@/configs/database';

const router = Router();

// Initialize dependencies
const ${names.camelSingular}Repository = new ${names.pascalSingular}Repository(prisma);
const ${names.camelSingular}Service = new ${names.pascalSingular}Service(${names.camelSingular}Repository);
const ${names.camelSingular}Controller = new ${names.pascalSingular}Controller(${names.camelSingular}Service);

// Routes
router.get('/', ${names.camelSingular}Controller.getAll);
router.get('/:id', ${names.camelSingular}Controller.getById);
router.post('/', ${names.camelSingular}Controller.create);
router.put('/:id', ${names.camelSingular}Controller.update);
router.delete('/:id', ${names.camelSingular}Controller.delete);

export default router;
`;

  await writeFile(path.join(getSrcPath(), 'transports/api/routers', `${names.kebabSingular}.router.ts`), content);
}

async function generateGraphQLTypes(names: ResourceNames, fields: Array<{ name: string; type: string; optional?: boolean }>): Promise<void> {
  const fieldsStr = fields.map(f => `  @Field(() => ${f.type === 'number' ? 'Int' : 'String'}${f.optional ? ', { nullable: true }' : ''})\n  ${f.name}!: ${mapTypeToTypeScript(f.type, f.optional)};`).join('\n\n');
  
  const content = `import { ObjectType, Field, ID, InputType, Int } from 'type-graphql';

@ObjectType()
export class ${names.pascalSingular}Type {
  @Field(() => ID)
  id!: string | number;

${fieldsStr}

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@InputType()
export class Create${names.pascalSingular}Input {
${fieldsStr}
}

@InputType()
export class Update${names.pascalSingular}Input {
${fields.map(f => `  @Field(() => ${f.type === 'number' ? 'Int' : 'String'}, { nullable: true })\n  ${f.name}?: ${mapTypeToTypeScript(f.type, false)};`).join('\n\n')}
}
`;

  await writeFile(path.join(getSrcPath(), 'transports/graphql/types', `${names.pascalSingular}Type.ts`), content);
}

async function generateResolver(names: ResourceNames): Promise<void> {
  const content = `import { Resolver, Query, Mutation, Arg, Int } from 'type-graphql';
import { ${names.pascalSingular}Service } from '@/core/services/${names.pascalSingular}Service';
import { ${names.pascalSingular}Repository } from '@/adapters/repositories/${names.pascalSingular}Repository';
import { ${names.pascalSingular}Type, Create${names.pascalSingular}Input, Update${names.pascalSingular}Input } from '../types/${names.pascalSingular}Type';
import { prisma } from '@/configs/database';

const ${names.camelSingular}Repository = new ${names.pascalSingular}Repository(prisma);
const ${names.camelSingular}Service = new ${names.pascalSingular}Service(${names.camelSingular}Repository);

@Resolver(() => ${names.pascalSingular}Type)
export class ${names.pascalSingular}Resolver {
  @Query(() => [${names.pascalSingular}Type])
  async ${names.camelPlural}(
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number,
    @Arg('offset', () => Int, { defaultValue: 0 }) offset: number
  ): Promise<${names.pascalSingular}Type[]> {
    const result = await ${names.camelSingular}Service.getAll${names.pascalPlural}({ limit, offset });
    return result.data;
  }

  @Query(() => ${names.pascalSingular}Type, { nullable: true })
  async ${names.camelSingular}(@Arg('id') id: string): Promise<${names.pascalSingular}Type | null> {
    return await ${names.camelSingular}Service.get${names.pascalSingular}ById(id);
  }

  @Mutation(() => ${names.pascalSingular}Type)
  async create${names.pascalSingular}(@Arg('input') input: Create${names.pascalSingular}Input): Promise<${names.pascalSingular}Type> {
    return await ${names.camelSingular}Service.create${names.pascalSingular}(input);
  }

  @Mutation(() => ${names.pascalSingular}Type, { nullable: true })
  async update${names.pascalSingular}(
    @Arg('id') id: string,
    @Arg('input') input: Update${names.pascalSingular}Input
  ): Promise<${names.pascalSingular}Type | null> {
    return await ${names.camelSingular}Service.update${names.pascalSingular}(id, input);
  }

  @Mutation(() => Boolean)
  async delete${names.pascalSingular}(@Arg('id') id: string): Promise<boolean> {
    await ${names.camelSingular}Service.delete${names.pascalSingular}(id);
    return true;
  }
}
`;

  await writeFile(path.join(getSrcPath(), 'transports/graphql/resolvers', `${names.pascalSingular}Resolver.ts`), content);
}

async function updatePrismaSchema(names: ResourceNames, fields: Array<{ name: string; type: string; optional?: boolean }>, database: string): Promise<void> {
  const { getProjectRoot } = await import('../../utils/file-helpers');
  const prismaPath = path.join(getProjectRoot(), 'prisma/schema.prisma');
  
  if (!fileExists(prismaPath)) {
    logWarning('Prisma schema not found, skipping...');
    return;
  }

  const fs = await import('fs');
  const existingSchema = fs.readFileSync(prismaPath, 'utf8');
  
  const idField = database === 'mongodb' 
    ? '  id     String   @id @default(auto()) @map("_id") @db.ObjectId'
    : '  id     Int      @id @default(autoincrement())';
  
  const fieldsStr = fields.map(f => `  ${f.name}  ${mapTypeToPrisma(f.type, f.optional)}`).join('\n');
  
  const model = `

model ${names.pascalSingular} {
${idField}
${fieldsStr}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("${names.snakePlural}")
}
`;

  fs.appendFileSync(prismaPath, model, 'utf8');
}
