package main

import (
	"fmt"
	"log"
	"strings"
	"sync"
	"time"
)

type publicIP struct {
	v4 string
	v6 string
}

func getPublicIP() publicIP {
	var publicIP publicIP
	var wg sync.WaitGroup

	if UseIPv4() {
		wg.Add(1)
		go func() {
			publicIP.v4 = GetPublicIP(4)
			wg.Done()
		}()
	}

	if UseIPv6() {
		wg.Add(1)
		go func() {
			publicIP.v6 = GetPublicIP(6)
			wg.Done()
		}()
	}

	wg.Wait()
	return publicIP
}

func getDNSRecords() []DNSRecords {
	apiKey := GetAPIKey()
	zoneID := GetZoneID()
	domainNames := GetDomainNames()
	ch := make(chan DNSRecords, len(domainNames))
	defer close(ch)

	for _, domainName := range domainNames {
		go func() {
			ch <- GetDNSRecord(zoneID, domainName, apiKey)
		}()
	}

	var dnsRecords []DNSRecords
	for i := 0; i < len(domainNames); i++ {
		dnsRecord := <-ch
		dnsRecords = append(dnsRecords, dnsRecord)
	}

	return dnsRecords
}

func initialize() {
	fmt.Println("  _______             _______               ___                       _       ___  _  ______")
	fmt.Println(" / ___/ /__  __ _____/ / _/ /__ ________   / _ \\__ _____  ___ ___ _  (_)___  / _ \\/ |/ / __/")
	fmt.Println("/ /__/ / _ \\/ // / _  / _/ / _ `/ __/ -_) / // / // / _ \\/ _ `/  ' \\/ / __/ / // /    /\\ \\  ")
	fmt.Println("\\___/_/\\___/\\_,_/\\_,_/_//_/\\_,_/_/  \\__/ /____/\\_, /_//_/\\_,_/_/_/_/_/\\__/ /____/_/|_/___/  ")
	fmt.Println("                                              /___/                                         ")

	var recordType string
	if UseIPv4() && UseIPv6() {
		recordType = "A and AAAA"
	} else if UseIPv4() {
		recordType = "A"
	} else if UseIPv6() {
		recordType = "AAAA"
	}

	domainNames := strings.Join(GetDomainNames(), ", ")

	interval := GetInterval()

	fmt.Printf("Updating %v records of %v every %v minutes\n\n", recordType, domainNames, interval)
}

func main() {
	initialize()

	for {
		var publicIP publicIP
		var dnsRecords []DNSRecords
		var wg sync.WaitGroup

		// concurrently fetch public ip and dns records
		wg.Add(2)
		go func() {
			publicIP = getPublicIP()
			wg.Done()
		}()
		go func() {
			dnsRecords = getDNSRecords()
			wg.Done()
		}()
		wg.Wait()

		// concurrently create/update dns entries if their content is not current public ip
		apiKey := GetAPIKey()
		zoneID := GetZoneID()
		for _, dnsRecord := range dnsRecords {
			if UseIPv4() && publicIP.v4 != dnsRecord.a.content {
				wg.Add(1)

				go func() {
					UpdateDNSRecord(zoneID, dnsRecord.a.id, apiKey, DNSRecordBody{Type: "A", Name: dnsRecord.name, Content: publicIP.v4})
					log.Printf("Set DNS A record %v to %v", dnsRecord.name, publicIP.v4)
					wg.Done()
				}()
			}
			if UseIPv6() && publicIP.v6 != dnsRecord.aaaa.content {
				wg.Add(1)

				go func() {
					UpdateDNSRecord(zoneID, dnsRecord.aaaa.id, apiKey, DNSRecordBody{Type: "AAAA", Name: dnsRecord.name, Content: publicIP.v6})
					log.Printf("Set DNS AAAA record %v to %v", dnsRecord.name, publicIP.v6)
					wg.Done()
				}()
			}
		}
		wg.Wait()

		time.Sleep(time.Duration(GetInterval()) * time.Minute)
	}
}
