import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import db from "../db.js";

const router = express.Router();

router.get("/dashboard", authenticateToken, async (req, res) => {
  try {

    /*
    =====================================================
    STATS
    =====================================================
    */

    const [lostStats] = await db.query(
      "SELECT COUNT(*) AS total FROM LOST_ITEMS"
    );

    const [foundStats] = await db.query(
      "SELECT COUNT(*) AS total FROM FOUND_ITEMS"
    );

    const [unclaimedStats] = await db.query(`
      SELECT COUNT(*) AS total FROM (
        SELECT id FROM LOST_ITEMS WHERE status != 'claimed'
        UNION ALL
        SELECT id FROM FOUND_ITEMS WHERE status != 'claimed'
      ) AS temp
    `);

    /*
    =====================================================
    FETCH ITEMS (SIMPLE AND FAST ⭐)
    =====================================================
    */

    const [foundItems] = await db.query(`
      SELECT
        id,
        item_name,
        status,
        created_at,
        CONCAT('/uploads/found_items/', image_path) AS image_path,
        'found' AS item_type
      FROM FOUND_ITEMS
      ORDER BY created_at DESC
    `);

    const [lostItems] = await db.query(`
      SELECT
        id,
        item_name,
        status,
        created_at,
        CONCAT('/uploads/lost_items/', image_path) AS image_path,
        'lost' AS item_type
      FROM LOST_ITEMS
      ORDER BY created_at DESC
    `);

    res.json({
      stats: {
        totalLost: lostStats[0].total,
        totalFound: foundStats[0].total,
        totalUnclaimed: unclaimedStats[0].total
      },
      items: [...foundItems, ...lostItems]
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
router.post("/admin/items/:id/:action", authenticateToken, async (req, res) => {
    try {
        const { id, action } = req.params;

        if (action === "verify") {
            // Update found item status to approved
            await db.query(
                `UPDATE FOUND_ITEMS SET status='approved' WHERE id=?`,
                [id]
            );

        } else if (action === "claimed") {
            // Update found item status to claimed
            await db.query(
                `UPDATE FOUND_ITEMS SET status='claimed' WHERE id=?`,
                [id]
            );

        } else if (action === "delete") {
            // Delete the item from the database (found items)
            await db.query(
                `DELETE FROM FOUND_ITEMS WHERE id=?`,
                [id]
            );
        }

        res.json({
            message: "Action completed successfully"
        });

    } catch (error) {

        console.error("Admin Action Error:", error);

        res.status(500).json({
            message: "Action processing failed"
        });
    }
});

export default router;