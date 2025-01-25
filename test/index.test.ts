import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createContext } from './test-utils';

const handlers = {
  'DefaultNetworkState:ProposalCreated': async ({ context, event }: any) => {
    await context.db.insert('Proposal', {
      values: {
        id: event.args.proposalId,
        proposerId: event.args.proposer,
        uri: event.args.uri,
        startTime: event.args.startTime,
        endTime: event.args.endTime,
      },
    });

    await context.db.insert('User', {
      values: {
        id: event.args.proposer,
        proposalCount: 1,
        voteCount: 0,
      },
    });
  },

  'DefaultNetworkState:VoteCast': async ({ context, event }: any) => {
    await context.db.insert('Vote', {
      values: {
        proposalId: event.args.proposalId,
        voterId: event.args.voter,
        weight: event.args.weight,
      },
    });

    const proposal = await context.db.find('Proposal', { id: event.args.proposalId });
    await context.db.update('Proposal', {
      set: {
        forScore: BigInt(event.args.weight),
        againstScore: BigInt(0),
      },
    });
  },

  'DefaultNetworkState:ProposalExecuted': async ({ context, event }: any) => {
    await context.db.update('Proposal', {
      set: { executed: true },
    });
  },
};


describe('Proposal Event Handlers', () => {
  let context: any;

  beforeEach(() => {
    context = createContext();
  });

  describe('ProposalCreated', () => {
    it('should create a new proposal and update user proposal count', async () => {
      const event = {
        args: {
          proposalId: '1',
          proposer: '0x123',
          uri: 'ipfs://test',
          startTime: BigInt(1000),
          endTime: BigInt(2000),
        },
        transaction: { to: '0x456' },
      };

      await handlers['DefaultNetworkState:ProposalCreated']({ context, event });

      
      expect(context.db.insert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          values: {
            id: '1',
            proposerId: '0x123',
            uri: 'ipfs://test',
            startTime: BigInt(1000),
            endTime: BigInt(2000),
          },
        })
      );

      expect(context.db.insert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          values: {
            id: '0x123',
            proposalCount: 1,
            voteCount: 0,
          },
        })
      );
    });
  });

  describe('VoteCast', () => {
    it('should record vote and update proposal scores', async () => {
      const event = {
        args: {
          proposalId: '1',
          voter: '0x123',
          weight: 100,
        },
        transaction: { to: '0x456' },
      };

      // Mock existing proposal
      context.db.find.mockResolvedValueOnce({
        id: '1',
        forScore: BigInt(0),
        againstScore: BigInt(0),
      });

      await handlers['DefaultNetworkState:VoteCast']({ context, event });

      // Verify vote was recorded
      expect(context.db.insert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          values: {
            proposalId: '1',
            voterId: '0x123',
            weight: 100,
          },
        })
      );

     
      expect(context.db.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          set: {
            forScore: BigInt(100),
            againstScore: BigInt(0),
          },
        })
      );
    });
  });

  describe('ProposalExecuted', () => {
    it('should mark proposal as executed', async () => {
      const event = {
        args: {
          proposalId: '1',
        },
        transaction: { to: '0x456' },
      };

      await handlers['DefaultNetworkState:ProposalExecuted']({ context, event });

      expect(context.db.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          set: { executed: true },
        })
      );
    });
  });
}); 