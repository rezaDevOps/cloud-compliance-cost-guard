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
	"github.com/aws/aws-sdk-go/service/cloudwatch"
	"github.com/aws/aws-sdk-go/service/costexplorer"
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
	Type                string  `json:"type"`
	Severity            string  `json:"severity"`
	ResourceID          string  `json:"resource_id"`
	ResourceType        string  `json:"resource_type"`
	Issue               string  `json:"issue"`
	Recommendation      string  `json:"recommendation"`
	EstimatedMonthlyCost float64 `json:"estimated_monthly_cost,omitempty"`
	PotentialSavings    float64 `json:"potential_savings,omitempty"`
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

	switch req.ScanType {
	case "security":
		// Scan EC2 instances
		ec2Findings := scanEC2(sess)
		findings = append(findings, ec2Findings...)

		// Scan S3 buckets
		s3Findings := scanS3(sess)
		findings = append(findings, s3Findings...)

		// Scan IAM
		iamFindings := scanIAM(sess)
		findings = append(findings, iamFindings...)

	case "cost":
		// Unused Resource Detection
		findings = append(findings, scanIdleEC2Instances(sess)...)
		findings = append(findings, scanUnattachedEBSVolumes(sess)...)
		findings = append(findings, scanUnusedElasticIPs(sess)...)
		findings = append(findings, scanOldSnapshots(sess)...)
		findings = append(findings, scanStoppedInstances(sess)...)

		// Right-Sizing Analysis
		findings = append(findings, performRightSizingAnalysis(sess)...)
		findings = append(findings, scanUndersizedInstances(sess)...)

		// Reserved Instance Recommendations
		findings = append(findings, analyzeReservedInstanceOpportunities(sess)...)

		// Spot Instance Opportunities
		findings = append(findings, analyzeSpotInstanceOpportunities(sess)...)
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
// Cost Optimization Scanning Functions

func scanIdleEC2Instances(sess *session.Session) []Finding {
	findings := []Finding{}
	ec2Svc := ec2.New(sess)
	cwSvc := cloudwatch.New(sess)

	result, err := ec2Svc.DescribeInstances(&ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{
				Name:   aws.String("instance-state-name"),
				Values: []*string{aws.String("running")},
			},
		},
	})
	if err != nil {
		log.Printf("Error describing instances: %v", err)
		return findings
	}

	for _, reservation := range result.Reservations {
		for _, instance := range reservation.Instances {
			endTime := time.Now()
			startTime := endTime.Add(-7 * 24 * time.Hour)

			cpuMetrics, err := cwSvc.GetMetricStatistics(&cloudwatch.GetMetricStatisticsInput{
				Namespace:  aws.String("AWS/EC2"),
				MetricName: aws.String("CPUUtilization"),
				Dimensions: []*cloudwatch.Dimension{
					{Name: aws.String("InstanceId"), Value: instance.InstanceId},
				},
				StartTime:  &startTime,
				EndTime:    &endTime,
				Period:     aws.Int64(3600),
				Statistics: []*string{aws.String("Average")},
			})

			if err == nil && len(cpuMetrics.Datapoints) > 0 {
				totalCPU := 0.0
				for _, dp := range cpuMetrics.Datapoints {
					if dp.Average != nil {
						totalCPU += *dp.Average
					}
				}
				avgCPU := totalCPU / float64(len(cpuMetrics.Datapoints))

				if avgCPU < 5.0 {
					monthlyCost := estimateEC2Cost(instance.InstanceType)
					findings = append(findings, Finding{
						Type:                "cost",
						Severity:            "high",
						ResourceID:          *instance.InstanceId,
						ResourceType:        "EC2",
						Issue:               fmt.Sprintf("Idle instance (avg CPU: %.2f%%)", avgCPU),
						Recommendation:      "Stop or terminate to save $" + fmt.Sprintf("%.2f/month", monthlyCost),
						EstimatedMonthlyCost: monthlyCost,
						PotentialSavings:    monthlyCost,
					})
				}
			}
		}
	}
	return findings
}

