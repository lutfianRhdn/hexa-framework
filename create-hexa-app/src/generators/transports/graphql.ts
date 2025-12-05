import fs from 'fs-extra';
import path from 'path';
import { GeneratorContext } from '../../types';

export async function generateGraphQLTransport(ctx: GeneratorContext): Promise<void> {
  const { srcPath, config } = ctx;
  const transportPath = path.join(srcPath, 'transports', 'graphql');
  
  await fs.ensureDir(path.join(transportPath, 'resolvers'));
  await fs.ensureDir(path.join(transportPath, 'types'));

  // Generate base GraphQL setup
  await generateGraphQLConfig(transportPath, config.template);

  // Generate auth-specific resolvers and types
  if (config.template === 'basic-auth' || config.template === 'full-auth') {
    await generateUserType(transportPath);
    await generateUserResolver(transportPath);
    await generateAuthResolver(transportPath, config.database);
  }

  // Generate role/permission resolvers for full auth
  if (config.template === 'full-auth') {
    await generateRoleType(transportPath);
    await generatePermissionType(transportPath);
    await generateRoleResolver(transportPath);
    await generatePermissionResolver(transportPath);
  }

  console.log('  ✅ GraphQL transport files generated');
}

async function generateGraphQLConfig(transportPath: string, template: string) {
  // Build resolver imports based on template
  let resolverImports = `import { AuthResolver } from './resolvers/AuthResolver';\nimport { UserResolver } from './resolvers/UserResolver';`;
  let resolverArray = '[AuthResolver, UserResolver]';
  
  if (template === 'full-auth') {
    resolverImports += `\nimport { RoleResolver } from './resolvers/RoleResolver';\nimport { PermissionResolver } from './resolvers/PermissionResolver';`;
    resolverArray = '[AuthResolver, UserResolver, RoleResolver, PermissionResolver]';
  }
  
  const config = `import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { Express, Application } from 'express';
import path from 'path';
${resolverImports}

export async function setupGraphQL(app: Express) {
  const schema = await buildSchema({
    resolvers: ${resolverArray},
    emitSchemaFile: path.resolve(__dirname, '../../schema.gql'),
    validate: false
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
    introspection: true
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app as any, path: '/graphql' });

  return apolloServer;
}
`;

  await fs.writeFile(path.join(transportPath, 'index.ts'), config);
}

async function generateUserType(transportPath: string) {
  const type = `import { ObjectType, Field, ID, InputType } from 'type-graphql';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id!: string | number;

  @Field()
  email!: string;

  @Field({ nullable: true })
  username!: string | null;

  @Field({ nullable: true })
  name!: string | null;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@InputType()
export class CreateUserInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  username!: string;

  @Field({ nullable: true })
  name?: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  token!: string;

  @Field(() => UserType)
  user!: UserType;
}

@ObjectType()
export class PaginatedUsers {
  @Field(() => [UserType])
  data!: UserType[];

  @Field()
  total!: number;

  @Field()
  page!: number;

  @Field()
  limit!: number;
}
`;

  await fs.writeFile(path.join(transportPath, 'types', 'UserType.ts'), type);
}

async function generateUserResolver(transportPath: string) {
  const resolver = `import { Resolver, Query, Mutation, Arg, ID, Ctx, UseMiddleware } from 'type-graphql';
import { UserType, CreateUserInput, UpdateUserInput, PaginatedUsers } from '../types/UserType';
import { UserService } from '../../../core/services/UserService';
import { GraphQLAuthMiddleware } from '../../../policies/graphqlAuthMiddleware';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Mutation(() => UserType)
  async createUser(@Arg('data') data: CreateUserInput): Promise<UserType> {
    return await this.userService.createUser(data);
  }

  @Query(() => UserType)
  @UseMiddleware(GraphQLAuthMiddleware)
  async user(@Arg('id', () => ID) id: string | number): Promise<UserType> {
    const userId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    return await this.userService.getUserById(userId);
  }

  @Query(() => PaginatedUsers)
  @UseMiddleware(GraphQLAuthMiddleware)
  async users(
    @Arg('page', { defaultValue: 1 }) page: number,
    @Arg('limit', { defaultValue: 10 }) limit: number
  ): Promise<PaginatedUsers> {
    return await this.userService.getAllUsers(page, limit);
  }

  @Mutation(() => UserType)
  @UseMiddleware(GraphQLAuthMiddleware)
  async updateUser(
    @Arg('id', () => ID) id: string | number,
    @Arg('data') data: UpdateUserInput
  ): Promise<UserType> {
    const userId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    return await this.userService.updateUser(userId, data);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(GraphQLAuthMiddleware)
  async deleteUser(@Arg('id', () => ID) id: string | number): Promise<boolean> {
    const userId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    await this.userService.deleteUser(userId);
    return true;
  }
}
`;

  await fs.writeFile(path.join(transportPath, 'resolvers', 'UserResolver.ts'), resolver);
}

