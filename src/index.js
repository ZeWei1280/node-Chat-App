import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import Filter from 'bad-words';
import { generateMessage, generateLocationMsg } from './utils/messages.js';
import { addUser,removeUser, getUser, getUsersInRoom} from './utils/user.js';

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

    socket.on('join', (options, callback)=>{
        const {error, user} = addUser({
            id: socket.id, 
            ...options
        })
        if(error) return callback(error);
        
        // socket.join()將客戶端連接到指定的房間。 這個方法是在服務端調用的。
        socket.join(user.room);
        socket.emit('message', generateMessage('系統訊息', '歡迎加入聊天室!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('系統訊息', `${user.username} 加入聊天室!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })


    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id);

        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!');
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    })

    socket.on('sendLocation', ({lat, long}, callback)=>{
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMsg(user.username, `https://google.com/maps?q=${lat},${long}`));
        callback();
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);

        if (user){
            io.to(user.room).emit('message', generateMessage('系統訊息', `${user.username} 已離開聊天室!`)); // 用io，不用socket.broadcast，因為user已經離開了
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })

})


server.listen(port, ()=>{
    console.log('Server is up on port '+ port);
})