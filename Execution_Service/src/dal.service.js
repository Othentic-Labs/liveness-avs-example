require('dotenv').config();
const pinataSDK = require("@pinata/sdk");
const { ethers } = require('ethers');
// this dalService is common DAL functionallity that is shared between Execution and Validation Service
const { dalService } = require('./liveliness/dal.service');
const { getSigningKey, sign } = require('./utils/mcl');

let pinataApiKey='';
let pinataSecretApiKey='';
let rpcBaseAddress='';
let privateKey='';
var performerAddress='';

function init() {
  pinataApiKey = process.env.PINATA_API_KEY;
  pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  rpcBaseAddress = process.env.OTHENTIC_CLIENT_RPC_ADDRESS;
  privateKey = process.env.PRIVATE_KEY_PERFORMER;
  performerAddress = process.env.PERFORMER_ADDRESS;
}

async function sendTask(proofOfTask, data, taskDefinitionId) {

  const message = ethers.AbiCoder.defaultAbiCoder().encode(["string", "bytes", "address", "uint16"], [proofOfTask, data, performerAddress, taskDefinitionId]);
  const messageHash = ethers.keccak256(message);

  const signingKey = getSigningKey(privateKey);
  const sig = sign(signingKey, messageHash);
  const sigType = 'bls';

  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "sendTask",
    params: [
      proofOfTask,
      data,
      taskDefinitionId,
      performerAddress,
      sig,
      sigType
    ]
  };
    try {
      const provider = new ethers.JsonRpcProvider(rpcBaseAddress);
      const response = await provider.send(jsonRpcBody.method, jsonRpcBody.params);
      console.log("sendTask: API response:", response);
  } catch (error) {
      console.error("Error making API request:", error);
  }
}

async function publishJSONToIpfs(data) {
  var proofOfTask = '';
  try {   
    const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);
    const response = await pinata.pinJSONToIPFS(data);
    proofOfTask = response.IpfsHash;
    console.log(`proofOfTask: ${proofOfTask}`);
  }
  catch (error) {  
    console.error("Error making API request to pinataSDK:", error);
  }
  return proofOfTask;
}

module.exports = {
  init,
  publishJSONToIpfs,
  sendTask,
  ...dalService,
}
