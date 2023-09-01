const token = sessionStorage.getItem('token');
if (!token) {
    window.location.href = '/login';
}
const chatSocket = io('/chat', {
    query: {
        token: token,
    },
});

chatSocket.on('send-mes-failed', (data) => {
    alert(data.message);
});

chatSocket.on('unauthorized', (data) => {
    window.location.href = '/login';
});

chatSocket.on('send-groups', (groups) => {
    const contacts = document.querySelector('.contacts');
    const groupAvatarList = ['rogers', 'stark', 'banner', 'thor'];
    groups.forEach((group, index) => {
        const groupElement = document.createElement('div');
        groupElement.classList.add('contact');
        if (index === 0) {
            groupElement.classList.add('selected');
            const chatName = document.querySelector('.chat .name');
            chatName.textContent = group.name;
            const chatAvatar = document.querySelector('.chat .bar .pic');
            chatAvatar.classList.add(groupAvatarList[index]);
        }
        groupElement.id = group._id;

        const groupAvatar = document.createElement('div');
        groupAvatar.classList.add('pic', groupAvatarList[index]);

        const groupName = document.createElement('div');
        groupName.classList.add('name');
        groupName.textContent = group.name;

        groupElement.appendChild(groupAvatar);
        groupElement.appendChild(groupName);

        contacts.appendChild(groupElement);
    });
});

chatSocket.on('new-message', (data) => {
    console.log(data);
    const message = data.message;
    const messageList = document.querySelector('.messages');
    const divMessage = document.createElement('div');
    divMessage.classList.add('message');
    const username = window.sessionStorage.getItem('username');
    if (data.sender === username) {
        divMessage.classList.add('parker');
    } else {
        divMessage.classList.add('stark');
    }
    divMessage.textContent = username + ': ' + message;
    messageList.appendChild(divMessage);
});
