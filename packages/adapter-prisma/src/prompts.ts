import prompts from 'prompts';

// prompts is badly typed so we have some more specific typed APIs

export async function confirmPrompt(message: string): Promise<boolean> {
  const { value } = await prompts({
    name: 'value',
    type: 'confirm',
    message,
  });
  return value;
}

export async function textPrompt(message: string): Promise<string> {
  const { value } = await prompts({
    name: 'value',
    type: 'text',
    message,
  });
  return value;
}
