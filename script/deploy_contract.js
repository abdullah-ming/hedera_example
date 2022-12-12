require("dotenv").config();
const {
    AccountId,
    PrivateKey,
    Client,
    ContractFunctionParameters,
    ContractExecuteTransaction,
    Wallet,
    LocalProvider,
    ContractCreateTransaction,
    FileCreateTransaction,
    ContractDeleteTransaction,
    ContractCallQuery,
    Hbar,
} = require("@hashgraph/sdk");

// Grab the OPERATOR_ID and OPERATOR_KEY from the .env file
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

// Build Hedera testnet and mirror node client
const client = Client.forTestnet();
// Set the operator account ID and operator private key
client.setOperator(operatorId, operatorKey);

//Import the compiled contract from the HelloHedera.json file
let helloHedera = require("../HelloHedera.json");
const bytecode = helloHedera.data.bytecode.object;

//Create a file on Hedera and store the hex-encoded bytecode
const fileCreateTx = new FileCreateTransaction()
        //Set the bytecode of the contract
        .setContents(bytecode);

async function main() {

    //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
    const submitTx = await fileCreateTx.execute(client);

    //Get the receipt of the file create transaction
    const fileReceipt = await submitTx.getReceipt(client);

    //Get the file ID from the receipt
    const bytecodeFileId = fileReceipt.fileId;

    //Log the file ID
    console.log("The smart contract byte code file ID is " +bytecodeFileId)

    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
    //Set the file ID of the Hedera file storing the bytecode
    .setBytecodeFileId(bytecodeFileId)
    //Set the gas to instantiate the contract
    .setGas(100000)
    //Provide the constructor parameters for the contract
    .setConstructorParameters(new ContractFunctionParameters().addString("Hello from Hedera!"));

    //Submit the transaction to the Hedera test network
    const contractResponse = await contractTx.execute(client);

    //Get the receipt of the file create transaction
    const contractReceipt = await contractResponse.getReceipt(client);

    //Get the smart contract ID
    const newContractId = contractReceipt.contractId;

    //Log the smart contract ID
    console.log("The smart contract ID is " + newContractId);


 //Create the transaction to update the contract message
 const contractExecTx = await new ContractExecuteTransaction()
 //Set the ID of the contract
 .setContractId(newContractId)
 //Set the gas for the contract call
 .setGas(100000)
 //Set the contract function to call
 .setFunction("set_message", new ContractFunctionParameters().addString("Hello from Hedera again!"));

//Submit the transaction to a Hedera network and store the response
const submitExecTx = await contractExecTx.execute(client);

//Get the receipt of the transaction
const receipt2 = await submitExecTx.getReceipt(client);

//Confirm the transaction was executed successfully 
console.log("The transaction status is " +receipt2.status.toString());

//Query the contract for the contract message
const contractCallQuery = new ContractCallQuery()
 //Set the ID of the contract to query
 .setContractId("0.0.49059384")
 //Set the gas to execute the contract call
 .setGas(100000)
 //Set the contract function to call
 .setFunction("get_message")
 //Set the query payment for the node returning the request
 //This value must cover the cost of the request otherwise will fail 
 .setQueryPayment(new Hbar(10));

//Submit the transaction to a Hedera network 
const contractUpdateResult = await contractCallQuery.execute(client);

//Get the updated message at index 0
const message2 = contractUpdateResult.getString(0);

//Log the updated message to the console
console.log("The updated contract message: " + message2);

//v2 Hedera JavaScript SDK
        

}

main();

