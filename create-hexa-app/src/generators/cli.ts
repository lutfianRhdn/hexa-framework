import * as path from 'path';
import * as fs from 'fs-extra';
import { GeneratorContext } from '../types';

export async function generateHexaCLI(ctx: GeneratorContext): Promise<void> {
  const { projectPath, srcPath } = ctx;
  
  // Create CLI directory in generated project
  const cliPath = path.join(projectPath, 'cli');
  await fs.ensureDir(cliPath);

  // Copy CLI templates from create-hexa-app/cli-templates to project/cli
  const templatesPath = path.join(__dirname, '../../cli-templates');
  
  // Copy the entire CLI structure
  await fs.copy(templatesPath, cliPath, {
    overwrite: true
  });

  // Create a README for the CLI
  const cliReadme = `# Hexa CLI

Powerful command-line interface for Hexa Framework projects.

## Available Commands

\`\`\`bash
# Generate complete CRUD
npm run hexa generate crud Product -- --fields name:string,price:number

# Run migrations
npm run hexa db migrate

# Start development server
npm run hexa serve

# Build project
npm run hexa build

# List all commands
npm run hexa list
\`\`\`

## Interactive Mode

Run without arguments for interactive mode:
\`\`\`bash
npm run hexa
\`\`\`
`;

  await fs.writeFile(path.join(cliPath, 'README.md'), cliReadme);
}
