import { getDnsRecord, patchDnsRecord } from "./cloudflare";
import getPublicIp from "./getPublicIp";
import * as log from "./log";

const { ZONE_ID, DOMAIN_NAME, API_KEY, INTERVAL } = process.env;

if (ZONE_ID === undefined) {
  log.error("could not access environment variable 'ZONE_ID'");
}
if (DOMAIN_NAME === undefined) {
  log.error("could not access environment variable 'DOMAIN_NAME'");
}
if (API_KEY === undefined) {
  log.error("could not access environment variable 'API_KEY'");
}
if (
  ZONE_ID === undefined || DOMAIN_NAME === undefined || API_KEY === undefined
) {
  process.exit(1);
}

const dynamicDns = async () => {
  try {
    const [publicIp, dnsRecord] = await Promise.all([
      getPublicIp(),
      getDnsRecord(ZONE_ID, DOMAIN_NAME, "A", API_KEY),
    ]);

    if (publicIp === dnsRecord.content) {
      log.info(`public ip address remained at '${publicIp}', no patch needed`);
      log.info(`checking again in ${INTERVAL} minutes\n`);
      return;
    }

    log.info(
      `public ip address changed from '${dnsRecord.content}' to '${publicIp}'`,
    );
    await patchDnsRecord(
      ZONE_ID,
      dnsRecord.id,
      API_KEY,
      publicIp,
      DOMAIN_NAME,
      "A",
    );
    log.info("patched dns entry");
    log.info(`checking again in ${INTERVAL} minutes\n`);
  } catch (error) {
    log.error((error as Error).message);
    log.info(`retrying in ${INTERVAL} minutes\n`);
  }
};

dynamicDns();
setInterval(
  dynamicDns,
  Number.parseInt(INTERVAL === undefined ? "5" : INTERVAL) * 60 * 1000,
);
