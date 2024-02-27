import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { createPublicClient, http } from "viem";

import { cookieStorage, createStorage } from "wagmi";
import { goerli } from "wagmi/chains";
import "viem/window";
import { metaMask } from "@wagmi/connectors";

// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "Dapp",
  description: "Topup App",
  url: "https://web3modal.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Create wagmiConfig
export const config = defaultWagmiConfig({
  chains: [goerli], // required
  connectors: [metaMask()],
  projectId, // required
  metadata, // required
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  enableWalletConnect: true, // Optional - true by default
  enableInjected: true, // Optional - true by default
  enableEIP6963: true, // Optional - true by default
  enableCoinbase: true, // Optional - true by default
});

export const client = createPublicClient({
  chain: goerli,
  transport: http(`https://goerli.infura.io/v3/${process.env.INFURA_ID}`),
});
