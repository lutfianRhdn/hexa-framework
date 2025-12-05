import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { toPascalCase, toCamelCase, toKebabCase } from '../utils/string-helpers';

interface MakeOptions {
  name: string;
  type: 'controller' | 'service' | 'repository' | 'entity' | 'middleware' | 'dto' | 'validator' | 'mapper';
  dir?: string;
}

export async function makeController(name: string, options: { resource?: boolean }) {
  const spinner = ora(`Creating controller: ${name}Controller`).start();
  
  try {
    const className = `${toPascalCase(name)}Controller`;
    const controllerDir = path.join(process.cwd(), 'src', 'transports', 'controllers');
    
    if (!fs.existsSync(controllerDir)) {
      fs.mkdirSync(controllerDir, { recursive: true });
    }
    
    const controllerPath = path.join(controllerDir, `${className}.ts`);
    
    if (fs.existsSync(controllerPath)) {
      spinner.fail(`Controller ${className} already exists`);
      return;
    }
    
    const content = options.resource ? generateResourceController(name) : generateController(name);
    fs.writeFileSync(controllerPath, content);
    
    spinner.succeed(`Controller created: ${chalk.green(controllerPath)}`);
  } catch (error: any) {
    spinner.fail('Failed to create controller');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export async function makeService(name: string) {
  const spinner = ora(`Creating service: ${name}Service`).start();
  
  try {
    const className = `${toPascalCase(name)}Service`;
    const serviceDir = path.join(process.cwd(), 'src', 'core', 'services');
    
    if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
    }
    
    const servicePath = path.join(serviceDir, `${className}.ts`);
    
    if (fs.existsSync(servicePath)) {
      spinner.fail(`Service ${className} already exists`);
      return;
    }
    
    const content = generateService(name);
    fs.writeFileSync(servicePath, content);
    
    spinner.succeed(`Service created: ${chalk.green(servicePath)}`);
  } catch (error: any) {
    spinner.fail('Failed to create service');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export async function makeRepository(name: string) {
  const spinner = ora(`Creating repository: ${name}Repository`).start();
  
  try {
    const className = `${toPascalCase(name)}Repository`;
    const repositoryDir = path.join(process.cwd(), 'src', 'adapters', 'repositories');
    
    if (!fs.existsSync(repositoryDir)) {
      fs.mkdirSync(repositoryDir, { recursive: true });
    }
    
    const repositoryPath = path.join(repositoryDir, `${className}.ts`);
    
    if (fs.existsSync(repositoryPath)) {
      spinner.fail(`Repository ${className} already exists`);
      return;
    }
    
    const content = generateRepository(name);
    fs.writeFileSync(repositoryPath, content);
    
    spinner.succeed(`Repository created: ${chalk.green(repositoryPath)}`);
  } catch (error: any) {
    spinner.fail('Failed to create repository');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export async function makeEntity(name: string) {
  const spinner = ora(`Creating entity: ${name}`).start();
  
  try {
    const className = toPascalCase(name);
    const entityDir = path.join(process.cwd(), 'src', 'core', 'entities');
    
    if (!fs.existsSync(entityDir)) {
      fs.mkdirSync(entityDir, { recursive: true });
    }
    
    const entityPath = path.join(entityDir, `${className}.ts`);
    
    if (fs.existsSync(entityPath)) {
      spinner.fail(`Entity ${className} already exists`);
      return;
    }
    
    const content = generateEntity(name);
    fs.writeFileSync(entityPath, content);
    
    spinner.succeed(`Entity created: ${chalk.green(entityPath)}`);
  } catch (error: any) {
    spinner.fail('Failed to create entity');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export async function makeMiddleware(name: string) {
  const spinner = ora(`Creating middleware: ${name}`).start();
  
  try {
    const fileName = toCamelCase(name);
    const middlewareDir = path.join(process.cwd(), 'src', 'core', 'middleware');
    
    if (!fs.existsSync(middlewareDir)) {
      fs.mkdirSync(middlewareDir, { recursive: true });
    }
    
    const middlewarePath = path.join(middlewareDir, `${fileName}.ts`);
    
    if (fs.existsSync(middlewarePath)) {
      spinner.fail(`Middleware ${fileName} already exists`);
      return;
    }
    
    const content = generateMiddleware(name);
    fs.writeFileSync(middlewarePath, content);
    
    spinner.succeed(`Middleware created: ${chalk.green(middlewarePath)}`);
  } catch (error: any) {
    spinner.fail('Failed to create middleware');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export async function makeDto(name: string) {
  const spinner = ora(`Creating DTO: ${name}Dto`).start();
  
  try {
    const className = `${toPascalCase(name)}Dto`;
    const dtoDir = path.join(process.cwd(), 'src', 'core', 'dtos');
    
    if (!fs.existsSync(dtoDir)) {
      fs.mkdirSync(dtoDir, { recursive: true });
    }
    
    const dtoPath = path.join(dtoDir, `${className}.ts`);
    
    if (fs.existsSync(dtoPath)) {
      spinner.fail(`DTO ${className} already exists`);
      return;
    }
    
    const content = generateDto(name);
    fs.writeFileSync(dtoPath, content);
    
    spinner.succeed(`DTO created: ${chalk.green(dtoPath)}`);
  } catch (error: any) {
    spinner.fail('Failed to create DTO');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// Template generators
function generateController(name: string): string {
  const className = `${toPascalCase(name)}Controller`;
  const serviceName = `${toPascalCase(name)}Service`;
  const instanceName = toCamelCase(name);
  
  return `import { Request, Response, NextFunction } from 'express';
import { ${serviceName} } from '../../core/services/${serviceName}';

export class ${className} {
  constructor(private ${instanceName}Service: ${serviceName}) {}

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.${instanceName}Service.findAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await this.${instanceName}Service.findById(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
`;
}

function generateResourceController(name: string): string {
  const className = `${toPascalCase(name)}Controller`;
  const serviceName = `${toPascalCase(name)}Service`;
  const instanceName = toCamelCase(name);
  
  return `import { Request, Response, NextFunction } from 'express';
import { ${serviceName} } from '../../core/services/${serviceName}';

export class ${className} {
  constructor(private ${instanceName}Service: ${serviceName}) {}

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.${instanceName}Service.findAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await this.${instanceName}Service.findById(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.${instanceName}Service.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await this.${instanceName}Service.update(id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.${instanceName}Service.delete(id);
      res.json({ success: true, message: '${className} deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
`;
}

function generateService(name: string): string {
  const className = `${toPascalCase(name)}Service`;
  const entityName = toPascalCase(name);
  const repositoryName = `${entityName}Repository`;
  const instanceName = toCamelCase(name);
  
  return `import { ${entityName} } from '../entities/${entityName}';
import { ${repositoryName} } from '../../adapters/repositories/${repositoryName}';

export class ${className} {
  constructor(private ${instanceName}Repository: ${repositoryName}) {}

  async findAll(): Promise<${entityName}[]> {
    return await this.${instanceName}Repository.findAll();
  }

  async findById(id: string): Promise<${entityName} | null> {
    return await this.${instanceName}Repository.findById(id);
  }

  async create(data: Partial<${entityName}>): Promise<${entityName}> {
    return await this.${instanceName}Repository.create(data);
  }

  async update(id: string, data: Partial<${entityName}>): Promise<${entityName}> {
    return await this.${instanceName}Repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.${instanceName}Repository.delete(id);
  }
}
`;
}

function generateRepository(name: string): string {
  const className = `${toPascalCase(name)}Repository`;
  const entityName = toPascalCase(name);
  const tableName = toKebabCase(name);
  
  return `import { ${entityName} } from '../../core/entities/${entityName}';
import { PrismaClient } from '@prisma/client';

export class ${className} {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<${entityName}[]> {
    return await this.prisma.${tableName}.findMany();
  }

  async findById(id: string): Promise<${entityName} | null> {
    return await this.prisma.${tableName}.findUnique({
      where: { id }
    });
  }

  async create(data: Partial<${entityName}>): Promise<${entityName}> {
    return await this.prisma.${tableName}.create({
      data: data as any
    });
  }

  async update(id: string, data: Partial<${entityName}>): Promise<${entityName}> {
    return await this.prisma.${tableName}.update({
      where: { id },
      data: data as any
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.${tableName}.delete({
      where: { id }
    });
  }
}
`;
}

function generateEntity(name: string): string {
  const className = toPascalCase(name);
  
  return `export class ${className} {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<${className}>) {
    Object.assign(this, data);
  }
}
`;
}

function generateMiddleware(name: string): string {
  const functionName = toCamelCase(name);
  
  return `import { Request, Response, NextFunction } from 'express';

export async function ${functionName}(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Add your middleware logic here
    
    next();
  } catch (error) {
    next(error);
  }
}
`;
}

function generateDto(name: string): string {
  const className = `${toPascalCase(name)}Dto`;
  
  return `export class ${className} {
  // Define your DTO properties here
  
  constructor(data: Partial<${className}>) {
    Object.assign(this, data);
  }

  validate(): boolean {
    // Add validation logic here
    return true;
  }
}
`;
}
