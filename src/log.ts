const STYLES = {
  RESET: "\x1b[0m",
  DEBUG: "\x1b[37m",
  INFO: "\x1b[34m",
  WARN: "\x1b[33m",
  ERROR: "\x1b[31m",
};

let LOG_LEVEL = process.env.LOG_LEVEL || "INFO";

if (!["DEBUG", "INFO", "WARN", "ERROR"].includes(LOG_LEVEL)) {
  console.warn(
    `${STYLES.WARN}[WARN]\tunknown log level '${LOG_LEVEL}', proceeding with log level 'INFO'${STYLES.RESET}`,
  );
  LOG_LEVEL = "INFO";
}

const debug = (...data: string[]) => {
  if (!["DEBUG"].includes(LOG_LEVEL)) {
    return;
  }
  const message = `${STYLES.DEBUG}[DEBUG]\t${data.join(" ")}${STYLES.RESET}`;
  console.debug(message);
};

const info = (...data: string[]) => {
  if (!["DEBUG", "INFO"].includes(LOG_LEVEL)) {
    return;
  }
  const message = `${STYLES.INFO}[INFO]\t${data.join(" ")}${STYLES.RESET}`;
  console.info(message);
};

const warn = (...data: string[]) => {
  if (!["DEBUG", "INFO", "WARN"].includes(LOG_LEVEL)) {
    return;
  }
  const message = `${STYLES.WARN}[WARN]\t${data.join(" ")}${STYLES.RESET}`;
  console.warn(message);
};

const error = (...data: string[]) => {
  if (!["DEBUG", "INFO", "WARN", "ERROR"].includes(LOG_LEVEL)) {
    return;
  }
  const message = `${STYLES.ERROR}[ERROR]\t${data.join(" ")}${STYLES.RESET}`;
  console.error(message);
};

export { debug, error, info, warn };
