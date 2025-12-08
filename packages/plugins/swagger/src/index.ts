/**
 * @hexa/plugin-swagger
 * OpenAPI/Swagger documentation plugin for Hexa Framework
 * by lutfian.rhdn
 * 
 * TODO: Full implementation coming soon
 */

import { IPlugin, PluginConfig, PluginMetadata } from '@hexa-framework/common';

export interface SwaggerPluginConfig extends PluginConfig {
    title?: string;
    version?: string;
    description?: string;
    basePath?: string;
    servers?: Array<{ url: string; description?: string }>;
}

/**
 * Swagger Plugin
 * Auto-generates OpenAPI documentation from routes
 * 
 * @status PLACEHOLDER - Full implementation coming in v2.0
 */
export class SwaggerPlugin implements IPlugin {
    readonly name = 'swagger';
    readonly version = '1.0.0';

    async init(config?: SwaggerPluginConfig): Promise<void> {
        console.log('[Swagger] Plugin initialized (placeholder)');
    }

    async onInit(): Promise<void> { }
    async onReady(): Promise<void> { }
    async onShutdown(): Promise<void> { }

    getMetadata(): PluginMetadata {
        return {
            name: this.name,
            version: this.version,
            description: 'OpenAPI/Swagger documentation generator',
            author: 'lutfian.rhdn',
        };
    }

    /**
     * Generate OpenAPI spec from routes (placeholder)
     */
    generateSpec(): object {
        return {
            openapi: '3.0.0',
            info: { title: 'API', version: '1.0.0' },
            paths: {},
        };
    }
}

export function createSwaggerPlugin(): SwaggerPlugin {
    return new SwaggerPlugin();
}
