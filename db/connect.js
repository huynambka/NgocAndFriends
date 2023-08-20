const mongoose = require('mongoose');

const connectDB = async (url) => {
    return mongoose
        .connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('Database connected');
        })
        .catch((err) => {
            console.log('Connection failed');
        });
};

module.exports = connectDB;
