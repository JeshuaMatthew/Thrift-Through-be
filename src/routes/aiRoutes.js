const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

// 1. Perbaikan: Panggil nama variabel dari .env, bukan memasukkan key-nya langsung ke dalam process.env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Perbaikan: Tambahkan tanda panah (=>) dan kurung kurawal buka ({) untuk memulai fungsi
router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: "Prompt tidak boleh kosong" });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: "Anda adalah asisten AI untuk platform jual beli elektronik bekas lokal yang bertujuan mengurangi e-waste. Tugas Anda meliputi: 1. Memberikan estimasi harga elektronik bekas berdasarkan kondisi dan harga pasar. 2. Membuat deskripsi produk yang menarik. 3. Menjawab pertanyaan umum sebagai chatbot. Jawab dengan faktual, profesional, dan dukung misi ramah lingkungan.",
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 3. Perbaikan: Gunakan 'res' (response), bukan 'req' (request) untuk mengirim data kembali
        res.status(200).json({
            success: true,
            data: responseText
        });

    } catch (error) {
        console.error("Error AI:", error);
        res.status(500).json({
            success: false,
            message: "Gagal memproses permintaan AI, silahkan coba lagi."
        });
    }
}); // 4. Perbaikan: Tambahkan penutup kurung kurawal dan kurung tutup untuk router.post

module.exports = router;