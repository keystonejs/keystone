import { IncomingMessage, ServerResponse } from 'http';
import { SessionStrategy, KeystoneContext, SessionContext } from '../../types';

export async function createSessionContext<T>(
  sessionStrategy: SessionStrategy<T>,
  context: KeystoneContext,
  req: IncomingMessage,
  res?: ServerResponse
): Promise<SessionContext<T>> {
  if (!res) return { session: await sessionStrategy.get({ req, context }) };
  return {
    session: await sessionStrategy.get({ req, context }),
    startSession: (data: T) => sessionStrategy.start({ res, data, context }),
    endSession: () => sessionStrategy.end({ req, res, context }),
  };
}
