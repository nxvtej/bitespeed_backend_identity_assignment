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
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/identity", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, email } = req.body;
    if (!phoneNumber && !email) {
        res.status(400).json({ error: "Phone number and email are required." });
    }
    const existingEmail = yield db_1.default.contact.findFirst({
        where: {
            email: email
        }
    });
    const existingPhone = yield db_1.default.contact.findFirst({
        where: {
            phoneNumber: phoneNumber
        }
    });
    if (!existingEmail && !existingPhone) {
        const newContact = yield db_1.default.contact.create({
            phoneNumber: phoneNumber || null,
            email: email || null,
            linkedId: null,
            linkPrecedence: 'primary',
        });
        res.status(201).json({
            contact: {
                primaryContactId: newContact.id,
                emails: newContact.email ? [newContact.email] : [],
                phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
                secondaryContactIds: []
            }
        });
    }
    else {
        // something got to be primary here
        // that will decide based on what is present 
    }
    res.status(200).json({
        contact: {
            primaryContactId: existingEmail === null || existingEmail === void 0 ? void 0 : existingEmail.id,
            emails: (existingEmail === null || existingEmail === void 0 ? void 0 : existingEmail.email) ? [existingEmail.email] : [],
            phoneNumbers: (existingEmail === null || existingEmail === void 0 ? void 0 : existingEmail.phoneNumber) ? [existingEmail.phoneNumber] : [],
            secondaryContactIds: []
        }
    });
}));
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
