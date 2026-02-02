import express from 'express';
import { eventRouter } from './routes/events.js';

const PORT = 8000;

const app = express();

app.use(express.json());

app.use('/api/event', eventRouter);

app.listen(PORT, () => {
    console.log(`Server connected on port ${PORT}`) 
}).on('error', (err) => {
    console.error('Failed to start server: ', err);
});