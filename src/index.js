import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectoryPath = path.join(__dirname, '../public');

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
// 使用 http.createServer() 方法創建了一個 HTTP 服務器對象，並將 Express 應用程序對象 app 作為回調函數傳遞給 createServer() 方法，
// 從而將 Express 應用程序掛載到了這個 HTTP 服務器上。相比直接使用 app.listen() 方法創建 Express 應用程序並將其綁定到指定端口上，
// 這種方式更加底層，需要手動處理更多的細節，但同時也更加靈活，可以自由地擴展和定制 HTTP 服務器的行為。
const io = new Server(server);
// 繼續把server當成參數傳給socket.io設定server

app.use(express.static(publicDirectoryPath));


io.on('connection', ()=>{
    console.log('New WebSocket connection');
})
server.listen(port, ()=>{
    console.log('Server is up on port '+ port);
})