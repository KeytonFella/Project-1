const AWS = require('aws-sdk');

// set  you aws region
AWS.config.update({
    region: 'us-east-2'
});

// create a dynamoDB client
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
    registerNewUser,
    retrieveUserLogin,
    retrieveUsername
}

//Retrieve username
function retrieveUsername(username){
    const params = {
        TableName: 'users',
        FilterExpression: '#u = :username',
        ExpressionAttributeNames: {
            '#u': 'username'
        },
        ExpressionAttributeValues: {
            ':username': username
        },  
    };
    return docClient.scan(params).promise();
}

//Register new user
/** A user should be able to create a new account using a JSON that contains their username and password
 * as long as the username & password are not blank and the user does not already exist 
 * Function: check JSON for valid username & password, check DB for existing user, add user to DB if requirements are met
 * Return: ?? */
function registerNewUser(user_id, username, password, role){
    const params = {
        TableName: "users",
        Item: {
            user_id,
            username,
            password,
            role
        }
    };
    return docClient.put(params).promise();
}

//Login an existing user
/** A user should be able to login using a JSON that contains their username and password 
 * Function: check DB to see if username and password match a user
 * Return: ?? */

function retrieveUserLogin(username, password){
    const params = {
        TableName: 'users',
        FilterExpression: '#u = :username AND #p = :password',
        ExpressionAttributeNames: {
            '#u': 'username',
            '#p': 'password'
        },
        ExpressionAttributeValues: {
            ':username': username,
            ':password': password
        },    
    };
    return docClient.scan(params).promise();
}

