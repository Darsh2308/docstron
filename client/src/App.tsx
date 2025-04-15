import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bgImage from "./assets/bg-main.jpg";
import { ArrowPathIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Define the expected response structure
interface ConversionResponse {
  downloadUrl: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [converted, setConverted] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null); // Store the converted file URL
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];

    if (uploadedFile) {
      // Check file extensions
      if (
        ![".pdf", ".docx"].includes(uploadedFile.name.slice(-4).toLowerCase())
      ) {
        setError("Please upload a PDF or DOCX file.");
        setFile(null);
        return;
      }

      if (uploadedFile.size > MAX_FILE_SIZE) {
        setError("File size exceeds the 10MB limit.");
        setFile(null);
        return;
      }

      setFile(uploadedFile);
      setConverted(false);
      setProgress(0);
      setError(null);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
    }, // Accepting specific MIME types
    maxSize: MAX_FILE_SIZE, // Restrict file size to 10MB
  });

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setConverted(false);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Define the config for the axios request, including the progress event
      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: ProgressEvent) => {
          if (progressEvent.total) {
            setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
          }
        },
      };

      // Send the file to the backend for conversion
      const response = await axios.post<ConversionResponse>(
        "http://localhost:5000/api/convert", // Adjust the URL based on your backend
        formData,
        config
      );

      // If conversion is successful, set the download URL
      setConvertedFileUrl(response.data.downloadUrl);
      setConverted(true);
      setIsConverting(false);
    } catch (err) {
      setIsConverting(false);
      setError("Error converting file.");
      console.error(err);
    }
  };

  const getDownloadFileName = () => {
    if (!file) return "converted";
    return file.name.endsWith(".pdf")
      ? file.name.replace(".pdf", ".docx")
      : file.name.replace(".docx", ".pdf");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-40 text-center"
      >
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">Docstron</h1>
        <p className="text-white text-sm">
          Seamlessly transform your documents, PDF to DOCX, and back, in a snap!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4 text-center"
      >
        <p className="text-gray-700 font-medium">Upload your files</p>

        {/* Drag-and-Drop area */}
        <motion.div whileHover={{ scale: 1.02 }} className="flex justify-center">
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer"
          >
            <input {...getInputProps()} />
            <p className="text-gray-500">
              Drag & Drop your file here or click to select
            </p>
          </div>
        </motion.div>

        {/* Displaying the file name */}
        {file && (
          <p className="text-gray-700 mt-4">
            <strong>Selected File:</strong> {file.name}
          </p>
        )}

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-red-500 text-sm mt-2"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {file && !isConverting && !converted && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConvert}
            className="bg-green-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-600 mx-auto flex items-center justify-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Convert
          </motion.button>
        )}

        {isConverting && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut", duration: 0.3 }}
            className="w-full bg-gray-200 rounded-full h-4 overflow-hidden"
          >
            <div className="bg-blue-500 h-4" />
          </motion.div>
        )}

        {converted && convertedFileUrl && (
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            href={convertedFileUrl}
            download={getDownloadFileName()}
            className="w-full bg-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-700 mx-auto flex items-center justify-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Download {getDownloadFileName()}
          </motion.a>
        )}
      </motion.div>
    </div>
  );
}

export default App;
