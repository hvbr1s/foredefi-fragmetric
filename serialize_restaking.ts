import { Connection } from "@solana/web3.js";
import { FordefiSolanaConfig, FragmetricConfig } from "./config";
import { createKeyPairSignerFromBytes } from '@solana/kit';

export async function restake(fordefiConfig: FordefiSolanaConfig, fragmetricConfig: FragmetricConfig, connection: Connection) {

    const FragmetricSDK = await import('@fragmetric-labs/sdk');    
    try {
        // Try to find RestakingProgram in the exports
        const { RestakingProgram } = FragmetricSDK as any;
        
        if (!RestakingProgram) {
            throw new Error("RestakingProgram not found in exports");
        }
        
        // Initialize the RestakingProgram for mainnet
        const restaking = RestakingProgram.mainnet(connection.rpcEndpoint);

        // Resolve the restaking program to ensure it's properly initialized
        await restaking.resolve();

        // Create a deposit transaction for SOL -> fragSOL
        const depositTx = await restaking.fragSOL
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

        console.log("Deposit transaction assembled:", depositTx);

        // return {
        //     chainId: "solana:mainnet",
        //     type: "solana_transaction",
        //     details: {
        //         type: "fragmetric_restaking",
        //         description: `Restake ${fragmetricConfig.restakeAmount} lamports of SOL for fragSOL`,
        //         assetSymbol: "SOL",
        //         assetAmount: fragmetricConfig.restakeAmount.toString(),
        //         market: fragmetricConfig.market,
        //     },
        //     transaction: {
        //         serializedTransaction: Buffer.from(depositTx.messageBytes).toString('base64'),
        //         instructions: depositTx.instructions?.map((ix: any) => ({
        //             programId: ix.programId,
        //             accounts: ix.accounts,
        //             data: ix.data ? Buffer.from(ix.data).toString('base64') : null,
        //         })) || [],
        //     },
        //     vaultId: fordefiConfig.vaultId,
        // };

    } catch (error) {
        console.error("Error creating restaking transaction:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to create restaking transaction: ${errorMessage}`);
    }
}