import { IncomingMessage, ServerResponse } from 'http';
import { SessionStrategy, CreateContext, SessionContext } from '../../types';

export async function createSessionContext<T>(
  sessionStrategy: SessionStrategy<T>,
  createContext: CreateContext,
  req: IncomingMessage,
  res?: ServerResponse
): Promise<SessionContext<T>> {
  if (!res) return { session: await sessionStrategy.get({ req, createContext }) };
  return {
    session: await sessionStrategy.get({ req, createContext }),
    startSession: (data: T) => sessionStrategy.start({ res, data, createContext }),
    endSession: () => sessionStrategy.end({ req, res, createContext }),
  };
}
