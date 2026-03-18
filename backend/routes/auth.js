import express from "express";
import bcrypt from "bcrypt";
import db from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();


/* ===============================
   SIGNUP ENDPOINT
=============================== */

router.post("/signup", async (req, res) => {
    try {
        const { fullname, username, email, password } = req.body;

        /* Validation */
        if (!fullname || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        /* Check duplicate email */
        const [existingUser] = await db.query(
            "SELECT * FROM USERS WHERE user_email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered."
            });
        }

        /* Hash password */
        const hashedPassword = await bcrypt.hash(password, 10);

        /* Insert user */
        await db.query(
            `INSERT INTO USERS 
            (name, user_name, user_email, user_type, user_password)
            VALUES (?, ?, ?, ?, ?)`,
            [fullname, username, email, "student", hashedPassword]
        );

        return res.status(201).json({
            success: true,
            message: "Account created successfully."
        });

    } catch (error) {
        console.error("Signup Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during signup."
        });
    }
});

/* ===============================
   LOGIN ENDPOINT
=============================== */

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        /* Validation */
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        /* Check if user exists */
        const [rows] = await db.query(
            "SELECT * FROM USERS WHERE user_email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = rows[0];

        /* Compare password */
        const isMatch = await bcrypt.compare(password, user.user_password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        /* Generate JWT Token */
        const token = jwt.sign(
        {
            id: user.id,           // ⭐ CRITICAL
            email: user.user_email,
            user_type: user.user_type
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.user_email,
                user_type: user.user_type
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login."
        });
    }
});


export default router;