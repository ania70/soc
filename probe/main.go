package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type Event struct {
	SyscallType  string `json:"syscall_type"`
	Timestamp    string `json:"timestamp"`
	PID          int    `json:"pid"`
	ProcessName  string `json:"process_name"`
	PodName      *string `json:"pod_name"`
	NodeName     string `json:"node_name"`
	Namespace    *string `json:"namespace"`
	ContainerID  *string `json:"container_id"`
	Args         string `json:"args"`
}

type Heartbeat struct {
	NodeName  string `json:"node_name"`
	IPAddress string `json:"ip_address"`
}

var (
	dashboardURL  string
	probeAPIKey   string
	nodeName      string
)

func init() {
	dashboardURL = os.Getenv("DASHBOARD_URL")
	if dashboardURL == "" {
		dashboardURL = "http://localhost:8001"
	}
	probeAPIKey = os.Getenv("PROBE_API_KEY")
	if probeAPIKey == "" {
		fmt.Fprintln(os.Stderr, "PROBE_API_KEY not set")
		os.Exit(1)
	}
	nodeName = os.Getenv("NODE_NAME")
	if nodeName == "" {
		hostname, _ := os.Hostname()
		nodeName = hostname
	}
}

func sendEvent(ev Event) error {
	body, _ := json.Marshal(ev)
	req, _ := http.NewRequest("POST", dashboardURL+"/api/events", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Probe-Key", probeAPIKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	resp.Body.Close()
	return nil
}

func sendHeartbeat() error {
	ip := os.Getenv("NODE_IP")
	if ip == "" {
		ip = "unknown"
	}
	hb := Heartbeat{NodeName: nodeName, IPAddress: ip}
	body, _ := json.Marshal(hb)
	req, _ := http.NewRequest("POST", dashboardURL+"/api/nodes/heartbeat", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Probe-Key", probeAPIKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	resp.Body.Close()
	return nil
}

func main() {
	fmt.Printf("KubeShield probe starting on node %s, dashboard=%s\n", nodeName, dashboardURL)

	// Send heartbeat on start and every 30s
	go func() {
		sendHeartbeat()
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			sendHeartbeat()
		}
	}()

	// On macOS or non-Linux, run in mock mode
	if _, err := os.Stat("/sys/kernel/tracing"); err != nil {
		fmt.Println("eBPF not available, running in mock mode")
		runMockMode()
		return
	}

	// TODO: Real eBPF tracepoint hooks for execve, openat, connect
	// This requires libbpf or cilium/ebpf and root privileges
	// For now, mock mode is the fallback
	runMockMode()
}

func runMockMode() {
	processes := []string{"nginx", "redis-server", "kube-apiserver", "curl", "cat", "python3", "etcd", "containerd"}
	pods := []string{"nginx-7f4b8-abc12", "redis-master-0", "api-server-6d8f-x9k2", "", "kube-proxy-abc34", "coredns-5644-def78"}
	namespaces := []string{"default", "kube-system", "production", ""}
	syscalls := []string{"execve", "openat", "connect"}

	ticker := time.NewTicker(1500 * time.Millisecond)
	defer ticker.Stop()

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)

	for {
		select {
		case <-sig:
			fmt.Println("Shutting down probe...")
			return
		case <-ticker.C:
			sc := syscalls[int(time.Now().Unix())%3]
			pod := pods[int(time.Now().Unix())%len(pods)]
			ns := namespaces[int(time.Now().Unix())%len(namespaces)]
			proc := processes[int(time.Now().Unix())%len(processes)]
			pid := int(time.Now().UnixNano() % 65000) + 100

			var podPtr, nsPtr, containerPtr *string
			if pod != "" {
				podPtr = &pod
				nsPtr = &ns
				cid := fmt.Sprintf("container-%d", time.Now().UnixNano()%9000+1000)
				containerPtr = &cid
			}

			var args string
			switch sc {
			case "execve":
				args = fmt.Sprintf(`{"filename":"/usr/bin/%s","argv":["%s","--flag"]}`, proc, proc)
			case "openat":
				args = fmt.Sprintf(`{"path":"/etc/%s.conf","flags":"O_RDONLY"}`, proc)
			case "connect":
				args = fmt.Sprintf(`{"dest_addr":"10.0.%d.%d","dest_port":%d}`, time.Now().Unix()%255, (time.Now().Unix()*7)%255, []int{80, 443, 6379, 8080, 53}[int(time.Now().Unix())%5])
			}

			ev := Event{
				SyscallType: sc,
				Timestamp:   time.Now().UTC().Format(time.RFC3339Nano),
				PID:         pid,
				ProcessName: proc,
				PodName:     podPtr,
				NodeName:    nodeName,
				Namespace:   nsPtr,
				ContainerID: containerPtr,
				Args:        args,
			}

			if err := sendEvent(ev); err != nil {
				fmt.Fprintf(os.Stderr, "send error: %v\n", err)
			}
		}
	}
}
