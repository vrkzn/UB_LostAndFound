import jwt from "jsonwebtoken";

/*
====================================================
 Authentication Middleware (FINAL STABLE VERSION)
====================================================
*/

export const authenticateToken = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        /*
        Remove "Bearer " prefix safely
        Example header:
        Authorization: Bearer token_string
        */

        const token = authHeader.replace("Bearer ", "").trim();

        if (!token) {
            return res.status(401).json({
                message: "Invalid token format"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        /*
        Attach decoded user data
        Example payload:
        {
          id,
          email,
          user_type
        }
        */

        req.user = decoded;

        next();

    } catch (error) {

        console.error("Auth Middleware Error:", error.message);

        return res.status(401).json({
            message: "Authentication failed"
        });
    }
};

/*
Export default (optional but safe for ES module compatibility)
*/
export default authenticateToken;