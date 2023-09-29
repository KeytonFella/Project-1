const express = require('express');
const server = express();
const PORT = 3000;
const ticketRouter = require('./routes/tickets');
const userRouter = require('./routes/users');
const bodyParser = require('body-parser');
server.use(bodyParser.json());
server.use('/tickets', ticketRouter);
server.use('/users', userRouter);

//Start server
server.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});