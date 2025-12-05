import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import {
  toPascalCase,
  toCamelCase,
  toSnakeCase,
} from '../utils/string-helpers';
import { entityTemplate } from '../templates/entity.template';
import { repositoryInterfaceTemplate } from '../templates/repository-interface.template';
import { repositoryAdapterTemplate } from '../templates/repository-adapter.template';
import { serviceTemplate } from '../templates/service.template';
import { controllerTemplate } from '../templates/controller.template';
import { routerTemplate } from '../templates/router.template';
import { validationTemplate } from '../templates/validation.template';
import { mapperTemplate } from '../templates/mapper.template';

interface GenerateOptions {
  type: string;
  dir: string;
}

interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
}

/**
 * Generate resource files
 */
export async function generateResource(
  resourceName?: string,
  options?: GenerateOptions
): Promise<void> {
  console.log(chalk.cyan.bold('\n🔷 Hexa Framework - Resource Generator\n'));

  // If no resource name, ask for it
  if (!resourceName) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'resourceName',
        message: 'Resource name (e.g., post, product, user):',
        validate: (input: string) => {
          if (!input) return 'Resource name is required';
          if (!/^[a-zA-Z]+$/.test(input))
            return 'Resource name must contain only letters';
          return true;
        },
      },
    ]);
    resourceName = answers.resourceName;
  }

  // Ask for fields
  const fields: FieldDefinition[] = [];
  let addMoreFields = true;

  console.log(chalk.gray('\nDefine fields for your resource:'));
  console.log(chalk.gray('(Press Enter with empty name to finish)\n'));

  while (addMoreFields) {
    const fieldAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'fieldName',
        message: 'Field name:',
      },
      {
        type: 'list',
        name: 'fieldType',
        message: 'Field type:',
        choices: ['string', 'number', 'boolean', 'Date', 'object', 'array'],
        when: (answers: any) => !!answers.fieldName,
      },
      {
        type: 'confirm',
        name: 'required',
        message: 'Is this field required?',
        default: true,
        when: (answers: any) => !!answers.fieldName,
      },
    ]);

    if (!fieldAnswers.fieldName) {
      addMoreFields = false;
    } else {
      fields.push({
        name: fieldAnswers.fieldName as string,
        type: fieldAnswers.fieldType as string,
        required: fieldAnswers.required as boolean,
      });
    }
  }

  // Add default fields
  fields.push(
    { name: 'isActive', type: 'boolean', required: false },
    { name: 'createdAt', type: 'Date', required: false },
    { name: 'updatedAt', type: 'Date', required: false }
  );

  // Confirm generation
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Generate ${fields.length} files for '${resourceName}'?`,
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('\n❌ Generation cancelled\n'));
    return;
  }

  const spinner = ora('Generating files...').start();

  try {
    const baseDir = options?.dir || 'src';
    const resourceLower = resourceName!.toLowerCase();
    const resourcePascal = toPascalCase(resourceName!);
    const resourceCamel = toCamelCase(resourceName!);
    const resourceSnake = toSnakeCase(resourceName!);

    // Generate files
    await generateEntity(baseDir, resourceLower, resourcePascal, fields);
    await generateRepositoryInterface(baseDir, resourceLower, resourcePascal);
    await generateRepositoryAdapter(baseDir, resourceLower, resourcePascal);
    await generateService(baseDir, resourceLower, resourcePascal);
    await generateController(baseDir, resourceLower, resourcePascal);
    await generateRouter(baseDir, resourceLower, resourcePascal, resourceCamel);
    await generateValidation(baseDir, resourceLower, resourcePascal, fields);
    await generateMapper(baseDir, resourceLower, resourcePascal, fields);

    spinner.succeed(chalk.green('Files generated successfully!'));

    console.log(chalk.cyan('\n✅ Generated files:'));
    console.log(chalk.gray(`  - ${baseDir}/core/entities/${resourceLower}/${resourceLower}.ts`));
    console.log(chalk.gray(`  - ${baseDir}/core/repositories/${resourceLower}.ts`));
    console.log(
      chalk.gray(`  - ${baseDir}/adapters/postgres/repositories/${resourcePascal}Repository.ts`)
    );
    console.log(chalk.gray(`  - ${baseDir}/core/services/${resourcePascal}Service.ts`));
    console.log(
      chalk.gray(`  - ${baseDir}/transports/api/controllers/${resourcePascal}Controller.ts`)
    );
    console.log(
      chalk.gray(`  - ${baseDir}/transports/api/routers/v1/${resourceLower}.ts`)
    );
    console.log(
      chalk.gray(`  - ${baseDir}/transports/api/validations/${resourceLower}.ts`)
    );
    console.log(chalk.gray(`  - ${baseDir}/mappers/${resourceLower}/`));

    console.log(chalk.cyan('\n📝 Next steps:'));
    console.log(
      chalk.white('  1. Add router to src/transports/api/routers/v1/index.ts')
    );
    console.log(chalk.white('  2. Update Prisma schema if needed'));
    console.log(chalk.white('  3. Run: npm run build'));
    console.log(chalk.white('  4. Test your endpoints!\n'));
  } catch (error) {
    spinner.fail(chalk.red('Generation failed'));
    throw error;
  }
}

async function generateEntity(
  baseDir: string,
  resourceLower: string,
  resourcePascal: string,
  fields: FieldDefinition[]
): Promise<void> {
  const dir = path.join(baseDir, 'core', 'entities', resourceLower);
  await fs.ensureDir(dir);
  const content = entityTemplate(resourcePascal, fields);
  await fs.writeFile(path.join(dir, `${resourceLower}.ts`), content);
}

async function generateRepositoryInterface(
  baseDir: string,
  resourceLower: string,
  resourcePascal: string
): Promise<void> {
  const dir = path.join(baseDir, 'core', 'repositories');
  await fs.ensureDir(dir);
  const content = repositoryInterfaceTemplate(resourcePascal, resourceLower);
  await fs.writeFile(path.join(dir, `${resourceLower}.ts`), content);
}

async function generateRepositoryAdapter(
  baseDir: string,
  resourceLower: string,
  resourcePascal: string
): Promise<void> {
  const dir = path.join(baseDir, 'adapters', 'postgres', 'repositories');
  await fs.ensureDir(dir);
  const content = repositoryAdapterTemplate(resourcePascal, resourceLower);
  await fs.writeFile(path.join(dir, `${resourcePascal}Repository.ts`), content);
}

async function generateService(
  baseDir: string,
  resourceLower: string,
  resourcePascal: string
): Promise<void> {
  const dir = path.join(baseDir, 'core', 'services');
  await fs.ensureDir(dir);
  const content = serviceTemplate(resourcePascal, resourceLower);
  await fs.writeFile(path.join(dir, `${resourcePascal}Service.ts`), content);
}

async function generateController(
  baseDir: string,
  resourceLower: string,
  resourcePascal: string
): Promise<void> {
  const dir = path.join(baseDir, 'transports', 'api', 'controllers');
  await fs.ensureDir(dir);
  const content = controllerTemplate(resourcePascal, resourceLower);
  await fs.writeFile(path.join(dir, `${resourcePascal}Controller.ts`), content);
}

async function generateRouter(
  baseDir: string,
  resourceLower: string,
  resourcePascal: string,
  resourceCamel: string
): Promise<void> {
  const dir = path.join(baseDir, 'transports', 'api', 'routers', 'v1');
  await fs.ensureDir(dir);
  const content = routerTemplate(resourcePascal, resourceLower, resourceCamel);
  await fs.writeFile(path.join(dir, `${resourceLower}.ts`), content);
}

async function generateValidation(
  baseDir: string,
  resourceLower: string,
  resourcePascal: string,
  fields: FieldDefinition[]
): Promise<void> {
  const dir = path.join(baseDir, 'transports', 'api', 'validations');
  await fs.ensureDir(dir);
  const content = validationTemplate(resourcePascal, fields);
  await fs.writeFile(path.join(dir, `${resourceLower}.ts`), content);
}

async function generateMapper(
  baseDir: string,
  resourceLower: string,
  resourcePascal: string,
  fields: FieldDefinition[]
): Promise<void> {
  const dir = path.join(baseDir, 'mappers', resourceLower);
  await fs.ensureDir(dir);
  const content = mapperTemplate(resourcePascal, resourceLower, fields);
  await fs.writeFile(path.join(dir, 'mapper.ts'), content);
}
