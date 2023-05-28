type CFResponse = {
  result: {
    content: string;
    name: string;
    type: string;
    id: string;
  }[];
  errors: {
    code: number;
    message: string;
  }[];
  success: boolean;
};

const getDnsRecord = async (
  zoneIdentifier: string,
  name: string,
  type: string,
  apiKey: string,
): Promise<{ content: string; id: string }> => {
  const url =
    `https://api.cloudflare.com/client/v4/zones/${zoneIdentifier}/dns_records?name=${name}&type=${type}`;
  const headers = {
    Authorization: `bearer ${apiKey}`,
  };

  const response = await fetch(url, { headers });
  const json: CFResponse = await response.json();

  if (json.success) {
    return (({ content, id }) => ({ content, id }))(json.result[0]);
  }

  const error = json.errors.reduce(
    (message, error) => `${message}${error.message}. `,
    "",
  );
  throw new Error(
    `failed to get dns ${type.toLowerCase()} record '${name}'. ${error}`,
  );
};

const patchDnsRecord = async (
  zoneIdentifier: string,
  identifier: string,
  apiKey: string,
  content: string,
  name: string,
  type: string,
) => {
  const url =
    `https://api.cloudflare.com/client/v4/zones/${zoneIdentifier}/dns_records/${identifier}`;
  const method = "PATCH";
  const headers = {
    Authorization: `bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({
    content,
    name,
    type,
  });

  const response = await fetch(url, { method, headers, body });
  const json: CFResponse = await response.json();

  if (json.success) {
    return;
  }

  const error = json.errors.reduce(
    (message, error) => `${message}${error.message}. `,
    "",
  );
  throw new Error(
    `failed to patch dns ${type.toLowerCase} record '${name}'. ${error}`,
  );
};

export { getDnsRecord, patchDnsRecord };
