"""
KAVACH - Baseline Email Dataset (100 Verified Ground-Truth Emails)
Contains 50 Phishing and 50 Legitimate Corporate/Personal emails
Structured for Real-Time Benchmark Evaluation, Live Testing, and Dynamic Retraining.
"""

from typing import List, Dict, Any
import copy

BASELINE_EMAILS: List[Dict[str, Any]] = [
    # --- 50 PHISHING EMAILS ---
    {
        "id": "EML-PHISH-001",
        "subject": "URGENT: Microsoft 365 Account Deactivation Warning",
        "sender": "security-alert@micros0ft-support-portal.com",
        "return_path": "bounce@mailer-daemon-spammer.ru",
        "body": "Dear Employee, Your Office 365 password expires in 2 hours. Failure to verify will result in immediate mailbox suspension and deletion of OneDrive files. Click the secure link below to verify your corporate credentials immediately: http://185.220.101.45/auth/login.php?user=corp",
        "headers": {
            "Received": [
                "from mail.darknet-relay.ru (185.220.101.45) by mx.google.com with ESMTPS id p8si9281; Mon, 19 Oct 2026 14:22:10 -0700",
                "from gateway.corp-phish.xyz (194.26.29.112) by mail.darknet-relay.ru with SMTP; Mon, 19 Oct 2026 14:21:40 -0700"
            ],
            "Authentication-Results": "spf=fail (sender IP 185.220.101.45 is not permitted) smtp.mailfrom=mailer-daemon-spammer.ru; dkim=fail; dmarc=fail",
            "X-Mailer": "PHPMailer 6.1.4 (https://github.com/PHPMailer/PHPMailer)"
        },
        "origin_ip": "185.220.101.45",
        "target_ip": "142.250.190.46",
        "label": 1,
        "threat_type": "Credential Harvesting / Account Impersonation",
        "urgency_score": 96
    },
    {
        "id": "EML-PHISH-002",
        "subject": "Action Required: Overdue Wire Transfer Payment of $14,820",
        "sender": "cfo-office@finance-internal-desk.com",
        "return_path": "spoofed@bulletproof-hosting.is",
        "body": "Hi Accounts Payable, Please see the attached invoice for vendor consulting services rendered last week. The CEO requested this wire transfer be settled before 5 PM today to avoid statutory interest penalties. View invoice: http://swift-bank-transfer.top/doc/invoice_9281.exe",
        "headers": {
            "Received": [
                "from vps-8912.bulletproof-hosting.is (193.106.191.22) by mail.company.com with ESMTP id tr9910; Mon, 19 Oct 2026 11:10:05 +0000"
            ],
            "Authentication-Results": "spf=softfail; dkim=none; dmarc=fail (p=reject)",
            "X-Mailer": "Python-urllib/3.9"
        },
        "origin_ip": "193.106.191.22",
        "target_ip": "104.244.42.1",
        "label": 1,
        "threat_type": "Business Email Compromise (BEC) / Wire Fraud",
        "urgency_score": 92
    },
    {
        "id": "EML-PHISH-003",
        "subject": "Payroll Update: Direct Deposit Routing Details Incomplete",
        "sender": "hr-benefits@workday-payroll-verify.org",
        "return_path": "attacker@compromised-vps.cn",
        "body": "Attention Team Member: We experienced an error synchronizing your banking direct deposit routing number for this bi-weekly payroll cycle. To prevent payroll rejection, log in to your employee self-service portal immediately: http://workday.secure-payroll-auth.info/login",
        "headers": {
            "Received": [
                "from relay-shanghai.compromised-vps.cn (221.229.172.9) by mx.mycompany.org; Mon, 19 Oct 2026 09:30:11 +0800"
            ],
            "Authentication-Results": "spf=fail; dkim=fail; dmarc=fail",
            "X-Mailer": "DirectMail Engine 4.2"
        },
        "origin_ip": "221.229.172.9",
        "target_ip": "52.95.110.1",
        "label": 1,
        "threat_type": "Payroll & HR Phishing",
        "urgency_score": 89
    },
    {
        "id": "EML-PHISH-004",
        "subject": "PayPal: Security Notification - Unauthorized Transaction Suspended",
        "sender": "service-intl@paypa1-security-verification.com",
        "return_path": "bounces@fraud-network.ru",
        "body": "We detected an unauthorized payment of $849.99 USD to Coinbase Inc from an unrecognized device in Vladivostok. If you did not authorize this payment, cancel immediately by entering your one-time PIN and credit card details: https://paypal.dispute-resolution-case892.xyz/cancel",
        "headers": {
            "Received": [
                "from host42.fraud-network.ru (195.54.160.89) by inbound.mail.com; Mon, 19 Oct 2026 08:15:22 +0300"
            ],
            "Authentication-Results": "spf=fail; dkim=none; dmarc=fail",
            "X-Mailer": "Exim 4.89"
        },
        "origin_ip": "195.54.160.89",
        "target_ip": "198.51.100.25",
        "label": 1,
        "threat_type": "Brand Impersonation / Fake Transaction Alert",
        "urgency_score": 95
    },
    {
        "id": "EML-PHISH-005",
        "subject": "Your Netflix Membership is On Hold: Update Payment Method",
        "sender": "no-reply@netflx-billing-update.cc",
        "return_path": "support@spam-cluster.nl",
        "body": "We were unable to validate your monthly billing details. Your streaming service has been temporarily restricted. Restore your access within 24 hours to avoid account termination: http://netflix.member-renew-id77.click/reactivate",
        "headers": {
            "Received": [
                "from server99.spam-cluster.nl (45.154.255.71) by mail.consumer.net; Sun, 18 Oct 2026 22:45:10 +0200"
            ],
            "Authentication-Results": "spf=neutral; dkim=fail; dmarc=none",
            "X-Mailer": "Postfix"
        },
        "origin_ip": "45.154.255.71",
        "target_ip": "192.0.2.14",
        "label": 1,
        "threat_type": "Consumer Brand Scam",
        "urgency_score": 88
    }
]

