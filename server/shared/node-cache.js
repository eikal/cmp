import NodeCache from 'node-cache';
const cacheInstance = new NodeCache();

export const getCacheConnection = () => {
    return cacheInstance;
};

export const setKey = (key, obj, ttl = 10000) => {
    return cacheInstance.set(key, obj, ttl);
};

export const msetKey = (objects) => {
    return cacheInstance.mset(objects);
};

export const getKey = (key) => {
    return cacheInstance.get(key);
};

export const mgetKey = (keys) => {
    return cacheInstance.mget(keys);
};

export const getKeys = () => {
    return cacheInstance.keys();
};

export const deleteKey = (key) => { // Delete a key. Returns the number of deleted entries. A delete will never fail.
    return cacheInstance.del(key);
};

export const takeKey = (key) => { // get the cached value and remove the key from the cache.
    return cacheInstance.take(key);
};

export const changeTTL = (key, ttl) => { // Redefine the ttl of a key. Returns true if the key has been found and changed. Otherwise returns false. If the ttl-argument isn't passed the default-TTL will be used.
    return cacheInstance.ttl(key, ttl);
};

export const getTTL = (key) => {
    return cacheInstance.getTtl(key);
};

export const flushAll = () => {
    return cacheInstance.flushAll();
};
