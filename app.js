require('express-async-errors');
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const app = express();
const port = 3000;

const router = require('./routes');

app.use(express.json());
app.use(passport.initialize());

const errorHandler = require('./middlewares/errorHandler');

app.use('/api/v1/user', router.userRoutes);
app.use('/api/v1/post', router.postRoutes);
app.use('/api/v1/auth', router.authRoutes);

app.get('/', (req, res) => res.send('YOUR CREWWWW!'));

app.use(errorHandler);

const connectDB = require('./db/connect');
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, console.log(`Server is listening on port ${port}...`));
    } catch (error) {
        console.log(error);
    }
};
start();