# Generate synthetic variations to complete 50 phishing emails
phish_subjects = [
    "IRS Final Notice: Outstanding Tax Penalty Assessment",
    "DHL Express: Shipment #89218 Failed Delivery Attempt",
    "Wells Fargo: Restricted Access On Checking Account #***902",
    "DocuSign: Confidential Signature Requested by Management",
    "IT Helpdesk: Mandatory VPN Certificate Upgrade",
    "Amazon Prime: Verification of $1,299 Apple MacBook Order",
    "Google Workspace: Critical Security Patch Required for Admin",
    "Zoom Video Communications: Recorded Meeting Cloud File Ready",
    "Internal Revenue Service: Electronic Refund Deposit Code",
    "LinkedIn: 14 Recruiter Inquiries Waiting on Inactive Profile",
    "Citibank: Security Compromise on Corporate Debit Card",
    "FedEx Tracking: Re-confirm Delivery Address with Fee",
    "SharePoint: Shared Confidential Board Meeting Minutes.pdf.exe",
    "Cisco Webex: Voicemail Notification from Unknown Caller",
    "Apple ID: New Login from iPhone 16 Pro in Ho Chi Minh City",
    "Meta for Business: Your Facebook Ad Account is Flagged",
    "Chase Online: Suspicious ACH Withdrawal Pending Approval",
    "Adobe Creative Cloud: License Renewal Payment Declined",
    "Slack Technologies: Security Session Revoked - Re-authenticate",
    "Dropbox Transfer: 1.2 GB of Financial Documents Sent to You",
    "Microsoft Teams: You were mentioned in Emergency Incident Chat",
    "Bank of America: Identity Verification Form Required",
    "Stripe Billing: Payout Failed for Transaction Batch #441",
    "Outlook Web App: Quarantine Notice - 7 Blocked Inbound Messages",
    "Government Pension: Cost-of-Living Adjustment Enrollment",
    "Norton LifeLock: Subscription Auto-Renewed for $499.00",
    "McAfee Total Protection: Antivirus Expired - Virus Detected",
    "USPS Alert: Package Held at Hub Due to Missing Street Number",
    "GitHub Support: Token Leakage Detected in Public Repository",
    "Okta Identity: Push Notification Denied - Verify Device",
    "Coinbase Global: ETH Withdrawal of 4.5 ETH Initiated",
    "Binance Security: New API Key Created with Trading Privileges",
    "Standard Chartered: OTP Request for Wire Transfer",
    "AT&T Wireless: Payment Declined - Line Suspension Imminent",
    "Salesforce CRM: Lead Distribution Quota Reset Notice",
    "Atlassian Jira: Critical Security Advisory CVE-2026-9912",
    "ServiceNow: Ticket #INC-90182 Escalated to Executive Level",
    "Capital One: Fraud Alert - Confirm Transaction of $620 at Target",
    "Expedia Partner: Reservation Cancelled by Guest - Refund Query",
    "Internal Audit Department: Mandatory Anti-Bribery Compliance Sign-off",
    "Health Insurance Exchange: Action Required to Retain Coverage",
    "KAVACH Security Test: Simulated Phishing Drill Attack Vector",
    "Kroger Rewards: You have $150 in Unclaimed Grocery Credit",
    "Zelle Pay: Transfer of $350.00 Received from Unknown Sender",
    "VMware vCenter: Host Certificate Validation Error"
]

