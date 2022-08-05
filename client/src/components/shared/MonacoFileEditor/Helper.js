/**
 * Parse and improve content according the file extension
 * @param {String} contentOutput - the content
 * @param {String} type - file extension
 * @returns formatted content
 */
export const prepareContent = (contentOutput, type) => {
    if (type === 'json') {
        try {
            return JSON.stringify(JSON.parse(contentOutput), null, 2)
        } catch (e) {
            throw new Error("JSON file is not valid, please fix it")
        }
    } else {
        return contentOutput;
    }
}

/**
 * Determine the theme of the Monaco file viewer, according edit mode and current theme
 * @param {Boolean} isEditMode
 * @param {String} currentTheme - 'light' or 'dark'
 * @param {String} swap - (optional) 'swap between light' to 'dark' 
 */
export const setMonacoTheme = (monaco, isEditMode, currentTheme, swap) => {
    try {
        if (swap) {
            if (currentTheme.includes('dark')) {
                currentTheme = 'light';
            } else {
                currentTheme = 'dark';
            }
        }
        if (isEditMode) {
            if (currentTheme.includes('dark')) {
                monaco.editor.setTheme('vs-dark');
                return 'vs-dark'
            } else {
                monaco.editor.setTheme('lightEdit');
                return 'lightEdit'
            }
        } else {
            if (currentTheme.includes('dark')) {
                monaco.editor.setTheme('darkReadOnly');
                return 'darkReadOnly'
            } else {
                monaco.editor.setTheme('lightReadOnly');
                return 'lightReadOnly'
            }
        }
    } catch (ex) {
        return null;
    }
}


export const getLanguage = (fileType) => {
    if (fileType === 'xml') {
        return "xml";
    }
    else if (/properties|profile/i.test(fileType)) {
        return "plaintext";
    }
    else if (/yaml|yml/i.test(fileType)) {
        return "yaml";
    }
    else if (fileType === 'json') {
        return "json";
    }
    else if (fileType === 'sh') {
        return "shell";
    }
    else return "plaintext";
}

export const isMyBackup = (backupOptional, fileName) => {
    try {
        const fileNameSplit = fileName.split(".");
        const baseFilename = fileNameSplit[0];
        const fileExtension = fileNameSplit[fileNameSplit.length - 1];
        if (backupOptional.startsWith(baseFilename + "." + fileExtension + '._bkp')) {
            return true;
        } else return false;
    } catch (ex) {
        return false;
    }
}