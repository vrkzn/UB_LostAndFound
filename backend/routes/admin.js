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
    f.date_found,
    f.time_found,
    f.claim_to,
    f.status,
    f.created_at,
    'found' AS item_type,

    CASE
      WHEN f.isAnonymous = 1 THEN 'Anonymous'
      ELSE u.name
    END AS reporter_name,

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
    l.date_lost AS date_found,
    l.time_lost AS time_found,
    l.claim_to,
    l.status,
    l.created_at,
    'lost' AS item_type,

    CASE
      WHEN l.isAnonymous = 1 THEN 'Anonymous'
      ELSE u.name
    END AS reporter_name,

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

    res.json({
      stats: {
        totalLost: lostStats.total,
        totalFound: foundStats.total,
        totalUnclaimed: unclaimedStats.total
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
    =====================================
    Determine Item Table
    =====================================
    */

    let table = "FOUND_ITEMS";

    const [[found]] = await db.query(
      "SELECT id FROM FOUND_ITEMS WHERE id=?",
      [id]
    );

    if (!found) {
      const [[lost]] = await db.query(
        "SELECT id FROM LOST_ITEMS WHERE id=?",
        [id]
      );

      if (lost) table = "LOST_ITEMS";
      else return res.status(404).json({ message: "Item not found" });
    }

    /*
    =====================================
    GET STATUS
    =====================================
    */

    const [[item]] = await db.query(
      `SELECT status FROM ${table} WHERE id=?`,
      [id]
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    /*
    =====================================
    ACTION HANDLER
    =====================================
    */

    if (action === "verify") {

      const newStatus =
        item.status === "approved" ? "pending" : "approved";

      await db.query(
        `UPDATE ${table} SET status=? WHERE id=?`,
        [newStatus, id]
      );
    }

    else if (action === "claimed") {

      const newStatus =
        item.status === "claimed"
          ? "approved"
          : "claimed";

      await db.query(
        `UPDATE ${table} SET status=? WHERE id=?`,
        [newStatus, id]
      );
    }

    else if (action === "delete") {

      await db.query(
        `DELETE FROM ${table} WHERE id=?`,
        [id]
      );
    }

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});
export default router;