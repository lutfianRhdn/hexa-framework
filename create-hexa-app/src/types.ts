export type ProjectTemplate = 'empty' | 'basic-auth' | 'full-auth';

export type AdapterType = 'prisma' | 'typeorm' | 'mongoose' | 'redis' | 'midtrans';

export type TransportType = 'rest' | 'graphql' | 'websocket';

export interface ProjectConfig {
  name: string;
  template: ProjectTemplate;
  adapters: AdapterType[];
  transports: TransportType[];
}

export interface GeneratorContext {
  config: ProjectConfig;
  projectPath: string;
  srcPath: string;
}

export interface DependencyMap {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}
