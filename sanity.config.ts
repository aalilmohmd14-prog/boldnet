import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemaTypes';

export default defineConfig({
  name: 'default',
  title: 'BoldNet Digital Blog',

  projectId: 'lda6ia2e',
  dataset: 'production',
  basePath: '/admin/studio',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});