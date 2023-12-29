const winston = require("winston");
const path = require("path");
require("winston-daily-rotate-file");

const { combine, timestamp, json } = winston.format;

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, "logs", "log-file-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
});

module.exports = winston.createLogger({
  levels: winston.config.syslog.levels,
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [fileRotateTransport],
});