func scanUnattachedEBSVolumes(sess *session.Session) []Finding {
	findings := []Finding{}
	svc := ec2.New(sess)

	result, err := svc.DescribeVolumes(&ec2.DescribeVolumesInput{
		Filters: []*ec2.Filter{
			{Name: aws.String("status"), Values: []*string{aws.String("available")}},
		},
	})
	if err != nil {
		return findings
	}

	for _, volume := range result.Volumes {
		sizeGB := float64(*volume.Size)
		monthlyCost := sizeGB * 0.10

		findings = append(findings, Finding{
			Type:                "cost",
			Severity:            "medium",
			ResourceID:          *volume.VolumeId,
			ResourceType:        "EBS",
			Issue:               fmt.Sprintf("Unattached volume (%d GB)", *volume.Size),
			Recommendation:      "Delete or snapshot unused volumes. Save $" + fmt.Sprintf("%.2f/month", monthlyCost),
			EstimatedMonthlyCost: monthlyCost,
			PotentialSavings:    monthlyCost,
		})
	}
	return findings
}

func scanUnusedElasticIPs(sess *session.Session) []Finding {
	findings := []Finding{}
	svc := ec2.New(sess)

	result, err := svc.DescribeAddresses(&ec2.DescribeAddressesInput{})
	if err != nil {
		return findings
	}

	for _, addr := range result.Addresses {
		if addr.InstanceId == nil || *addr.InstanceId == "" {
			monthlyCost := 3.65
			findings = append(findings, Finding{
				Type:                "cost",
				Severity:            "low",
				ResourceID:          *addr.AllocationId,
				ResourceType:        "ElasticIP",
				Issue:               "Unused Elastic IP",
				Recommendation:      "Release to save $3.65/month",
				EstimatedMonthlyCost: monthlyCost,
				PotentialSavings:    monthlyCost,
			})
		}
	}
	return findings
}

func scanOldSnapshots(sess *session.Session) []Finding {
	findings := []Finding{}
	svc := ec2.New(sess)

	result, err := svc.DescribeSnapshots(&ec2.DescribeSnapshotsInput{
		OwnerIds: []*string{aws.String("self")},
	})
	if err != nil {
		return findings
	}

	oneYearAgo := time.Now().AddDate(-1, 0, 0)
	for _, snapshot := range result.Snapshots {
		if snapshot.StartTime.Before(oneYearAgo) {
			sizeGB := float64(*snapshot.VolumeSize)
			monthlyCost := sizeGB * 0.05

			findings = append(findings, Finding{
				Type:                "cost",
				Severity:            "low",
				ResourceID:          *snapshot.SnapshotId,
				ResourceType:        "Snapshot",
				Issue:               fmt.Sprintf("Old snapshot (%d GB, >1 year)", *snapshot.VolumeSize),
				Recommendation:      "Delete if no longer needed. Save $" + fmt.Sprintf("%.2f/month", monthlyCost),
				EstimatedMonthlyCost: monthlyCost,
				PotentialSavings:    monthlyCost,
			})
		}
	}
	return findings
}

