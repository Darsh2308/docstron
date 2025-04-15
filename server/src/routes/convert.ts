import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { convertFile } from "./convertFile"; // Relative path from convert.ts to convertFile.ts

// Setup multer to save uploaded files to the "uploads" directory
const upload = multer({ dest: "uploads/" });

const router = express.Router();

// POST route to handle file conversion
router.post("/convert", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  const file = req.file;

  // Check if file is provided
  if (!file) {
    res.status(400).json({ error: "No file uploaded." });
    return;
  }

  // Construct file path
  const filePath = path.join(__dirname, "../uploads", file.filename);

  try {
    // Perform the conversion
    const convertedFilePath = await convertFile(filePath); // Convert the file (PDF to DOCX, or vice versa)

    // Construct the public URL for the converted file
    const convertedFileName = path.basename(convertedFilePath);
    const downloadUrl = `http://localhost:5000/uploads/${convertedFileName}`;

    // Send the converted file URL as a response
    res.json({
      downloadUrl: downloadUrl,
    });

    // Clean up the uploaded file after processing (Optional, since the file might be large)
    fs.unlinkSync(filePath);
    fs.unlinkSync(convertedFilePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error converting file." });
  }
});

export default router;
