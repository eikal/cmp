export const isBasicUser = () => {
    return localStorage.getItem('role') === 'basic'
}

export const isAdvancedUser = () => {
    return localStorage.getItem('role') === 'advanced'
}

export const isAdminUser = () => {
    return localStorage.getItem('role') === 'admin'
}

export const isSuperAdminUser = () => {
    return localStorage.getItem('role') === 'superAdmin'
}

export const getCloudspaceID = () => {
    if (localStorage.getItem('cloudspace')) {
        return JSON.parse(localStorage.getItem('cloudspace')).id
    } else {
        return null;
    }
}
