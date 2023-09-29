const express = require('express');
const router = express.Router();
const logger = require('../utility/logger');
const ticketService = require('../service/ticketService');
const ticketValidation = require('../utility/ticketMiddleware');
const userValidation = require('../utility/userMiddleware');

const bodyParser = require('body-parser');
router.use(bodyParser.json());

module.exports = router;

//SUBMIT NEW TICKET
router.post('', logger.createLog, ticketValidation.newTicket, userValidation.verifyUser, async (req, res) => {
    const body = req.body;
    try{
        const data = await ticketService.submitNewTicket(body.currentUser, body.description, body.type, body.amount)
        if(data.bool){
            res.status(201).send({
                message: data.message
            })
        }else{
            res.status(400).send({
                message: data.message
            })
        }
    }catch(err){
        res.status(500).send({
            message: 'An error occurred',
            error: `${err}`
        })
    }  
})

//View tickets submitted by user
router.get('', logger.createLog, userValidation.verifyUser, async (req, res) => {
    const currentUser = {username: req.body.currentUser, role: req.body.currentUserRole};   
    try{
        const data = await ticketService.getTickets(currentUser, req.query)
        if(data.bool){
            res.send(data.tickets.Items)
        }else{
            res.status(403).send({
                message: data.message
            })
        }
    }catch(err){
        res.status(500).send({
            message: 'An error occurred',
            error: `${err}`
        })
    }
})

router.put('/:ticket_id', logger.createLog, userValidation.isAdmin, ticketValidation.updateTicketStatus, userValidation.verifyUser,  async (req, res) => {       
    try{
        const data = await ticketService.updateTicketStatus(req.params.ticket_id, req.body.status, req.body.currentUser)
        if(data.bool){
            res.send({
                message: data.message,
                ticket: data.ticket
            })
        }else{
            res.status(400).send({
                message: `The ticket could not be updated. Please ensure the ticket id is valid, the current ticket status is pending, and you are not the author of the ticket`,
                // error: `${data.message}`
            })
        }
    }catch(err){
        res.status(500).send({
            message: 'An error occurred',
            error: `${err}`
        })
    }
})