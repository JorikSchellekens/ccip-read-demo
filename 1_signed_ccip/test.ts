import {ethers} from "ethers";
import {readFileSync, writeFileSync} from "fs";

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

// deploy contract
const bytecode = readFileSync("./artifacts/PointlessCCIP.bin").toString()
const abi = JSON.parse(readFileSync("./artifacts/PointlessCCIP.abi").toString())

const wallet = new ethers.Wallet("0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e");
const account = wallet.connect(provider)

const factory = new ethers.ContractFactory(abi, bytecode, account);

async function main() {
  const contract = await factory.deploy();
  writeFileSync("./artifacts/contract", contract.address);
  console.log("Reading contract deployed to address:", contract.address);

  // Call the lookup function and allow ethers to use CCIP-read
  const result = await contract.lookup({ccipReadEnabled: true});
  console.log(result)
}

main();