async function generateAuthResolver(transportPath: string, database: string) {
  const isMongoDb = database === 'mongodb';
  const resolver = `import { Resolver, Mutation, Arg, Ctx, Query, UseMiddleware } from 'type-graphql';
import { AuthResponse, LoginInput, UserType } from '../types/UserType';
import { AuthService } from '../../../core/services/AuthService';
import { GraphQLAuthMiddleware } from '../../../policies/graphqlAuthMiddleware';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async login(@Arg('data') data: LoginInput): Promise<AuthResponse> {
    return await this.authService.login(data);
  }

  @Query(() => UserType)
  @UseMiddleware(GraphQLAuthMiddleware)
  async me(@Ctx() ctx: any): Promise<UserType> {
    return ctx.user;
  }
}
`;

  await fs.writeFile(path.join(transportPath, 'resolvers', 'AuthResolver.ts'), resolver);

  // Also generate GraphQL auth middleware
  const authMiddleware = `import { MiddlewareFn } from 'type-graphql';
import jwt from 'jsonwebtoken';
import { config } from '../configs/env';
import prisma from '../configs/database';

interface GraphQLContext {
  req: any;
  res: any;
  user?: any;
}

export const GraphQLAuthMiddleware: MiddlewareFn<GraphQLContext> = async ({ context }, next) => {
  const authHeader = context.req.headers.authorization;

  if (!authHeader) {
    throw new Error('Not authenticated');
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string | number; email: string };
    
    const user = await prisma.user.findUnique({
      where: { id: ${isMongoDb ? 'decoded.userId as string' : 'decoded.userId as number'} }
    });

    if (!user) {
      throw new Error('User not found');
    }

    context.user = user;
    return next();
  } catch (error) {
    throw new Error('Invalid token');
  }
};
`;

  await fs.writeFile(
    path.join(transportPath, '../../policies', 'graphqlAuthMiddleware.ts'),
    authMiddleware
  );
}

async function generateRoleType(transportPath: string) {
  const type = `import { ObjectType, Field, ID, InputType } from 'type-graphql';

@ObjectType()
export class RoleType {
  @Field(() => ID)
  id!: string | number;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description!: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@InputType()
export class CreateRoleInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateRoleInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}
`;

  await fs.writeFile(path.join(transportPath, 'types', 'RoleType.ts'), type);
}

async function generatePermissionType(transportPath: string) {
  const type = `import { ObjectType, Field, ID, InputType } from 'type-graphql';

@ObjectType()
export class PermissionType {
  @Field(() => ID)
  id!: string | number;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description!: string | null;

  @Field()
  resource!: string;

  @Field()
  action!: string;

  @Field(() => ID)
  roleId!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@InputType()
export class CreatePermissionInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  resource!: string;

  @Field()
  action!: string;

  @Field(() => ID)
  roleId!: number;
}

@InputType()
export class UpdatePermissionInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  resource?: string;

  @Field({ nullable: true })
  action?: string;
}
`;

  await fs.writeFile(path.join(transportPath, 'types', 'PermissionType.ts'), type);
}

