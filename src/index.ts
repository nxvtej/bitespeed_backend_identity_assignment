import express from 'express';
import prisma from './db';
import { contactRequest, contactResponse } from './interfaces';

const app = express();
app.use(express.json());

app.post("/identity", async (req, res): Promise<void> => {
    const { phoneNumber, email }: contactRequest = req.body;
    console.log("Received request:", req.body);
    if (!phoneNumber && !email) {
        res.status(400).json({ error: "Phone number and email are required." });
    }

    const existingEmail = await prisma.contact.findFirst({
        where: {
            email: email
        }
    })
    const existingPhone = await prisma.contact.findFirst({
        where: {
            phoneNumber: phoneNumber
        }
    })

    if (!existingEmail && !existingPhone) {
        const newContact = await prisma.contact.create({
            data: {
                phoneNumber: phoneNumber || null,
                email: email || null,
                linkedId: null,
                linkPrecedence: 'primary',
            }
        });
        res.status(201).json({
            contact: {
                primaryContactId: newContact.id,
                emails: newContact.email ? [newContact.email] : [],
                phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
                secondaryContactIds: []
            }
        });
    } else {
        // something got to be primary here
        // that will decide based on what is present 
    }

    res.status(200).json({
        contact: {
            primaryContactId: existingEmail?.id,
            emails: existingEmail?.email ? [existingEmail.email] : [],
            phoneNumbers: existingEmail?.phoneNumber ? [existingEmail.phoneNumber] : [],
            secondaryContactIds: []
        }
    });
})
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});