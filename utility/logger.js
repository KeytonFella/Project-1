module.exports = {
    createLog
}

const { createLogger, transports, format} = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({timestamp, level, message}) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app.log'}),
    ]
});

function createLog(req, res, next){
    res.on("finish", function() {
      logger.info(`${req.method}, ${`${req.protocol}://${req.get('host')}${req.originalUrl}`}, ${res.statusCode}, ${res.statusMessage}`);
    });
    next();
};