phish_senders = [
    "alert@irs-gov-tax-refund.org", "tracking@dhl-delivery-status.info", "security@wellsfargo-auth-online.cc",
    "notifications@docusign-envelope-review.net", "it-support@corp-global-network.top", "orders@amazon-fulfillment-verify.com",
    "admin@workspace-google-security.xyz", "recordings@zoom-cloud-meeting.org", "refund@irs-treasury-notice.cc",
    "connections@linkedin-career-network.info", "fraud@citibank-alert-verification.com", "redelivery@fedex-shipping-update.xyz",
    "sharepoint@microsoft-cloud-doc.click", "voicemail@webex-notification.net", "security@apple-id-cloud-guard.org",
    "support@meta-business-ads-center.info", "security@chase-bank-verify.top", "billing@adobe-subscription-alert.cc",
    "admin@slack-workspaces-auth.xyz", "transfers@dropbox-cloud-storage.click", "teams-notification@ms-teams-live.net",
    "identity@bankofamerica-secure-login.org", "payouts@stripe-merchant-notice.info", "postmaster@exchange-quarantine-filter.com",
    "claims@pension-adjustment-benefits.org", "invoicing@norton-lifelock-renewal.top", "alerts@mcafee-antivirus-support.click",
    "delivery@usps-tracking-package-hub.info", "security@github-repo-scan.cc", "mfa@okta-verification-service.xyz",
    "withdrawals@coinbase-security-desk.net", "api-guard@binance-security-alerts.org", "fraud@standardchartered-secure.top",
    "billing@att-wireless-services.info", "system@salesforce-crm-alerts.xyz", "security@atlassian-advisories.net",
    "service-desk@servicenow-escalations.org", "alerts@capitalone-fraud-monitor.cc", "bookings@expedia-partner-reservations.xyz",
    "compliance@internal-audit-verification.top", "enrollment@healthcare-coverage-update.org", "drill@phish-sim-test-domain.net",
    "rewards@kroger-grocery-points.click", "transactions@zelle-payment-receipt.xyz", "vcenter@vmware-infrastructure.cc"
]

