// 調用 io() 方法來建立一個 Socket.IO 的客戶端實例
// io() 是一個用於建立 Socket.IO 客戶端實例的方法。它的主要作用是建立一個新的 Socket.IO 客戶端實例，並將其連接到指定的 Socket.IO 伺服器。
const socket = io();

socket.on('message', (data)=>{
    console.log(data);
})

sendMessageForm.addEventListener('submit', (e)=>{
    e.preventDefault(); //防止預設刷新頁面
    
    /* 以下三種都能取得input value */
    const message = e.target.elements.message.value; //e.target=現在正在監聽的target，即sendMessageForm，.element.<name>，表示其中的元素
    // const message = sendMessageForm.querySelector("input").value;
    // const message = sendMessageInput.value;
    socket.emit('sendMessage', message, (error)=>{
        if(error){
            return console.log(error);
        }
        console.log('Message delivered!');
    });
})

sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your brower');
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, ()=>{
            console.log('Location Shared!');
        })
    })
})