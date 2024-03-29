import express from 'express';
import jwt from 'jsonwebtoken'

let Router = express.Router();

const cookieExtractor = (req) => {
    if (req && req.cookies ) {
        const token = req.cookies.refresh_token; 
        return token; 
    }  
}

// Verify if the user send an valid 
Router.get('/refresh', (req,res,next) => { 
    const token = cookieExtractor(req);
    
    jwt.verify(token, process.env.JWT_KEY_REFRESH, (err, decoded) => {
        
        if(err) {
            console.log(err);
            res.status(401).json({ success: false, message: 'Token is invalid! Log in again.' });
            return;
        }

        const jwtPayload = {
            _id: decoded._id,
            email: decoded.email
        }

        const accessToken = jwt.sign(jwtPayload, process.env.JWT_KEY, { expiresIn: 30 * 60000 }); // Expires in 30 minutes
        

        res.cookie('access_token', accessToken, {
            httpOnly: true,
          });

        res.status(200).json({ success: true, access_token: accessToken });
    });
});


// Verify if the user send an valid token
Router.get('/refresh-admin', (req,res,next) => { 
    const token = cookieExtractor(req);
    jwt.verify(token, process.env.JWT_KEY_ADMIN_REFRESH, (err, decoded) => {
        
        if(err) {
            res.status(401).json({ success: false, message: 'Token is invalid! Log in again.' });
            return;
        }

        const jwtPayload = {
            _id: decoded._id,
            email: decoded.email
        }

        const accessToken = jwt.sign(jwtPayload, process.env.JWT_KEY, { expiresIn: 30 * 60000 }); // Expires in 30 minutes
        const accessTokenAdmin = jwt.sign(jwtPayload, process.env.JWT_KEY_ADMIN, { expiresIn: 30 * 60000 }); // Expires in 30 minutes
        
        res.cookie('access_token', accessToken, {
            httpOnly: true,
          });
          
        res.cookie('access_token_admin', accessTokenAdmin, {
            httpOnly: true,
          });

        res.status(200).json({ success: true, message:'New tokens have been sent' });
    });
});


export default Router;