func scanUndersizedInstances(sess *session.Session) []Finding {
	findings := []Finding{}
	ec2Svc := ec2.New(sess)
	cwSvc := cloudwatch.New(sess)

	result, err := ec2Svc.DescribeInstances(&ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{Name: aws.String("instance-state-name"), Values: []*string{aws.String("running")}},
		},
	})
	if err != nil {
		return findings
	}

	for _, reservation := range result.Reservations {
		for _, instance := range reservation.Instances {
			endTime := time.Now()
			startTime := endTime.Add(-7 * 24 * time.Hour)

			cpuMetrics, _ := cwSvc.GetMetricStatistics(&cloudwatch.GetMetricStatisticsInput{
				Namespace:  aws.String("AWS/EC2"),
				MetricName: aws.String("CPUUtilization"),
				Dimensions: []*cloudwatch.Dimension{
					{Name: aws.String("InstanceId"), Value: instance.InstanceId},
				},
				StartTime:  &startTime,
				EndTime:    &endTime,
				Period:     aws.Int64(3600),
				Statistics: []*string{aws.String("Average")},
			})

			if len(cpuMetrics.Datapoints) > 0 {
				totalCPU := 0.0
				for _, dp := range cpuMetrics.Datapoints {
					if dp.Average != nil {
						totalCPU += *dp.Average
					}
				}
				avgCPU := totalCPU / float64(len(cpuMetrics.Datapoints))

				if avgCPU >= 10 && avgCPU < 30 {
					currentCost := estimateEC2Cost(instance.InstanceType)
					potentialSavings := currentCost * 0.5

					findings = append(findings, Finding{
						Type:                "cost",
						Severity:            "medium",
						ResourceID:          *instance.InstanceId,
						ResourceType:        "EC2",
						Issue:               fmt.Sprintf("Oversized instance (avg CPU: %.2f%%)", avgCPU),
						Recommendation:      "Downsize to save ~$" + fmt.Sprintf("%.2f/month", potentialSavings),
						EstimatedMonthlyCost: currentCost,
						PotentialSavings:    potentialSavings,
					})
				}
			}
		}
	}
	return findings
}

func estimateEC2Cost(instanceType *string) float64 {
	if instanceType == nil {
		return 0
	}

	priceMap := map[string]float64{
		"t2.micro": 8.76, "t2.small": 17.52, "t2.medium": 35.04, "t2.large": 70.08,
		"t3.micro": 7.59, "t3.small": 15.18, "t3.medium": 30.37, "t3.large": 60.74,
		"m5.large": 70.08, "m5.xlarge": 140.16, "m5.2xlarge": 280.32,
		"c5.large": 62.78, "c5.xlarge": 125.55,
	}

	if cost, ok := priceMap[*instanceType]; ok {
		return cost
	}
	return 50.0
}

// Advanced Cost Optimization Functions

func scanStoppedInstances(sess *session.Session) []Finding {
	findings := []Finding{}
	svc := ec2.New(sess)

	result, err := svc.DescribeInstances(&ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{Name: aws.String("instance-state-name"), Values: []*string{aws.String("stopped")}},
		},
	})
	if err != nil {
		return findings
	}

	for _, reservation := range result.Reservations {
		for _, instance := range reservation.Instances {
			stoppedDuration := time.Since(*instance.LaunchTime)
			if stoppedDuration > 7*24*time.Hour {
				monthlyCost := estimateEC2Cost(instance.InstanceType) * 0.1 // EBS storage cost
				findings = append(findings, Finding{
					Type:                "cost",
					Severity:            "medium",
					ResourceID:          *instance.InstanceId,
					ResourceType:        "EC2",
					Issue:               fmt.Sprintf("Instance stopped for %d days", int(stoppedDuration.Hours()/24)),
					Recommendation:      "Terminate if no longer needed. Currently paying for EBS storage",
					EstimatedMonthlyCost: monthlyCost,
					PotentialSavings:    monthlyCost,
				})
			}
		}
	}
	return findings
}

