// log setup
const winston = require('winston');
require('winston-daily-rotate-file');

const logFormat = winston.format.printf(function(info) {
  return `${new Date().toISOString()}-${info.level}: ${info.message}`;
});

function getCONSOLE(format){
  return new winston.transports.Console({prettyPrint: true, colorize: true, timestamp: true, format: winston.format.combine(winston.format.colorize(), format)});
}

function getFILE(format) {
  return new winston.transports.DailyRotateFile({
    filename: 'app-%DATE%.log',
    dirname: 'logs',
    datePattern: 'YYYY-MM-DD-HH',
    maxSize: '20m',
    maxFiles: '14d',
    format: format,
    level: 'debug'
  });
}

function createLogger(f){
  return winston.createLogger({
    transports: [getCONSOLE(f), getFILE(f)]
  });
}

exports.getCONSOLE = getCONSOLE;
exports.getFILE = getFILE;
exports.createLogger = createLogger;

exports.ModuleLogger = function(name){
  const moduleLogFormat = winston.format.printf(function(info) {
    return `${new Date().toISOString()}-${info.level}: [${name}] ${info.message}`;
  });
  return createLogger(moduleLogFormat);
}

const logger = createLogger(logFormat);

logger.info('Logger setup !');

exports.Logger = logger;
