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
const index_1 = __importDefault(require("./index"));
const db_1 = __importDefault(require("./db"));
const server = index_1.default.listen(3000, () => {
    console.log('Server is running on port 3000');
    console.log(`Access the /identify endpoint at http://localhost:3000/identify`);
});
process.on('beforeExit', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Shutting down server...');
    yield db_1.default.$disconnect();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
}));
process.on('SIGTERM', () => {
    console.log("SIGTERM received, shutting down.");
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log("SIGINT received, shutting down.");
    process.exit(0);
});