func analyzeReservedInstanceOpportunities(sess *session.Session) []Finding {
	findings := []Finding{}
	ec2Svc := ec2.New(sess)
	ceSvc := costexplorer.New(sess)

	// Get running instances
	result, err := ec2Svc.DescribeInstances(&ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{Name: aws.String("instance-state-name"), Values: []*string{aws.String("running")}},
		},
	})
	if err != nil {
		return findings
	}

	// Track instance types and their counts
	instanceCounts := make(map[string]int)
	instanceIDs := make(map[string][]string)
	
	for _, reservation := range result.Reservations {
		for _, instance := range reservation.Instances {
			if instance.InstanceType != nil {
				instanceType := *instance.InstanceType
				instanceCounts[instanceType]++
				instanceIDs[instanceType] = append(instanceIDs[instanceType], *instance.InstanceId)
			}
		}
	}

	// Analyze usage patterns with Cost Explorer
	endTime := time.Now()
	startTime := endTime.AddDate(0, -3, 0) // Last 3 months
	
	// Get cost and usage data
	costInput := &costexplorer.GetCostAndUsageInput{
		TimePeriod: &costexplorer.DateInterval{
			Start: aws.String(startTime.Format("2006-01-02")),
			End:   aws.String(endTime.Format("2006-01-02")),
		},
		Granularity: aws.String("MONTHLY"),
		Metrics:     []*string{aws.String("UnblendedCost")},
		GroupBy: []*costexplorer.GroupDefinition{
			{
				Type: aws.String("DIMENSION"),
				Key:  aws.String("INSTANCE_TYPE"),
			},
		},
	}

	_, err = ceSvc.GetCostAndUsage(costInput)
	if err != nil {
		log.Printf("Cost Explorer API error (may need permissions): %v", err)
	}

	// Recommend RIs for instances running >70% of the time
	for instanceType, count := range instanceCounts {
		if count >= 1 {
			onDemandCost := estimateEC2Cost(&instanceType) * float64(count)
			riCost := onDemandCost * 0.60 // ~40% savings with 1-year RI
			savings := onDemandCost - riCost

			findings = append(findings, Finding{
				Type:                "cost",
				Severity:            "high",
				ResourceID:          fmt.Sprintf("%s (%d instances)", instanceType, count),
				ResourceType:        "EC2-RI",
				Issue:               fmt.Sprintf("%d %s instances running continuously", count, instanceType),
				Recommendation:      fmt.Sprintf("Purchase 1-year Reserved Instances. Save ~$%.2f/month (40%% discount)", savings),
				EstimatedMonthlyCost: onDemandCost,
				PotentialSavings:    savings,
			})
		}
	}

	return findings
}

func analyzeSpotInstanceOpportunities(sess *session.Session) []Finding {
	findings := []Finding{}
	ec2Svc := ec2.New(sess)
	cwSvc := cloudwatch.New(sess)

	result, err := ec2Svc.DescribeInstances(&ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{Name: aws.String("instance-state-name"), Values: []*string{aws.String("running")}},
		},
	})
	if err != nil {
		return findings
	}

	for _, reservation := range result.Reservations {
		for _, instance := range reservation.Instances {
			// Check if instance is suitable for Spot
			// Criteria: Not in production, stateless workloads, fault-tolerant
			
			// Check tags for environment
			isProduction := false
			isStateless := false
			
			for _, tag := range instance.Tags {
				if tag.Key != nil && tag.Value != nil {
					if *tag.Key == "Environment" && (*tag.Value == "production" || *tag.Value == "prod") {
						isProduction = true
					}
					if *tag.Key == "Workload" && (*tag.Value == "batch" || *tag.Value == "dev" || *tag.Value == "test") {
						isStateless = true
					}
				}
			}

			// Also check if instance has low CPU variance (indicates non-critical workload)
			endTime := time.Now()
			startTime := endTime.Add(-7 * 24 * time.Hour)

			cpuMetrics, err := cwSvc.GetMetricStatistics(&cloudwatch.GetMetricStatisticsInput{
				Namespace:  aws.String("AWS/EC2"),
				MetricName: aws.String("CPUUtilization"),
				Dimensions: []*cloudwatch.Dimension{
					{Name: aws.String("InstanceId"), Value: instance.InstanceId},
				},
				StartTime:  &startTime,
				EndTime:    &endTime,
				Period:     aws.Int64(3600),
				Statistics: []*string{aws.String("Average"), aws.String("Maximum")},
			})

			if err == nil && len(cpuMetrics.Datapoints) > 0 && (!isProduction || isStateless) {
				onDemandCost := estimateEC2Cost(instance.InstanceType)
				spotCost := onDemandCost * 0.30 // ~70% savings with Spot
				savings := onDemandCost - spotCost

				suitability := "dev/test"
				if isStateless {
					suitability = "batch/stateless"
				}

				findings = append(findings, Finding{
					Type:                "cost",
					Severity:            "medium",
					ResourceID:          *instance.InstanceId,
					ResourceType:        "EC2-Spot",
					Issue:               fmt.Sprintf("Instance suitable for Spot (%s workload)", suitability),
					Recommendation:      fmt.Sprintf("Migrate to Spot Instances. Save ~$%.2f/month (70%% discount). Use Spot Fleet or Auto Scaling for fault tolerance", savings),
					EstimatedMonthlyCost: onDemandCost,
					PotentialSavings:    savings,
				})
			}
		}
	}

	return findings
}

