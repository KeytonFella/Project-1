const userDAO = require('../repository/userDAO');
const jwtUtil = require('../utility/jwt_util');
const uuid = require('uuid');

module.exports = {
    registerUser,
    login,
    retrieveEmployeeList,
    updateUserRole
}

async function registerUser(username, password){   
    try{
        const data = await userDAO.retrieveUsername(username);
        if(data.Count === 0){
            try{
                const data = await userDAO.registerNewUser(uuid.v4(), username, password, "employee");
                return {bool: true, message: "Registration Successful"};
            }catch(err){
                return {bool: false, message: `An Error Occurred: \n ${err}`};
            }
        }else{
            return {bool: false, message: "Username Already Taken"};
        }
    }catch(err){
        return {bool: false, message: `An Error Occurred: \n ${err}`};
    }
}

async function login(username, password){
    try{
        const data = await userDAO.retrieveUserLogin(username, password)
        if(data.Count === 1){
            const userItem = data.Items[0];
            const token = jwtUtil.createJWT(userItem.username, userItem.user_role);
            return {bool: true, message: "Login successful", token: token};
        }else{
            return {bool: false, message: "Invalid username/password"}
        }
    }catch(err){
        return {bool: false, message: `An Error Occurred: \n ${err}`};
    }
}

async function retrieveEmployeeList(){
    try{
        const data = await userDAO.retrieveEmployeeList();
        return {bool: true, employeeList: data};
    }catch(err){
        return {bool: false, message: `An Error Occurred: \n ${err}`};
    }
}

async function updateUserRole(user_id, user_role){
    try{
        const data = await userDAO.updateUserRole(user_id, user_role);
        return {bool: true, message: "User role updated successfully"};
    }catch(err){
        return {bool: false, message: "Unable to update user role.", error: `${err}`};
    }
}