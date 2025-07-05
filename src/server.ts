import app from './index'
import prisma from './db';

const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
    console.log(`Access the /identify endpoint at http://localhost:3000/identify`);

});

process.on('beforeExit', async () => {
    console.log('Shutting down server...');
    await prisma.$disconnect();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    })
})

process.on('SIGTERM', () => {
    console.log("SIGTERM received, shutting down.")
    process.exit(0);
})

process.on('SIGINT', () => {
    console.log("SIGINT received, shutting down.")
    process.exit(0);
})