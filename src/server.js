const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const pool = require('./config/db'); 

const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const communityRoutes = require('./routes/communityRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
});

const chatSocket = require('./socket/chatSocket');
chatSocket(io);

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Error:", err);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Multer Error: ${err.message}` });
    }
    res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Thrift-Through Backend is officially running with WebSockets!');
});

pool.initialize()
    .then(() => {
        console.log("✅ Data Source has been initialized!");
        server.listen(PORT, () => {
            console.log(`🚀 Server is listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Error during Data Source initialization:", err);
    });