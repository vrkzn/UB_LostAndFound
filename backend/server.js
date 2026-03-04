import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import itemsRouter from "./routes/items.js";
import adminRouter from "./routes/admin.js";

const app = express();
const port = 7002;

app.use(cors({
    origin: "http://localhost:5174",
    credentials: true,
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/admin", adminRouter);

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});