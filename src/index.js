import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import Filter from 'bad-words';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectoryPath = path.join(__dirname, '../public');

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(publicDirectoryPath));


// io代表server，管理所有與client的連線。
io.on('connection', (socket)=>{
    console.log('New WebSocket connection');



    socket.emit('message', 'Welcome');
    socket.broadcast.emit('message', 'A new user has joined!')
    socket.on('sendMessage', (message, callback)=>{
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!');
        }

        io.emit('message', message);
        callback();
    })
    socket.on('disconnect', ()=>{
        io.emit('message', 'A user has left'); // 用io，不用socket.broadcast，因為user已經離開了
    })
    socket.on('sendLocation', ({lat, long}, callback)=>{
        io.emit('message', `https://google.com/maps?q=${lat},${long}`);
        callback();
    })
})


server.listen(port, ()=>{
    console.log('Server is up on port '+ port);
})