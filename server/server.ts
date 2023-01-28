import http from 'http';
import url from 'url';

const port = 7331;
const host = 'localhost';


const server = http.createServer((req, res) => {
  if (req.url == undefined) return;
  const parsedUrl = url.parse(req.url, true);
  const sender = parsedUrl.query["sender"];
  const data = parsedUrl.query["data"];

  console.log("The contract which raised the error is:", sender);
  console.log("The data is:", data);

  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  res.end(JSON.stringify({
    "data": "0x00"
  }));
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
