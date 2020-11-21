// log setup
const winston = require('winston');
require('winston-daily-rotate-file');

const logFormat = winston.format.printf(function(info) {
  return `${new Date().toISOString()}-${info.level}: ${JSON.stringify(info.message, null, 4)}`;
});

const transports = {
  console: new winston.transports.Console({prettyPrint: true, colorize: true, timestamp: true, format: winston.format.combine(winston.format.colorize(), logFormat)}),
  file: new winston.transports.DailyRotateFile({
    filename: 'app-%DATE%.log',
    dirname: 'logs',
    datePattern: 'YYYY-MM-DD-HH',
    maxSize: '20m',
    maxFiles: '14d'
  })
};

const logger = winston.createLogger({
  transports: [transports.console, transports.file]
});

logger.info('Logger setup !');

exports.logger = logger;