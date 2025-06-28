// import { Connection } from "@solana/web3.js";
import { FordefiSolanaConfig, FragmetricConfig } from "./config";
import { solanaCluster } from './config'
import * as kit from '@solana/kit';

const mainnetRpc = kit.createSolanaRpc(solanaCluster);

export async function restake(fordefiConfig: FordefiSolanaConfig, fragmetricConfig: FragmetricConfig) {

    const vaultPubKey = kit.address(fordefiConfig.fordefiSolanaVaultAddress)
    const FragmetricSDK = await import('@fragmetric-labs/sdk');    
    try {
        // Initialize the RestakingProgram for mainnet
        const { RestakingProgram } = FragmetricSDK as any;        
        const restaking =  await RestakingProgram.mainnet(solanaCluster);

        // Resolve the restaking program to ensure it's properly initialized
        await restaking.resolve();

        // Create a deposit transaction for SOL -> fragSOL
        const tx = await restaking.fragSOL
            .user(fordefiConfig.fordefiSolanaVaultAddress)
            .deposit.assemble(
                {
                    assetMint: null, // null means we're depositing SOL
                    assetAmount: fragmetricConfig.restakeAmount, // Amount in lamports
                    applyPresetComputeUnitLimit: true,
                },
                {
                    recentBlockhash: null,
                }
            );

        console.log("Deposit transaction assembled:", tx);

        const { value: latestBlockhash } = await mainnetRpc.getLatestBlockhash().send();

        const txMessage = kit.pipe(
            kit.createTransactionMessage({ version: 0 }),
            message => kit.setTransactionMessageFeePayer(vaultPubKey, message),
            message => kit.setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message),
            message => kit.appendTransactionMessageInstructions(tx.instructions, message)
          );
        console.log("Tx message: ", txMessage)
        
        const signedTx = await kit.partiallySignTransactionMessageWithSigners(txMessage)
        console.log("Signed transaction: ", signedTx)

        const base64EncodedData = Buffer.from(signedTx.messageBytes).toString('base64');
        console.debug("Raw data ->", base64EncodedData)
        
        const jsonBody = {
            "vault_id": fordefiConfig.vaultId,
            "signer_type": "api_signer",
            "sign_mode": "auto",
            "type": "solana_transaction",
            "details": {
                "type": "solana_serialized_transaction_message",
                "push_mode": "auto",
                "data": base64EncodedData,
                "chain": "solana_mainnet"
            },
            "wait_for_state": "signed" // only for create-and-wait
        };
    
        return jsonBody;

    } catch (error) {
        console.error("Error creating restaking transaction:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to create restaking transaction: ${errorMessage}`);
    }
}