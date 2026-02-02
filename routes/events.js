import express from 'express';
import { postEvent, getEvents } from '../controllers/eventsController.js';

export const eventRouter = express.Router();

eventRouter.post("/", postEvent);
eventRouter.get("/", getEvents);

