import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/router.js';
import cors from 'cors';

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/', router)

const PORT = 4000; // backend routing port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});