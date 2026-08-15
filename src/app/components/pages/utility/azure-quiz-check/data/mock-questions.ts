import { QuizQuestion } from '../models/quiz.model';

export const MOCK_AZURE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'AZ-Q001',
    domain: 'Enterprise Solution Architecture & Scalability',
    question: 'An enterprise multi-tier e-commerce workload hosted on Azure Kubernetes Service (AKS) requires active-active multi-region deployment with automated failover and minimal RPO/RTO. What is the recommended traffic routing and database replication architecture?',
    options: [
      'Azure Front Door (AFD) with global anycast routing and health probes, paired with Azure Cosmos DB with multi-region writes and strong consistency.',
      'Azure Traffic Manager with DNS failover and Azure SQL Database Geo-Replication with manual failover groups.',
      'Azure Application Gateway with Multi-Region Peering and single-region Azure Database for PostgreSQL Flexible Server.',
      'Azure Load Balancer (Standard) with cross-region load balancing and Azure Blob Storage GRS replication.'
    ],
    correctIndex: 0,
    explanation: 'Azure Front Door provides Layer 7 global routing with instant anycast failover based on health probes. Azure Cosmos DB with multi-region writes guarantees active-active distributed data persistence with sub-10ms latencies across regions, meeting enterprise RTO/RPO objectives.',
    difficulty: 'Enterprise Architect (L400)'
  },
  {
    id: 'AZ-Q002',
    domain: 'Enterprise Solution Architecture & Scalability',
    question: 'A financial institution is migrating a high-throughput transaction processing engine to Azure. The system requires sub-millisecond compute latency, dedicated single-tenant hardware, and network throughput exceeding 100 Gbps. Which Azure compute and networking configuration is appropriate?',
    options: [
      'Standard D-series VMs in a Virtual Machine Scale Set with Accelerated Networking enabled.',
      'Azure Dedicated Host with FX-series or M-series VMs, Accelerated Networking, and Proximity Placement Groups.',
      'Azure App Service Isolated Plan (ASEv3) with private endpoints and express vNet integration.',
      'Azure Container Instances deployed in a dedicated Virtual Network with Standard SKU.'
    ],
    correctIndex: 1,
    explanation: 'Azure Dedicated Host provides single-tenant physical servers for isolation and compliance. FX/M-series compute optimizes single-core performance, Proximity Placement Groups guarantee ultra-low inter-VM latency, and Accelerated Networking delivers up to 100+ Gbps throughput.',
    difficulty: 'Enterprise Architect (L400)'
  },
  {
    id: 'AZ-Q003',
    domain: 'Cloud Governance, FinOps & CAF',
    question: 'An enterprise organization with 80+ Azure subscriptions across 5 business units wants to enforce consistent security controls, tag inheritance, and cost boundaries without disrupting DevOps developer agility. What hierarchy should the architect design?',
    options: [
      'Create a single Root Management Group and assign Owner permissions to all team leads.',
      'Implement Azure Landing Zones (CAF) with a structured Management Group hierarchy (Core, Platform, Workloads, Sandbox) using Azure Policy initiatives and RBAC inheritance.',
      'Deploy Azure Automation runbooks that scan subscriptions hourly and delete non-compliant resources.',
      'Configure Azure Cost Management budgets on resource groups with automated subscription suspension webhooks.'
    ],
    correctIndex: 1,
    explanation: 'The Cloud Adoption Framework (CAF) Azure Landing Zone architecture establishes a scalable Management Group hierarchy (Platform: Management, Connectivity, Identity vs Workloads/Landing Zones) where governance policies and RBAC are assigned centrally at management group levels and inherited systematically.',
    difficulty: 'Enterprise Architect (L400)'
  },
  {
    "id": "AZ-Q004",
    "domain": "Cloud Governance, FinOps & CAF",
    "question": "To optimize cloud spend on a fleet of predictable production Azure VMs and Azure SQL Databases running 24/7 over a 3-year horizon, which FinOps strategy yields the maximum cost reduction?",
    "options": [
      "Use Spot Virtual Machines for production database workloads.",
      "Combine Azure Savings Plans for compute flexibility with 3-Year Azure Reserved VM Instances (RI) and Azure Hybrid Benefit (AHB) for Windows Server & SQL Server.",
      "Configure Azure Auto-Shutdown schedules on all production domain controllers and databases.",
      "Migrate all VMs to Basic SKU tier with standard HDD managed disks."
    ],
    "correctIndex": 1,
    "explanation": "Combining 3-Year Reserved Instances (RIs) or Azure Savings Plans with Azure Hybrid Benefit (leveraging existing on-prem SA licenses) can save up to 80% over pay-as-you-go rates for steady-state 24/7 production workloads.",
    "difficulty": "Enterprise Architect (L300)"
  },
  {
    "id": "AZ-Q005",
    "domain": "Security, Identity & Zero-Trust",
    "question": "Under a Zero-Trust architecture, an internal microservice running in Azure Container Apps must securely access secrets from Azure Key Vault and query Azure SQL without storing any database credentials, connection strings, or API tokens in code or environment variables. What is the prescribed pattern?",
    "options": [
      "Store encrypted passwords in a private GitHub repository and inject via deployment secrets.",
      "Use Azure System-Assigned Managed Identity on Container Apps with RBAC on Key Vault (Key Vault Secrets User) and Microsoft Entra ID authentication on Azure SQL.",
      "Generate a Shared Access Signature (SAS) token valid for 365 days and bake it into the container image.",
      "Deploy a custom OAuth 2.0 proxy container in the pod with a hardcoded client secret."
    ],
    "correctIndex": 1,
    "explanation": "System-Assigned Managed Identities provide automatic token acquisition via Microsoft Entra ID without secret management. Azure SQL supports native Entra ID tokens, and Key Vault RBAC ('Key Vault Secrets User') enforces least privilege without static credentials.",
    "difficulty": "Enterprise Architect (L400)"
  },
  {
    "id": "AZ-Q006",
    "domain": "Security, Identity & Zero-Trust",
    "question": "An enterprise requires all outbound internet traffic from workloads in private subnets across 10 spoke virtual networks to be inspected, logged, and filtered for URL threat intelligence. What network topology should the architect deploy?",
    "options": [
      "Attach a Public IP directly to every VM and configure local Windows/Linux iptables.",
      "Deploy Azure Virtual WAN (Secure Hub) or Hub-Spoke topology with Azure Firewall Premium and User Defined Routes (0.0.0.0/0 pointing to Azure Firewall Private IP).",
      "Configure Network Security Group (NSG) outbound rules with service tags on each subnet.",
      "Deploy NAT Gateway in each spoke subnet without centralized logging."
    ],
    "correctIndex": 1,
    "explanation": "A centralized Hub-and-Spoke or Secure Virtual WAN Hub with Azure Firewall Premium (supporting TLS inspection, IDPS, and URL filtering) combined with UDRs (0.0.0.0/0 -> Firewall IP) ensures all egress traffic is securely inspected and centralized in Log Analytics.",
    "difficulty": "Enterprise Architect (L400)"
  },
  {
    "id": "AZ-Q007",
    "domain": "DevOps, CI/CD & Service Accelerators",
    "question": "A consulting organization wants to build reusable 'Service Accelerators' for client deployments that mandate compliance with ISO 27001 and CIS benchmarks. How should the infrastructure definitions be codified and distributed?",
    "options": [
      "Maintain bash shell scripts that execute `az cli` commands manually during client workshops.",
      "Develop modular Infrastructure as Code using Bicep Modules or Terraform Verified Modules published to a Private Azure Container Registry (ACR) or Private Module Registry with automated CI validation.",
      "Export ARM templates directly from the Azure portal UI after building resources manually.",
      "Share Word documentation screenshots of the Azure Portal configuration steps."
    ],
    "correctIndex": 1,
    "explanation": "Service Accelerators rely on modular, reusable, version-controlled Bicep/Terraform modules published to private registries (e.g. Azure ACR for Bicep). Automated CI validation ensures consistency, security scanning (e.g., Checkov/Trivy), and adherence to compliance benchmarks across client engagements.",
    "difficulty": "Enterprise Architect (L400)"
  },
  {
    "id": "AZ-Q008",
    "domain": "DevOps, CI/CD & Service Accelerators",
    "question": "In a continuous deployment pipeline for mission-critical banking APIs on Azure App Service, which deployment strategy guarantees zero downtime, allows automated smoke testing on production hardware, and enables instantaneous rollback?",
    "options": [
      "Direct in-place FTP deployment over SSH.",
      "Deployment Slots with Auto-Swap and Pre-Swap Health Check endpoints combined with Azure Application Insights telemetry validation.",
      "Rolling in-place binary overwrite during weekend maintenance windows.",
      "Rebuilding the entire Resource Group on every commit."
    ],
    "correctIndex": 1,
    "explanation": "Azure App Service Deployment Slots allow deploying the new version to a staging slot, warming up cache, running integration/smoke tests on real hardware, and performing an atomic DNS swap with zero downtime and instant rollback capability.",
    "difficulty": "Enterprise Architect (L300)"
  },
  {
    "id": "AZ-Q009",
    "domain": "Data, Modern Integration & Hybrid",
    "question": "An enterprise IoT platform receives 500,000 telemetry events per second. Downstream consumers include a real-time anomaly detection stream and a cold-path parquet data lake for analytical queries. Which Azure architecture meets these dual requirements cost-effectively?",
    "options": [
      "Azure Event Hubs with Event Hubs Capture enabled (dumping to Azure Data Lake Storage Gen2) and Azure Stream Analytics / Azure Databricks for the hot path.",
      "Azure Logic Apps with HTTP triggers saving directly to Azure SQL Database.",
      "Azure Queue Storage polled every second by a single Azure Function.",
      "Azure Cosmos DB with manual ETL cron jobs exporting to CSV files."
    ],
    "correctIndex": 0,
    "explanation": "Azure Event Hubs provides massive ingestion scale (GBs/sec). Event Hubs Capture automatically routes cold data to ADLS Gen2 in Parquet/Avro without compute overhead, while Stream Analytics/Databricks consumes the hot path partition stream with sub-second latency.",
    "difficulty": "Enterprise Architect (L400)"
  },
  {
    "id": "AZ-Q010",
    "domain": "Data, Modern Integration & Hybrid",
    "question": "A healthcare client requires unified governance, policy enforcement, and inventory tracking across on-premises VMware virtual machines, AWS EC2 instances, and native Azure workloads. What Azure capability fulfills this requirement?",
    "options": [
      "Azure Site Recovery (ASR) in continuous failover simulation mode.",
      "Azure Arc-enabled Servers and Azure Arc-enabled Kubernetes integrated with Azure Policy and Microsoft Defender for Cloud.",
      "Azure ExpressRoute Direct with redundant circuits.",
      "Azure Migrate Appliance in continuous discovery mode."
    ],
    "correctIndex": 1,
    "explanation": "Azure Arc extends Azure Resource Manager control plane to non-Azure infrastructure (on-prem, AWS, GCP), enabling centralized inventory, Azure Policy compliance, guest configuration, and unified Defender for Cloud monitoring.",
    "difficulty": "Enterprise Architect (L400)"
  },
  {
    "id": "AZ-Q011",
    "domain": "Consulting, Presales & CTO Advisory",
    "question": "During a presales discovery session with a client CTO who is hesitant to migrate their legacy monolithic core system to Azure due to fear of prolonged downtime and operational disruption, what architectural strategy should you advocate as a trusted advisor?",
    "options": [
      "Recommend a 'Big Bang' full rewrite into serverless microservices over a 3-month timeline.",
      "Advocate the Strangler Fig pattern combined with Cloud Adoption Framework (CAF) iterative migration waves, starting with low-risk satellite services and API Management.",
      "Advise the client to remain completely on-premises and avoid cloud adoption.",
      "Propose lifting and shifting all physical servers to Azure IaaS without assessing network or storage performance."
    ],
    "correctIndex": 1,
    "explanation": "As a trusted advisor/CTO partner, advocating the Strangler Fig pattern allows progressive modernization behind an API gateway (e.g. Azure APIM), minimizing operational risk and business downtime while delivering incremental value in measurable CAF migration waves.",
    "difficulty": "Enterprise Architect (L400)"
  },
  {
    "id": "AZ-Q012",
    "domain": "Consulting, Presales & CTO Advisory",
    "question": "When developing an enterprise Azure Go-To-Market (GTM) strategy and RFP estimation model for a Fortune 500 digital transformation bid, which set of architectural artifacts is essential for executive sign-off?",
    "options": [
      "Only the Azure Pricing Calculator URL export.",
      "Target Architecture Blueprint (High-Level Design & Component Architecture), Bill of Materials (BOM), Total Cost of Ownership (TCO) ROI analysis, Risk & Mitigation Matrix, and Phased Execution Roadmap.",
      "A raw Git commit log and sample C# codebase.",
      "A list of Azure certified employees without solution scope."
    ],
    "correctIndex": 1,
    "explanation": "Executive proposals require high-level design (HLD) blueprints, an itemized BOM, TCO/ROI comparative financial justification, comprehensive risk governance, and a clear phased migration/delivery roadmap to align with CIO/CTO business objectives.",
    "difficulty": "Enterprise Architect (L400)"
  },
  {
    "id": "AZ-Q013",
    "domain": "Enterprise Solution Architecture & Scalability",
    "question": "A global retail application experiences sudden 10x traffic spikes during flash sales. To protect the backend order processing service from database connection exhaustion and thread starvation, which architectural pattern should be applied?",
    "options": [
      "Cache-Aside Pattern with Azure Cache for Redis and Queue-Based Load Leveling using Azure Service Bus FIFO Queues.",
      "Direct synchronous REST calls from browser clients to Azure SQL stored procedures.",
      "Increasing the VM size of the web tier manually during the sale.",
      "Disabling database foreign key constraints during peak hours."
    ],
    "correctIndex": 0,
    "explanation": "The Queue-Based Load Leveling pattern uses Azure Service Bus queues to decouple high-volume ingestion from backend workers, smoothing out traffic spikes. Cache-Aside with Redis reduces repetitive read queries on the relational database.",
    "difficulty": "Enterprise Architect (L300)"
  },
  {
    "id": "AZ-Q014",
    "domain": "Security, Identity & Zero-Trust",
    "question": "An architect must ensure that administrative access to Azure production subscriptions cannot be permanently assigned to any user and requires Multi-Factor Authentication (MFA), manager approval, and automatic revocation after 4 hours. Which service must be configured?",
    "options": [
      "Microsoft Entra Privileged Identity Management (PIM) with Just-In-Time (JIT) eligible role assignments and approval workflows.",
      "Standard Azure RBAC permanent Role Assignments with Owner role.",
      "Custom PowerShell scripts executed via Windows Task Scheduler.",
      "Azure Bastion host with local administrator accounts."
    ],
    "correctIndex": 0,
    "explanation": "Microsoft Entra PIM enables Just-In-Time (JIT) privilege elevation, enforcing time-bound role activations (e.g. max 4 hours), mandatory MFA, ticket justifications, approval chains, and comprehensive audit logs.",
    "difficulty": "Enterprise Architect (L300)"
  },
  {
    "id": "AZ-Q015",
    "domain": "Cloud Governance, FinOps & CAF",
    "question": "An enterprise policy requires all Azure resources in non-production subscriptions to have a valid 'Environment' tag (Dev/QA/UAT) and 'Owner' tag. If resources are deployed without tags, the policy must automatically remediate and inherit tags from the parent resource group. Which Azure Policy effect should be used?",
    "options": [
      "AuditIfNotExists",
      "Modify / Append with remediation task",
      "Deny",
      "Disabled"
    ],
    "correctIndex": 1,
    "explanation": "The 'Modify' or 'Append' policy effects with managed identity remediation tasks allow Azure Policy to automatically inject and inherit missing tags from parent Resource Groups during deployment or through manual/scheduled remediation tasks.",
    "difficulty": "Enterprise Architect (L300)"
  },
  {
    "id": "AZ-Q016",
    "domain": "Data, Modern Integration & Hybrid",
    "question": "A microservices platform needs to publish domain business events to 15 different downstream subscriber microservices across various Azure regions with filtering capabilities on event headers without subscribers receiving unwanted messages. Which integration service is purpose-built for this?",
    "options": [
      "Azure Event Grid with custom topics, event subscriptions, and advanced attribute filtering.",
      "Azure Storage Queues with single consumer polling.",
      "Point-to-point HTTP webhook polling in a loop.",
      "Azure Relay Hybrid Connections."
    ],
    "correctIndex": 0,
    "explanation": "Azure Event Grid is a fully managed reactive pub/sub event broker that supports massive scale, push-push delivery, dead-lettering, and rich JSON/CloudEvents attribute filtering so subscribers only receive relevant domain events.",
    "difficulty": "Enterprise Architect (L300)"
  },
  {
    "id": "AZ-Q017",
    "domain": "DevOps, CI/CD & Service Accelerators",
    "question": "In an enterprise Azure DevOps multi-stage YAML pipeline, what security mechanism should be implemented so that deployment jobs can access Azure Resource Manager without storing long-lived client secrets in service connections?",
    "options": [
      "Workload Identity Federation (OIDC) service connection between Azure DevOps / GitHub and Microsoft Entra ID.",
      "Hardcoding a Service Principal Client Secret in the pipeline YAML file.",
      "Using personal Microsoft accounts (MSA) with 2-factor authentication prompts during build execution.",
      "Storing the subscription master management certificate in plain text artifact."
    ],
    "correctIndex": 0,
    "explanation": "Workload Identity Federation uses OpenID Connect (OIDC) short-lived tokens exchanged directly with Microsoft Entra ID, completely eliminating the need to generate, store, rotate, or manage long-lived secrets in CI/CD pipelines.",
    "difficulty": "Enterprise Architect (L400)"
  },
  {
    "id": "AZ-Q018",
    "domain": "Enterprise Solution Architecture & Scalability",
    "question": "Which disaster recovery strategy provides the highest availability (RPO near 0, RTO near 0) for a mission-critical Azure solution across two paired regions, and what is its trade-off?",
    "options": [
      "Cold Standby (Backup/Restore); Lowest operational complexity.",
      "Active-Active Multi-Region (Hot-Hot) with distributed data synchronization; Highest cost and design complexity for data conflict resolution.",
      "Pilot Light (Minimal Core Running); Instant automatic DNS switchover with zero lag.",
      "Warm Standby; Free of charge Azure disaster recovery tier."
    ],
    "correctIndex": 1,
    "explanation": "Active-Active (Hot-Hot) deployment serves live traffic in multiple regions simultaneously, achieving near-zero RTO/RPO. The trade-off is significantly higher operational cost (2x infrastructure) and complexity in managing distributed database consistency and conflict resolution.",
    "difficulty": "Enterprise Architect (L400)"
  },
  {
    "id": "AZ-Q019",
    "domain": "Security, Identity & Zero-Trust",
    "question": "An enterprise requires all communication between Azure VMs in a spoke Virtual Network and Azure Storage / Azure Key Vault to traverse Microsoft backbone network and be completely inaccessible from public internet IP addresses. What should be provisioned?",
    "options": [
      "Azure Private Endpoints (Azure Private Link) with Private DNS Zones integrated into the Virtual Network.",
      "Opening Storage Account firewall to '0.0.0.0/0' and using HTTPS.",
      "Assigning Public IPs to all VMs and creating an NSG rule for port 443.",
      "Deploying a public VPN gateway in the default subnet."
    ],
    "correctIndex": 0,
    "explanation": "Azure Private Link brings Azure PaaS services (Storage, Key Vault, SQL) directly into the customer's private VNet using a private IP address. Combined with Private DNS Zones, traffic never leaves the Microsoft backbone, and public endpoint access can be completely disabled.",
    "difficulty": "Enterprise Architect (L300)"
  },
  {
    "id": "AZ-Q020",
    "domain": "Consulting, Presales & CTO Advisory",
    "question": "In leading technical teams and fostering cloud architecture excellence across an engineering organization (as required in the Orion GROW framework), which practice best accelerates team skills and ensures consistent architectural quality across client deliverables?",
    "options": [
      "Prohibiting team members from making technical decisions without executive sign-off.",
      "Establishing an Architecture Review Board (ARB), holding regular Architecture Katas/Guild sessions, providing mentorship on certifications (e.g. AZ-305), and building reusable reference architectures.",
      "Assigning all client technical tasks strictly to senior architects without junior involvement.",
      "Replacing all architectural documentation with verbal handoffs."
    ],
    "correctIndex": 1,
    "explanation": "Establishing an Architecture Review Board (ARB), holding hands-on Architecture Katas, active coaching/mentoring toward professional certifications (AZ-305), and building reusable reference assets elevates organizational capability and aligns with Orion's GROW values.",
    "difficulty": "Enterprise Architect (L400)"
  }
];
