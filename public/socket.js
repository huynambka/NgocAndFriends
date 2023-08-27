const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}
const chatSocket = io('/chat', {
    query: {
        token: token,
    },
});

const chatForm = document.querySelector('#chat-form');
const chatMes = document.querySelector('#chat-mes');

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = chatMes.value;
    chatMes.textContent = '';
    // const groupId = sessionStorage.getItem('groupId');
    // if (!groupId) {
    //     alert('Please join a group first');
    //     return;
    // }
    chatSocket.emit('user-send-mes', {
        message: message,
        groupId: '64e9bec91aaaafef7a9b5226',
    });
});

chatSocket.on('send-mes-success', (data) => {
    const message = data.message;
    console.log(message);
    const messageList = document.querySelector('#message');
    const newMessage = document.createElement('li');
    newMessage.textContent = message;
    messageList.appendChild(newMessage);
});

chatSocket.on('send-mes-failed', (data) => {
    alert(data.message);
});

chatSocket.on('unauthorized', (data) => {
    window.location.href = '/login.html';
});
