import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

export interface FordefiSolanaConfig {
  accessToken: string;
  vaultId: string;
  fordefiSolanaVaultAddress: string;
  privateKeyPem: string;
  apiPathEndpoint: string;
};

export interface FragmetricConfig {
  market: string;
  restakeAmount: bigint
};

export const fordefiConfig: FordefiSolanaConfig = {
  accessToken: process.env.FORDEFI_API_TOKEN || "",
  vaultId: process.env.SOLANA_VAULT_ID || "",
  fordefiSolanaVaultAddress: process.env.SOLANA_VAULT_ADDRESS || "",
  privateKeyPem: fs.readFileSync('./secret/private.pem', 'utf8'),
  apiPathEndpoint: '/api/v1/transactions/create-and-wait'
};

export const exponentConfig: FragmetricConfig = {
  market: "EJ4GPTCnNtemBVrT7QKhRfSKfM53aV2UJYGAC8gdVz5b", // fragSOL market, you can find more markets at https://web-api.exponent.finance/api/markets
  restakeAmount: 100n, // in smallest fragSOL units (9 decimals -> https://solscan.io/token/FRAGSEthVFL7fdqM8hxfxkfCZzUvmg21cqPJVvC1qdbo)
};

export const solanaCluster: "mainnet-beta" | "testnet" | "devnet" = "mainnet-beta"