phish_ips = [
    "185.190.141.22", "194.38.20.15", "109.236.88.19", "45.142.122.9", "185.244.30.12",
    "193.36.119.4", "195.123.218.7", "185.220.100.252", "194.26.29.98", "45.154.255.10",
    "185.161.211.5", "193.106.191.80", "195.201.10.45", "176.119.1.88", "185.143.223.19",
    "194.135.25.10", "45.95.169.11", "185.246.221.7", "193.106.191.14", "185.153.199.2",
    "185.220.101.5", "194.26.29.41", "185.161.211.90", "195.54.160.101", "45.154.255.44",
    "185.190.141.67", "194.38.20.88", "109.236.88.54", "45.142.122.33", "185.244.30.40",
    "193.36.119.50", "195.123.218.89", "185.220.100.11", "194.26.29.77", "45.154.255.99",
    "185.161.211.12", "193.106.191.105", "195.201.10.77", "176.119.1.102", "185.143.223.45",
    "194.135.25.66", "45.95.169.30", "185.246.221.49", "193.106.191.60", "185.153.199.88"
]

for idx, (subj, sndr, o_ip) in enumerate(zip(phish_subjects, phish_senders, phish_ips), start=6):
    BASELINE_EMAILS.append({
        "id": f"EML-PHISH-{idx:03d}",
        "subject": subj,
        "sender": sndr,
        "return_path": f"bounce@{sndr.split('@')[-1]}",
        "body": f"Urgent security notice regarding your profile: please follow this link to verify immediate identity: http://{sndr.split('@')[-1]}/verify?token=SEC_{idx*1039}. Failure to complete within 24 hours will lead to permanent suspension.",
        "headers": {
            "Received": [
                f"from malicious-mta.{sndr.split('@')[-1]} ({o_ip}) by target-mx.defense.gov id x{idx*91}; Sun, 18 Oct 2026 12:{idx:02d}:00 +0000"
            ],
            "Authentication-Results": "spf=fail; dkim=fail; dmarc=fail",
            "X-Mailer": "MassMailer/3.1"
        },
        "origin_ip": o_ip,
        "target_ip": "140.82.112.4",
        "label": 1,
        "threat_type": "Phishing & Credential Harvest",
        "urgency_score": 85 + (idx % 15)
    })

