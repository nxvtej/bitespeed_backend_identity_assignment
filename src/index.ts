import express from 'express';
import prisma from './db';
import { contactRequest, contactResponse } from './interfaces';
import { identityController } from './controllers/contactControllers';

const app = express();
app.use(express.json());

app.post("/identify", identityController)

export default app;