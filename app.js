const express = require('express');
const server = express();
const PORT = 3000;
const ticketRouter = require('./routes/tickets');

const uuid = require('uuid');
const bodyParser = require('body-parser');
const userDAO = require('./repository/userDAO');

server.use(bodyParser.json());
server.use('/tickets', ticketRouter);

//validate user req body
function validateNewUser(req, res, next){
    if(!req.body.username || !req.body.password){
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

//REGISTER NEW USER
server.post('/register', validateNewUser, checkUsernameExists, (req, res) => {
    const body = req.body;
    if(body.valid && !body.userExists){
        userDAO.registerNewUser(uuid.v4(), body.username, body.password, false)
            .then((data) => {
                res.send({
                    message: "User registered successfully"
                })
            })
            .catch((err) => {
                res.send({
                    message: "Failed to register new user"
                })
            })
        } else {
            if(body.userExists){
                res.send({
                    message: "Username already taken"
                })        
            } else {
                res.send({
                    message: "Invalid user properties"
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
                res.send({
                    message: "User login successful"
                })
            } else {
                res.send({
                    message: "Invalid username/password"
                })
            }
        })
        .catch((err) => {
            res.send({
                message: "Login failed"
            })
        })
})

//Start server
server.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});

