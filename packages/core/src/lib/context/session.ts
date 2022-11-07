import { IncomingMessage, ServerResponse } from 'http';
import { SessionStrategy, CreateContext, SessionContext } from '../../types';

export async function createSessionContext<T>(
  sessionStrategy: SessionStrategy<T>,
  req: IncomingMessage,
  res: ServerResponse,
  createContext: CreateContext
): Promise<SessionContext<T>> {
  return {
    session: await sessionStrategy.get({ req, createContext }),
    startSession: (data: T) => sessionStrategy.start({ res, data, createContext }),
    endSession: () => sessionStrategy.end({ req, res, createContext }),
  };
}
