import fs from 'fs-extra';
import path from 'path';
import { GeneratorContext } from '../types';

export async function generateBaseStructure(ctx: GeneratorContext): Promise<void> {
  const { projectPath, srcPath } = ctx;

  // Create base directories
  const directories = [
    srcPath,
    path.join(srcPath, 'configs'),
    path.join(srcPath, 'adapters'),
    path.join(srcPath, 'core'),
    path.join(srcPath, 'core', 'entities'),
    path.join(srcPath, 'core', 'repositories'),
    path.join(srcPath, 'core', 'services'),
    path.join(srcPath, 'transports'),
    path.join(srcPath, 'mappers'),
    path.join(srcPath, 'policies'),
    path.join(projectPath, 'prisma')
  ];

  for (const dir of directories) {
    await fs.ensureDir(dir);
  }

  // Create .env.example
  const envExample = `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"
`;

  await fs.writeFile(path.join(projectPath, '.env.example'), envExample);

  // Create .gitignore
  const gitignore = `node_modules/
dist/
.env
*.log
.DS_Store
`;

  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);

  // Create tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };

  await fs.writeFile(
    path.join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );
}
