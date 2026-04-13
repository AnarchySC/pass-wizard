/* Pass Wizard — Skill Tree module.
 *
 * Migrated from AnarchySC/Skilltwee-AZ104. The skill taxonomy, quest lists,
 * resource links, and 80%-per-tier unlock rule are preserved verbatim. The
 * visual language is re-skinned via css/skill-tree.css to match Pass Wizard
 * tokens. Progress persists via the shared pw store under
 * data.skillTree = { xp, unlocked: [skillId], quests: { questId: true } }.
 *
 * Exposed API: PWSkillTree.mount({ exam, container })
 *
 * Exam data is currently hardcoded for AZ-104. When a second exam gets a
 * skill tree, move SKILL_TREES into exams/<slug>/skill-tree.json and fetch
 * based on examMeta.slug.
 */

const PW_SKILL_TREE_AZ104 = {
  tierUnlockThreshold: 0.8,
  tiers: [
    {
      level: 1,
      title: 'Identity & Governance (15-20%)',
      skills: [
        { id: 'azure-ad',          icon: '🔐', name: 'Azure AD',         desc: 'Users, groups, guest accounts',       xp: 20 },
        { id: 'rbac',              icon: '🎭', name: 'RBAC',             desc: 'Roles, assignments, custom roles',    xp: 25 },
        { id: 'management-groups', icon: '🏢', name: 'Management Groups',desc: 'Hierarchy, inheritance',              xp: 15 },
        { id: 'azure-policy',      icon: '📜', name: 'Azure Policy',     desc: 'Compliance, initiatives, remediation',xp: 20 },
        { id: 'resource-locks',    icon: '🔒', name: 'Resource Locks',   desc: 'CanNotDelete, ReadOnly',              xp: 10 },
        { id: 'cost-management',   icon: '💰', name: 'Cost Management',  desc: 'Budgets, alerts, recommendations',    xp: 15 },
      ],
    },
    {
      level: 2,
      title: 'Storage (15-20%)',
      skills: [
        { id: 'storage-accounts', icon: '💾', name: 'Storage Accounts', desc: 'Types, replication, tiers',            xp: 25 },
        { id: 'blob-storage',     icon: '📦', name: 'Blob Storage',     desc: 'Containers, access levels, lifecycle', xp: 20 },
        { id: 'azure-files',      icon: '📁', name: 'Azure Files',      desc: 'File shares, snapshots, sync',         xp: 20 },
        { id: 'storage-security', icon: '🔑', name: 'Storage Security', desc: 'SAS, keys, firewall, encryption',      xp: 25 },
        { id: 'azcopy',           icon: '📤', name: 'AzCopy & Tools',   desc: 'Import/Export, Storage Explorer',      xp: 15 },
        { id: 'managed-disks',    icon: '💿', name: 'Managed Disks',    desc: 'Types, snapshots, encryption',         xp: 20 },
      ],
    },
    {
      level: 3,
      title: 'Compute (20-25%)',
      skills: [
        { id: 'virtual-machines', icon: '🖥️', name: 'Virtual Machines', desc: 'Create, size, availability',          xp: 30 },
        { id: 'vm-extensions',    icon: '🔧', name: 'VM Extensions',    desc: 'DSC, Custom Script, Monitoring',       xp: 20 },
        { id: 'app-service',      icon: '🌐', name: 'App Service',      desc: 'Web apps, plans, deployment',          xp: 25 },
        { id: 'containers',       icon: '🐳', name: 'Containers',       desc: 'ACI, AKS basics, ACR',                 xp: 25 },
        { id: 'scale-sets',       icon: '📊', name: 'Scale Sets',       desc: 'VMSS, autoscaling, updates',           xp: 25 },
        { id: 'availability',     icon: '⚡', name: 'High Availability',desc: 'Zones, sets, SLA',                     xp: 20 },
      ],
    },
    {
      level: 4,
      title: 'Virtual Networking (25-30%)',
      skills: [
        { id: 'virtual-networks', icon: '🌐', name: 'Virtual Networks', desc: 'VNets, subnets, IP addressing',        xp: 35 },
        { id: 'network-security', icon: '🛡️', name: 'Network Security',desc: 'NSGs, ASGs, rules',                    xp: 30 },
        { id: 'load-balancing',   icon: '⚖️', name: 'Load Balancing',  desc: 'Azure LB, App Gateway, Traffic Mgr',   xp: 30 },
        { id: 'vpn-gateway',      icon: '🔐', name: 'VPN Gateway',      desc: 'S2S, P2S, ExpressRoute',               xp: 25 },
        { id: 'dns',              icon: '🌍', name: 'Azure DNS',        desc: 'Zones, records, private DNS',          xp: 20 },
        { id: 'vnet-peering',     icon: '🔗', name: 'VNet Peering',     desc: 'Local, global, transit',               xp: 25 },
      ],
    },
    {
      level: 5,
      title: 'Monitor and Maintain (10-15%)',
      skills: [
        { id: 'azure-monitor',   icon: '📊', name: 'Azure Monitor',   desc: 'Metrics, logs, workbooks',             xp: 30 },
        { id: 'log-analytics',   icon: '📈', name: 'Log Analytics',   desc: 'KQL, workspaces, insights',            xp: 25 },
        { id: 'alerts',          icon: '🚨', name: 'Alerts',          desc: 'Action groups, rules, severity',       xp: 20 },
        { id: 'backup',          icon: '💾', name: 'Azure Backup',    desc: 'Vault, policies, restore',             xp: 25 },
        { id: 'service-health',  icon: '🏥', name: 'Service Health',  desc: 'Incidents, maintenance, advisories',   xp: 15 },
        { id: 'network-watcher', icon: '🔍', name: 'Network Watcher', desc: 'Diagnostics, topology, packet capture',xp: 20 },
      ],
    },
  ],
  quests: {
    'azure-ad': {
      quests: {
        'Build Without Help': [
          'Create users and groups in Azure AD',
          'Configure guest user access',
          'Set up self-service password reset',
          'Configure MFA for users',
          'Implement dynamic group membership',
        ],
        'Understand & Explain': [
          'Know the difference between Azure AD and on-premise AD',
          'Explain user types: Member vs Guest',
          'Understand group types: Security vs Microsoft 365',
          'Know Azure AD licensing tiers and features',
        ],
        'Common Exam Questions': [
          'Bulk user creation with CSV templates',
          'Dynamic groups require Azure AD P1',
          'B2B collaboration scenarios',
        ],
      },
      resources: [
        { name: 'MS Learn: Describe Azure identity, access, and security', url: 'https://learn.microsoft.com/training/modules/describe-azure-identity-access-security/' },
        { name: 'Microsoft Entra ID Documentation', url: 'https://learn.microsoft.com/entra/identity/' },
        { name: 'Azure Identity Management Best Practices', url: 'https://learn.microsoft.com/azure/security/fundamentals/identity-management-best-practices' },
        { name: 'John Savill Azure AD Deep Dive', url: 'https://www.youtube.com/watch?v=Ma7VAQE7ga4' },
      ],
    },
    'rbac': {
      quests: {
        'Build Without Help': [
          'Assign built-in roles at different scopes',
          'Create custom roles with JSON',
          'Use deny assignments',
          'Implement PIM for just-in-time access',
        ],
        'Understand & Explain': [
          'Know the role hierarchy and inheritance',
          'Explain Actions vs NotActions vs DataActions',
          'Understand Owner vs Contributor vs Reader',
        ],
        'Common Exam Questions': [
          'Maximum custom roles per tenant (5000)',
          'Deny assignments override allow',
          'Role assignment takes up to 30 minutes to propagate',
        ],
      },
      resources: [
        { name: 'Azure RBAC Documentation', url: 'https://learn.microsoft.com/azure/role-based-access-control/overview' },
        { name: 'Built-in Roles Reference', url: 'https://learn.microsoft.com/azure/role-based-access-control/built-in-roles' },
        { name: 'RBAC Best Practices', url: 'https://learn.microsoft.com/azure/role-based-access-control/best-practices' },
      ],
    },
    'management-groups': {
      quests: {
        'Build Without Help': [
          'Create management group hierarchy',
          'Move subscriptions between groups',
          'Apply policies at management group level',
        ],
        'Understand & Explain': [
          'Maximum depth is 6 levels (excluding root)',
          'Tenant Root Group is automatically created',
          'Policy and RBAC inheritance',
        ],
      },
      resources: [
        { name: 'Management Groups Overview', url: 'https://learn.microsoft.com/azure/governance/management-groups/overview' },
        { name: 'Organize Resources with Management Groups', url: 'https://learn.microsoft.com/training/modules/use-azure-resource-manager/' },
        { name: 'Cloud Adoption Framework - Management Groups', url: 'https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/design-area/resource-org-management-groups' },
      ],
    },
    'azure-policy': {
      quests: {
        'Build Without Help': [
          'Create policy definitions',
          'Assign policies with parameters',
          'Create initiatives (policy sets)',
          'Configure remediation tasks',
        ],
        'Understand & Explain': [
          'Know policy effects: Deny, Audit, Append, DeployIfNotExists',
          'Understand evaluation cycle (1 hour default)',
          'DeployIfNotExists needs managed identity',
        ],
      },
      resources: [
        { name: 'Azure Policy Documentation', url: 'https://learn.microsoft.com/azure/governance/policy/overview' },
        { name: 'Policy Samples GitHub', url: 'https://github.com/Azure/azure-policy' },
        { name: 'Policy Effects Explained', url: 'https://learn.microsoft.com/azure/governance/policy/concepts/effects' },
        { name: 'MS Learn: Azure Policy', url: 'https://learn.microsoft.com/training/modules/intro-to-governance/' },
      ],
    },
    'resource-locks': {
      quests: {
        'Build Without Help': [
          'Apply CanNotDelete locks',
          'Apply ReadOnly locks',
          'Remove locks via portal and CLI',
        ],
        'Understand & Explain': [
          'CanNotDelete vs ReadOnly differences',
          'Locks apply to all users and roles',
          "Locks don't prevent billing",
        ],
      },
      resources: [
        { name: 'Resource Locks Documentation', url: 'https://learn.microsoft.com/azure/azure-resource-manager/management/lock-resources' },
        { name: 'Protect Azure Resources with Locks', url: 'https://learn.microsoft.com/training/modules/use-azure-resource-manager/' },
      ],
    },
    'cost-management': {
      quests: {
        'Build Without Help': [
          'Create budgets and alerts',
          'Configure cost analysis',
          'Set up cost allocation tags',
        ],
        'Understand & Explain': [
          "Budgets don't stop spending",
          'Cost data has 8-24 hour delay',
          'Know Azure Advisor 5 pillars',
        ],
      },
      resources: [
        { name: 'Cost Management + Billing', url: 'https://learn.microsoft.com/azure/cost-management-billing/' },
        { name: 'Azure Pricing Calculator', url: 'https://azure.microsoft.com/pricing/calculator/' },
        { name: 'Control Azure Spending and Manage Bills', url: 'https://learn.microsoft.com/training/modules/control-azure-spending-manage-bills/' },
        { name: 'Azure Advisor Documentation', url: 'https://learn.microsoft.com/azure/advisor/' },
      ],
    },
    'storage-accounts': {
      quests: {
        'Build Without Help': [
          'Create GPv2 storage accounts',
          'Configure replication (LRS, ZRS, GRS, RA-GRS)',
          'Set up lifecycle management',
        ],
        'Understand & Explain': [
          'Archive tier has 180-day early deletion fee',
          'Know replication SLAs',
          'Premium only supports LRS/ZRS',
        ],
      },
      resources: [
        { name: 'Storage Account Overview', url: 'https://learn.microsoft.com/azure/storage/common/storage-account-overview' },
        { name: 'Storage Redundancy Options', url: 'https://learn.microsoft.com/azure/storage/common/storage-redundancy' },
        { name: 'MS Learn: Azure Storage Fundamentals', url: 'https://learn.microsoft.com/training/modules/azure-storage-fundamentals/' },
      ],
    },
    'blob-storage': {
      quests: {
        'Build Without Help': [
          'Create containers with access levels',
          'Configure blob versioning and snapshots',
          'Set up static website hosting',
        ],
        'Understand & Explain': [
          'Container access levels: Private, Blob, Container',
          'Page blobs for VHDs, Block blobs for files',
          'Maximum block blob size',
        ],
      },
      resources: [
        { name: 'Azure Blob Storage Documentation', url: 'https://learn.microsoft.com/azure/storage/blobs/' },
        { name: 'Static Website Hosting', url: 'https://learn.microsoft.com/azure/storage/blobs/storage-blob-static-website' },
        { name: 'Work with Blob Storage', url: 'https://learn.microsoft.com/training/modules/work-with-blob-storage/' },
      ],
    },
    'azure-files': {
      quests: {
        'Build Without Help': [
          'Create file shares',
          'Mount on Windows/Linux',
          'Configure Azure File Sync',
        ],
        'Understand & Explain': [
          'Port 445 must be open',
          'NFS requires Premium tier',
          'File Sync components',
        ],
      },
      resources: [
        { name: 'Azure Files Documentation', url: 'https://learn.microsoft.com/azure/storage/files/' },
        { name: 'Azure File Sync Planning', url: 'https://learn.microsoft.com/azure/storage/file-sync/file-sync-planning' },
        { name: 'Manage Azure File Shares', url: 'https://learn.microsoft.com/training/modules/manage-azure-file-shares/' },
      ],
    },
    'storage-security': {
      quests: {
        'Build Without Help': [
          'Generate SAS tokens',
          'Configure firewall rules',
          'Set up private endpoints',
        ],
        'Understand & Explain': [
          'SAS cannot be revoked once created',
          'Account vs Service SAS',
          'Always use HTTPS with SAS',
        ],
      },
      resources: [
        { name: 'Storage Security Guide', url: 'https://learn.microsoft.com/azure/storage/common/storage-security-guide' },
        { name: 'SAS Overview', url: 'https://learn.microsoft.com/azure/storage/common/storage-sas-overview' },
        { name: 'Configure Storage Security', url: 'https://learn.microsoft.com/training/modules/configure-storage-security/' },
      ],
    },
    'azcopy': {
      quests: {
        'Build Without Help': [
          'Install and use AzCopy',
          'Copy between storage accounts',
          'Use with SAS tokens',
        ],
      },
      resources: [
        { name: 'AzCopy Documentation', url: 'https://learn.microsoft.com/azure/storage/common/storage-use-azcopy-v10' },
        { name: 'Storage Explorer', url: 'https://azure.microsoft.com/features/storage-explorer/' },
        { name: 'Import/Export Service', url: 'https://learn.microsoft.com/azure/import-export/' },
      ],
    },
    'managed-disks': {
      quests: {
        'Build Without Help': [
          'Create managed disks',
          'Take snapshots',
          'Change disk types',
        ],
      },
      resources: [
        { name: 'Managed Disks Overview', url: 'https://learn.microsoft.com/azure/virtual-machines/managed-disks-overview' },
        { name: 'Disk Types and Performance', url: 'https://learn.microsoft.com/azure/virtual-machines/disks-types' },
        { name: 'Configure Virtual Machine Storage', url: 'https://learn.microsoft.com/training/modules/configure-virtual-machine-storage/' },
      ],
    },
    'virtual-machines': {
      quests: {
        'Build Without Help': [
          'Create Windows and Linux VMs',
          'Configure availability sets/zones',
          'Resize VMs',
        ],
        'Understand & Explain': [
          'B-series are burstable',
          'Availability zones = 99.99% SLA',
          'Generation 1 vs 2 VMs',
        ],
      },
      resources: [
        { name: 'Virtual Machines Documentation', url: 'https://learn.microsoft.com/azure/virtual-machines/' },
        { name: 'VM Sizes and Types', url: 'https://learn.microsoft.com/azure/virtual-machines/sizes' },
        { name: 'MS Learn: Create a Virtual Machine', url: 'https://learn.microsoft.com/training/modules/create-windows-virtual-machine-in-azure/' },
        { name: 'Availability Options for VMs', url: 'https://learn.microsoft.com/azure/virtual-machines/availability' },
      ],
    },
    'vm-extensions': {
      quests: {
        'Build Without Help': [
          'Install Custom Script Extension',
          'Configure DSC extension',
        ],
      },
      resources: [
        { name: 'VM Extensions Overview', url: 'https://learn.microsoft.com/azure/virtual-machines/extensions/overview' },
        { name: 'Custom Script Extension', url: 'https://learn.microsoft.com/azure/virtual-machines/extensions/custom-script-windows' },
        { name: 'DSC Extension', url: 'https://learn.microsoft.com/azure/virtual-machines/extensions/dsc-overview' },
      ],
    },
    'app-service': {
      quests: {
        'Build Without Help': [
          'Create App Service plans',
          'Deploy web apps',
          'Configure deployment slots',
        ],
      },
      resources: [
        { name: 'App Service Documentation', url: 'https://learn.microsoft.com/azure/app-service/' },
        { name: 'Deploy a Web App', url: 'https://learn.microsoft.com/training/modules/host-a-web-app-with-azure-app-service/' },
        { name: 'App Service Plans', url: 'https://learn.microsoft.com/azure/app-service/overview-hosting-plans' },
      ],
    },
    'containers': {
      quests: {
        'Build Without Help': [
          'Deploy ACI',
          'Create ACR',
          'Basic AKS deployment',
        ],
      },
      resources: [
        { name: 'Azure Container Instances', url: 'https://learn.microsoft.com/azure/container-instances/' },
        { name: 'Azure Kubernetes Service', url: 'https://learn.microsoft.com/azure/aks/' },
        { name: 'Azure Container Registry', url: 'https://learn.microsoft.com/azure/container-registry/' },
        { name: 'Run Containers in Azure', url: 'https://learn.microsoft.com/training/modules/run-docker-with-azure-container-instances/' },
      ],
    },
    'scale-sets': {
      quests: {
        'Build Without Help': [
          'Create VMSS',
          'Configure autoscaling',
        ],
      },
      resources: [
        { name: 'VM Scale Sets Overview', url: 'https://learn.microsoft.com/azure/virtual-machine-scale-sets/overview' },
        { name: 'Autoscaling Documentation', url: 'https://learn.microsoft.com/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-autoscale-overview' },
        { name: 'Build a Scalable Application', url: 'https://learn.microsoft.com/training/modules/build-app-with-scale-sets/' },
      ],
    },
    'availability': {
      quests: {
        'Build Without Help': [
          'Configure availability sets',
          'Deploy to availability zones',
        ],
      },
      resources: [
        { name: 'Availability Options for VMs', url: 'https://learn.microsoft.com/azure/virtual-machines/availability' },
        { name: 'Availability Zones', url: 'https://learn.microsoft.com/azure/reliability/availability-zones-overview' },
        { name: 'Design for High Availability', url: 'https://learn.microsoft.com/training/modules/design-for-high-availability/' },
      ],
    },
    'virtual-networks': {
      quests: {
        'Build Without Help': [
          'Create VNets and subnets',
          'Configure IP addressing',
          'Set up service endpoints',
        ],
        'Understand & Explain': [
          'Azure reserves 5 IPs per subnet',
          '/29 is smallest subnet',
          'Cannot change address space with peering',
        ],
      },
      resources: [
        { name: 'Virtual Network Documentation', url: 'https://learn.microsoft.com/azure/virtual-network/' },
        { name: 'Design Virtual Networks', url: 'https://learn.microsoft.com/training/modules/design-ip-addressing-for-azure/' },
        { name: 'Network Best Practices', url: 'https://learn.microsoft.com/azure/virtual-network/virtual-network-vnet-plan-design-arm' },
      ],
    },
    'network-security': {
      quests: {
        'Build Without Help': [
          'Create NSGs and rules',
          'Configure ASGs',
          'Set up Azure Firewall',
        ],
        'Understand & Explain': [
          'Lower priority = higher precedence',
          'NSGs are stateful',
          'Default rules cannot be deleted',
        ],
      },
      resources: [
        { name: 'Network Security Groups', url: 'https://learn.microsoft.com/azure/virtual-network/network-security-groups-overview' },
        { name: 'Azure Firewall Documentation', url: 'https://learn.microsoft.com/azure/firewall/' },
        { name: 'Configure Network Security', url: 'https://learn.microsoft.com/training/modules/configure-network-security-groups/' },
      ],
    },
    'load-balancing': {
      quests: {
        'Build Without Help': [
          'Create Load Balancer',
          'Configure Application Gateway',
          'Set up Traffic Manager',
        ],
      },
      resources: [
        { name: 'Azure Load Balancer', url: 'https://learn.microsoft.com/azure/load-balancer/load-balancer-overview' },
        { name: 'Application Gateway', url: 'https://learn.microsoft.com/azure/application-gateway/' },
        { name: 'Traffic Manager', url: 'https://learn.microsoft.com/azure/traffic-manager/' },
        { name: 'Load Balance Web Traffic', url: 'https://learn.microsoft.com/training/modules/load-balance-web-traffic-with-application-gateway/' },
      ],
    },
    'vpn-gateway': {
      quests: {
        'Build Without Help': [
          'Create VPN Gateway',
          'Configure S2S VPN',
          'Set up P2S VPN',
        ],
      },
      resources: [
        { name: 'VPN Gateway Documentation', url: 'https://learn.microsoft.com/azure/vpn-gateway/' },
        { name: 'ExpressRoute Overview', url: 'https://learn.microsoft.com/azure/expressroute/' },
        { name: 'Configure VPN Gateway', url: 'https://learn.microsoft.com/training/modules/configure-vpn-gateway/' },
      ],
    },
    'dns': {
      quests: {
        'Build Without Help': [
          'Create DNS zones',
          'Configure records',
          'Set up private DNS',
        ],
      },
      resources: [
        { name: 'Azure DNS Documentation', url: 'https://learn.microsoft.com/azure/dns/' },
        { name: 'Private DNS Zones', url: 'https://learn.microsoft.com/azure/dns/private-dns-overview' },
        { name: 'Host Your Domain on Azure DNS', url: 'https://learn.microsoft.com/training/modules/host-domain-azure-dns/' },
      ],
    },
    'vnet-peering': {
      quests: {
        'Build Without Help': [
          'Configure VNet peering',
          'Set up global peering',
        ],
      },
      resources: [
        { name: 'Virtual Network Peering', url: 'https://learn.microsoft.com/azure/virtual-network/virtual-network-peering-overview' },
        { name: 'Configure VNet Peering', url: 'https://learn.microsoft.com/training/modules/configure-vnet-peering/' },
        { name: 'Hub-Spoke Network Topology', url: 'https://learn.microsoft.com/azure/architecture/reference-architectures/hybrid-networking/hub-spoke' },
      ],
    },
    'azure-monitor': {
      quests: {
        'Build Without Help': [
          'Configure metrics',
          'Create workbooks',
          'Set up diagnostics',
        ],
        'Understand & Explain': [
          'Metrics retained for 93 days',
          'Platform vs Guest metrics',
        ],
      },
      resources: [
        { name: 'Azure Monitor Overview', url: 'https://learn.microsoft.com/azure/azure-monitor/overview' },
        { name: 'Metrics Documentation', url: 'https://learn.microsoft.com/azure/azure-monitor/essentials/data-platform-metrics' },
        { name: 'Monitor Azure Resources', url: 'https://learn.microsoft.com/training/modules/monitor-azure-resources/' },
        { name: 'Azure Monitor Workbooks', url: 'https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-overview' },
      ],
    },
    'log-analytics': {
      quests: {
        'Build Without Help': [
          'Create workspaces',
          'Write KQL queries',
        ],
      },
      resources: [
        { name: 'Log Analytics Documentation', url: 'https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-overview' },
        { name: 'KQL Tutorial', url: 'https://learn.microsoft.com/azure/data-explorer/kusto/query/tutorial' },
        { name: 'Analyze Logs with KQL', url: 'https://learn.microsoft.com/training/modules/analyze-logs-with-kql/' },
      ],
    },
    'alerts': {
      quests: {
        'Build Without Help': [
          'Create alert rules',
          'Configure action groups',
        ],
      },
      resources: [
        { name: 'Azure Monitor Alerts', url: 'https://learn.microsoft.com/azure/azure-monitor/alerts/alerts-overview' },
        { name: 'Action Groups', url: 'https://learn.microsoft.com/azure/azure-monitor/alerts/action-groups' },
        { name: 'Configure Alerts', url: 'https://learn.microsoft.com/training/modules/configure-azure-alerts/' },
      ],
    },
    'backup': {
      quests: {
        'Build Without Help': [
          'Create Recovery Services vault',
          'Configure backup policies',
          'Perform restore',
        ],
      },
      resources: [
        { name: 'Azure Backup Documentation', url: 'https://learn.microsoft.com/azure/backup/' },
        { name: 'Recovery Services Vault', url: 'https://learn.microsoft.com/azure/backup/backup-azure-recovery-services-vault-overview' },
        { name: 'Configure VM Backup', url: 'https://learn.microsoft.com/training/modules/configure-virtual-machine-backups/' },
      ],
    },
    'service-health': {
      quests: {
        'Build Without Help': [
          'Configure health alerts',
          'Review advisories',
        ],
      },
      resources: [
        { name: 'Azure Service Health', url: 'https://learn.microsoft.com/azure/service-health/' },
        { name: 'Configure Health Alerts', url: 'https://learn.microsoft.com/azure/service-health/alerts-activity-log-service-notifications-portal' },
        { name: 'Resource Health Overview', url: 'https://learn.microsoft.com/azure/service-health/resource-health-overview' },
      ],
    },
    'network-watcher': {
      quests: {
        'Build Without Help': [
          'Enable Network Watcher',
          'Use IP flow verify',
          'Configure packet capture',
        ],
      },
      resources: [
        { name: 'Network Watcher Documentation', url: 'https://learn.microsoft.com/azure/network-watcher/' },
        { name: 'Network Diagnostics', url: 'https://learn.microsoft.com/azure/network-watcher/network-watcher-network-configuration-diagnostics-overview' },
        { name: 'Monitor Networks', url: 'https://learn.microsoft.com/training/modules/monitor-diagnose-networks-azure-network-watcher/' },
      ],
    },
  },
};

