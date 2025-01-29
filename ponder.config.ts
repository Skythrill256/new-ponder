import { createConfig } from "ponder";
import { http } from "viem";
import { DefaultNetworkState } from "./abis/DefaultNetworkState";

export default createConfig({
  database: {
    kind: "postgres",
    connectionString: "postgresql://neondb_owner:npg_zSB73xCOWmoK@ep-sparkling-smoke-a826xz6s-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"
  },
  networks: {
    amoy: {
      chainId: 80002,
      transport: http(process.env.RPC_URL)
    }
  },
  contracts: {
    DefaultNetworkState: {
      network: "amoy",
      abi: DefaultNetworkState,
      address: "0x49ae0951c8B9e8ee731c7C10f98AB81f40F6058d",
      startBlock: 0,
    },
  },
});
