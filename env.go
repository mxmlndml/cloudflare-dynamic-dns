package main

import (
	"log"
	"os"
	"strconv"
	"strings"
)

func GetAPIKey() string {
	value, isSet := os.LookupEnv("API_KEY")
	if !isSet {
		log.Panic("Missing environment variable 'API_KEY'")
	}

	return value
}

func GetZoneID() string {
	value, isSet := os.LookupEnv("ZONE_ID")
	if !isSet {
		log.Panic("Missing environment variable 'ZONE_ID'")
	}

	return value
}

func GetDomainNames() []string {
	value, isSet := os.LookupEnv("DOMAIN_NAMES")
	if !isSet {
		log.Panic("Missing environment variable 'DOMAIN_NAMES'")
	}

	return strings.Split(value, ",")
}

func UseIPv4() bool {
	value, isSet := os.LookupEnv("RECORD_TYPES")
	if !isSet {
		return true
	}

	switch value {
	case "A", "*":
		return true
	case "AAAA":
		return false
	default:
		log.Panicf("Unrecognized value '%v' for 'RECORD_TYPES'", value)
		return false
	}
}

func UseIPv6() bool {
	value, isSet := os.LookupEnv("RECORD_TYPES")
	if !isSet {
		return false
	}

	switch value {
	case "AAAA", "*":
		return true
	case "A":
		return false
	default:
		log.Panicf("Unrecognized value '%v' for 'RECORD_TYPES'", value)
		return false
	}
}

func GetInterval() int {
	value, isSet := os.LookupEnv("INTERVAL")

	if !isSet {
		return 5
	}

	interval, err := strconv.Atoi(value)
	if err != nil {
		log.Panic("Error converting 'INTERVAL' to integer: ", err)
	}

	return interval
}