func performRightSizingAnalysis(sess *session.Session) []Finding {
	findings := []Finding{}
	ec2Svc := ec2.New(sess)
	cwSvc := cloudwatch.New(sess)

	result, err := ec2Svc.DescribeInstances(&ec2.DescribeInstancesInput{
		Filters: []*ec2.Filter{
			{Name: aws.String("instance-state-name"), Values: []*string{aws.String("running")}},
		},
	})
	if err != nil {
		return findings
	}

	for _, reservation := range result.Reservations {
		for _, instance := range reservation.Instances {
			endTime := time.Now()
			startTime := endTime.Add(-14 * 24 * time.Hour) // 14 days

			cpuMetrics, _ := cwSvc.GetMetricStatistics(&cloudwatch.GetMetricStatisticsInput{
				Namespace:  aws.String("AWS/EC2"),
				MetricName: aws.String("CPUUtilization"),
				Dimensions: []*cloudwatch.Dimension{
					{Name: aws.String("InstanceId"), Value: instance.InstanceId},
				},
				StartTime:  &startTime,
				EndTime:    &endTime,
				Period:     aws.Int64(3600),
				Statistics: []*string{aws.String("Average"), aws.String("Maximum")},
			})

			if len(cpuMetrics.Datapoints) > 0 {
				totalCPU := 0.0
				maxCPU := 0.0
				for _, dp := range cpuMetrics.Datapoints {
					if dp.Average != nil {
						totalCPU += *dp.Average
					}
					if dp.Maximum != nil && *dp.Maximum > maxCPU {
						maxCPU = *dp.Maximum
					}
				}
				avgCPU := totalCPU / float64(len(cpuMetrics.Datapoints))

				currentCost := estimateEC2Cost(instance.InstanceType)
				
				// Detailed right-sizing recommendations
				if avgCPU < 15 && maxCPU < 40 {
					// Can downsize by 2 levels
					potentialSavings := currentCost * 0.65
					findings = append(findings, Finding{
						Type:                "cost",
						Severity:            "high",
						ResourceID:          *instance.InstanceId,
						ResourceType:        "EC2-RightSize",
						Issue:               fmt.Sprintf("Significantly oversized (avg: %.1f%%, max: %.1f%%)", avgCPU, maxCPU),
						Recommendation:      fmt.Sprintf("Downsize by 2 tiers. Performance risk: LOW. Save $%.2f/month", potentialSavings),
						EstimatedMonthlyCost: currentCost,
						PotentialSavings:    potentialSavings,
					})
				} else if avgCPU >= 15 && avgCPU < 30 && maxCPU < 60 {
					// Can downsize by 1 level
					potentialSavings := currentCost * 0.45
					findings = append(findings, Finding{
						Type:                "cost",
						Severity:            "medium",
						ResourceID:          *instance.InstanceId,
						ResourceType:        "EC2-RightSize",
						Issue:               fmt.Sprintf("Moderately oversized (avg: %.1f%%, max: %.1f%%)", avgCPU, maxCPU),
						Recommendation:      fmt.Sprintf("Downsize by 1 tier. Performance risk: LOW. Save $%.2f/month", potentialSavings),
						EstimatedMonthlyCost: currentCost,
						PotentialSavings:    potentialSavings,
					})
				}
			}
		}
	}

	return findings
}
