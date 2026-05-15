import express from "express";
import multer from "multer";
import fs from "fs";
import Tesseract from "tesseract.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/scan-receipt", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const filePath = req.file.path;

        // 🔍 OCR
        const result = await Tesseract.recognize(filePath, "eng");
        const text = result.data.text;

        // 🧠 Smart extraction logic
        const lines = text
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);

        const keywords = [
            "grand total",
            "total amount",
            "amount payable",
            "net total",
            "total",
        ];

        let amount = null;

        // 🔥 Scan from bottom → top
        for (let i = lines.length - 1; i >= 0; i--) {
            const lowerLine = lines[i].toLowerCase();

            for (let key of keywords) {
                if (lowerLine.includes(key)) {
                    const match = lines[i].match(/[\d,.]+/);
                    if (match) {
                        amount = match[0].replace(/,/g, "");
                        break;
                    }
                }
            }

            if (amount) break;
        }

        // ⚡ Fallback: pick largest number (very useful)
        if (!amount) {
            const numbers = text.match(/[\d,.]+/g);
            if (numbers) {
                amount = numbers
                    .map((n) => parseFloat(n.replace(/,/g, "")))
                    .filter((n) => !isNaN(n))
                    .sort((a, b) => b - a)[0];
            }
        }

        // 🧹 delete file
        fs.unlinkSync(filePath);

        res.json({
            success: true,
            amount,
            raw: text,
        });
    } catch (err) {
        console.error("OCR Error:", err);

        res.status(500).json({
            success: false,
            amount: null,
            message: "Failed to scan receipt",
        });
    }
});

export default router;