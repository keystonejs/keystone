import prompts from 'prompts';

// prompts is badly typed so we have some more specific typed APIs
// prompts also returns an undefined value on SIGINT which we really just want to exit on

export async function confirmPrompt(message: string): Promise<boolean> {
  const { value } = await prompts({
    name: 'value',
    type: 'confirm',
    message,
    initial: true,
  });
  if (value === undefined) {
    process.exit(1);
  }
  return value;
}
