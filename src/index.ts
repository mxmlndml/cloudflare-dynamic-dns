import { getDnsRecords, patchDnsRecords } from "./cloudflare";
import getPublicIp from "./getPublicIp";
import * as log from "./log";

const { ZONE_ID, DOMAIN_NAMES, API_KEY, INTERVAL } = process.env;

if (ZONE_ID === undefined) {
  log.error("could not access environment variable 'ZONE_ID'");
}
if (DOMAIN_NAMES === undefined) {
  log.error("could not access environment variable 'DOMAIN_NAMES'");
}
if (API_KEY === undefined) {
  log.error("could not access environment variable 'API_KEY'");
}
if (
  ZONE_ID === undefined || DOMAIN_NAMES === undefined || API_KEY === undefined
) {
  process.exit(1);
}

const dynamicDns = async () => {
  const domainNames = DOMAIN_NAMES.split(",");
  try {
    const [publicIp, dnsRecords] = await Promise.all([
      getPublicIp(),
      getDnsRecords(ZONE_ID, domainNames, "A", API_KEY),
    ]);

    const dnsRecordsToPatch = dnsRecords.filter((dnsRecord) => {
      dnsRecord.content !== publicIp;
    });

    if (dnsRecordsToPatch.length === 0) {
      log.info(`public ip address remained at '${publicIp}', no patch needed`);
      log.info(`checking again in ${INTERVAL} minutes\n`);
      return;
    }

    log.info(
      `public ip address changed from '${
        dnsRecordsToPatch[0].content
      }' to '${publicIp}'`,
    );
    await patchDnsRecords(
      dnsRecordsToPatch,
      ZONE_ID,
      API_KEY,
      publicIp,
      "A",
    );
    log.info("patched dns entries");
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
