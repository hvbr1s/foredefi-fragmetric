import { signWithApiSigner } from './utils/signer';
import { signWithFordefi } from './utils/process_tx'
import {}
import { fordefiConfig, exponentConfig, solanaCluster } from './config';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';

async function main(): Promise<void> {
  if (!fordefiConfig.accessToken) {
    console.error('Error: FORDEFI_API_TOKEN environment variable is not set');
    return;
  }

  // Connect to Solana cluster
  let connection = new Connection(clusterApiUrl(solanaCluster as any), "confirmed");

  // We create the tx
  const jsonBody = await restake(fordefiConfig, connection)
  console.log("JSON request: ", jsonBody)

  // Fetch serialized tx from json file
  const requestBody = JSON.stringify(jsonBody);

  // Create payload
  const timestamp = new Date().getTime();
  const payload = `${fordefiConfig.apiPathEndpoint}|${timestamp}|${requestBody}`;

  try {
    // Send tx payload to API Signer for signature
    const signature = await signWithApiSigner(payload, fordefiConfig.privateKeyPem);
    
    // Send signed payload to Fordefi
    const response = await signWithFordefi(fordefiConfig.apiPathEndpoint, fordefiConfig.accessToken, signature, timestamp, requestBody);
    const data = response.data;
    console.log(data)

  } catch (error: any) {
    console.error(`Failed to sign the transaction: ${error.message}`);
  }
}

if (require.main === module) {
  main();
}