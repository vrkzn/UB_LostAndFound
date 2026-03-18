import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import db from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.get("/dashboard", authenticateToken, async (req, res) => {

  try {
    const userId = req.user.id; // coming from token
    const [[user]] = await db.query("SELECT name FROM USERS WHERE id=?", [userId]);

    /*
    =====================================================
    STATS
    =====================================================
    */

    const [[lostStats]] = await db.query(
      "SELECT COUNT(*) AS total FROM LOST_ITEMS"
    );

    const [[foundStats]] = await db.query(
      "SELECT COUNT(*) AS total FROM FOUND_ITEMS"
    );

    const [[unclaimedStats]] = await db.query(`
      SELECT COUNT(*) AS total FROM (
        SELECT id FROM LOST_ITEMS WHERE status != 'claimed'
        UNION ALL
        SELECT id FROM FOUND_ITEMS WHERE status != 'claimed'
      ) AS temp
    `);
const [[claimedStats]] = await db.query(`
  SELECT COUNT(*) AS total FROM (
    SELECT id FROM LOST_ITEMS WHERE status='claimed'
    UNION ALL
    SELECT id FROM FOUND_ITEMS WHERE status='claimed'
  ) AS temp
`);
    /*
    =====================================================
    FETCH FOUND ITEMS (FULL DATA ⭐)
    =====================================================
    */

const [foundItems] = await db.query(`
  SELECT
    f.id,
    f.item_name,
    f.category,
    f.description,
    f.notes,
    f.location_found AS location,
    f.date_found AS event_date,
    f.time_found AS event_time,
    f.claim_to,
    f.status,
    f.claimed_by,
    f.claim_datetime,
    f.created_at,
    'found' AS item_type,
    
    u.name AS reporter_name,      -- always give the user's name
    f.isAnonymous,               -- add this to indicate anonymous

    (
      SELECT image_path
      FROM FOUND_ITEM_IMAGES
      WHERE found_item_id = f.id
      LIMIT 1
    ) AS image_path

  FROM FOUND_ITEMS f
  LEFT JOIN USERS u ON u.id = f.user_id
  ORDER BY f.created_at DESC
`);

    /*
    =====================================================
    FETCH LOST ITEMS (FULL DATA ⭐)
    =====================================================
    */

const [lostItems] = await db.query(`
  SELECT
    l.id,
    l.item_name,
    l.category,
    l.description,
    l.notes,
    l.location_lost AS location,
    l.date_lost AS event_date,
    l.time_lost AS event_time,
    l.claim_to,
    l.status,
    l.claimed_by,
    l.claim_datetime,
    l.created_at,
    'lost' AS item_type,
    
    u.name AS reporter_name,     
    l.isAnonymous,              

    (
      SELECT image_path
      FROM LOST_ITEM_IMAGES
      WHERE lost_item_id = l.id
      LIMIT 1
    ) AS image_path

  FROM LOST_ITEMS l
  LEFT JOIN USERS u ON u.id = l.user_id
  ORDER BY l.created_at DESC
`);

// Inside /admin/dashboard route
const [[currentUser]] = await db.query(
  "SELECT name FROM USERS WHERE id=?",
  [req.user.id] // from authenticateToken
);

    res.json({
      stats: {
        totalLost: lostStats.total,
        totalFound: foundStats.total,
        totalUnclaimed: unclaimedStats.total,
        totalClaimed: claimedStats.total
      },

  items: [...foundItems, ...lostItems],
  userName: currentUser?.name || "Unknown"  // send current user's name
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Dashboard fetch failed"
    });
  }
});


// --------------------------------------------------
// ADMIN ACTIONS (Verify, Claim, Delete)
// --------------------------------------------------

