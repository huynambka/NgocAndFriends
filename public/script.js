let base64Image = '';
let imageType = '';

var chat = document.getElementById('chat');
chat.scrollTop = chat.scrollHeight - chat.clientHeight;

const imageInput = document.getElementById('image-input');
const imageButton = document.getElementById('image-button');

imageButton.addEventListener('click', () => {
    imageInput.click();
});

const sendMessage = (event) => {
    if (event.key === 'Enter') {
        const message = document.getElementById('mes-input').value;
        if (message === '') {
            return;
        }
        console.log(base64Image);
        chatSocket.emit('user-send-mes', {
            message: message,
            groupId: document.querySelector('.contact.selected').id,
            image: {
                base64: base64Image,
                type: imageType,
            },
        });
        document.getElementById('mes-input').value = '';
    }
};
imageInput.addEventListener('change', (event) => {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('Image loaded');
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const MAX_WIDTH = 320;
                const MAX_HEIGHT = 180;

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round((width * MAX_HEIGHT) / height);
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataURL = canvas.toDataURL(
                    selectedImage.type,
                    0.7,
                );
                console.log(compressedDataURL);
            };
        };
        reader.readAsDataURL(selectedImage);
    }
});
