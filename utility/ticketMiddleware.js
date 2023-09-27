const jwtUtil = require('../utility/jwt_util');

module.exports = {
    newTicket,
    updateTicketStatus
}

function newTicket(req, res, next){
    const body = req.body;
    let message = "Please resolve the following issues to submit a ticket: "
    if(!body.description || !body.type || !body.amount){
        if(!body.description){   
            message = message.concat("The request must include a description. ");
        }
        if(!body.type){
            message = message.concat("The request must include a type. ");
        }
        if(!body.amount){
            message = message.concat("The request must include an amount.");
        }
        res.status(400).send({
            message: `${message}`
        })
    } else {
        next();
    }
}

function updateTicketStatus(req, res, next){
    const body = req.body;
    if(body.status === 'Denied' || body.status === 'Approved'){
        next();
    }else{
        res.status(400).send({
            message: "Ticket status can only be updated to 'Denied' or 'Approved'"
        })
    }
}
