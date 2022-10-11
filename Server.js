import express from 'express';
const app = express();
import mongoose from 'mongoose';
import { APP_PORT, DB_URL } from './Config';
import errorHandler from './middlewares/errorHandler';
import router from './routers';
import path from 'path';

// Database connection
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('DB connected...')
})

global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({extended: false}));
app.use(express.json())

app.use('/api', router);

app.use(errorHandler);

app.listen(APP_PORT, () => console.log(`Listening on port ${APP_PORT}`))