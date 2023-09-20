const AWS = require('aws-sdk');

// set  you aws region
AWS.config.update({
    region: 'us-east-2'
});

// create a dynamoDB client
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
    submitNewTicket,
    retrieveSubmittedTickets,
    retrieveTicketsOfStatus,
    updateTicketStatus
}
//Submit a ticket
/** A ticket should be a JSON that includes ticket id, author, description, type, and amount
 * the ticket id should auto increment and have a default status of Pending 
 * (which the manager will change to Approved/Denied)
 * Function: check JSON for valid ticket, add ticket to DB
 * Return: ?? */

function submitNewTicket(ticket_id, author, description, type, amount, status){
    const params = {
        TableName: "tickets",
        Item: {
            ticket_id,
            author,
            description,
            type,
            amount,
            status
        }
    };
    return docClient.put(params).promise();
}



//User views their own previous tickets
/**A user should be able to see their request submission history including tickets that 
 * are still pending and tickets that have been processed*/
function retrieveSubmittedTickets(author){
    const params = {
        TableName: 'tickets',
        FilterExpression: '#a = :author',
        ExpressionAttributeNames: {
            '#a': 'author'
        },
        ExpressionAttributeValues: {
            ':author': author
        },  
    };
    return docClient.scan(params).promise();
}

//Manager views all pending tickets
function retrieveTicketsOfStatus(status){
    const params = {
        TableName: 'tickets',
        FilterExpression: '#s = :status',
        ExpressionAttributeNames: {
            '#s': 'status'
        },
        ExpressionAttributeValues: {
            ':status': status
        },  
    };
    return docClient.scan(params).promise();
}

//Manager updates ticket status
function updateTicketStatus(ticket_id, status){
    const params = {
        TableName: 'tickets',
        Key: {
            ticket_id
        },
        UpdateExpression: 'set #s = :status',
        ExpressionAttributeNames:{
            '#s': 'status'
        },
        ExpressionAttributeValues:{
            ':status': status
        },
        ConditionExpression: 'attribute_exists(ticket_id)'
    }

    return docClient.update(params).promise();
}