import { ProjectConfig, DependencyMap } from '../types';

export function generateDependencies(config: ProjectConfig): DependencyMap {
  // Base dependencies for all projects
  const baseDeps = {
    'hexa-framework-core': '^1.0.0',
    'express': '^4.18.2',
    'dotenv': '^16.3.1',
    'cors': '^2.8.5',
    'helmet': '^7.1.0',
    'zod': '^3.22.4'
  };

  const baseDevDeps = {
    'typescript': '^5.9.3',
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

  // Database dependencies
  const dbDeps = {
    '@prisma/client': '^5.7.0'
  };

  const dbDevDeps = {
    'prisma': '^5.7.0'
  };

  // Transport-specific dependencies
  const transportDeps: Record<string, Record<string, string>> = {
    rest: {
      'morgan': '^1.10.0',
      'compression': '^1.7.4',
      '@types/morgan': '^1.9.9',
      '@types/compression': '^1.7.5'
    },
    graphql: {
      'apollo-server-express': '^3.13.0',
      'graphql': '^16.8.1',
      'type-graphql': '^2.0.0-rc.1',
      'reflect-metadata': '^0.1.14',
      '@types/graphql': '^14.5.0'
    },
    websocket: {
      'socket.io': '^4.6.1',
      '@types/socket.io': '^3.0.2'
    }
  };

  // Collect transport dependencies
  const selectedTransportDeps = config.transports.reduce((acc, transport) => {
    return { ...acc, ...transportDeps[transport] };
  }, {});

  return {
    dependencies: {
      ...baseDeps,
      ...authDeps,
      ...dbDeps,
      ...selectedTransportDeps
    },
    devDependencies: {
      ...baseDevDeps,
      ...dbDevDeps
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
      'prisma:generate': 'prisma generate',
      'prisma:migrate': 'prisma migrate dev',
      'prisma:studio': 'prisma studio',
      hexa: 'ts-node cli/hexa-cli.ts',
      'hexa:build': 'tsc --project cli/tsconfig.json'
    },
    keywords: ['hexa-framework', 'typescript', 'hexagonal-architecture'],
    author: '',
    license: 'MIT',
    dependencies,
    devDependencies
  };

  const fs = await import('fs-extra');
  const path = await import('path');
  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}
