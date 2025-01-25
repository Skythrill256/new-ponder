import { onchainTable, relations } from "ponder";
export const users = onchainTable("users", (t) => ({
  id: t.text().primaryKey(), // Using address as primary key
  proposalCount: t.integer().default(0),
  voteCount: t.integer().default(0),
}));

export const proposals = onchainTable("proposals", (t) => ({
  id: t.bigint().primaryKey(), // proposalId
  proposerId: t.text().notNull(),
  uri: t.text(),
  startTime: t.bigint(),
  endTime: t.bigint(),
  forScore: t.bigint().default(BigInt(0)),
  againstScore: t.bigint().default(BigInt(0)),
  executed: t.boolean().default(false),
}));
export const votes = onchainTable("votes", (t) => ({
  proposalId: t.bigint().notNull(),
  voterId: t.text().notNull().primaryKey(),
  weight: t.bigint(),
}));

// Define Relationships
// One-to-Many: User → Proposals
export const usersRelations = relations(users, ({ many }) => ({
  proposals: many(proposals),
  votes: many(votes),
}));

// Many-to-One: Proposal → User
export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  proposer: one(users, { fields: [proposals.proposerId], references: [users.id] }),
  votes: many(votes),
}));

// Many-to-One: Vote → User & Proposal
export const votesRelations = relations(votes, ({ one }) => ({
  voter: one(users, { fields: [votes.voterId], references: [users.id] }),
  proposal: one(proposals, { fields: [votes.proposalId], references: [proposals.id] }),
}));
