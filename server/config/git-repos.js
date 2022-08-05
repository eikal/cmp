const SOURCES = [
    {
        sourceName: 'bitbucket-tech',
        repositories: [
            {
                repoName: 'banking-solutions',
                sourceUrl: 'bitbucket.bottomline.tech/scm/cfrm_devops/banking-solutions-deployment-scripts.git',
                sourceMonitoringUrl: 'bitbucket.bottomline.tech/scm/cfrm_devops/banking-solutions-monitoring-deployment-scripts.git',
                cloneDestinationPath: process.env.SOURCE_SYNC_BS_DIR_PATH,
                cloneMonitoringPath: process.env.SOURCE_SYNC_MONITOR_PATH,
                branches: [
                    '620_GA',
                    '630_SP1',
                    '630_SP2',
                    '630_SP2_WLS',
                    '630_GA',
                    '640_SP1',
                    '640_GA'
                ],
                enabled: true
            }
        ]
    }
];

export default SOURCES;
