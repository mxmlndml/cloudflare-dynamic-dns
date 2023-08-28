# Dynamic DNS Updates with Cloudflare

![cloudflare-dynamic-dns](https://github.com/mxmlndml/cloudflare-dynamic-dns/assets/42516330/d1faa020-e730-4f53-9706-4fe9e9a7bd41)

This Docker container offers a straightforward and efficient solution for
automating dynamic DNS updates using the Cloudflare DNS service. It empowers you
to effortlessly update your DNS records in Cloudflare at predefined intervals,
guaranteeing that your services are consistently accessible through a domain
name.

## Prerequisites

Before you can use this Docker container, ensure you meet the following
prerequisites:

- Docker: [Docker installation guide](https://docs.docker.com/get-docker/)
- Cloudflare DNS:
  [Cloudflare zone setups guide](https://developers.cloudflare.com/dns/zone-setups/)

## Installation

This script runs as a Docker container, which means installation is as simple as
pulling the pre-built Docker container and running it with the necessary
environment variables

```sh
docker run -d -e API_KEY=123 -e ZONE_ID=023e105f4ecef8ad9ca31a8372d0c353 -e DOMAIN_NAMES=dyndns.example.com,example.com --restart=always mxmlndml/cloudflare-dynamic-dns
```

Alternatively you can copy the `docker-compose.yml` from this repository into an
empty directory of your machine, edit the environment variables and start the
container with `docker compose`

```sh
docker compose up -d
```

## Configuration

You can configure this Docker container using environment variables. Here's a
breakdown of the available configuration variables:

- **`API_KEY`** _required_
  \
  Cloudflare API token with `Zone Settings:Read`, `Zone:Read` and `DNS:Edit`
  permissions
- **`ZONE_ID`** _required_
  \
  Zone ID of your website (in the right sidebar on the overview page of your
  site)
- **`DOMAIN_NAMES`** _required_
  \
  List of DNS A records that should store your public IP address delimited by a
  comma (and only a comma)
- **`INTERVAL`** _defaults to `5`_
  \
  Time interval in minutes between DNS updates
- **`LOG_LEVEL`** _defaults to `INFO`_
  \
  Logging level for the container, either `DEBUG`, `INFO`, `WARN` or `ERROR`
