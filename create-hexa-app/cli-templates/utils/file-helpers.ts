import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

export async function ensureDirectory(dirPath: string): Promise<void> {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDirectory(dir);
  fs.writeFileSync(filePath, content, 'utf8');
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function getProjectRoot(): string {
  let currentDir = process.cwd();
  
  // Look for package.json
  while (currentDir !== path.parse(currentDir).root) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  return process.cwd();
}

export function getSrcPath(): string {
  const projectRoot = getProjectRoot();
  const srcPath = path.join(projectRoot, 'src');
  
  if (!fs.existsSync(srcPath)) {
    throw new Error(`src directory not found at ${srcPath}`);
  }
  
  return srcPath;
}

export function detectProjectConfig(): { template: string; database: string; transports: string[] } {
  const projectRoot = getProjectRoot();
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found. Are you in a Hexa Framework project?');
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // Detect template
  let template = 'empty';
  if (fs.existsSync(path.join(projectRoot, 'src/core/entities/permission'))) {
    template = 'full-auth';
  } else if (fs.existsSync(path.join(projectRoot, 'src/core/entities/user'))) {
    template = 'basic-auth';
  }
  
  // Detect database
  let database = 'postgresql';
  const prismaSchema = path.join(projectRoot, 'prisma/schema.prisma');
  if (fs.existsSync(prismaSchema)) {
    const schema = fs.readFileSync(prismaSchema, 'utf8');
    if (schema.includes('provider = "mysql"')) database = 'mysql';
    else if (schema.includes('provider = "mongodb"')) database = 'mongodb';
    else if (schema.includes('provider = "sqlite"')) database = 'sqlite';
  }
  
  // Detect transports
  const transports: string[] = [];
  if (deps['morgan']) transports.push('rest');
  if (deps['apollo-server-express']) transports.push('graphql');
  if (deps['socket.io']) transports.push('websocket');
  
  return { template, database, transports };
}

export function logSuccess(message: string): void {
  console.log(chalk.green('✅', message));
}

export function logError(message: string): void {
  console.log(chalk.red('❌', message));
}

export function logWarning(message: string): void {
  console.log(chalk.yellow('⚠️ ', message));
}

export function logInfo(message: string): void {
  console.log(chalk.blue('ℹ️ ', message));
}

export function parseFields(fieldsString: string): Array<{ name: string; type: string; optional?: boolean }> {
  if (!fieldsString) return [];
  
  return fieldsString.split(',').map(field => {
    const [name, typeStr] = field.trim().split(':');
    const optional = typeStr?.includes('?');
    const type = typeStr?.replace('?', '') || 'string';
    
    return { name: name.trim(), type, optional };
  });
}

export function mapTypeToZod(type: string, optional: boolean = false): string {
  const zodTypes: Record<string, string> = {
    string: 'z.string()',
    number: 'z.number()',
    boolean: 'z.boolean()',
    date: 'z.date()',
    array: 'z.array(z.any())',
    object: 'z.object({})'
  };
  
  const zodType = zodTypes[type.toLowerCase()] || 'z.string()';
  return optional ? `${zodType}.optional()` : zodType;
}

export function mapTypeToPrisma(type: string, optional: boolean = false): string {
  const prismaTypes: Record<string, string> = {
    string: 'String',
    number: 'Int',
    float: 'Float',
    boolean: 'Boolean',
    date: 'DateTime',
    json: 'Json'
  };
  
  const prismaType = prismaTypes[type.toLowerCase()] || 'String';
  return optional ? `${prismaType}?` : prismaType;
}

export function mapTypeToTypeScript(type: string, optional: boolean = false): string {
  const tsTypes: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    date: 'Date',
    array: 'any[]',
    object: 'Record<string, any>'
  };
  
  const tsType = tsTypes[type.toLowerCase()] || 'string';
  return optional ? `${tsType} | null` : tsType;
}
