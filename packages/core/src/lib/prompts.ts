import prompts from 'prompts';

// prompts is badly typed so we have some more specific typed APIs
// prompts also returns an undefined value on SIGINT which we really just want to exit on

async function confirmPromptImpl(message: string, initial: boolean = true): Promise<boolean> {
  const { value } = await prompts({
    name: 'value',
    type: 'confirm',
    message,
    initial,
  });
  if (value === undefined) {
    process.exit(1);
  }
  return value;
}

async function textPromptImpl(message: string): Promise<string> {
  const { value } = await prompts({
    name: 'value',
    type: 'text',
    message,
  });
  if (value === undefined) {
    process.exit(1);
  }
  return value;
}

export let shouldPrompt = process.stdout.isTTY && !process.env.SKIP_PROMPTS;

export let confirmPrompt = confirmPromptImpl;
export let textPrompt = textPromptImpl;

// we could do this with jest.mock but i find jest.mock unpredictable and this is much easier to understand
export function mockPrompts(prompts: {
  text: (message: string) => Promise<string>;
  confirm: (message: string) => Promise<boolean>;
  shouldPrompt: boolean;
}) {
  confirmPrompt = prompts.confirm;
  textPrompt = prompts.text;
  shouldPrompt = prompts.shouldPrompt;
}

export function resetPrompts() {
  confirmPrompt = confirmPromptImpl;
  textPrompt = textPromptImpl;
}
