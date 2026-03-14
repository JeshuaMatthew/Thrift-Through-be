const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
const pool = require('./config/db'); 

const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const communityRoutes = require('./routes/communityRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));

app.use(express.json()); 
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Thrift-Through Backend is officially running!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});