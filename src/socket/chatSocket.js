const pool = require('../config/db');

const chatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // Join a community room
        socket.on('join_room', (communityId) => {
            socket.join(`community_${communityId}`);
            console.log(`👥 User ${socket.id} joined room: community_${communityId}`);
        });

        // Handle sending messages
        socket.on('send_message', async (data) => {
            try {
                const { community_id, user_id, chat_text } = data;

                // 1. Simpan ke Database
                const sqlQuery = `
                    INSERT INTO chats (community_id, user_id, chat_text, date_sent) 
                    VALUES ($1, $2, $3, NOW()) 
                    RETURNING *;
                `;
                const result = await pool.query(sqlQuery, [community_id, user_id, chat_text]);
                const newMessage = result.rows[0];

                // 2. Broadcast ke semua orang di room komunitas tersebut
                io.to(`community_${community_id}`).emit('receive_message', newMessage);

            } catch (err) {
                console.error("Error in WebSocket chat:", err.message);
                socket.emit('error', { message: 'Gagal mengirim pesan' });
            }
        });

        // Handle edit message
        socket.on('edit_message', async (data) => {
            try {
                const { chat_id, community_id, new_text, user_id } = data;

                // 1. Update Database (pastikan user milik chat ini)
                const updateQuery = `
                    UPDATE chats 
                    SET chat_text = $1 
                    WHERE chat_id = $2 AND user_id = $3
                    RETURNING *;
                `;
                const result = await pool.query(updateQuery, [new_text, chat_id, user_id]);

                if (result.rows.length > 0) {
                    // 2. Broadcast perubahan
                    io.to(`community_${community_id}`).emit('message_edited', result.rows[0]);
                } else {
                    socket.emit('error', { message: 'Gagal mengedit pesan: Tidak ditemukan atau bukan milik Anda' });
                }

            } catch (err) {
                console.error("Error editing message:", err.message);
                socket.emit('error', { message: 'Gagal mengedit pesan' });
            }
        });

        // Handle delete message (soft delete)
        socket.on('delete_message', async (data) => {
            try {
                const { chat_id, community_id, user_id } = data;

                // 1. Soft delete di Database
                const deleteQuery = `
                    UPDATE chats 
                    SET is_deleted = true 
                    WHERE chat_id = $1 AND user_id = $2
                    RETURNING *;
                `;
                const result = await pool.query(deleteQuery, [chat_id, user_id]);

                if (result.rows.length > 0) {
                    // 2. Broadcast penghapusan
                    io.to(`community_${community_id}`).emit('message_deleted', { chat_id });
                } else {
                    socket.emit('error', { message: 'Gagal menghapus pesan: Tidak ditemukan atau bukan milik Anda' });
                }

            } catch (err) {
                console.error("Error deleting message:", err.message);
                socket.emit('error', { message: 'Gagal menghapus pesan' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });
};

module.exports = chatSocket;
