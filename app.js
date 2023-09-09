require('express-async-errors');
require('dotenv').config();
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*', // In production, change this to production URL
        methods: ['GET', 'POST'],
    },
});

const router = require('./routes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const passport = require('./middlewares/passport');
const errorHandler = require('./middlewares/errorHandler');

app.use(passport.initialize());

app.use('/api/v1/user', router.userRoutes);
app.use('/api/v1/group', router.groupRoutes);
app.use('/api/v1/auth', router.authRoutes);

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/', (req, res) => {
    res.redirect('/chat');
});
const socketHandler = require('./socket/socketHandler');
socketHandler(io);

app.use(errorHandler);

const connectDB = require('./db/connect');
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        server.listen(
            process.env.PORT,
            console.log(`Server is listening on port ${process.env.PORT}...`),
        );
    } catch (error) {
        console.log(error);
    }
};
start();
