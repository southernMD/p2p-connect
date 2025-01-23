/**
 * @description: 输入 blob 返回zip下载
 * @param {Blob} content
 * @return {void}
 */
export const triggerDownloadZip = (content: Blob) => {
    const a = document.createElement('a');
    const url = URL.createObjectURL(content);
    a.href = url;
    a.download = 'uploaded_files.zip';
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * @description: 输入blob与文件名，返回指定下载文件
 * @param {Blob} content
 * @param {string} name
 * @return {voide}
 */
export const triggerDownload = async (content: Blob, name: string) => {
    const a = document.createElement('a');
    const url = URL.createObjectURL(content);
    a.href = url;
    a.download = new Date().getTime() + '.' + name;
    a.click();
    URL.revokeObjectURL(url);
};