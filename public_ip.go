package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

func GetPublicIP(version int8) string {
	url := fmt.Sprintf("https://ipv%d.icanhazip.com", version)

	resp, err := http.Get(url)
	if err != nil {
		log.Panic("Failed to get public IP: ", err)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	return strings.TrimSpace(string(body))
}
