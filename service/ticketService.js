const ticketDAO = require('../repository/ticketDAO');
const jwtUtil = require('../utility/jwt_util');
const uuid = require('uuid');

module.exports = {
    submitNewTicket,
    getTickets,
    updateTicketStatus
}

async function submitNewTicket(author, description, type, amount){
    try{
        const data = await ticketDAO.submitNewTicket(uuid.v4(), author, description, type, amount, "Pending");
        return {bool: true, message: "Ticket submitted successfully"};
    }catch(err){
        return {bool: false, message: `${err}`};
    }
}

async function getTickets(currentUser, queryObject){
    const user = currentUser.username;
    const role = currentUser.role;

    try{
        if(queryObject.type){
            const data = await ticketDAO.retrieveSubmittedTicketsByType(user, queryObject.type)
            return {bool: true, tickets: data};
        }
        else if(queryObject.status){
            if(role === 'admin' && queryObject.status === "Pending"){
                const data = await ticketDAO.retrieveTicketsOfStatus(queryObject.status)
                return {bool: true, tickets: data};
            } else {
                return {bool: false, message: "You do not have the required permissions to make this request"};
            }
        } else {
            const data = await ticketDAO.retrieveSubmittedTickets(user)
            return {bool: true, tickets: data};
        }
    } catch(err) {
        return {bool: false, message: `${err}`};
    }
}

async function updateTicketStatus(ticket_id, status, resolver){
    try{
        const data = await ticketDAO.updateTicketStatus(ticket_id, status, resolver)
        return {bool: true, message: "Ticket updated successfully"}
    } catch(err) {
        return {bool: false, message: `${err}`};
    }
}