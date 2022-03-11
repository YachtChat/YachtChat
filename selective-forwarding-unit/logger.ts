import winston, {format} from 'winston';

export const logger = winston.createLogger({
  level: 'debug',
  format: format.combine(format.timestamp(), format.json()),
});

// If we're not in production then log to the console
if(!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}