router.post("/items/:id/:action", authenticateToken, async (req, res) => {
  try {
    const { id, action } = req.params;

    let table = "FOUND_ITEMS";
    let imageTable = "FOUND_ITEM_IMAGES";
    let imageColumn = "found_item_id";
    let imageFolder = "found_items"; // folder in uploads

    const [[found]] = await db.query("SELECT id FROM FOUND_ITEMS WHERE id=?", [id]);

    if (!found) {
      const [[lost]] = await db.query("SELECT id FROM LOST_ITEMS WHERE id=?", [id]);
      if (lost) {
        table = "LOST_ITEMS";
        imageTable = "LOST_ITEM_IMAGES";
        imageColumn = "lost_item_id";
        imageFolder = "lost_items"; // folder in uploads
      } else {
        return res.status(404).json({ message: "Item not found" });
      }
    }

    // Get item status
    const [[item]] = await db.query(`SELECT status FROM ${table} WHERE id=?`, [id]);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (action === "verify") {
      const newStatus = item.status === "approved" ? "pending" : "approved";
      await db.query(`UPDATE ${table} SET status=? WHERE id=?`, [newStatus, id]);
    } else if (action === "claimed") {
      if (item.status === "claimed") {
        await db.query(
          `UPDATE ${table} SET status='approved', claimed_by=NULL, claim_datetime=NULL WHERE id=?`,
          [id]
        );
      } else {
        const { claimed_by, claim_datetime } = req.body;
        await db.query(
          `UPDATE ${table} SET status='claimed', claimed_by=?, claim_datetime=? WHERE id=?`,
          [claimed_by, claim_datetime, id]
        );
      }
    } else if (action === "delete") {
      // Get all associated images
      const [images] = await db.query(`SELECT image_path FROM ${imageTable} WHERE ${imageColumn}=?`, [id]);

      // Delete image files safely
      for (const img of images) {
        if (img.image_path) {
          const imgPath = path.join(__dirname, "uploads", imageFolder, path.basename(img.image_path));
          try {
            if (fs.existsSync(imgPath)) {
              fs.unlinkSync(imgPath);
              console.log(`Deleted image: ${imgPath}`);
            }
          } catch (err) {
            console.error("Failed to delete image:", imgPath, err);
          }
        }
      }

      // Delete image records from DB
      await db.query(`DELETE FROM ${imageTable} WHERE ${imageColumn}=?`, [id]);

      // Delete the main item
      await db.query(`DELETE FROM ${table} WHERE id=?`, [id]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// CLAIM/UNCLAIM endpoint (handles both lost and found items)
router.post("/items/:id/claimed", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { claimed_by, claim_datetime } = req.body;

    let table = null;
    let itemType = null;

    const [[foundItem]] = await db.query("SELECT id, 'found' AS type FROM FOUND_ITEMS WHERE id=?", [id]);
    if (foundItem) {
      table = "FOUND_ITEMS";
      itemType = "found";
    } else {
      const [[lostItem]] = await db.query("SELECT id, 'lost' AS type FROM LOST_ITEMS WHERE id=?", [id]);
      if (lostItem) {
        table = "LOST_ITEMS";
        itemType = "lost";
      }
    }

    if (!table) return res.status(404).json({ success: false, message: "Item not found" });

    if (claimed_by === null && claim_datetime === null) {
      // Unclaim
      await db.query(
        `UPDATE ${table} 
         SET status='approved',
             claimed_by=NULL,
             claim_datetime=NULL
         WHERE id=?`,
        [id]
      );
    } else {
      // Claim
      await db.query(
        `UPDATE ${table}
         SET status='claimed',
             claimed_by=?,
             claim_datetime=?
         WHERE id=?`,
        [claimed_by, claim_datetime, id]
      );
    }

    res.json({ success: true, itemType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }

});

// Get current user info (for header display)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [[user]] = await db.query("SELECT id, name, user_name, user_type FROM USERS WHERE id=?", [userId]);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      name: user.name || "Unknown",
      user_name: user.user_name,
      user_type: user.user_type
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;