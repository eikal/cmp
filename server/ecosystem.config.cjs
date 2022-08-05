
module.exports = {
	apps: [
		{
			name: 'auth-service',
			script: './services/auth/index.mjs',
			max_memory_restart: '750M',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		},
		{
			name: 'source-sync-service',
			script: './services/source-sync/index.mjs',
			max_memory_restart: '750M',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		},
		{
			name: 'store-hiera-service',
			script: './services/store-hiera/index.mjs',
			max_memory_restart: '750M',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		},
		{
			name: 'entities-api-service',
			script: './services/entities-api/index.mjs',
			max_memory_restart: '2G',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		},
		{
			name: 'agent-service',
			script: './services/agent/index.mjs',
			max_memory_restart: '750M',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		},
		{
			name: 'status-check-service',
			script: './services/status-check/index.mjs',
			max_memory_restart: '2G',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		},
		{
			name: 'monitoring-service',
			script: './services/monitoring/index.mjs',
			max_memory_restart: '750M',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		},
		{
			name: 'action-job-service',
			script: './services/action-job/index.mjs',
			instances: 'max',
			exec_mode: 'cluster',
			max_memory_restart: '5G',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		},
		{
			name: 'k8s-service',
			script: './services/k8s/index.mjs',
			max_memory_restart: '750M',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		},
		{
			name: 'alert-collect',
			script: './services/alert-collector/index.mjs',
			max_memory_restart: '2G',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		},
		{
			name: 'foreman-collector',
			script: './services/foreman-collector/index.mjs',
			max_memory_restart: '2G',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		},
		{
			name: 'cloudshell-service',
			script: './services/cloudshell/index.mjs',
			max_memory_restart: '2G',
			log_date_format: 'YYYY-MM-DD HH:mm Z'
		}
	]
};
