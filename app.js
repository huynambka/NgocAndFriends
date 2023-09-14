require('express-async-errors');
require('dotenv').config();
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const app = express();
const server = http.createServer(app);

app.use(
    cors({
        origin: '*',
        credentials: true,
    }),
);

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

app.use('/api/user', router.userRoutes);
app.use('/api/group', router.groupRoutes);
app.use('/api/auth', router.authRoutes);

app.get('/api-docs', (req, res) => {
    res.download(__dirname + '/NNFS.postman_collection.json');
});

app.get('/', (req, res) => {
    res.send(
        '<h1 style="text-align: center">Hello, this is the server for the NnFs project.</h1>' +
            '<h2 style="text-align: center"><a href="/api-docs">API Documentations</a></h2>',
    );
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
