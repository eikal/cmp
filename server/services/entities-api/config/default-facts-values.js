const FACTS_VALUES = {
    BT_CUSTOMER_VALUES: ['bp', 'btiq', 'fml', 'chc'],
    BT_PRODUCT_VALUES: ['cfrmiso', 'btiq', 'cfrmcloud', 'cfrmit', 'cfrm', 'cfrmrd'],
    BT_LOB_VALUES: ['cfrm'],
    BT_TIER_VALUES: ['PROD', 'UAT', 'PPD', 'DR', 'DEV'],
    BT_ENV_VALUES: ['ae', 'ic', ''],
    BT_ROLE_VALUES: ['elasticsearch', 'app', 'mgmt', 'oradb', 'elastic'],
    BT_INFRA_NETWORK_VALUES: [
        {
            tier: 'PROD',
            dataCenterName: 'gb00',
            networks: ['gb00_cfrm_app', 'gb00_cfrm_db']
        },
        {
            tier: 'DR',
            dataCenterName: 'gb03',
            networks: ['gb03_cfrm_dr_app', 'gb03_cfrm_dr_db']
        },
        {
            tier: 'UAT',
            dataCenterName: 'gb00',
            networks: ['gb00_cfrm_app', 'gb00_cfrm_db']
        },
        {
            tier: 'PPD',
            dataCenterName: 'gb03',
            networks: ['gb03_cfrm_preprod_app', 'gb03_cfrm_preprod_db']
        }
    ],
    BT_INFRA_CLUSTER_VALUES: [
        {
            dataCenterName: 'gb00',
            clusters: ['gb00-aza-ntnx-01', 'gb00-azc-ntnx-02']
        },
        {
            dataCenterName: 'gb03',
            clusters: ['gb03-aza-ntnx-01', 'gb03-azc-ntnx-02', 'gb03-azc-ntnx-03', 'gb03-azd-ntnx-04']
        },
        {
            dataCenterName: 'ny2',
            clusters: ['ny2-aza-ntnx-05', 'ny2-aza-ntnx-07', 'ny2-aza-ntnx-08', 'ny2-aza-ntnx-09', 'ny2-aza-ntnx-10',
                'ny2-aza-ntnx-11', 'ny2-aza-ntnx-12', 'ny2-aza-ntnx-13'
            ]
        }
    ],
    // BT_ARTEMIS_VERSION_VALUES: ['2.13.0', '2.11.0'],
    FIREWALL_GROUP_VALUES: [
        {
            dataCenterName: 'gb00',
            tier: ['PROD', 'UAT'],
            role: 'app',
            env: 'ic',
            firewallGroup: 'CFRMRD_PR_FE'
        },
        {
            dataCenterName: 'gb00',
            tier: ['PROD', 'UAT'],
            role: 'app',
            env: 'ae',
            firewallGroup: 'CFRMRD_PR_BE'
        },
        {
            dataCenterName: 'gb00',
            tier: ['PROD', 'UAT'],
            role: 'elasticsearch',
            env: '',
            firewallGroup: 'CFRMRD_PR_ES'
        },
        {
            dataCenterName: 'gb00',
            tier: ['PROD', 'UAT'],
            role: 'oradb',
            env: '',
            firewallGroup: 'CFRMRD_PR_DB'
        },
        {
            dataCenterName: 'gb03',
            tier: ['PPD'],
            role: 'app',
            env: 'ic',
            firewallGroup: 'CFRMRD_PPD_FE'
        },
        {
            dataCenterName: 'gb03',
            tier: ['PPD'],
            role: 'app',
            env: 'ae',
            firewallGroup: 'CFRMRD_PPD_BE'
        },
        {
            dataCenterName: 'gb03',
            tier: ['PPD'],
            role: 'elasticsearch',
            env: '',
            firewallGroup: 'CFRMRD_PPD_ES'
        },
        {
            dataCenterName: 'gb03',
            tier: ['PPD'],
            role: 'oradb',
            env: '',
            firewallGroup: 'CFRMRD_PPD_DB'
        },
        {
            dataCenterName: 'gb03',
            tier: ['DR'],
            role: 'app',
            env: 'ic',
            firewallGroup: 'CFRMRD_DR_FE'
        },
        {
            dataCenterName: 'gb03',
            tier: ['DR'],
            role: 'app',
            env: 'ae',
            firewallGroup: 'CFRMRD_DR_FE'
        },
        {
            dataCenterName: 'gb03',
            tier: ['DR'],
            role: 'elasticsearch',
            env: '',
            firewallGroup: 'CFRMRD_DR_FE'
        },
        {
            dataCenterName: 'gb03',
            tier: ['DR'],
            role: 'oradb',
            env: '',
            firewallGroup: 'CFRMRD_DR_FE'
        }
    ],
    ENVIRONMENT_VALUES: ['master', 'production'],
    CPU_VALUES: ['1', '2', '4', '8'],
    MEMORY_VALUES: ['2048', '4096', '8192', '16384', '32768'],
    ADDITIONAL_DISK_VALUES: ['50', '100', '150', '250', '300', '400', '500'],
    DATACENTER_VALUES: [
        {
            name: 'gb03',
            secondName: 'colt'
        },
        {
            name: 'gb00',
            secondName: 'bunker'
        },
        {
            name: 'ny2',
            secondName: 'ny2'
        },
        {
            name: 'ch01',
            secondName: 'ch01'
        }
    ],
    HOSTNAME_VALUES: [
        {
            name: 'gb03',
            dataCenterName: 'gb03'
        },
        {
            name: 'gb00',
            dataCenterName: 'gb00'
        },
        {
            name: 'us01',
            dataCenterName: 'ny2'
        },
        {
            name: 'ch01',
            dataCenterName: 'ch01'
        }
    ],
    OS_VERSION_VALUES: ['rhel', 'win2019'],
    HOSTGROUP_VALUES: [
        'BT CFRM CLOUD Application Servers',
        'BT CFRM CLOUD NFS Servers',
        'BT CFRM CLOUD ElasticSearch Cluster',
        'BT CFRM CLOUD Oracle DB Servers'
    ]
};

export default FACTS_VALUES;
