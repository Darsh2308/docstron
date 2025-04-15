import { exec } from "child_process";
import path from "path";
import fs from "fs";

/**
 * Converts a PDF file to DOCX format by invoking a Python script.
 * @param filePath - The path to the input PDF file.
 * @returns The path to the converted DOCX file.
 */
export const convertFile = async (filePath: string): Promise<string> => {
  // Define the path to the Python script and output DOCX file path
  const pythonScriptPath = path.resolve(__dirname, "../convert_pdf_to_docx.py");
  const outputFilePath = filePath.replace(".pdf", ".docx");

  console.log(`Python script path: ${pythonScriptPath}`);
  console.log(`Output file path: ${outputFilePath}`);

  try {
    // Execute the Python script to convert the file
    const command = `python "${pythonScriptPath}" "${filePath}" "${outputFilePath}"`;

    // Using the exec function to run the Python script
    await new Promise<void>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Conversion failed: ${stderr || error.message}`));
        } else {
          console.log("Python script output:", stdout); // Log the stdout for debugging if needed
          resolve();
        }
      });
    });

    // Check if the converted file exists
    if (!fs.existsSync(outputFilePath)) {
      throw new Error("Converted file not found after execution.");
    }

    // Return the path to the converted file
    return outputFilePath;
  } catch (error: unknown) {
    // Handle errors properly
    if (error instanceof Error) {
      throw new Error("Failed to convert file: " + error.message);
    } else {
      throw new Error("Failed to convert file: Unknown error");
    }
  }
};
