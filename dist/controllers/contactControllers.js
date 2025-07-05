"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityController = void 0;
const db_1 = __importDefault(require("../db"));
const identityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, email } = req.body;
    console.log("Received request:", req.body);
    if (!phoneNumber && !email) {
        res.status(400).json({ error: "Phone number and email are required." });
        return;
    }
    try {
        const existingRecord = yield db_1.default.contact.findMany({
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
        });
        if (existingRecord.length === 0) {
            const newContact = yield db_1.default.contact.create({
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
        }
        else {
            // primary contact decide absed on linkprecedence or createdat
            let primaryContact = existingRecord.find(r => r.linkPrecedence === 'primary') || existingRecord[0];
            const secondaryContacts = existingRecord.filter(r => r.id != primaryContact.id);
            const allEmails = new Set();
            const allPhone = new Set();
            const secondaryIds = [];
            existingRecord.forEach(r => {
                if (r.email)
                    allEmails.add(r.email);
                if (r.phoneNumber)
                    allPhone.add(r.phoneNumber);
                if (r.id !== primaryContact.id)
                    secondaryIds.push(r.id);
            });
            let needNewSecondary = false;
            if ((email && ![...allEmails].includes(email)) ||
                (phoneNumber && ![...allPhone].includes(phoneNumber))) {
                needNewSecondary = true;
            }
            if (needNewSecondary) {
                const newSecondary = yield db_1.default.contact.create({
                    data: {
                        phoneNumber: phoneNumber || null,
                        email: email || null,
                        linkedId: primaryContact.id,
                        linkPrecedence: 'secondary',
                    }
                });
                secondaryIds.push(newSecondary.id);
                if (newSecondary.email)
                    allEmails.add(newSecondary.email);
                if (newSecondary.phoneNumber)
                    allPhone.add(newSecondary.phoneNumber);
            }
            // Merge multiple primaries logic
            const primaries = existingRecord.filter(r => r.linkPrecedence === "primary");
            if (primaries.length > 1) {
                primaries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
                primaryContact = primaries[0];
                for (let i = 1; i < primaries.length; i++) {
                    yield db_1.default.contact.update({
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
        });
        return;
    }
    catch (error) {
        console.error("Error during identity reconciliation:", error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
        return;
    }
});
exports.identityController = identityController;