const PW_SKILL_TREES = {
  'az-104': PW_SKILL_TREE_AZ104,
};

const PWSkillTree = (function () {
  function esc(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function loadState(examCode) {
    const d = pwLoad(examCode);
    d.skillTree = d.skillTree || { xp: 0, unlocked: [], quests: {} };
    d.skillTree.unlocked = d.skillTree.unlocked || [];
    d.skillTree.quests = d.skillTree.quests || {};
    return d;
  }

  function totalSkills(tree) {
    return tree.tiers.reduce((n, t) => n + t.skills.length, 0);
  }

  function totalXpEarned(tree, unlocked) {
    const set = new Set(unlocked);
    let xp = 0;
    for (const tier of tree.tiers) {
      for (const s of tier.skills) if (set.has(s.id)) xp += s.xp;
    }
    return xp;
  }

  function questIds(skillId, quests) {
    const qd = quests[skillId];
    if (!qd) return [];
    const ids = [];
    for (const section of Object.keys(qd.quests)) {
      qd.quests[section].forEach((_, i) => ids.push(`${skillId}:${section}:${i}`));
    }
    return ids;
  }

  function tierUnlocked(tree, tierIdx, unlockedSet) {
    if (tierIdx === 0) return true;
    const prev = tree.tiers[tierIdx - 1].skills;
    const prevMastered = prev.filter(s => unlockedSet.has(s.id)).length;
    return prevMastered >= Math.floor(prev.length * tree.tierUnlockThreshold);
  }

  function render(ctx) {
    const { container, tree, examCode } = ctx;
    const data = loadState(examCode);
    const unlockedSet = new Set(data.skillTree.unlocked);
    const total = totalSkills(tree);
    const mastered = data.skillTree.unlocked.length;
    const pct = Math.round((mastered / total) * 100);
    const xp = totalXpEarned(tree, data.skillTree.unlocked);
    const questsDone = Object.values(data.skillTree.quests).filter(Boolean).length;

    const tiersHtml = tree.tiers.map((tier, idx) => {
      const unlocked = tierUnlocked(tree, idx, unlockedSet);
      const skillsHtml = tier.skills.map(s => {
        const isMastered = unlockedSet.has(s.id);
        const cls = ['st-skill'];
        if (isMastered) cls.push('unlocked');
        else if (!unlocked) cls.push('locked');
        return `
          <div class="${cls.join(' ')}" data-skill="${esc(s.id)}">
            <div class="st-skill-xp">+${s.xp} XP</div>
            <div class="st-skill-icon">${s.icon}</div>
            <div class="st-skill-name">${esc(s.name)}</div>
            <div class="st-skill-desc">${esc(s.desc)}</div>
            <div class="st-skill-cta">📋 View Quests</div>
          </div>`;
      }).join('');
      return `
        <section class="st-tier">
          <div class="st-tier-title">
            <span class="st-tier-icon">LV.${tier.level}</span>
            ${esc(tier.title)}
          </div>
          <div class="st-skills">${skillsHtml}</div>
        </section>`;
    }).join('');

    container.innerHTML = `
      <div class="st-wrap">
        <div class="st-stats">
          <div class="st-stat"><div class="st-stat-value" id="stUnlocked">${mastered}</div><div class="st-stat-label">Skills Mastered</div></div>
          <div class="st-stat"><div class="st-stat-value">${total}</div><div class="st-stat-label">Total Skills</div></div>
          <div class="st-stat"><div class="st-stat-value" id="stXp">${xp}</div><div class="st-stat-label">XP Earned</div></div>
          <div class="st-stat"><div class="st-stat-value" id="stQuests">${questsDone}</div><div class="st-stat-label">Quests Complete</div></div>
        </div>
        <div>
          <div class="st-progress-bar"><div class="st-progress-fill" id="stProgressFill" style="width:${pct}%"></div></div>
          <div class="st-progress-text" id="stProgressText">${pct}% Complete</div>
        </div>
        <div class="st-help">Click any unlocked skill to view its quests and resources. Each tier unlocks when 80% of the previous tier is mastered.</div>
        ${tiersHtml}
      </div>
      <div class="st-modal" id="stModal">
        <div class="st-modal-content">
          <div class="st-modal-header">
            <div class="st-modal-title">
              <span class="st-modal-icon" id="stModalIcon"></span>
              <span id="stModalName"></span>
            </div>
            <button class="st-close" id="stClose" aria-label="Close">&times;</button>
          </div>
          <div id="stModalBody"></div>
        </div>
      </div>
    `;

    wireEvents(container, ctx);
  }

  function wireEvents(container, ctx) {
    container.querySelectorAll('.st-skill').forEach(el => {
      el.addEventListener('click', () => {
        if (el.classList.contains('locked')) return;
        openModal(el.dataset.skill, ctx);
      });
    });
    const modal = container.querySelector('#stModal');
    container.querySelector('#stClose').addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
  }

  function openModal(skillId, ctx) {
    const { container, tree, examCode } = ctx;
    const qdata = tree.quests[skillId];
    if (!qdata) return;
    const data = loadState(examCode);
    const skill = findSkill(tree, skillId);

    container.querySelector('#stModalIcon').textContent = skill.icon;
    container.querySelector('#stModalName').textContent = skill.name;

    const ids = questIds(skillId, tree.quests);
    const done = ids.filter(id => data.skillTree.quests[id]).length;

    let html = '';
    for (const section of Object.keys(qdata.quests)) {
      html += `<div class="st-quest-section"><div class="st-quest-section-title">✅ ${esc(section)}</div>`;
      qdata.quests[section].forEach((q, i) => {
        const qid = `${skillId}:${section}:${i}`;
        const checked = data.skillTree.quests[qid] ? 'checked' : '';
        const doneCls = data.skillTree.quests[qid] ? 'done' : '';
        html += `
          <label class="st-quest-item ${doneCls}" data-qid="${esc(qid)}">
            <input type="checkbox" ${checked}>
            <span class="st-quest-text">${esc(q)}</span>
          </label>`;
      });
      html += '</div>';
    }

    if (qdata.resources && qdata.resources.length) {
      html += `<div class="st-resources"><div class="st-resources-title">📚 Free Learning Resources</div>`;
      for (const r of qdata.resources) {
        html += `<a class="st-resource" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a>`;
      }
      html += `</div>`;
    }

    const isMastered = data.skillTree.unlocked.includes(skillId);
    const allDone = done === ids.length && ids.length > 0;
    html += `
      <button class="st-mastery" id="stMasteryBtn" ${allDone || isMastered ? '' : 'disabled'}>
        ${isMastered ? '✅ Skill Mastered' : 'Mark as Mastered'} (${done}/${ids.length} quests)
      </button>`;

    container.querySelector('#stModalBody').innerHTML = html;
    container.querySelector('#stModal').classList.add('show');

    container.querySelectorAll('#stModalBody .st-quest-item input').forEach(cb => {
      cb.addEventListener('change', e => handleQuestToggle(e, skillId, ctx));
    });
    container.querySelector('#stMasteryBtn').addEventListener('click', () => handleMastery(skillId, ctx));
  }

  function handleQuestToggle(e, skillId, ctx) {
    const { container, tree, examCode } = ctx;
    const label = e.target.closest('.st-quest-item');
    const qid = label.dataset.qid;
    const data = loadState(examCode);
    data.skillTree.quests[qid] = e.target.checked;
    pwSave(examCode, data);
    label.classList.toggle('done', e.target.checked);

    const ids = questIds(skillId, tree.quests);
    const done = ids.filter(id => data.skillTree.quests[id]).length;
    const isMastered = data.skillTree.unlocked.includes(skillId);
    const allDone = done === ids.length && ids.length > 0;
    const btn = container.querySelector('#stMasteryBtn');
    btn.disabled = !(allDone || isMastered);
    btn.textContent = `${isMastered ? '✅ Skill Mastered' : 'Mark as Mastered'} (${done}/${ids.length} quests)`;

    const qStat = container.querySelector('#stQuests');
    if (qStat) {
      const all = Object.values(data.skillTree.quests).filter(Boolean).length;
      qStat.textContent = all;
    }
  }

  function handleMastery(skillId, ctx) {
    const { container, tree, examCode } = ctx;
    const data = loadState(examCode);
    const idx = data.skillTree.unlocked.indexOf(skillId);
    if (idx === -1) data.skillTree.unlocked.push(skillId);
    else data.skillTree.unlocked.splice(idx, 1);
    data.skillTree.xp = totalXpEarned(tree, data.skillTree.unlocked);
    pwSave(examCode, data);
    // Full re-render keeps tier locks, stats, and skill cards in sync.
    render(ctx);
    // Reopen the modal so the user sees the state flip without losing context.
    openModal(skillId, ctx);
  }

  function findSkill(tree, skillId) {
    for (const tier of tree.tiers) {
      const s = tier.skills.find(x => x.id === skillId);
      if (s) return s;
    }
    return null;
  }

  function mount({ exam, container }) {
    const tree = PW_SKILL_TREES[exam.slug];
    if (!tree) {
      container.innerHTML = `<div class="coming-soon"><h2>Skill Tree</h2><p>No skill tree authored for ${exam.code} yet.</p></div>`;
      return;
    }
    render({ container, tree, examCode: exam.code });
  }

  return { mount };
})();
