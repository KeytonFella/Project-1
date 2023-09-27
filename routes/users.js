const express = require('express');
const router = express.Router();
const logger = require('../utility/logger');
const userService = require('../service/userService');
const userValidation = require('../utility/userMiddleware');
const bodyParser = require('body-parser');
router.use(bodyParser.json());

module.exports = router;

//REGISTER NEW USER
router.post('/register', logger.createLog, userValidation.userProperties, async (req, res)  => {
    const body = req.body;
        try{
            const data = await userService.registerUser(body.username, body.password);
            if(data.bool){
                res.status(200).send({
                    message: data.message
                })
            }else{
                res.status(400).send({
                    message: data.message
                })
            }
        }catch(err){
            res.status(400).send({
                message: 'An error occurred',
                error: `${err}`
            })
        }
});

//LOGIN EXISTING USER
router.post('/login', logger.createLog, userValidation.userProperties, async (req, res) => {
    const body = req.body;
    try{
        const data = await userService.login(body.username, body.password);
        if(data.bool){
            res.status(200).send({
                message: data.message,
                token: data.token
            })
        }else{
            res.status(400).send({
                message: data.message
            })
        }
    }catch(err){
        res.status(400).send({
            message: 'An error occurred',
            error: `${err}`
        })
    }
});

router.get('/accounts', logger.createLog, userValidation.isAdmin, async (req, res) => { 
    try{
        const data = await userService.retrieveEmployeeList();
        if(data.bool){
            res.status(200).send(data.employeeList.Items);
        }else{
            res.status(400).send({
                message: data.message
            });
        }       
    }catch(err){
        res.status(400).send({
            message: 'An error occurred',
            error: `${err}`
        });
    }

});

router.put('/accounts/:user_id', logger.createLog, userValidation.isAdmin, async (req, res) => {
    const body = req.body;

    try{
        const data = await userService.updateUserRole(req.params.user_id, body.user_role);
        if(data.bool){
            res.send({
                message: data.message
            })
        }else{
            res.status(400).send({
                message: data.message,
                error: data.error
            })
        }
    }catch(err){
        logger.error(`An error occurred when trying to update user_id: ${req.params.user_id} role to ${body.user_role}: \n${err}`);
        res.status(400).send({
            message: 'An error occurred',
            error: `${err}`
        });
    }
});