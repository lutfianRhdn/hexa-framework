import fs from 'fs-extra';
import path from 'path';
import { GeneratorContext } from '../../types';

export async function generateEmptyTemplate(ctx: GeneratorContext): Promise<void> {
  // Empty template has no entities, services, or controllers
  // Just a health check endpoint
  console.log('  📦 Empty template - no auth files generated');
}
