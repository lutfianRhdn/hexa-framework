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

export async function makeAdapter(name: string, options: { type?: string }) {
  const adapterType = options.type || 'database';
  const spinner = ora(`Creating ${adapterType} adapter: ${name}Adapter`).start();
  
  try {
    const className = `${toPascalCase(name)}Adapter`;
    const adapterDir = path.join(process.cwd(), 'src', 'adapters', adapterType);
    
    if (!fs.existsSync(adapterDir)) {
      fs.mkdirSync(adapterDir, { recursive: true });
    }
    
    const adapterPath = path.join(adapterDir, `${className}.ts`);
    
    if (fs.existsSync(adapterPath)) {
      spinner.fail(`Adapter ${className} already exists`);
      return;
    }
    
    const content = generateAdapter(name, adapterType);
    fs.writeFileSync(adapterPath, content);
    
    spinner.succeed(`Adapter created: ${chalk.green(adapterPath)}`);
  } catch (error: any) {
    spinner.fail('Failed to create adapter');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

export async function makeTransport(name: string, options: { type?: string }) {
  const transportType = options.type || 'http';
  const spinner = ora(`Creating ${transportType} transport: ${name}Transport`).start();
  
  try {
    const className = `${toPascalCase(name)}Transport`;
    const transportDir = path.join(process.cwd(), 'src', 'transports', transportType);
    
    if (!fs.existsSync(transportDir)) {
      fs.mkdirSync(transportDir, { recursive: true });
    }
    
    const transportPath = path.join(transportDir, `${className}.ts`);
    
    if (fs.existsSync(transportPath)) {
      spinner.fail(`Transport ${className} already exists`);
      return;
    }
    
    const content = generateTransport(name, transportType);
    fs.writeFileSync(transportPath, content);
    
    spinner.succeed(`Transport created: ${chalk.green(transportPath)}`);
  } catch (error: any) {
    spinner.fail('Failed to create transport');
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

function generateAdapter(name: string, adapterType: string): string {
  const className = `${toPascalCase(name)}Adapter`;
  const entityName = toPascalCase(name);
  
  if (adapterType === 'database' || adapterType === 'repositories') {
    return `import { PrismaClient } from '@prisma/client';

/**
 * ${className} - Database Adapter
 * Handles data persistence for ${entityName}
 */
export class ${className} {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<any[]> {
    // Implement database query
    return await this.prisma.${toCamelCase(name)}.findMany();
  }

  async findById(id: string): Promise<any | null> {
    return await this.prisma.${toCamelCase(name)}.findUnique({
      where: { id }
    });
  }

  async create(data: any): Promise<any> {
    return await this.prisma.${toCamelCase(name)}.create({
      data
    });
  }

  async update(id: string, data: any): Promise<any> {
    return await this.prisma.${toCamelCase(name)}.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.${toCamelCase(name)}.delete({
      where: { id }
    });
  }
}
`;
  } else if (adapterType === 'cache') {
    return `/**
 * ${className} - Cache Adapter
 * Handles caching operations for ${entityName}
 */
export class ${className} {
  private cacheStore: Map<string, any> = new Map();
  private ttl: number = 3600; // 1 hour default

  async get(key: string): Promise<any | null> {
    return this.cacheStore.get(key) || null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cacheStore.set(key, value);
    
    // Set expiration
    setTimeout(() => {
      this.cacheStore.delete(key);
    }, (ttl || this.ttl) * 1000);
  }

  async delete(key: string): Promise<void> {
    this.cacheStore.delete(key);
  }

  async clear(): Promise<void> {
    this.cacheStore.clear();
  }

  async has(key: string): Promise<boolean> {
    return this.cacheStore.has(key);
  }
}
`;
  } else if (adapterType === 'messaging' || adapterType === 'queue') {
    return `/**
 * ${className} - Messaging/Queue Adapter
 * Handles message queue operations for ${entityName}
 */
export class ${className} {
  async send(message: any): Promise<void> {
    // Implement message sending logic
    console.log('Sending message:', message);
  }

  async receive(): Promise<any> {
    // Implement message receiving logic
    return null;
  }

  async subscribe(topic: string, handler: (message: any) => void): Promise<void> {
    // Implement subscription logic
    console.log(\`Subscribed to \${topic}\`);
  }

  async unsubscribe(topic: string): Promise<void> {
    // Implement unsubscription logic
    console.log(\`Unsubscribed from \${topic}\`);
  }
}
`;
  } else {
    // Generic adapter
    return `/**
 * ${className} - ${adapterType} Adapter
 * Handles external ${adapterType} integration for ${entityName}
 */
export class ${className} {
  constructor() {
    // Initialize adapter
  }

  async connect(): Promise<void> {
    // Implement connection logic
    console.log('${className} connected');
  }

  async disconnect(): Promise<void> {
    // Implement disconnection logic
    console.log('${className} disconnected');
  }

  async execute(operation: string, data?: any): Promise<any> {
    // Implement operation execution
    console.log(\`Executing \${operation}\`, data);
    return null;
  }
}
`;
  }
}

function generateTransport(name: string, transportType: string): string {
  const className = `${toPascalCase(name)}Transport`;
  const routerName = `${toCamelCase(name)}Router`;
  
  if (transportType === 'http' || transportType === 'rest') {
    return `import { Router, Request, Response, NextFunction } from 'express';
import { ${toPascalCase(name)}Controller } from '../controllers/${toPascalCase(name)}Controller';

/**
 * ${className} - HTTP/REST Transport
 * Handles HTTP routing and request/response for ${toPascalCase(name)}
 */
export class ${className} {
  private router: Router;
  private controller: ${toPascalCase(name)}Controller;

  constructor(controller: ${toPascalCase(name)}Controller) {
    this.router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET all
    this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
      this.controller.index(req, res, next);
    });

    // GET by ID
    this.router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
      this.controller.show(req, res, next);
    });

    // POST create
    this.router.post('/', (req: Request, res: Response, next: NextFunction) => {
      this.controller.store(req, res, next);
    });

    // PUT update
    this.router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
      this.controller.update(req, res, next);
    });

    // DELETE
    this.router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
      this.controller.destroy(req, res, next);
    });
  }

  getRouter(): Router {
    return this.router;
  }
}

// Export router instance
export const ${routerName} = (controller: ${toPascalCase(name)}Controller) => {
  const transport = new ${className}(controller);
  return transport.getRouter();
};
`;
  } else if (transportType === 'graphql') {
    return `import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } from 'graphql';

/**
 * ${className} - GraphQL Transport
 * Handles GraphQL schema and resolvers for ${toPascalCase(name)}
 */

// Define GraphQL Type
const ${toPascalCase(name)}Type = new GraphQLObjectType({
  name: '${toPascalCase(name)}',
  fields: () => ({
    id: { type: GraphQLID },
    // Add your fields here
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  })
});

// Query definitions
export const ${toCamelCase(name)}Queries = {
  ${toCamelCase(name)}: {
    type: ${toPascalCase(name)}Type,
    args: { id: { type: GraphQLID } },
    resolve: async (parent: any, args: any, context: any) => {
      // Implement resolver logic
      return null;
    }
  },
  ${toCamelCase(name)}List: {
    type: new GraphQLList(${toPascalCase(name)}Type),
    resolve: async (parent: any, args: any, context: any) => {
      // Implement resolver logic
      return [];
    }
  }
};

// Mutation definitions
export const ${toCamelCase(name)}Mutations = {
  create${toPascalCase(name)}: {
    type: ${toPascalCase(name)}Type,
    args: {
      // Add input arguments
    },
    resolve: async (parent: any, args: any, context: any) => {
      // Implement mutation logic
      return null;
    }
  },
  update${toPascalCase(name)}: {
    type: ${toPascalCase(name)}Type,
    args: {
      id: { type: GraphQLID },
      // Add input arguments
    },
    resolve: async (parent: any, args: any, context: any) => {
      // Implement mutation logic
      return null;
    }
  },
  delete${toPascalCase(name)}: {
    type: GraphQLID,
    args: { id: { type: GraphQLID } },
    resolve: async (parent: any, args: any, context: any) => {
      // Implement mutation logic
      return args.id;
    }
  }
};
`;
  } else if (transportType === 'grpc') {
    return `/**
 * ${className} - gRPC Transport
 * Handles gRPC service for ${toPascalCase(name)}
 */

interface I${toPascalCase(name)}Service {
  Get${toPascalCase(name)}: (call: any, callback: any) => void;
  List${toPascalCase(name)}: (call: any, callback: any) => void;
  Create${toPascalCase(name)}: (call: any, callback: any) => void;
  Update${toPascalCase(name)}: (call: any, callback: any) => void;
  Delete${toPascalCase(name)}: (call: any, callback: any) => void;
}

export class ${className} implements I${toPascalCase(name)}Service {
  Get${toPascalCase(name)}(call: any, callback: any): void {
    // Implement Get logic
    callback(null, { id: call.request.id });
  }

  List${toPascalCase(name)}(call: any, callback: any): void {
    // Implement List logic
    callback(null, { items: [] });
  }

  Create${toPascalCase(name)}(call: any, callback: any): void {
    // Implement Create logic
    callback(null, call.request);
  }

  Update${toPascalCase(name)}(call: any, callback: any): void {
    // Implement Update logic
    callback(null, call.request);
  }

  Delete${toPascalCase(name)}(call: any, callback: any): void {
    // Implement Delete logic
    callback(null, { success: true });
  }
}

// Service definition for proto file:
/*
service ${toPascalCase(name)}Service {
  rpc Get${toPascalCase(name)} (${toPascalCase(name)}Request) returns (${toPascalCase(name)}Response);
  rpc List${toPascalCase(name)} (Empty) returns (${toPascalCase(name)}ListResponse);
  rpc Create${toPascalCase(name)} (Create${toPascalCase(name)}Request) returns (${toPascalCase(name)}Response);
  rpc Update${toPascalCase(name)} (Update${toPascalCase(name)}Request) returns (${toPascalCase(name)}Response);
  rpc Delete${toPascalCase(name)} (Delete${toPascalCase(name)}Request) returns (DeleteResponse);
}
*/
`;
  } else if (transportType === 'websocket') {
    return `import { Server as WebSocketServer, WebSocket } from 'ws';

/**
 * ${className} - WebSocket Transport
 * Handles real-time WebSocket communication for ${toPascalCase(name)}
 */
export class ${className} {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({ port });
    this.setupListeners();
  }

  private setupListeners(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected');
      this.clients.add(ws);

      ws.on('message', (message: string) => {
        this.handleMessage(ws, message);
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: string): void {
    try {
      const data = JSON.parse(message.toString());
      
      // Handle different message types
      switch (data.type) {
        case 'get':
          this.handleGet(ws, data);
          break;
        case 'create':
          this.handleCreate(ws, data);
          break;
        case 'update':
          this.handleUpdate(ws, data);
          break;
        case 'delete':
          this.handleDelete(ws, data);
          break;
        default:
          ws.send(JSON.stringify({ error: 'Unknown message type' }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  }

  private handleGet(ws: WebSocket, data: any): void {
    // Implement get logic
    ws.send(JSON.stringify({ type: 'get', data: null }));
  }

  private handleCreate(ws: WebSocket, data: any): void {
    // Implement create logic
    this.broadcast({ type: 'created', data: data.payload });
  }

  private handleUpdate(ws: WebSocket, data: any): void {
    // Implement update logic
    this.broadcast({ type: 'updated', data: data.payload });
  }

  private handleDelete(ws: WebSocket, data: any): void {
    // Implement delete logic
    this.broadcast({ type: 'deleted', data: { id: data.id } });
  }

  private broadcast(message: any): void {
    const json = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    });
  }

  close(): void {
    this.wss.close();
  }
}
`;
  } else {
    // Generic transport
    return `/**
 * ${className} - ${transportType} Transport
 * Handles ${transportType} communication for ${toPascalCase(name)}
 */
export class ${className} {
  constructor() {
    // Initialize transport
    this.setup();
  }

  private setup(): void {
    // Setup transport logic
    console.log('${className} transport initialized');
  }

  async send(data: any): Promise<void> {
    // Implement send logic
    console.log('Sending data:', data);
  }

  async receive(): Promise<any> {
    // Implement receive logic
    return null;
  }

  async close(): Promise<void> {
    // Cleanup logic
    console.log('${className} transport closed');
  }
}
`;
  }
}

/**
 * Generate test file for any component
 */
export async function makeTest(name: string, options: { type?: string; unit?: boolean; integration?: boolean; e2e?: boolean }) {
  const testType = options.unit ? 'unit' : options.integration ? 'integration' : options.e2e ? 'e2e' : 'spec';
  const componentType = options.type || 'service';
  
  const spinner = ora(`Creating ${testType} test for ${name}`).start();
  
  try {
    const className = `${toPascalCase(name)}${toPascalCase(componentType)}`;
    const testFileName = `${className}.${testType}.ts`;
    
    // Determine test directory based on type
    let testDir: string;
    if (testType === 'unit' || testType === 'spec') {
      testDir = path.join(process.cwd(), 'tests', 'unit', componentType + 's');
    } else if (testType === 'integration') {
      testDir = path.join(process.cwd(), 'tests', 'integration');
    } else {
      testDir = path.join(process.cwd(), 'tests', 'e2e');
    }
    
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const testPath = path.join(testDir, testFileName);
    
    if (fs.existsSync(testPath)) {
      spinner.fail(`Test file ${testFileName} already exists`);
      return;
    }
    
    const content = generateTestFile(name, componentType, testType);
    fs.writeFileSync(testPath, content);
    
    spinner.succeed(`Test created: ${chalk.green(testPath)}`);
    console.log(chalk.gray(`\nRun tests with: ${chalk.cyan('hexa test')}`));
  } catch (error: any) {
    spinner.fail('Failed to create test');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

/**
 * Generate test file content based on component type
 */
function generateTestFile(name: string, componentType: string, testType: string): string {
  const className = `${toPascalCase(name)}${toPascalCase(componentType)}`;
  const varName = toCamelCase(name) + toPascalCase(componentType);
  
  // Determine import path based on component type
  let importPath = '';
  switch (componentType) {
    case 'controller':
      importPath = '@/transports/controllers';
      break;
    case 'service':
      importPath = '@/core/services';
      break;
    case 'repository':
      importPath = '@/adapters/repositories';
      break;
    case 'entity':
      importPath = '@/core/entities';
      break;
    case 'middleware':
      importPath = '@/transports/middlewares';
      break;
    case 'adapter':
      importPath = '@/adapters';
      break;
    case 'transport':
      importPath = '@/transports';
      break;
    default:
      importPath = '@/core';
  }

  if (testType === 'unit' || testType === 'spec') {
    return generateUnitTest(className, varName, importPath, componentType);
  } else if (testType === 'integration') {
    return generateIntegrationTest(className, varName, importPath, componentType);
  } else {
    return generateE2ETest(className, varName, importPath, componentType);
  }
}

/**
 * Generate unit test template
 */
function generateUnitTest(className: string, varName: string, importPath: string, componentType: string): string {
  if (componentType === 'service') {
    return `import { ${className} } from '${importPath}/${className}';

describe('${className}', () => {
  let ${varName}: ${className};

  beforeEach(() => {
    // Initialize service before each test
    ${varName} = new ${className}();
  });

  afterEach(() => {
    // Cleanup after each test
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(${varName}).toBeDefined();
      expect(${varName}).toBeInstanceOf(${className});
    });
  });

  describe('business logic methods', () => {
    it('should perform operation successfully', async () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      const result = await ${varName}.someMethod(input);
      
      // Assert
      expect(result).toBeDefined();
      // Add your assertions here
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const invalidInput = null;
      
      // Act & Assert
      await expect(${varName}.someMethod(invalidInput)).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', async () => {
      // Add edge case tests
    });

    it('should validate input data', async () => {
      // Add validation tests
    });
  });
});
`;
  } else if (componentType === 'repository') {
    return `import { ${className} } from '${importPath}/${className}';

describe('${className}', () => {
  let ${varName}: ${className};
  let mockDb: any;

  beforeEach(() => {
    // Mock database connection
    mockDb = {
      query: jest.fn(),
      execute: jest.fn(),
    };
    
    ${varName} = new ${className}(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all records', async () => {
      // Arrange
      const mockData = [{ id: 1 }, { id: 2 }];
      mockDb.query.mockResolvedValue(mockData);
      
      // Act
      const result = await ${varName}.findAll();
      
      // Assert
      expect(result).toEqual(mockData);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return a single record by id', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test' };
      mockDb.query.mockResolvedValue([mockData]);
      
      // Act
      const result = await ${varName}.findById(1);
      
      // Assert
      expect(result).toEqual(mockData);
    });

    it('should return null when record not found', async () => {
      // Arrange
      mockDb.query.mockResolvedValue([]);
      
      // Act
      const result = await ${varName}.findById(999);
      
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      // Arrange
      const newData = { name: 'New Item' };
      const mockCreated = { id: 1, ...newData };
      mockDb.execute.mockResolvedValue({ insertId: 1 });
      mockDb.query.mockResolvedValue([mockCreated]);
      
      // Act
      const result = await ${varName}.create(newData);
      
      // Assert
      expect(result).toEqual(mockCreated);
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      // Arrange
      const updateData = { name: 'Updated' };
      mockDb.execute.mockResolvedValue({ affectedRows: 1 });
      
      // Act
      await ${varName}.update(1, updateData);
      
      // Assert
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete a record', async () => {
      // Arrange
      mockDb.execute.mockResolvedValue({ affectedRows: 1 });
      
      // Act
      await ${varName}.delete(1);
      
      // Assert
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });
  });
});
`;
  } else if (componentType === 'controller') {
    return `import { ${className} } from '${importPath}/${className}';
import { Request, Response } from 'express';

describe('${className}', () => {
  let ${varName}: ${className};
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockService: any;

  beforeEach(() => {
    // Mock service
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Mock Express request and response
    mockRequest = {
      params: {},
      body: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    ${varName} = new ${className}(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('index', () => {
    it('should return all items', async () => {
      // Arrange
      const mockData = [{ id: 1 }, { id: 2 }];
      mockService.findAll.mockResolvedValue(mockData);

      // Act
      await ${varName}.index(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockService.findAll).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockData);
    });
  });

  describe('show', () => {
    it('should return a single item', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      const mockData = { id: 1, name: 'Test' };
      mockService.findById.mockResolvedValue(mockData);

      // Act
      await ${varName}.show(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockService.findById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockData);
    });

    it('should return 404 when item not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockService.findById.mockResolvedValue(null);

      // Act
      await ${varName}.show(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('store', () => {
    it('should create a new item', async () => {
      // Arrange
      const newData = { name: 'New Item' };
      mockRequest.body = newData;
      const mockCreated = { id: 1, ...newData };
      mockService.create.mockResolvedValue(mockCreated);

      // Act
      await ${varName}.store(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockService.create).toHaveBeenCalledWith(newData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreated);
    });
  });

  describe('update', () => {
    it('should update an existing item', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated' };
      const mockUpdated = { id: 1, name: 'Updated' };
      mockService.update.mockResolvedValue(mockUpdated);

      // Act
      await ${varName}.update(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockService.update).toHaveBeenCalledWith(1, { name: 'Updated' });
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdated);
    });
  });

  describe('destroy', () => {
    it('should delete an item', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockService.delete.mockResolvedValue(true);

      // Act
      await ${varName}.destroy(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockService.delete).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });
  });
});
`;
  } else {
    // Generic test template
    return `import { ${className} } from '${importPath}/${className}';

describe('${className}', () => {
  let instance: ${className};

  beforeEach(() => {
    instance = new ${className}();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create an instance', () => {
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(${className});
    });
  });

  describe('methods', () => {
    it('should perform operation successfully', async () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      // const result = await instance.someMethod(input);
      
      // Assert
      // expect(result).toBeDefined();
      // Add your assertions here
    });
  });
});
`;
  }
}

/**
 * Generate integration test template
 */
function generateIntegrationTest(className: string, varName: string, importPath: string, componentType: string): string {
  return `import { ${className} } from '${importPath}/${className}';

/**
 * Integration tests for ${className}
 * Tests interactions between multiple components
 */
describe('${className} Integration Tests', () => {
  let ${varName}: ${className};

  beforeAll(async () => {
    // Setup test database, connections, etc.
    // await setupTestEnvironment();
  });

  afterAll(async () => {
    // Cleanup test environment
    // await teardownTestEnvironment();
  });

  beforeEach(() => {
    ${varName} = new ${className}();
  });

  describe('end-to-end workflow', () => {
    it('should handle complete operation flow', async () => {
      // Arrange
      const testData = { /* integration test data */ };
      
      // Act
      // Perform multi-step operations
      // const result = await ${varName}.complexOperation(testData);
      
      // Assert
      // Verify the complete flow
      // expect(result).toBeDefined();
    });
  });

  describe('database interactions', () => {
    it('should persist and retrieve data correctly', async () => {
      // Test actual database operations
    });

    it('should handle transactions properly', async () => {
      // Test transaction rollback/commit
    });
  });

  describe('external dependencies', () => {
    it('should interact with external services', async () => {
      // Test API calls, message queues, etc.
    });
  });

  describe('error scenarios', () => {
    it('should handle database connection failures', async () => {
      // Test resilience
    });

    it('should recover from timeout errors', async () => {
      // Test error recovery
    });
  });
});
`;
}

/**
 * Generate E2E test template
 */
function generateE2ETest(className: string, varName: string, importPath: string, componentType: string): string {
  return `import request from 'supertest';
import { app } from '@/index';

/**
 * End-to-End tests for ${className}
 * Tests the complete application flow from HTTP request to response
 */
describe('${className} E2E Tests', () => {
  beforeAll(async () => {
    // Setup test server and database
    // await app.initialize();
  });

  afterAll(async () => {
    // Cleanup and close connections
    // await app.close();
  });

  describe('GET endpoints', () => {
    it('should retrieve all items', async () => {
      const response = await request(app)
        .get('/api/items')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should retrieve a single item by id', async () => {
      const response = await request(app)
        .get('/api/items/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(1);
    });

    it('should return 404 for non-existent item', async () => {
      await request(app)
        .get('/api/items/99999')
        .expect(404);
    });
  });

  describe('POST endpoints', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'Test Item',
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidItem = {};

      await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);
    });
  });

  describe('PUT endpoints', () => {
    it('should update an existing item', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/items/1')
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent item', async () => {
      await request(app)
        .put('/api/items/99999')
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE endpoints', () => {
    it('should delete an item', async () => {
      await request(app)
        .delete('/api/items/1')
        .expect(204);

      // Verify deletion
      await request(app)
        .get('/api/items/1')
        .expect(404);
    });
  });

  describe('authentication and authorization', () => {
    it('should require authentication', async () => {
      await request(app)
        .post('/api/items')
        .send({ name: 'Test' })
        .expect(401);
    });

    it('should allow access with valid token', async () => {
      const token = 'valid-test-token';

      await request(app)
        .post('/api/items')
        .set('Authorization', \`Bearer \${token}\`)
        .send({ name: 'Test' })
        .expect(201);
    });
  });

  describe('error handling', () => {
    it('should handle server errors gracefully', async () => {
      // Trigger a server error condition
      await request(app)
        .get('/api/items/error')
        .expect(500);
    });

    it('should return proper error messages', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ invalid: 'data' })
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBeDefined();
    });
  });
});
`;
}