# --- 50 LEGITIMATE EMAILS ---
legit_samples = [
    {
        "id": "EML-LEGIT-001",
        "subject": "Engineering Sprint Planning - Q4 Roadmap Review",
        "sender": "alex.rivera@technology-innovations.com",
        "return_path": "alex.rivera@technology-innovations.com",
        "body": "Hi Team, Tomorrow at 10:00 AM PST we will meet for the bi-weekly sprint retrospective and backlog grooming. Please review the updated Jira tickets and ensure story points are finalized. See attached architecture diagram for reference. Best, Alex Rivera, Lead Architect",
        "headers": {
            "Received": [
                "from mail-wm1-f44.google.com (209.85.128.44) by mx.technology-innovations.com id 82193; Mon, 19 Oct 2026 16:30:00 -0700"
            ],
            "Authentication-Results": "spf=pass (google.com: domain of alex.rivera@technology-innovations.com designates 209.85.128.44 as permitted sender); dkim=pass header.i=@technology-innovations.com; dmarc=pass",
            "X-Mailer": "Gmail Web Interface"
        },
        "origin_ip": "209.85.128.44",
        "target_ip": "142.250.190.46",
        "label": 0,
        "threat_type": "Legitimate / Normal Workflow",
        "urgency_score": 12
    },
    {
        "id": "EML-LEGIT-002",
        "subject": "Amazon Web Services: Monthly Billing Statement for Account #9812",
        "sender": "no-reply-aws@amazon.com",
        "return_path": "bounces+9812@bounces.amazon.com",
        "body": "Greetings from Amazon Web Services. This is your billing statement for the month of September 2026. The total amount of $341.22 has been charged to your payment card ending in 4109. You can download your detailed PDF invoice from the AWS Management Console.",
        "headers": {
            "Received": [
                "from a10-45.smtp-out.amazonses.com (54.240.10.45) by mx.mycorp.org; Mon, 19 Oct 2026 04:00:15 +0000"
            ],
            "Authentication-Results": "spf=pass; dkim=pass header.d=amazon.com; dmarc=pass",
            "X-Mailer": "AmazonSES"
        },
        "origin_ip": "54.240.10.45",
        "target_ip": "198.51.100.1",
        "label": 0,
        "threat_type": "Legitimate / Routine Notification",
        "urgency_score": 10
    },
    {
        "id": "EML-LEGIT-003",
        "subject": "Lunch & Learn: Introduction to Vector Databases & Embeddings",
        "sender": "dev-relations@internal-university.edu",
        "return_path": "dev-relations@internal-university.edu",
        "body": "Hello Everyone! Join us this Thursday in Conference Room 3B (or via the regular Google Meet link) for a session on scalable semantic search, ChromaDB, and Pinecone. Pizza will be provided. RSVP on the calendar invite.",
        "headers": {
            "Received": [
                "from smtp.internal-university.edu (128.197.27.18) by mail.internal-university.edu; Mon, 19 Oct 2026 12:00:00 -0400"
            ],
            "Authentication-Results": "spf=pass; dkim=pass; dmarc=pass",
            "X-Mailer": "Outlook 365"
        },
        "origin_ip": "128.197.27.18",
        "target_ip": "128.197.27.1",
        "label": 0,
        "threat_type": "Legitimate / Community",
        "urgency_score": 5
    },
    {
        "id": "EML-LEGIT-004",
        "subject": "GitHub: [kavach-security] Pull Request #14 Merged by Sameeraj",
        "sender": "notifications@github.com",
        "return_path": "noreply@github.com",
        "body": "Sameeraj merged commit a9f012b into main: 'Implement Real-Time ASTRALIS 3D Spatial Reconnaissance View with Three.js HUD'. View changes on GitHub: https://github.com/kavach-defense/kavach/pull/14",
        "headers": {
            "Received": [
                "from smtp.github.com (140.82.112.21) by mx.developer.net; Mon, 19 Oct 2026 18:22:01 +0000"
            ],
            "Authentication-Results": "spf=pass; dkim=pass header.d=github.com; dmarc=pass",
            "X-Mailer": "GitHub Notification Engine"
        },
        "origin_ip": "140.82.112.21",
        "target_ip": "104.244.42.129",
        "label": 0,
        "threat_type": "Legitimate / CI/CD & Development",
        "urgency_score": 8
    },
    {
        "id": "EML-LEGIT-005",
        "subject": "Quarterly Financial Results - Q3 All-Hands Presentation",
        "sender": "investor-relations@enterprise-global.com",
        "return_path": "ir@enterprise-global.com",
        "body": "Dear Colleagues, Please find attached the presentation deck summarizing our Q3 financial performance. Key highlights include 28% year-over-year revenue growth and the expansion of our AI Cyber Defense division. Have a great week.",
        "headers": {
            "Received": [
                "from mail.enterprise-global.com (198.51.100.88) by mx.internal-corp.net; Mon, 19 Oct 2026 09:15:00 +0000"
            ],
            "Authentication-Results": "spf=pass; dkim=pass; dmarc=pass",
            "X-Mailer": "Microsoft Exchange Server 2019"
        },
        "origin_ip": "198.51.100.88",
        "target_ip": "198.51.100.1",
        "label": 0,
        "threat_type": "Legitimate / Corporate Memo",
        "urgency_score": 15
    }
]

for s in legit_samples:
    BASELINE_EMAILS.append(s)

