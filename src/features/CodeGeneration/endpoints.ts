import { defineEndpoints, tag } from '@shared/api/endpoints/builder';

const E = defineEndpoints('codeGeneration');
export const codeGenerationEndpoints = E((e) => ({
  scripts: e.get('scripts', 'v1/code-generation/scripts').tag('codeGeneration:scripts'),
  scriptById: e.get('scriptById', 'v1/code-generation/scripts/:id').tag('codeGeneration:scriptById'),
  createScript: e.post('createScript', 'v1/code-generation/scripts').deps([tag('codeGeneration:scripts')]),
  generate: e.post('generate', 'v1/code-generation/generate').deps([tag('codeGeneration:scripts')]),
  execute: e.post('execute', 'v1/code-generation/generate/execute'),
}));
