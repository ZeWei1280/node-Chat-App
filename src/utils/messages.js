const generateMessage = (text)=>{
    return{
        text, 
        createdAt: new Date().getTime()
    }
}

const generateLocationMsg = (url)=>{
    return{
        url, 
        createdAt: new Date().getTime()
    }
}

export {
    generateMessage, 
    generateLocationMsg
};