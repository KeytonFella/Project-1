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
    updateTicketStatus,
    retrieveSubmittedTicketsByType,
    retrieveTicketByID
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

function retrieveTicketByID(ticket_id){
    const params = {
        TableName: 'tickets',
        Key: {
            ticket_id: ticket_id,
        }
    };
    return docClient.get(params).promise();
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

//User views their own previous tickets filtered by type
function retrieveSubmittedTicketsByType(author, type){
    const params = {
        TableName: 'tickets',
        FilterExpression: '#a = :author AND #t = :type',
        ExpressionAttributeNames: {
            '#a': 'author',
            '#t': 'type'
        },
        ExpressionAttributeValues: {
            ':author': author,
            ':type': type
        },  
    };
    return docClient.scan(params).promise();
}

//Manager views all pending tickets
function retrieveTicketsOfStatus(status, user){
    const params = {
        TableName: 'tickets',
        FilterExpression: '#s = :status AND #a <> :author',
        ExpressionAttributeNames: {
            '#s': 'status',
            '#a': 'author'
        },
        ExpressionAttributeValues: {
            ':status': status,
            ':author': user
        },  
    };
    return docClient.scan(params).promise();
}

//Manager updates ticket status
function updateTicketStatus(ticket_id, status, resolver){
    const params = {
        TableName: 'tickets',
        Key: {
            ticket_id
        },
        UpdateExpression: 'set #s = :status, #r = :resolver',
        ConditionExpression: 'attribute_exists(ticket_id) AND #s = :pending AND #a <> :resolver',
        ExpressionAttributeNames:{
            '#a': 'author',
            '#s': 'status',
            '#r': 'resolver'
        },
        ExpressionAttributeValues:{
            ':status': status,
            ':resolver': resolver,
            ':pending': "Pending"
        }   
    }

    return docClient.update(params).promise();
}