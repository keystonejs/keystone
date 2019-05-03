import pLimit from 'p-limit';

export let promptInput = jest.fn();

export let createPromptConfirmLoader = () => jest.fn();

export let limit = pLimit(1);
