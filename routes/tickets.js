const express = require('express');
const router = express.Router();
const jwtUtil = require('../utility/jwt_util');
const ticketDAO = require('../repository/ticketDAO');
const uuid = require('uuid');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

module.exports = router;

function validateNewTicket(req, res, next){
    const body = req.body;
    body.message = "Please resolve the following issues to submit a ticket: "
    if(!body.description || !body.type || !body.amount){
        if(!body.description){   
            body.message = body.message.concat("The request must include a description. ");
        }
        if(!body.type){
            body.message = body.message.concat("The request must include a type. ");
        }
        if(!body.amount){
            body.message = body.message.concat("The request must include an amount.");
        }
        body.valid = false;
        next(); 
    } else {
        body.valid = true;
        next();
    }
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

//SUBMIT NEW TICKET
router.post('', validateNewTicket, verifyUser, (req, res) => {
    const body = req.body;
    if(body.valid){
        ticketDAO.submitNewTicket(uuid.v4(), body.username, body.description, body.type, body.amount, "Pending")
        .then((data) => {
            res.send({
                message: "Ticket submitted successfully"
            })
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 400;
            res.send({
                message: "Failed to submit ticket"
            })
        })
    } else {
        res.statusCode = 400;
        res.send({
            message: `${body.message}`
        })
    } 
})

//View tickets submitted by user
router.get('', verifyUser, (req, res, next) => {
    const author = req.body.username;   
    if(req.query.author === 'default'){
        if(author){
            ticketDAO.retrieveSubmittedTickets(author)
            .then((data) => {
                res.send(data.Items)
            })
            .catch((err) => {
                console.error(err);
                res.statusCode = 400;
                res.send({
                    message: `Failed to retrieve tickets from user ${author}`
                })
            })
        } 
    }  else {
        next();
    } 
})

//Retrieve all tickets with status = ?
//NEED TO ADD CHECK FOR ADMIN
router.get('', verifyUser, (req, res, next) => {
    const status = req.query.status;
    if(req.body.role === 'admin'){
        if(status){
            ticketDAO.retrieveTicketsOfStatus(status)
            .then((data) => {
                res.send(data.Items)
            })
            .catch((err) => {
                console.error(err);
                res.statusCode = 400;
                res.send({
                    message: `Failed to retrieve tickets with status: ${status}`
                })
            })
        } else {
            next();
        }
    } else {
        res.statusCode = 401;
        res.send({
            message: `You are not an admin, you are an ${req.body.role}`
        })
    }
})

router.put('/:ticket_id', verifyUser, (req, res) => {
    if(req.body.role === 'admin'){
        ticketDAO.updateTicketStatus(req.params.ticket_id, req.body.status)
        .then((data) => {
            res.send({
                message: "Ticket status updated successfully"
            })
        })
        .catch((err) => {
            console.error(err);
            res.statusCode = 400;
            res.send({
                message: "Failed to update ticket"
            })
        })
    }else{
        res.statusCode = 401;
        res.send({
            message: `You are not an admin, you are an ${req.body.role}`
        })
    }
})