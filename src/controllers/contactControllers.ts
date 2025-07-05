import { Request, response, Response } from "express";
import { contactRequest, contactResponse } from "../interfaces";
import prisma from "../db";
import { all } from "axios";
import { LanguageServiceMode } from "typescript";

export const identityController = async (req: Request, res: Response): Promise<void> => {

    const { phoneNumber, email }: contactRequest = req.body;
    console.log("Received request:", req.body);

    if (!phoneNumber && !email) {
        res.status(400).json({ error: "Phone number and email are required." });
        return;
    }
    try {

        const existingRecord = await prisma.contact.findMany({
            where: {
                isDeleted: false,
                OR: [
                    ...(email ? [{ email: email }] : []),
                    ...(phoneNumber ? [{ phoneNumber: phoneNumber }] : []),

                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
        })

        if (existingRecord.length === 0) {
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
            return;
        } else {
            // primary contact decide absed on linkprecedence or createdat
            let primaryContact = existingRecord.find(r => r.linkPrecedence === 'primary') || existingRecord[0]
            const secondaryContacts = existingRecord.filter(r => r.id != primaryContact.id)

            const allEmails = new Set<string>();
            const allPhone = new Set<string>();
            const secondaryIds: number[] = [];

            existingRecord.forEach(r => {
                if (r.email) allEmails.add(r.email);
                if (r.phoneNumber) allPhone.add(r.phoneNumber);
                if (r.id !== primaryContact.id) secondaryIds.push(r.id);
            })

            let needNewSecondary = false;

            if (
                (email && ![...allEmails].includes(email)) ||
                (phoneNumber && ![...allPhone].includes(phoneNumber))
            ) {
                needNewSecondary = true;
            }

            if (needNewSecondary) {
                const newSecondary = await prisma.contact.create({
                    data: {
                        phoneNumber: phoneNumber || null,
                        email: email || null,
                        linkedId: primaryContact.id,
                        linkPrecedence: 'secondary',
                    }
                });

                secondaryIds.push(newSecondary.id);
                if (newSecondary.email) allEmails.add(newSecondary.email);
                if (newSecondary.phoneNumber) allPhone.add(newSecondary.phoneNumber);
            }
            // Merge multiple primaries logic
            const primaries = existingRecord.filter(r => r.linkPrecedence === "primary");
            if (primaries.length > 1) {
                primaries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
                primaryContact = primaries[0];
                for (let i = 1; i < primaries.length; i++) {
                    await prisma.contact.update({
                        where: { id: primaries[i].id },
                        data: {
                            linkPrecedence: 'secondary',
                            linkedId: primaryContact.id,
                        },
                    });
                    secondaryIds.push(primaries[i].id);
                }
            }

            res.status(200).json({
                contact: {
                    primaryContactId: primaryContact.id,
                    emails: [primaryContact.email, ...[...allEmails].filter(e => e !== primaryContact.email)],
                    phoneNumbers: [primaryContact.phoneNumber, ...[...allPhone].filter(p => p !== primaryContact.phoneNumber)],
                    secondaryContactIds: secondaryIds,
                },

            });
            return;
        }

        res.status(404).json({
            message: 'Wrong req.'
        })
        return
    }
    catch (error) {
        console.error("Error during identity reconciliation:", error)
        res.status(500).json({
            error: 'Internal Server Error'
        })
        return;
    }
}


