import path from 'path'
import winston from 'winston'
import fs from 'fs'

// Simplified logger for production-ready mode
// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

const { combine, timestamp, errors, splat, json, colorize, printf } = winston.format

const logFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  json()
)

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  printf(({ timestamp: logTimestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `${logTimestamp} [${level}]: ${message}${metaString}`
  })
)

const transports: winston.transport[] = [
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    format: logFormat,
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    format: logFormat,
  }),
  new winston.transports.Console({
    format: consoleFormat,
  })
]

export const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'ajo-backend',
    env: process.env.NODE_ENV || 'development',
    pid: process.pid,
  },
  transports,
  exitOnError: false,
})

export const createModuleLogger = (
  moduleName: string,
  defaultMeta: Record<string, unknown> = {}
) => {
  return logger.child({
    module: moduleName,
    ...defaultMeta,
  })
}
