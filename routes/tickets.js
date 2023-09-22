const express = require('express');
const router = express.Router();
const jwtUtil = require('../utility/jwt_util');
const logger = require('../utility/logger');
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
                logger.error(`An error occurred when authenticating token: \n${err}`);
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
            logger.info(`${body.username} has submitted a new ticket for "${body.description}"`);
            res.send({
                message: "Ticket submitted successfully"
            })
        })
        .catch((err) => {
            logger.error(`An error occurred when ${req.body.username} tried to submit a new ticket: \n${err}`);
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
    const type = req.query.type;
    if(req.query.author === 'default'){
        if(author && !type){
            ticketDAO.retrieveSubmittedTickets(author)
            .then((data) => {
                logger.info(`${author} viewed all of their tickets`);
                res.send(data.Items)
            })
            .catch((err) => {
                logger.error(`An error occurred when ${author} tried to view all their tickets: \n${err}`);
                res.statusCode = 400;
                res.send({
                    message: `Failed to retrieve tickets from user ${author}`
                })
            })
        } 
        if(author && type){
            ticketDAO.retrieveSubmittedTicketsByType(author, type)
            .then((data) => {
                logger.info(`${author} viewed all of their tickets for ${type}`);
                res.send(data.Items)
            })
            .catch((err) => {
                logger.error(`An error occurred when ${req.body.username} tried to view all their ${type} tickets: \n${err}`);
                res.statusCode = 400;
                res.send({
                    message: `Failed to retrieve tickets from user ${author}, of type ${type}`
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
                logger.info(`${req.body.username} viewed all ${status} tickets`);
                res.send(data.Items)
            })
            .catch((err) => {
                logger.error(`An error occurred when ${req.body.username} tried to view all ${status} tickets: \n${err}`);
                res.statusCode = 400;
                res.send({
                    message: `Failed to retrieve tickets with status: ${status}`
                })
            })
        } else {
            next();
        }
    } else {
        logger.info(`UNAUTHORIZED: ${req.body.role}: ${req.body.username} attempted to view all tickets`);
        res.statusCode = 401;
        res.send({
            message: `You must be an admin to view all ${status} tickets. You are an ${req.body.role}`
        })
    }
})

router.put('/:ticket_id', verifyUser, (req, res) => {
    if(req.body.role === 'admin'){
        ticketDAO.updateTicketStatus(req.params.ticket_id, req.body.status, req.body.username)
        .then((data) => {
            logger.info(`${req.body.username} has ${req.body.status} ticket id: ${req.params.ticket_id}`);
            res.send({
                message: "Ticket status updated successfully"
            })
        })
        .catch((err) => {
            logger.error(`An error occurred when ${req.body.username} tried to set the status of ticket id: ${req.params.ticket_id} to ${req.body.status} \n${err}`);
            res.statusCode = 400;
            res.send({
                message: "Failed to update ticket. Please ensure the ticket id is valid and the ticket is pending"
            })
        })
    }else{
        logger.info(`UNAUTHORIZED: ${req.body.role}: ${req.body.username} attempted to change a ticket's status`);
        res.statusCode = 401;
        res.send({
            message: `You must be an admin to update a ticket. You are an ${req.body.role}`
        })
    }
})