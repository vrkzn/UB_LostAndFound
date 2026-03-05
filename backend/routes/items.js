import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../db.js";
import { fileURLToPath } from "url";
import { authenticateToken } from "../middleware/authMiddleware.js";


const router = express.Router();

/*
====================================================
 Path Setup (ES Module Safe)
====================================================
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
====================================================
 Upload Directory Setup
====================================================
*/

const uploadDir = path.join(__dirname, "../uploads/found_items");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/*
====================================================
 Multer Configuration
====================================================
*/

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {

    const allowed = ["image/png", "image/jpeg"];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only PNG and JPEG images are allowed"), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        files: 3
    }
});

/*
====================================================
 Utility Function — Philippine Time Generator
====================================================
*/

function getPhilippineTime() {
    return new Date(
        new Date().toLocaleString("en-US", {
            timeZone: "Asia/Manila"
        })
    );
}

/*
====================================================
 Found Item Report Route
====================================================
*/

router.post(
    "/found",
    authenticateToken,
    (req, res, next) => {
        upload.array("images", 3)(req, res, next);
    },
    async (req, res) => {
        try {

            let {
                item_name,
                category,
                date_found,
                time_found,
                location_found,
                claim_to,
                description,
                notes,
                isAnonymous
            } = req.body;

            /*
            ====================================================
            Normalize Fields
            ====================================================
            */

            item_name = item_name?.trim();
            category = category?.trim();
            date_found = date_found?.trim();
            time_found = time_found?.trim();
            location_found = location_found?.trim();
            claim_to = claim_to?.trim();
            description = description?.trim();
            notes = notes?.trim() || "";

            /*
            ====================================================
            Required Field Validation
            ====================================================
            */

            if (
                !item_name ||
                !category ||
                !date_found ||
                !time_found ||
                !location_found ||
                !claim_to ||
                !description
            ) {
                return res.status(400).json({
                    message: "Missing required fields"
                });
            }

            const anonymousFlag =
                String(isAnonymous).toLowerCase() === "true" ? 1 : 0;

            const userId = req.user.id;
            const createdAt = getPhilippineTime();

            /*
            ====================================================
            Insert Found Item
            ====================================================
            */

            const [result] = await db.query(
                `INSERT INTO FOUND_ITEMS 
                (user_id, item_name, category, date_found, time_found,
                 location_found, claim_to, description, notes,
                 isAnonymous, status, created_at)
                 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
                [
                    userId,
                    item_name,
                    category,
                    date_found,
                    time_found,
                    location_found,
                    claim_to,
                    description,
                    notes,
                    anonymousFlag,
                    createdAt
                ]
            );

            const foundItemId = result.insertId;

            /*
            ====================================================
            Save Uploaded Images
            ====================================================
            */

            if (req.files && req.files.length > 0) {

                const imageRecords = req.files.map(file => [
                    foundItemId,
                    `/uploads/found_items/${file.filename}`,
                    getPhilippineTime()
                ]);

                await db.query(
                    `INSERT INTO FOUND_ITEM_IMAGES 
                    (found_item_id, image_path, uploaded_at)
                    VALUES ?`,
                    [imageRecords]
                );
            }

            res.json({
                message: "Found item report saved successfully"
            });

        } catch (error) {

            console.error("Found Report Error:", error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


/*
====================================================
 Get Items for Student Dashboard
====================================================
*/
router.get("/:type", authenticateToken, async (req, res) => {

    try {

        const { type } = req.params;

        if (!["found", "lost"].includes(type)) {
            return res.status(400).json({
                message: "Invalid type"
            });
        }

        const table =
            type === "found"
                ? "FOUND_ITEMS"
                : "LOST_ITEMS";

        const imageTable =
            type === "found"
                ? "FOUND_ITEM_IMAGES"
                : "LOST_ITEM_IMAGES";

        const foreignKey =
            type === "found"
                ? "found_item_id"
                : "lost_item_id";

        const [rows] = await db.query(`
            SELECT 
                i.id,
                i.item_name,
                i.category,
                i.description,
                i.status,
                i.created_at,

                (
                    SELECT image_path
                    FROM ${imageTable}
                    WHERE ${foreignKey} = i.id
                    LIMIT 1
                ) AS image_path

            FROM ${table} i
            WHERE i.status = 'approved'
            ORDER BY i.created_at DESC
        `);

        res.json(rows);

    } catch (error) {

        console.error("Fetch Items Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// router.get("/found", authenticateToken, async (req, res) => {
//   const [rows] = await db.query(`
//     SELECT * FROM FOUND_ITEMS ORDER BY created_at DESC
//   `);

//   res.json(rows);
// });

// router.get("/lost", authenticateToken, async (req, res) => {
//   const [rows] = await db.query(`
//     SELECT * FROM LOST_ITEMS ORDER BY created_at DESC
//   `);

//   res.json(rows);
// });
export default router;