import oracledb from 'oracledb';
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/**
 * This method execute query on oracledb
 * @param {Object} connection - connection object
 * @param {String} query - query for example,  `select * from ic_principals where tenant_id = :id`
 * @param {Array} params - array of parmeters query for example, ['SLF']
 * @param {Boolean} params - default set to close connection after execute query
 */
export const executeQuery = async (connection, query, params, isCloseConnection = true) => {
    try {
        const result = await connection.execute(query, params);
        return result;
    } catch (ex) {
        const error = `executeQuery -- ${ex}`;
        console.error(error);
        throw error;
    } finally {
        if (connection && isCloseConnection) {
            try {
                await connection.close();
            } catch (ex) {
                console.error(`executeQuery -- Failed to close connection, Error:${ex}`);
            }
        }
    }
};

/**
 * This method check test connection with DB
 * @param {String} oracleHomePath - oracle home path
 * @param {String} username - oracle user
 * @param {String} password - oracle paswword
 * @param {String} connectionString - oracle connection string
 */
export const testConnection = async (oracleHomePath, username, password, connectionString) => {
    let connection;
    try {
        let libdir = `${oracleHomePath}/instantclient`;
        if (process.platform === 'win32') {
            libdir = oracleHomePath;
        }
        try {
            oracledb.initOracleClient({
                libDir: libdir
            });
        } catch (ex) {
        }

        connection = await oracledb.getConnection({
            user: username,
            password: password,
            connectString: connectionString
        });

        if (connection) {
            return true;
        } else {
            return false;
        }
    } catch (ex) {
        const error = `testConnection -- ${ex}`;
        console.error(error);
        if (connection) {
            await connection.close();
        }
        return false;
    }
};

/**
 * This method check return connection
 * @param {String} oracleHomePath - oracle home path
 * @param {String} username - oracle user
 * @param {String} password - oracle paswword
 * @param {String} connectionString - oracle connection string
 */
export const getConnection = async (oracleHomePath, username, password, connectionString) => {
    let connection;
    try {
        let libdir = `${oracleHomePath}/instantclient`;
        if (process.platform === 'win32') {
            libdir = oracleHomePath;
        }
        try {
            oracledb.initOracleClient({
                libDir: libdir
            });
        } catch (ex) {
        }

        connection = await oracledb.getConnection({
            user: username,
            password: password,
            connectString: connectionString
        });

        return connection;
    } catch (ex) {
        const error = `getConnection -- ${ex}`;
        console.error(error);
        if (connection) {
            await connection.close();
        }
        throw error;
    }
};
