export type ProjectTemplate = 'empty' | 'basic-auth' | 'full-auth';

export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';

export type TransportType = 'rest' | 'graphql' | 'websocket';

export interface ProjectConfig {
  name: string;
  template: ProjectTemplate;
  database: DatabaseType;
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
