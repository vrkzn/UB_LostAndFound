import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.js";
import itemsRouter from "./routes/items.js";
import adminRouter from "./routes/admin.js";

const app = express();
const port = 7002;
// ⚡ Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json());

/*
=====================================
SERVE UPLOADS
=====================================
*/

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
=====================================
ROUTES
=====================================
*/

app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/admin", adminRouter);

app.listen(port, () => {
   
    console.log(`Server started on http://localhost:${port}`);
});