import { ProjectConfig, DependencyMap } from '../types';

export function generateDependencies(config: ProjectConfig): DependencyMap {
  // Base dependencies for all projects
  const baseDeps: Record<string, string> = {
    '@hexa-framework/core': '^2.0.0',
    '@hexa-framework/common': '^1.0.0',
    'express': '^4.18.2',
    'dotenv': '^16.3.1',
    'cors': '^2.8.5',
    'helmet': '^7.1.0',
    'zod': '^3.22.4'
  };

  const baseDevDeps: Record<string, string> = {
    'typescript': '^5.3.3',
    '@types/node': '^20.10.6',
    '@types/express': '^4.17.21',
    '@types/cors': '^2.8.17',
    'ts-node-dev': '^2.0.0'
  };

  // Auth dependencies
  const authDeps: Record<string, string> = config.template !== 'empty' ? {
    'bcrypt': '^5.1.1',
    'jsonwebtoken': '^9.0.2',
    '@types/bcrypt': '^5.0.2',
    '@types/jsonwebtoken': '^9.0.5'
  } : {};

  // Adapter dependencies
  const adapterDeps: Record<string, Record<string, string>> = {
    prisma: {
      '@hexa-framework/adapter-prisma': '^1.0.0',
      '@prisma/client': '^5.7.0'
    },
    typeorm: {
      '@hexa-framework/adapter-typeorm': '^1.0.0',
      'typeorm': '^0.3.17',
      'reflect-metadata': '^0.1.14',
      'pg': '^8.11.3', // Defaulting to pg for now, user might change
      'mysql2': '^3.6.5' // Adding mysql2 as well just in case
    },
    mongoose: {
      '@hexa-framework/adapter-mongoose': '^1.0.0',
      'mongoose': '^8.0.3'
    },
    redis: {
      '@hexa-framework/adapter-redis': '^1.0.0',
      'redis': '^4.6.12'
    }
  };

  const adapterDevDeps: Record<string, Record<string, string>> = {
    prisma: {
      'prisma': '^5.7.0'
    },
    typeorm: {},
    mongoose: {},
    redis: {}
  };

  // Transport-specific dependencies
  const transportDeps: Record<string, Record<string, string>> = {
    rest: {
      '@hexa-framework/transport-rest': '^1.0.0',
      'morgan': '^1.10.0',
      'compression': '^1.7.4',
      '@types/morgan': '^1.9.9',
      '@types/compression': '^1.7.5'
    },
    graphql: {
      '@hexa-framework/transport-graphql': '^1.0.0',
      'apollo-server-express': '^3.13.0',
      'graphql': '^16.8.1',
      'type-graphql': '^2.0.0-rc.1',
      'reflect-metadata': '^0.1.14',
      '@types/graphql': '^14.5.0'
    },
    websocket: {
      // Future: @hexa-framework/transport-websocket
      'socket.io': '^4.6.1',
      '@types/socket.io': '^3.0.2'
    }
  };

  // Plugin dependencies (Default included for now)
  const pluginDeps: Record<string, string> = {
    '@hexa-framework/plugin-logging': '^1.0.0',
    '@hexa-framework/plugin-rate-limit': '^1.0.0',
    '@hexa-framework/plugin-swagger': '^1.0.0'
  };

  // Collect adapter dependencies
  const selectedAdapterDeps = config.adapters.reduce((acc, adapter) => {
    return { ...acc, ...adapterDeps[adapter] };
  }, {});

  const selectedAdapterDevDeps = config.adapters.reduce((acc, adapter) => {
    return { ...acc, ...adapterDevDeps[adapter] };
  }, {});

  // Collect transport dependencies
  const selectedTransportDeps = config.transports.reduce((acc, transport) => {
    return { ...acc, ...transportDeps[transport] };
  }, {});

  return {
    dependencies: {
      ...baseDeps,
      ...authDeps,
      ...selectedAdapterDeps,
      ...selectedTransportDeps,
      ...pluginDeps
    },
    devDependencies: {
      ...baseDevDeps,
      ...selectedAdapterDevDeps
    }
  };
}

export async function generatePackageJson(ctx: { config: ProjectConfig; projectPath: string }): Promise<void> {
  const { config, projectPath } = ctx;
  const { dependencies, devDependencies } = generateDependencies(config);

  const packageJson = {
    name: config.name,
    version: '1.0.0',
    description: `Hexa Framework project with ${config.template} template`,
    main: 'dist/index.js',
    bin: {
      hexa: './dist/cli/hexa-cli.js'
    },
    scripts: {
      dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
      build: 'tsc && tsc --project cli/tsconfig.json',
      start: 'node dist/index.js',
      hexa: 'ts-node cli/hexa-cli.ts',
      'hexa:build': 'tsc --project cli/tsconfig.json'
    },
    keywords: ['hexa-framework', 'typescript', 'hexagonal-architecture'],
    author: '',
    license: 'MIT',
    dependencies,
    devDependencies
  };

  // Add Prisma scripts if selected
  if (config.adapters.includes('prisma')) {
    Object.assign(packageJson.scripts, {
      'prisma:generate': 'prisma generate',
      'prisma:migrate': 'prisma migrate dev',
      'prisma:studio': 'prisma studio'
    });
  }

  const fs = await import('fs-extra');
  const path = await import('path');
  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}
