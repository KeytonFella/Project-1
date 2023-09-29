const jwtUtil = require('../utility/jwt_util');

module.exports = {
    userProperties,
    verifyUser,
    isAdmin,
    containsUserRole
}

function userProperties(req, res, next){
    const body = req.body;
    let message = "Invalid request. "
    if(!body.username || !body.password){ 
        if(!body.username){
            message = message.concat("Please include a valid username. ")
        }
        if(!body.password){
            message = message.concat("Please include a valid password.")
        }
        res.statusCode = 400;
        res.send({
            message: `${message}`
        })
    }else{
        next();
    }
}

function containsUserRole(req, res, next){
    const user_role = req.body.user_role;
    if(user_role){
        if(user_role === "admin" || user_role === "employee"){
            next();
        }else{
            res.status(400).send({
                message: "The user role must be either 'admin' or 'employee'"
            })
        }        
    }else{
        res.status(400).send({
            message: "Please include a user role in your request"
        })
    }
}

function verifyUser(req, res, next){
    if(req.headers.authorization){
        const token = req.headers.authorization.split(' ')[1];
        jwtUtil.verifyTokenAndReturnPayload(token)
            .then((payload) => {
                req.body.currentUser = payload.username;
                req.body.currentUserRole = payload.role;
                next();
            })
            .catch((err) => {
                logger.error(`An error occurred when authenticating token: \n${err}`);
                res.statusCode = 401;
                res.send({
                    message: "Failed to Authenticate Token"
                })
            })
    }else{
        res.statusCode = 401;
        res.send({
            message: "User requires authorization. Please log in"
        })
    }
}

function isAdmin(req, res, next){
    if(req.headers.authorization){
        const token = req.headers.authorization.split(' ')[1];
        jwtUtil.verifyTokenAndReturnPayload(token)
            .then((payload) => {
                if(payload.role === 'admin'){
                    next();
                }else{
                    res.status(403).send({
                        message: "You do not have the required permissions to make this request"
                    })
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(401).send({
                    message: "Failed to Authenticate Token"
                })
            })
    }else{
        res.status(401).send({
            message: "User requires authorization"
        })
    }
}