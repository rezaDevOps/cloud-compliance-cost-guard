package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ec2"
	"github.com/aws/aws-sdk-go/service/iam"
	"github.com/aws/aws-sdk-go/service/s3"
)

type ScanRequest struct {
	AccountID   string `json:"account_id"`
	Provider    string `json:"provider"`
	ScanType    string `json:"scan_type"`
	Credentials json.RawMessage `json:"credentials"`
}

type Finding struct {
	Type           string `json:"type"`
	Severity       string `json:"severity"`
	ResourceID     string `json:"resource_id"`
	ResourceType   string `json:"resource_type"`
	Issue          string `json:"issue"`
	Recommendation string `json:"recommendation"`
}

type ScanResult struct {
	AccountID    string    `json:"account_id"`
	ScanType     string    `json:"scan_type"`
	Status       string    `json:"status"`
	Findings     []Finding `json:"findings"`
	ScannedAt    time.Time `json:"scanned_at"`
	SeverityCounts map[string]int `json:"severity_counts"`
}

func main() {
	http.HandleFunc("/scan", handleScan)
	http.HandleFunc("/health", handleHealth)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Scanner service starting on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

func handleScan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ScanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result := performScan(req)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func performScan(req ScanRequest) ScanResult {
	result := ScanResult{
		AccountID:      req.AccountID,
		ScanType:       req.ScanType,
		Status:         "completed",
		Findings:       []Finding{},
		ScannedAt:      time.Now(),
		SeverityCounts: make(map[string]int),
	}

	switch req.Provider {
	case "aws":
		result.Findings = scanAWS(req)
	case "azure":
		// TODO: Implement Azure scanning
	case "gcp":
		// TODO: Implement GCP scanning
	}

	// Count severities
	for _, finding := range result.Findings {
		result.SeverityCounts[finding.Severity]++
	}

	return result
}

func scanAWS(req ScanRequest) []Finding {
	findings := []Finding{}
	
	// Create AWS session
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("eu-central-1"),
	})
	if err != nil {
		log.Printf("Error creating AWS session: %v", err)
		return findings
	}

	if req.ScanType == "security" {
		// Scan EC2 instances
		ec2Findings := scanEC2(sess)
		findings = append(findings, ec2Findings...)
		
		// Scan S3 buckets
		s3Findings := scanS3(sess)
		findings = append(findings, s3Findings...)
		
		// Scan IAM
		iamFindings := scanIAM(sess)
		findings = append(findings, iamFindings...)
	}

	return findings
}

func scanEC2(sess *session.Session) []Finding {
	findings := []Finding{}
	svc := ec2.New(sess)
	
	result, err := svc.DescribeInstances(nil)
	if err != nil {
		log.Printf("Error describing EC2 instances: %v", err)
		return findings
	}
	
	for _, reservation := range result.Reservations {
		for _, instance := range reservation.Instances {
			// Check for public IP
			if instance.PublicIpAddress != nil {
				findings = append(findings, Finding{
					Type:           "security",
					Severity:       "high",
					ResourceID:     *instance.InstanceId,
					ResourceType:   "EC2",
					Issue:          "Instance has public IP address",
					Recommendation: "Consider using private subnets with NAT Gateway",
				})
			}
			
			// Check for unencrypted volumes
			for _, bdm := range instance.BlockDeviceMappings {
				if bdm.Ebs != nil && bdm.Ebs.Encrypted != nil && !*bdm.Ebs.Encrypted {
					findings = append(findings, Finding{
						Type:           "security",
						Severity:       "medium",
						ResourceID:     *bdm.Ebs.VolumeId,
						ResourceType:   "EBS",
						Issue:          "EBS volume is not encrypted",
						Recommendation: "Enable encryption for EBS volumes",
					})
				}
			}
		}
	}
	
	return findings
}
func scanS3(sess *session.Session) []Finding {
	findings := []Finding{}
	svc := s3.New(sess)
	
	result, err := svc.ListBuckets(nil)
	if err != nil {
		log.Printf("Error listing S3 buckets: %v", err)
		return findings
	}
	
	for _, bucket := range result.Buckets {
		// Check bucket ACL
		acl, err := svc.GetBucketAcl(&s3.GetBucketAclInput{
			Bucket: bucket.Name,
		})
		if err != nil {
			continue
		}
		
		// Check for public access
		for _, grant := range acl.Grants {
			if grant.Grantee != nil && grant.Grantee.URI != nil {
				if *grant.Grantee.URI == "http://acs.amazonaws.com/groups/global/AllUsers" {
					findings = append(findings, Finding{
						Type:           "security",
						Severity:       "critical",
						ResourceID:     *bucket.Name,
						ResourceType:   "S3",
						Issue:          "S3 bucket has public access",
						Recommendation: "Remove public access and use pre-signed URLs or CloudFront",
					})
				}
			}
		}
		
		// Check for encryption
		enc, err := svc.GetBucketEncryption(&s3.GetBucketEncryptionInput{
			Bucket: bucket.Name,
		})
		if err != nil || enc.ServerSideEncryptionConfiguration == nil {
			findings = append(findings, Finding{
				Type:           "security",
				Severity:       "medium",
				ResourceID:     *bucket.Name,
				ResourceType:   "S3",
				Issue:          "S3 bucket is not encrypted",
				Recommendation: "Enable default encryption for S3 bucket",
			})
		}
	}
	
	return findings
}

func scanIAM(sess *session.Session) []Finding {
	findings := []Finding{}
	svc := iam.New(sess)
	
	// Check for root account MFA
	summary, err := svc.GetAccountSummary(nil)
	if err != nil {
		log.Printf("Error getting account summary: %v", err)
		return findings
	}
	
	if mfaDevices, ok := summary.SummaryMap["AccountMFAEnabled"]; ok {
		if *mfaDevices == 0 {
			findings = append(findings, Finding{
				Type:           "security",
				Severity:       "critical",
				ResourceID:     "root-account",
				ResourceType:   "IAM",
				Issue:          "Root account does not have MFA enabled",
				Recommendation: "Enable MFA for root account immediately",
			})
		}
	}
	
	// Check for users without MFA
	users, err := svc.ListUsers(nil)
	if err != nil {
		return findings
	}
	
	for _, user := range users.Users {
		mfaDevices, err := svc.ListMFADevices(&iam.ListMFADevicesInput{
			UserName: user.UserName,
		})
		if err != nil {
			continue
		}
		
		if len(mfaDevices.MFADevices) == 0 {
			findings = append(findings, Finding{
				Type:           "security",
				Severity:       "high",
				ResourceID:     *user.UserName,
				ResourceType:   "IAM",
				Issue:          fmt.Sprintf("User %s does not have MFA enabled", *user.UserName),
				Recommendation: "Enable MFA for all IAM users",
			})
		}
	}
	
	return findings
}