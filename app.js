const express = require('express');
const server = express();
const PORT = 3000;
const ticketRouter = require('./routes/tickets');
const jwtUtil = require('./utility/jwt_util');
const logger = require('./utility/logger');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const userDAO = require('./repository/userDAO');


server.use(bodyParser.json());
server.use('/tickets', ticketRouter);

//validate user req body
function validateNewUser(req, res, next){
    const body = req.body;
    body.message = "Invalid request. "
    if(!body.username || !body.password){ 
        if(!req.body.username){
            req.body.message = body.message.concat("Please include a valid username. ")
        }
        if(!req.body.password){
            req.body.message = body.message.concat("Please include a valid password.")
        }
        req.body.valid = false;
        next();
    } else {
        req.body.valid = true;
        next();
    }
}

//Check username exists
function checkUsernameExists(req, res, next){
    userDAO.retrieveUsername(req.body.username)
        .then((data) => {
            if(data.Count){
                req.body.userExists = true;
                next();
            } else {
                req.body.userExists = false;
                next()
            }
        })
        .catch((err) => {
            console.error(err);
        });
}

function verifyUser(req, res, next){
    if(req.headers.authorization){
        const token = req.headers.authorization.split(' ')[1];
        jwtUtil.verifyTokenAndReturnPayload(token)
            .then((payload) => {
                req.body.username = payload.username;
                req.body.role = payload.role;
                next();
            })
            .catch((err) => {
                console.error(err);
                res.statusCode = 401;
                res.send({
                    message: "Failed to Authenticate Token"
                })
            })
    } else {
        res.statusCode = 401;
        res.send({
            message: "User requires authorization"
        })
    }
}

//REGISTER NEW USER
server.post('/register', validateNewUser, checkUsernameExists, (req, res) => {
    const body = req.body;
    if(body.valid && !body.userExists){
        userDAO.registerNewUser(uuid.v4(), body.username, body.password, "employee")
            .then((data) => {
                logger.info(`User ${body.username} has been registered`);
                res.send({
                    message: "User registered successfully"
                })
            })
            .catch((err) => {
                res.statusCode = 400;
                res.send({
                    message: "Failed to register new user"
                })
            })
        } else {
            if(body.userExists){
                res.statusCode = 400;
                res.send({
                    message: "Username already taken"
                })        
            } else {
                res.send({
                    message: `${body.message}`
                })
            }    
        }
});

//LOGIN EXISTING USER
server.post('/login', (req, res) => {
    const body = req.body;
    userDAO.retrieveUserLogin(body.username, body.password)
        .then((data) => {
            if(data.Count == 1){
                const userItem = data.Items[0];
                const token = jwtUtil.createJWT(userItem.username, userItem.user_role);
                logger.info(`User ${body.username} has logged in`);
                res.send({
                    message: "User login successful",
                    token: token
                })
            } else {
                res.send({
                    message: "Invalid username/password"
                })
            }
        })
        .catch((err) => {
            logger.error(`An error occurred when ${body.username} tried to login: \n${err}`);
            res.send({
                message: "Login failed"
            })
        })
})

server.get('/accounts', verifyUser, (req, res) => {
    const body = req.body;
    if(body.role === 'admin'){
        userDAO.retrieveEmployeeList()
        .then((data) => {
            logger.info(`User ${body.username} has viewed all accounts`);
            res.send(data.Items)
        })
        .catch((err) => {
            logger.error(`An error occurred when ${body.username} tried to view all user accounts: \n${err}`);
            res.statusCode = 400;
            res.send({
                message: `Failed to retrieve employee list`
            })
        })
    } else {
        logger.info(`UNAUTHORIZED: ${req.body.role}: ${req.body.username} attempted to view all user accounts`);
        res.statusCode = 401;
        res.send({
            message: `You must be an admin to update a user's role. You are an ${req.body.role}`
        })
    }
})

server.put('/accounts/:user_id', verifyUser, (req, res) => {
    const body = req.body;
    if(body.role === 'admin'){
        userDAO.updateUserRole(req.params.user_id, body.user_role)
        .then((data) => {
            logger.info(`User ${body.username} has updated user_id: ${req.params.user_id} role to ${body.user_role}`);
            res.send({
                message: "User role updated successfully"
            })
        })
        .catch((err) => {
            logger.error(`An error occurred when ${body.username} tried to update user_id: ${req.params.user_id} role to ${body.user_role}: \n${err}`);
            res.statusCode = 400;
            res.send({
                message: "Failed to update user role. Please ensure the user_id is valid"
            })
        })
    }else{
        logger.info(`UNAUTHORIZED: ${req.body.role}: ${req.body.username} attempted to update user_id: ${req.params.user_id} role to ${body.user_role}`);
        res.statusCode = 401;
        res.send({
            message: `You must be an admin to update a user's role. You are an ${req.body.role}`
        })

    }
})

//Start server
server.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});