import { vi } from 'vitest';

interface EventHandlerArgs {
  context: any;
  event: {
    args: Record<string, any>;
    transaction: { to: string };
  };
}

export const createContext = () => ({
  db: {
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(true) }),
    find: vi.fn(),
    update: vi.fn().mockReturnValue({ set: vi.fn().mockResolvedValue(true) }),
  },
});

// Mock the entire ponder module
vi.mock('ponder:registry', () => ({
  ponder: {
    getEventHandler: vi.fn((name: string) => async (args: EventHandlerArgs) => args),
  },
}));