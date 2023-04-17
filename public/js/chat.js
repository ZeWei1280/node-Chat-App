// 調用 io() 方法來建立一個 Socket.IO 的客戶端實例
// io() 是一個用於建立 Socket.IO 客戶端實例的方法。它的主要作用是建立一個新的 Socket.IO 客戶端實例，並將其連接到指定的 Socket.IO 伺服器。
const socket = io();


const $messages = document.querySelector('#messages');
const autoscroll = ()=>{
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }

}
//---------------

// ---------------render message---------------
// message_template.innerHTML 是用來獲取這個template的 HTML 內容
const messageTemplate = message_template.innerHTML;
socket.on('message', (data)=>{
    // console.log(data);
    /*
        使用 Mustache.js template引擎中的 Mustache.render() 方法來將從伺服器接收到的資料插入到 HTML 模板中，
        並生成對應的 HTML 內容。生成的 HTML 內容被存儲在 html 變量中。
    */
    /*
        最後，使用 insertAdjacentHTML() 方法將生成的 HTML 內容插入到 HTML 頁面的指定位置中。
        messages 是一個表示訊息列表的 DOM 元素，insertAdjacentHTML() 方法將生成的 HTML 內容插入到該元素的末尾('beforeend')，
        這樣新的訊息就會顯示在訊息列表的底部。
    */
    const html = Mustache.render(messageTemplate, {
        username: data.username,
        msg: data.text,
        createdAt: moment(data.createdAt).format('hh:mm a')
    }); 
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})


const locationMsgTemplate = locationMsg_template.innerHTML;
socket.on('locationMessage', (data)=>{
    // console.log(data);
    const html = Mustache.render(locationMsgTemplate, {
        username: data.username,
        msg: data.url,
        createdAt: moment(data.createdAt).format('hh:mm a')
    }); 
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})
//----------options-------------
// location.search為client端的參數，在此會獲取我們的輸入
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

//------------------------------
sendMessageForm.addEventListener('submit', (e)=>{
    e.preventDefault(); //防止預設刷新頁面
    
    // disable button (避免誤觸)，第二個參數會被轉成string，所以有輸入一定會被設置成true來開啟該屬性
    sendMessageButton.setAttribute('disabled', 'disabled');

    /* 以下三種都能取得input value */
    const message = e.target.elements.message.value; //e.target=現在正在監聽的target，即sendMessageForm，.element.<name>，表示其中的元素
    // const message = sendMessageForm.querySelector("input").value;
    // const message = sendMessageInput.value;
    
    socket.emit('sendMessage', message, (error)=>{
        // enable button (避免誤觸)，刪除該屬性
         sendMessageButton.removeAttribute('disabled');
         sendMessageInput.value='';// 清空input
         sendMessageInput.focus(); // input curser重新顯示閃爍，可以直接重新輸入


        if(error){
            return console.log(error);
        }
        console.log('Message delivered!');
    });
})
//---------------

sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your brower');
    }
    sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, ()=>{
            console.log('Location Shared!');
            sendLocationButton.removeAttribute('disabled');
        })
    })
})

//---------------
const sidebarTemplete = sidebar_templete.innerHTML;
socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplete, {
        room,
        users
    })
    sidebar.innerHTML = html;
})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
});