legit_topics = [
    ("Design System Review - Dark Mode Color Palette Specs", "priya.sharma@creative-studio.io", "204.79.197.200"),
    ("Invitation: Security Architecture Working Group Call", "marcus.vance@cyber-consortium.org", "199.16.156.10"),
    ("Your Weekly Digest: Top 5 Papers in Computer Vision", "newsletter@arxiv-digest.org", "140.211.9.88"),
    ("Customer Feedback Summary: September Release v2.4", "rachel.adams@saas-metrics.com", "13.107.42.14"),
    ("Notice of Annual General Meeting and Proxy Vote", "governance@corporate-board.com", "20.190.151.68"),
    ("Slack Notification: New message in #cyber-defense-team", "notifications@slack.com", "54.192.150.12"),
    ("Your Uber Receipt for Friday Evening Ride", "uber.us@uber.com", "104.36.195.10"),
    ("Stripe: Payment of $49.00 confirmed for Pro Subscription", "receipts@stripe.com", "54.187.159.20"),
    ("Google Calendar: Antigravity Demo Rehearsal @ 3:00pm", "calendar-notification@google.com", "172.217.16.206"),
    ("Statuspage Incident Update: All API Services Operational", "updates@statuspage.io", "151.101.65.140"),
    ("New Comment on Figma Project: ASTRALIS 3D Recon UI Mockup", "notifications@figma.com", "151.101.1.91"),
    ("Atlassian Bitbucket: Pipeline #4821 Passed Successfully", "notifications@bitbucket.org", "18.205.93.0"),
    ("Your Spotify Family Plan Monthly Receipt", "no-reply@spotify.com", "35.186.224.25"),
    ("Docker Hub: Automated Build Finished for kavach-core", "no-reply@docker.com", "52.84.150.80"),
    ("HR Announcement: Wellness Day Observed on October 25", "hr-director@corporate-enterprise.com", "64.233.160.26"),
    ("IEEE Computer Society: Call for Papers - Deepfake Forensics", "editorial@ieee.org", "140.98.193.100"),
    ("DigitalOcean: Backup completed for droplet kavach-node-01", "support@digitalocean.com", "198.41.215.162"),
    ("Twilio: Account balance threshold notification", "billing@twilio.com", "54.244.50.10"),
    ("Python Software Foundation: PyCon 2027 Registration Open", "conference@python.org", "151.101.0.223"),
    ("Notion: Dipanshu shared page 'KAVACH Technical Specs'", "notify@notion.so", "104.18.22.40"),
    ("Datadog Alert Resolved: CPU Utilization Normalized on Cluster", "alerts@datadoghq.com", "52.204.100.80"),
    ("Coursera: Keep up your momentum in Deep Learning Specialization", "recommendations@coursera.org", "54.230.159.100"),
    ("Cloudflare: Security Analytics Report for Last 30 Days", "no-reply@cloudflare.com", "104.16.124.96"),
    ("Asana: Task 'Implement Sherloq ELA Heatmaps' Assigned to You", "notifications@asana.com", "54.240.38.10"),
    ("LinkedIn: 3 People viewed your profile this week", "messages-noreply@linkedin.com", "108.174.10.10"),
    ("Sentry: Issue #402 resolved in production release", "app@getsentry.com", "35.190.247.1"),
    ("Medium Daily Digest: What's New in Spatial Computing", "digest@medium.com", "162.159.153.4"),
    ("Your Receipt from Apple Store for iCloud+ 200GB", "no_reply@email.apple.com", "17.171.108.20"),
    ("Stack Overflow: You earned a badge 'Research Specialist'", "do-not-reply@stackoverflow.email", "151.101.129.69"),
    ("Zendesk: Your support ticket #8291 has been marked solved", "support@zendesk.com", "192.161.144.10"),
    ("Tableau Public: Your dashboard 'Cyber Attack Map' was featured", "marketing@tableau.com", "54.240.11.15"),
    ("JetBrains: Your PyCharm Professional License Auto-Renewed", "sales@jetbrains.com", "52.84.160.20"),
    ("USPS Delivery Confirmation: Package Delivered to Front Door", "auto-reply@usps.gov", "56.0.12.80"),
    ("OpenAI API: Monthly Usage Summary for Org org-kavach99", "support@openai.com", "104.18.7.192"),
    ("Vercel: Deployment kavach-hud-preview completed successfully", "notifications@vercel.com", "76.76.21.21"),
    ("LeetCode: Weekly Contest 412 Rankings Announced", "support@leetcode.com", "104.18.25.10"),
    ("Hugging Face: New Model Release - Whisper-Large-v4", "news@huggingface.co", "18.66.122.90"),
    ("New York Times: Evening Briefing - Global Tech Developments", "nytdirect@nytimes.com", "151.101.65.164"),
    ("HashiCorp Terraform Cloud: Workspace plan finished with 0 errors", "no-reply@hashicorp.com", "52.85.110.40"),
    ("Postman: Yashashvi shared API Collection 'KAVACH Endpoints'", "notifications@postman.com", "54.240.14.8"),
    ("NVIDIA Developer: CUDA 13.0 Toolkit Now Available for Download", "developer@nvidia.com", "192.229.211.108"),
    ("ACM TechNews: Advances in Quantum Resistance and Cryptography", "technews@acm.org", "199.167.75.10"),
    ("Airbnb: Reservation Confirmed for Hackathon Weekend", "automated@airbnb.com", "54.240.27.10"),
    ("Grammarly: Your weekly writing report is here!", "insights@grammarly.com", "54.240.9.112"),
    ("Team Kavach: Let's finalize our slide presentation!", "shubh.verma@college.edu", "204.79.197.200")
]

