export type LoadStepStatus = 'pending' | 'running' | 'done' | 'error';
export type LoadStep = { key: string; title: string; description: string; status: LoadStepStatus };

