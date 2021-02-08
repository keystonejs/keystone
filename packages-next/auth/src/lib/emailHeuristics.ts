const emailKeysToGuess = ['email', 'username'];

export const guessEmailFromValue = (value: any) => {
  for (const key of emailKeysToGuess) {
    if (value[key] && typeof value[key].value === 'string') {
      return value[key].value;
    }
  }
};

// email validation regex from https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)
export const validEmail = (email: string) =>
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    email
  );
