package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func setAuthHeader(req *http.Request, apiKey string) {
	authHeader := fmt.Sprint("bearer ", apiKey)
	req.Header.Add("Authorization", authHeader)
}

type cloudflareResponse struct {
	Success bool
	Result  []struct {
		ID      string
		Content string
		Type    string
	}
	Errors []struct {
		Message string
	}
}

func checkServerErrors(data *cloudflareResponse) {
	if data.Success {
		return
	}

	msg := ""
	for i, err := range data.Errors {
		if i != 0 {
			msg += ", "
		}
		msg += err.Message
	}

	log.Panic("Server responded with error: ", msg)
}

type dnsRecord struct {
	id      string
	content string
}
type DNSRecords struct {
	name string
	a    dnsRecord
	aaaa dnsRecord
}

func GetDNSRecord(zoneID string, domainName string, apiKey string) DNSRecords {
	dnsRecords := DNSRecords{
		name: domainName,
	}

	url := fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%s/dns_records?name=%s", zoneID, domainName)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Panic("Error creating the request: ", err)
	}
	setAuthHeader(req, apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Panic("Error loading the response: ", err)
	}

	defer resp.Body.Close()

	var data cloudflareResponse
	err = json.NewDecoder(resp.Body).Decode(&data)
	if err != nil {
		log.Panic("Error parsing JSON: ", err)
	}
	checkServerErrors(&data)

	for _, record := range data.Result {
		switch record.Type {
		case "A":
			dnsRecords.a = dnsRecord{id: record.ID, content: record.Content}
		case "AAAA":
			dnsRecords.aaaa = dnsRecord{id: record.ID, content: record.Content}
		}
	}
	return dnsRecords
}

type DNSRecordBody struct {
	Content string
	Name    string
	Type    string
}

func UpdateDNSRecord(zoneID string, dnsRecordID string, apiKey string, body DNSRecordBody) {
	var method string
	var url string
	if dnsRecordID == "" {
		method = http.MethodPost
		url = fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%v/dns_records", zoneID)
	} else {
		method = http.MethodPatch
		url = fmt.Sprintf("https://api.cloudflare.com/client/v4/zones/%v/dns_records/%v", zoneID, dnsRecordID)
	}

	encodedBody, err := json.Marshal(&body)
	if err != nil {
		log.Panic("Error parsing the json body: ", err)
	}

	req, err := http.NewRequest(method, url, bytes.NewReader(encodedBody))
	if err != nil {
		log.Panic("Error creating the request: ", err)
	}
	setAuthHeader(req, apiKey)
	req.Header.Add("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Panic("Error loading the response: ", err)
	}

	defer resp.Body.Close()

	var data cloudflareResponse
	err = json.NewDecoder(resp.Body).Decode(&data)
	if err != nil {
		log.Fatal("Error parsing JSON: ", err)
	}
	checkServerErrors(&data)
}
