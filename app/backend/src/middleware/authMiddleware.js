import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route',
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            // Add user id to request
            req.userId = decoded.id;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed',
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication',
        });
    }
};

export default protect;
