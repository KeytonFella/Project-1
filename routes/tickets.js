const express = require('express');
const router = express.Router();

const ticketDAO = require('../repository/ticketDAO');
const uuid = require('uuid');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

module.exports = router;

function validateNewTicket(req, res, next){
    const body = req.body;
    if(!body.author || !body.description || !body.type || !body.amount){
        body.valid = false;
        next();
    } else {
        body.valid = true;
        next();
    }
}

//SUBMIT NEW TICKET
router.post('', validateNewTicket, (req, res) => {
    const body = req.body;
    if(body.valid){
        ticketDAO.submitNewTicket(uuid.v4(), body.author, body.description, body.type, body.amount, "Pending")
        .then((data) => {
            res.send({
                message: "Ticket submitted successfully"
            })
        })
        .catch((err) => {
            console.error(err);
            res.send({
                message: "Failed to submit ticket"
            })
        })
    } else {
        res.send({
            message: "Invalid ticket properties"
        })
    } 
})

//View tickets submitted by user
router.get('', (req, res, next) => {
    const author = req.query.author;   
    if(author){
        ticketDAO.retrieveSubmittedTickets(author)
        .then((data) => {
            res.send(data.Items)
        })
        .catch((err) => {
            console.error(err);
            res.send({
                message: `Failed to retrieve tickets from user ${author}`
            })
        })
    } else {
        next();
    }
})

//Retrieve all tickets with status = ?
//NEED TO ADD CHECK FOR ADMIN
router.get('', (req, res, next) => {
    const status = req.query.status;   
    if(status){
        ticketDAO.retrieveTicketsOfStatus(status)
        .then((data) => {
            res.send(data.Items)
        })
        .catch((err) => {
            console.error(err);
            res.send({
                message: `Failed to retrieve tickets with status: ${status}`
            })
        })
    } else {
        next();
    }
})

router.put('/:ticket_id', (req, res) => {
    ticketDAO.updateTicketStatus(req.params.ticket_id, req.body.status)
    .then((data) => {
        res.send({
            message: "Ticket status updated successfully"
        })
    })
    .catch((err) => {
        console.error(err);
        res.send({
            message: "Failed to update ticket"
        })
    })
})