async function generateRoleResolver(transportPath: string) {
  const resolver = `import { Resolver, Query, Mutation, Arg, ID, UseMiddleware } from 'type-graphql';
import { RoleType, CreateRoleInput, UpdateRoleInput } from '../types/RoleType';
import { RoleService } from '../../../core/services/RoleService';
import { GraphQLAuthMiddleware } from '../../../policies/graphqlAuthMiddleware';
import { GraphQLPermissionMiddleware } from '../../../policies/graphqlPermissionMiddleware';

@Resolver()
export class RoleResolver {
  constructor(private roleService: RoleService) {}

  @Mutation(() => RoleType)
  @UseMiddleware(GraphQLAuthMiddleware, GraphQLPermissionMiddleware('role', 'create'))
  async createRole(@Arg('data') data: CreateRoleInput): Promise<RoleType> {
    return await this.roleService.createRole(data);
  }

  @Query(() => RoleType)
  @UseMiddleware(GraphQLAuthMiddleware, GraphQLPermissionMiddleware('role', 'read'))
  async role(@Arg('id', () => ID) id: string | number): Promise<RoleType> {
    const roleId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    return await this.roleService.getRoleById(roleId);
  }

  @Query(() => [RoleType])
  @UseMiddleware(GraphQLAuthMiddleware, GraphQLPermissionMiddleware('role', 'read'))
  async roles(): Promise<RoleType[]> {
    return await this.roleService.getAllRoles();
  }

  @Mutation(() => RoleType)
  @UseMiddleware(GraphQLAuthMiddleware, GraphQLPermissionMiddleware('role', 'update'))
  async updateRole(
    @Arg('id', () => ID) id: string | number,
    @Arg('data') data: UpdateRoleInput
  ): Promise<RoleType> {
    const roleId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    return await this.roleService.updateRole(roleId, data);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(GraphQLAuthMiddleware, GraphQLPermissionMiddleware('role', 'delete'))
  async deleteRole(@Arg('id', () => ID) id: string | number): Promise<boolean> {
    const roleId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    await this.roleService.deleteRole(roleId);
    return true;
  }
}
`;

  await fs.writeFile(path.join(transportPath, 'resolvers', 'RoleResolver.ts'), resolver);

  // Generate GraphQL permission middleware
  const permissionMiddleware = `import { MiddlewareFn } from 'type-graphql';
import prisma from '../configs/database';

interface GraphQLContext {
  req: any;
  res: any;
  user?: any;
}

export function GraphQLPermissionMiddleware(resource: string, action: string): MiddlewareFn<GraphQLContext> {
  return async ({ context }, next) => {
    if (!context.user) {
      throw new Error('Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: context.user.id },
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user || !user.role) {
      throw new Error('User not found or no role assigned');
    }

    const hasPermission = user.role.permissions.some(
      (p: { resource: string; action: string }) => p.resource === resource && p.action === action
    );

    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    return next();
  };
}
`;

  await fs.writeFile(
    path.join(transportPath, '../../policies', 'graphqlPermissionMiddleware.ts'),
    permissionMiddleware
  );
}

async function generatePermissionResolver(transportPath: string) {
  const resolver = `import { Resolver, Query, Mutation, Arg, ID, UseMiddleware } from 'type-graphql';
import { PermissionType, CreatePermissionInput, UpdatePermissionInput } from '../types/PermissionType';
import { PermissionService } from '../../../core/services/PermissionService';
import { GraphQLAuthMiddleware } from '../../../policies/graphqlAuthMiddleware';
import { GraphQLPermissionMiddleware } from '../../../policies/graphqlPermissionMiddleware';

@Resolver()
export class PermissionResolver {
  constructor(private permissionService: PermissionService) {}

  @Mutation(() => PermissionType)
  @UseMiddleware(GraphQLAuthMiddleware, GraphQLPermissionMiddleware('permission', 'create'))
  async createPermission(@Arg('data') data: CreatePermissionInput): Promise<PermissionType> {
    return await this.permissionService.createPermission(data);
  }

  @Query(() => PermissionType)
  @UseMiddleware(GraphQLAuthMiddleware, GraphQLPermissionMiddleware('permission', 'read'))
  async permission(@Arg('id', () => ID) id: string | number): Promise<PermissionType> {
    const permissionId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    return await this.permissionService.getPermissionById(permissionId);
  }

  @Query(() => [PermissionType])
  @UseMiddleware(GraphQLAuthMiddleware, GraphQLPermissionMiddleware('permission', 'read'))
  async permissions(): Promise<PermissionType[]> {
    return await this.permissionService.getAllPermissions();
  }

  @Query(() => [PermissionType])
  @UseMiddleware(GraphQLAuthMiddleware, GraphQLPermissionMiddleware('permission', 'read'))
  async permissionsByRole(@Arg('roleId', () => ID) roleId: string | number): Promise<PermissionType[]> {
    const role = typeof roleId === 'string' && !isNaN(Number(roleId)) ? Number(roleId) : roleId;
    return await this.permissionService.getPermissionsByRole(role);
  }

  @Mutation(() => PermissionType)
  @UseMiddleware(GraphQLAuthMiddleware, GraphQLPermissionMiddleware('permission', 'update'))
  async updatePermission(
    @Arg('id', () => ID) id: string | number,
    @Arg('data') data: UpdatePermissionInput
  ): Promise<PermissionType> {
    const permissionId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    return await this.permissionService.updatePermission(permissionId, data);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(GraphQLAuthMiddleware, GraphQLPermissionMiddleware('permission', 'delete'))
  async deletePermission(@Arg('id', () => ID) id: string | number): Promise<boolean> {
    const permissionId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    await this.permissionService.deletePermission(permissionId);
    return true;
  }
}
`;

  await fs.writeFile(path.join(transportPath, 'resolvers', 'PermissionResolver.ts'), resolver);
}
