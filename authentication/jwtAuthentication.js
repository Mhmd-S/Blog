import jwt from 'jsonwebtoken';

// Not passport. But is used to to verify the user
// If adming is true then get the access_token_admin otherwise get the normal access_token
const cookieExtractor = (req, admin) => {
    if (req && req.cookies ) {
        const token = admin ? req.cookies.access_token_admin : req.cookies.access_token;
        return token; 
    }  
}

// Middleware for authenticating user
const verifyJWT = (req,res,next) => {
    const accessToken = cookieExtractor(req, false)
    jwt.verify(accessToken, process.env.JWT_KEY,(err, decoded) => {
        if (err) {
            console.log(accessToken)
            res.status(401).json({success: false, message: 'Toking invalid!'});
            return;
        }
        req.userId = decoded._id;
        next();
    });
}

// Middleware for authenticating admins
// Whenever the admins are sending a request a protected route they need to sned their admin cookie as the access_token
const verifyAdminJWT = (req,res,next) => { 
    const accessToken = cookieExtractor(req, true);
    jwt.verify(accessToken, process.env.JWT_KEY_ADMIN, (err, decoded) => {
        if (err) {
            res.status(401).json({ success: false, message: 'Toking invalid!' });
            return;
        }
        req.userId = decoded._id;
        next();
    });
}

export {verifyJWT, verifyAdminJWT};