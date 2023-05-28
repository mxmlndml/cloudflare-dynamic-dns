import { Resolver } from "dns/promises";
import * as log from "./log";

const OPEN_DNS = {
  RESOLVER: "resolver1.opendns.com",
  MYIP: "myip.opendns.com",
};
const HTTPS_URLS = [
  "https://ipv4.icanhazip.com",
  "https://ifconfig.me/ip",
  "https://myexternalip.com/raw",
  "https://ipecho.net/plain",
];

let dnsServers: string[] = [];

// get public ipv4 address via dns
const dns = async (): Promise<string> => {
  const resolver = new Resolver();

  // set resolver to opendns
  if (dnsServers.length === 0) {
    // cache dns server ip
    dnsServers = await resolver.resolve4(OPEN_DNS.RESOLVER);
    log.debug(`cached resolver ip address '${dnsServers[0]}'`);
  }
  resolver.setServers(dnsServers);

  // get public ip via opendns dns lookup
  const [publicIp] = await resolver.resolve4(OPEN_DNS.MYIP);
  log.debug(`determined public ip address '${publicIp}' via dns`);

  return publicIp;
};

const https = async (): Promise<string> => {
  const messages: string[] = [];

  const requests = HTTPS_URLS.map(async (url: string): Promise<Response> => {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return response;
      }
      throw new Error(response.statusText);
    } catch (error) {
      const message =
        `failed to fetch public ip address via https from '${url}'`;
      messages.push(message);
      throw new Error(message);
    }
  });

  try {
    const response = await Promise.any(requests);
    const publicIp = (await response.text()).replace("\n", "");
    log.debug(
      `determined public ip address '${publicIp}' via https using '${response.url}'`,
    );
    return publicIp;
  } catch (error) {
    messages.forEach((message) => log.warn(message));
    throw new Error((error as Error).message);
  }
};

const getPublicIp = async () => {
  let ip = "";
  try {
    log.debug("determine public ip address via dns");
    ip = await dns();
  } catch (error) {
    if (dnsServers.length === 0) {
      log.warn(`dns resolution of '${OPEN_DNS.RESOLVER}' timed out`);
    } else {
      log.warn(
        `dns resolution of '${OPEN_DNS.MYIP}' via '${dnsServers[0]}' timed out`,
      );
      dnsServers = [];
      log.debug("reset cached dns servers");
    }
    log.debug("fall back to https");

    try {
      log.debug("determine public ip address via https");
      ip = await https();
    } catch (error) {
      throw new Error(
        "failed to determine public ip address via dns and https",
      );
    }
  }

  return ip;
};

export default getPublicIp;
