import { Address } from "viem"
export interface proposalCreated {
  proposalId: bigint,
  proposer: Address,
  uri: string
}

export interface proposalExecuted {
  proposalId: bigint
}

export interface voteCast {
  proposalId: bigint,
  voter: Address,
  weight: bigint
}

export interface Proposal {
  proposer: string;
  uri: string;
  startTime: bigint;
  endTime: bigint;
  executed: boolean;
  forScore: bigint;
  againstScore: bigint;
  executionData: string;
  target: string;
}


