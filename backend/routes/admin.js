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
    FETCH FOUND ITEMS
    =====================================================
    */

    const [foundItems] = await db.query(`
SELECT
  f.id,
  f.item_name,
  f.status,
  f.created_at,
  (
    SELECT image_path
    FROM FOUND_ITEM_IMAGES
    WHERE found_item_id = f.id
    LIMIT 1
  ) AS image_path,
  'found' AS item_type
FROM FOUND_ITEMS f
ORDER BY f.created_at DESC
    `);

    /*
    =====================================================
    FETCH LOST ITEMS
    =====================================================
    */

    const [lostItems] = await db.query(`
SELECT
  l.id,
  l.item_name,
  l.status,
  l.created_at,
  (
    SELECT image_path
    FROM LOST_ITEM_IMAGES
    WHERE lost_item_id = l.id
    LIMIT 1
  ) AS image_path,
  'lost' AS item_type
FROM LOST_ITEMS l
ORDER BY l.created_at DESC
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

router.post("/items/:id/:action", authenticateToken, async (req, res) => {
  try {

    const { id, action } = req.params;

    /*
    =========================================
    VERIFY TOGGLE
    =========================================
    */

    if (action === "verify") {

      const [[item]] = await db.query(
        "SELECT status FROM FOUND_ITEMS WHERE id=?",
        [id]
      );

      const newStatus =
        item.status === "approved" ? "pending" : "approved";

      await db.query(
        "UPDATE FOUND_ITEMS SET status=? WHERE id=?",
        [newStatus, id]
      );
    }

    /*
    =========================================
    CLAIM TOGGLE
    =========================================
    */

    else if (action === "claimed") {

      const [[item]] = await db.query(
        "SELECT status FROM FOUND_ITEMS WHERE id=?",
        [id]
      );

      const newStatus =
        item.status === "claimed"
          ? "approved"   // or pending depending on your workflow
          : "claimed";

      await db.query(
        "UPDATE FOUND_ITEMS SET status=? WHERE id=?",
        [newStatus, id]
      );
    }

    /*
    =========================================
    DELETE
    =========================================
    */

    else if (action === "delete") {

      await db.query(
        "DELETE FROM FOUND_ITEMS WHERE id=?",
        [id]
      );
    }

    res.json({
      success: true
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});
export default router;