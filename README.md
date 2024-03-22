# Dynamic DNS Updates with Cloudflare

![cloudflare-dynamic-dns](https://github.com/mxmlndml/cloudflare-dynamic-dns/assets/42516330/fc6e7c3e-eb96-4fdf-924e-cf86dab70b4b)

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
docker run -d -e API_KEY=123 -e ZONE_ID=023e105f4ecef8ad9ca31a8372d0c353 -e DOMAIN_NAMES=example.com,*.example.com mxmlndml/cloudflare-dynamic-dns
```

Alternatively you can copy the `docker-compose.yml` and `.env.template` from this repository into an
empty directory of your machine, rename the `.env.template` to `.env`, edit the environment variables in both files and start the
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
- **`RECORD_TYPES`** _defaults to `A`_
  \
  Whether A and/or AAAA records should be updated
  \
  `A`: updates only A records
  \
  `AAAA`: updates only AAAA records
  \
  `*`: updates both A and AAAA records
- **`INTERVAL`** _defaults to `5`_
  \
  Time interval in minutes between DNS updates
