import pino from "pino";

const errorLogger = pino(
  {
    level: "warn",
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  //   pino.destination({
  //     dest: "./log/logs.log",
  //     sync: false,
  //   }),
);

const infoLogger = pino({
  level: "info",
  timestamp: pino.stdTimeFunctions.isoTime,
});

export { errorLogger, infoLogger };