for idx, (subj, sndr, o_ip) in enumerate(legit_topics, start=6):
    BASELINE_EMAILS.append({
        "id": f"EML-LEGIT-{idx:03d}",
        "subject": subj,
        "sender": sndr,
        "return_path": sndr,
        "body": f"Hello, this is an official routine notification regarding {subj}. No further emergency actions are necessary. If you have questions, please contact our support team. Best regards, {sndr.split('@')[0].capitalize()}",
        "headers": {
            "Received": [
                f"from corporate-relay.{sndr.split('@')[-1]} ({o_ip}) by defense-mx.internal id msg_{idx*102}; Mon, 19 Oct 2026 10:{idx:02d}:00 +0000"
            ],
            "Authentication-Results": "spf=pass; dkim=pass; dmarc=pass",
            "X-Mailer": "Enterprise Mail Gateway 2026"
        },
        "origin_ip": o_ip,
        "target_ip": "142.250.190.46",
        "label": 0,
        "threat_type": "Legitimate",
        "urgency_score": 5 + (idx % 12)
    })

class EmailDatasetManager:
    """Manages the 100 baseline emails and dynamic test additions for live evaluation."""
    def __init__(self):
        self._dataset = copy.deepcopy(BASELINE_EMAILS)

    def get_all(self) -> List[Dict[str, Any]]:
        return self._dataset

    def get_counts(self) -> Dict[str, int]:
        total = len(self._dataset)
        phishing = sum(1 for e in self._dataset if e["label"] == 1)
        legit = total - phishing
        return {"total": total, "phishing": phishing, "legitimate": legit}

    def add_sample(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Dynamically add an email to dataset (for user-requested dynamic testing & retraining)."""
        new_id = f"EML-DYNAMIC-{len(self._dataset) + 1:03d}"
        item = copy.deepcopy(email_data)
        item["id"] = new_id
        if "label" not in item:
            item["label"] = 1 if item.get("predicted_label") == "PHISHING" else 0
        self._dataset.append(item)
        return item

    def reset_to_baseline(self):
        self._dataset = copy.deepcopy(BASELINE_EMAILS)

dataset_manager = EmailDatasetManager()
