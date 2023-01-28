import http from 'http';
import url from 'url';
import { ethers } from 'ethers';
import {readFileSync} from 'fs';

const message = "You signed it mate";
const port = 7331;
const host = '127.0.0.1';

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet("0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e");
const account = wallet.connect(provider);

const server = http.createServer(async (req, res) => {
  if (req.url == undefined) return;
  const parsedUrl = url.parse(req.url, true);
  const sender = parsedUrl.query["sender"];
  const data = parsedUrl.query["data"];

  console.log("The contract which raised the error is:", sender);
  console.log("The data is:", data);

  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  res.end(JSON.stringify({
    "data": await encodeData(),
  }));
  console.log('replied')
});

async function encodeData(): Promise<string> {
  const contractAddress = readFileSync("./artifacts/contract").toString();
  const abi = JSON.parse(readFileSync("./artifacts/PointlessCCIP.abi").toString())
  const contract = new ethers.Contract(contractAddress, abi, account);


  const hash = await contract.getMessageHash(message)
  const sig = await wallet.signMessage(ethers.utils.arrayify(hash))
  console.log(  ethers.utils.defaultAbiCoder.encode(["string", "bytes"], [message, sig]))
  return ethers.utils.defaultAbiCoder.encode(["string", "bytes"], [message, sig]);
}

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
