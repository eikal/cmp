export const titleCase = (title) => {
    if (!title) {
        return '';
    }
    if (title.length < 2) { 
        return title;
    }
    return title[0].toUpperCase() + title.slice(1).toLowerCase();
}

export const isEmailValidate = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return true
    }
    return false
}

export const includeSpacielChars = (str) => {
    if (!str) {
        return false;
    }
    const specialChars = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}

export const capitalizeStr = (str) => {
    const finalStr = str.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    return finalStr;
}