import axios from 'axios';

export const buildCpuQuery = (server, type = null, period = null) => {
    try {
        let params = null;
        let endpoint = null;
        let uri = null;
        if (type === 'utilization') {
            params = {
                query: `100 - (avg(irate(node_cpu_seconds_total{mode="idle",instance="${server}:9100"}[1d])) * 100)`,
                start: (new Date(new Date().getTime() - (period * 60 * 60 * 1000))).getTime() / 1000,
                end: new Date().getTime() / 1000,
                period: 14 * period
            };
            endpoint = 'query_range';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&start=${params.start}&end=${params.end}&step=${params.period}`;
            return { uri, endpoint };
        } if (type === 'cpuCount') {
            params = {
                query: `node_cpu_seconds_total{mode="idle", instance="${server}:9100"}[1m]`,
                time: new Date().getTime() / 1000
            };
            endpoint = 'query';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&time=${params.time}`;
            return { uri, endpoint };
        } else {
            params = {
                query: `100 - (avg(irate(node_cpu_seconds_total{mode="idle",instance="${server}:9100"}[2m])) * 100)`,
                start: new Date().getTime() / 1000
            };
            endpoint = 'query';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&start=${params.start}`;
        }

        return { uri, endpoint };
    } catch (ex) {
        const err = `buildCpuQuery, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const getCpuQueryResult = async (uri, type = null) => {
    try {
        const response = await axios.get(uri);
        if (response.status !== 200) {
            throw JSON.stringify(response);
        }
        if (response?.data?.data?.result.length === 0) {
            return [];
        }
        if (type === 'cpuCount') {
            return response.data.data.result;
        }
        return response.data.data.result[0].values ? response.data.data.result[0].values : response.data.data.result[0].value;
    } catch (ex) {
        const err = `getCpuQueryResult, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const buildMemoryQuery = (server, type = null, period = null) => {
    try {
        let params = null;
        let endpoint = null;
        let uri = null;
        if (type === 'utilization') {
            params = {
                query: `1 - ((sum(node_memory_MemAvailable_bytes{instance="${server}:9100"})) / (sum(node_memory_MemTotal_bytes{instance="${server}:9100"})))`,
                start: (new Date(new Date().getTime() - (period * 60 * 60 * 1000))).getTime() / 1000,
                end: new Date().getTime() / 1000,
                period: 14 * period
            };
            endpoint = 'query_range';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&start=${params.start}&end=${params.end}&step=${params.period}`;
            return { uri, endpoint };
        }
        if (type === 'usage') {
            params = {
                query: `(((node_memory_MemTotal_bytes{instance="${server}:9100"} - node_memory_MemFree_bytes{instance="${server}:9100"}) / node_memory_MemTotal_bytes{instance="${server}:9100"}))`,
                time: new Date().getTime() / 1000
            };
            endpoint = 'query';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&time=${params.time}`;
            return { uri, endpoint };
        }
        if (type === 'totalUsage') {
            params = {
                query: `node_memory_MemTotal_bytes{instance="${server}:9100"} - node_memory_MemFree_bytes{instance="${server}:9100"}`,
                time: new Date().getTime() / 1000
            };
            endpoint = 'query';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&time=${params.time}`;
            return { uri, endpoint };
        }
        if (type === 'total') {
            params = {
                query: `node_memory_MemTotal_bytes{instance="${server}:9100"}`,
                time: new Date().getTime() / 1000
            };
            endpoint = 'query';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&time=${params.time}`;
            return { uri, endpoint };
        }
        return { uri, endpoint };
    } catch (ex) {
        const err = `buildMemoryQuery, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const getMemoryQueryResult = async (uri) => {
    try {
        const response = await axios.get(uri);
        if (response.status !== 200) {
            throw JSON.stringify(response);
        }
        if (response?.data?.data?.result.length === 0) {
            return [];
        }
        return response.data.data.result[0].values ? response.data.data.result[0].values : response.data.data.result[0].value;
    } catch (ex) {
        const err = `getMemoryQueryResult, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const buildDiskQuery = (server, type = null, period = null) => {
    try {
        let params = null;
        let endpoint = null;
        let uri = null;
        if (type === 'utilization') {
            params = {
                query: `100 - (100 * ((sum(node_filesystem_avail_bytes{fstype!="rootfs",instance="${server}:9100"} ))  / (sum(node_filesystem_size_bytes{fstype!="rootfs",instance="${server}:9100"})) ))`,
                start: (new Date(new Date().getTime() - (period * 60 * 60 * 1000))).getTime() / 1000,
                end: new Date().getTime() / 1000,
                period: 14 * period
            };
            endpoint = 'query_range';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&start=${params.start}&end=${params.end}&step=${params.period}`;
            return { uri, endpoint };
        }
        if (type === 'usage') {
            params = {
                query: `100 - (100 * (((node_filesystem_avail_bytes{ instance="${server}:9100" }) / (node_filesystem_size_bytes{instance="${server}:9100"}))))`,
                time: new Date().getTime() / 1000
            };
            endpoint = 'query';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&time=${params.time}`;
            return { uri, endpoint };
        }
        if (type === 'totalUsage') {
            params = {
                query: `(node_filesystem_size_bytes{instance="${server}:9100"})`,
                time: new Date().getTime() / 1000
            };
            endpoint = 'query';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&time=${params.time}`;
            return { uri, endpoint };
        }
        if (type === 'total') {
            params = {
                query: `sum(node_filesystem_size_bytes{instance="${server}:9100", mountpoint="/opt"})`,
                time: new Date().getTime() / 1000
            };
            endpoint = 'query';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&time=${params.time}`;
            return { uri, endpoint };
        }
        return { uri, endpoint };
    } catch (ex) {
        const err = `buildDiskQuery, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const getDiskQueryResult = async (uri) => {
    try {
        const response = await axios.get(uri);
        if (response.status !== 200) {
            throw JSON.stringify(response);
        }
        if (response?.data?.data?.result.length === 0) {
            return [];
        }
        if (response?.data?.data?.result.length > 3) {
            const result = [];
            for (const elm of response.data.data.result) {
                result.push({ mountpoint: elm.metric.mountpoint, value: elm.value[1] });
            }
            return result;
        }
        return response.data.data.result[0].values ? response.data.data.result[0].values : response.data.data.result[0].value;
    } catch (ex) {
        const err = `getDiskQueryResult, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};

export const buildNetworkQuery = (server, type = null, period = null) => {
    try {
        let params = null;
        let endpoint = null;
        let uri = null;
        if (type === 'recieve') {
            params = {
                query: `irate(node_network_receive_bytes_total{instance="${server}:9100", device!="lo"}[2m]) /100000`,
                time: new Date().getTime() / 1000
            };
            endpoint = 'query';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&time=${params.time}`;
            return { uri, endpoint };
        }
        if (type === 'transmit') {
            params = {
                query: `irate(node_network_transmit_bytes_total{instance="${server}:9100", device!="lo"}[2m]) /100000`,
                time: new Date().getTime() / 1000
            };
            endpoint = 'query';
            uri = `${process.env.PROMETHEUS_URL}/api/v1/${endpoint}?query=${params.query}&time=${params.time}`;
        }

        return { uri, endpoint };
    } catch (ex) {
        const err = `buildCpuQuery, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};
