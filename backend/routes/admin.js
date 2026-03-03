import express from "express";

const router = express.Router();

// Example dashboard endpoint
router.get("/dashboard", (req, res) => {
    res.json({
        message: "Admin dashboard data loaded"
    });
});

export default router;