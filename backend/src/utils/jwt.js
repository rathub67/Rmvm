import jwt from 'jsonwebtoken';

function generateToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
}

function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

export { generateToken, verifyToken };
