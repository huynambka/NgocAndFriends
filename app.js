const express = require('express');
require('express-async-errors');
const app = express();
const port = 3000;

const router = require('./routes');

app.use(express.json());

const errorHandler = require('./middlewares/errorHandler');

app.use('/api/v1/user', router.userRoutes);
app.use('/api/v1/post', router.postRoutes);

app.get('/', (req, res) => res.send('YOUR CREWWWW!'));

app.use(errorHandler);

const connectDB = require('./db/connect');
const start = async () => {
    try {
        await connectDB(
            process.env.MONGO_URI || 'mongodb+srv://huynambka:PassMongoDB1008@huynambka.e0yk43a.mongodb.net/your_crew',
        );
        app.listen(port, console.log(`Server is listening on port ${port}...`));
    } catch (error) {
        console.log(error);
    }
};
start();
