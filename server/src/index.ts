import express from "express";
import cors from "cors";
import convertRoutes from "./routes/convert"; // Import convert routes

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default route
app.get("/", (req, res) => {
  res.send("Docstron backend is live!");
});

// API route for file conversion
app.use("/api", convertRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
