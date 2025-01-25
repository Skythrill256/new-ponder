
import { ponder } from "ponder:registry";
import schema from "ponder:schema";

ponder.on("DefaultNetworkState:ProposalCreated", async ({ context, event }) => {
  if (event.transaction.to === null) return;
  try {
    const { proposalId, proposer, uri, startTime, endTime } = event.args;

    await context.db.insert(schema.proposals).values({
      id: proposalId,
      proposerId: proposer,
      uri,
      startTime,
      endTime,
    });

    let user = await context.db.find(schema.users, { id: proposer });
    if (user && user.proposalCount !== null) {
      await context.db
        .update(schema.users, { id: proposer })
        .set({ proposalCount: user.proposalCount + 1 });
    } else {
      await context.db.insert(schema.users).values({
        id: proposer,
        proposalCount: 1,
        voteCount: 0,
      });
    }

    console.log(`ProposalCreated processed successfully: ${proposalId}`);
  } catch (error) {
    console.error("Error handling ProposalCreated event:", error);
  }
});

ponder.on("DefaultNetworkState:VoteCast", async ({ context, event }) => {
  if (event.transaction.to === null) return;

  try {
    const { proposalId, voter, weight } = event.args;

    await context.db.insert(schema.votes).values({
      proposalId,
      voterId: voter,
      weight,
    });

    let proposal = await context.db.find(schema.proposals, { id: proposalId });
    if (proposal && proposal.forScore !== null && proposal.againstScore !== null) {
      const updatedForScore = proposal.forScore + BigInt(weight > 0 ? weight : 0);
      const updatedAgainstScore = proposal.againstScore + BigInt(weight < 0 ? -weight : 0);

      await context.db
        .update(schema.proposals, { id: proposalId })
        .set({
          forScore: updatedForScore,
          againstScore: updatedAgainstScore,
        });
    }

    let user = await context.db.find(schema.users, { id: voter });
    if (user && user.voteCount !== null) {
      await context.db
        .update(schema.users, { id: voter })
        .set({ voteCount: user.voteCount + 1 });
    } else {
      await context.db.insert(schema.users).values({
        id: voter,
        proposalCount: 0,
        voteCount: 1,
      });
    }

    console.log(`VoteCast processed and written successfully: ${proposalId}`);
  } catch (error) {
    console.error("Error handling VoteCast event:", error);
  }
});

ponder.on("DefaultNetworkState:ProposalExecuted", async ({ context, event }) => {
  if (event.transaction.to === null) return;

  try {
    const { proposalId } = event.args;

    await context.db
      .update(schema.proposals, { id: proposalId })
      .set({ executed: true });

    console.log(`ProposalExecuted processed successfully: ${proposalId}`);
  } catch (error) {
    console.error("Error handling ProposalExecuted event:", error);
  }
});
