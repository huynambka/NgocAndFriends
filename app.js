require('express-async-errors');
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

const router = require('./routes');

app.use(express.json());

const passport = require('./middlewares/passport');
const errorHandler = require('./middlewares/errorHandler');

app.use(passport.initialize());

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
