export const wrapHandlers = <EventType extends { defaultPrevented: boolean }>(
  consumerHandler: ((event: EventType) => any) | undefined,
  ourHandler: (event: EventType) => any
) => (event: EventType) => {
  if (typeof consumerHandler === 'function') {
    consumerHandler(event);
  }

  if (!event.defaultPrevented) {
    ourHandler(event);
  }
};
