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
// Ensure folder exists
const lostDir = path.join(__dirname, "../uploads/lost_items");

if (!fs.existsSync(lostDir)) {
  fs.mkdirSync(lostDir, { recursive: true });
}

const lostUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, lostDir);
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    }
  })
});
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

router.post("/found",
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

router.post("/lost", authenticateToken, upload.array("images", 3), async (req, res) => {
  try {

    const {
      item_name,
      category,
      date_lost,
      time_lost,
      location_lost,
      claim_to,
      description,
      notes,
      isAnonymous
    } = req.body;

    // ✅ Force user_id from auth middleware
    const user_id = req.user.id;

    // Validation
    if (!item_name || !category || !date_lost || !time_lost ||
        !location_lost || !claim_to || !description) {
      return res.status(400).json({
        message: "Please fill in all required fields"
      });
    }

    // Insert lost item
    const insertQuery = `
      INSERT INTO LOST_ITEMS
      (user_id, item_name, category, date_lost, time_lost,
       location_lost, claim_to, description, notes, isAnonymous)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(insertQuery, [
      user_id,
      item_name,
      category,
      date_lost,
      time_lost,
      location_lost,
      claim_to,
      description,
      notes || null,
      isAnonymous === "true" || isAnonymous === true ? 1 : 0
    ]);

    const lostItemId = result.insertId;

    // ✅ Save images if uploaded
    if (req.files && req.files.length > 0) {

      const imageQuery = `
        INSERT INTO LOST_ITEM_IMAGES (lost_item_id, image_path)
        VALUES (?, ?)
      `;

      for (const file of req.files) {
await db.execute(imageQuery, [
  lostItemId,
  `/uploads/found_items/${file.filename}`
]);
      }
    }

    res.status(201).json({
      message: "Lost item reported successfully",
      id: lostItemId
    });

  } catch (error) {
    console.error("Lost Item Backend Error:", error);

    res.status(500).json({
      message: "Server error while reporting lost item"
    });
  }
});

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

        /*
        =====================================================
        CONFIGURATION MAP (SAFE TABLE RESOLUTION)
        =====================================================
        */

        const config = {
            found: {
                table: "FOUND_ITEMS",
                imageTable: "FOUND_ITEM_IMAGES",
                foreignKey: "found_item_id"
            },
            lost: {
                table: "LOST_ITEMS",
                imageTable: "LOST_ITEM_IMAGES",
                foreignKey: "lost_item_id"
            }
        };

        const { table, imageTable, foreignKey } = config[type];

        /*
        =====================================================
        FETCH ITEMS
        =====================================================
        */

        const [rows] = await db.query(`
            SELECT 
                i.id,
                i.item_name,
                i.category,
                i.description,
                i.date_lost,
                i.time_lost,
                i.location_lost AS location_lost,
                i.claim_to,
                i.notes,
                i.isAnonymous,
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

        return res.json(rows);

    } catch (error) {

        console.error("Fetch Items Error:", error);

        return res.status(500).json({
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