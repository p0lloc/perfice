export function downloadTextFile(fileName: string, mimeType: string, text: string){
    const blob = new Blob([text], {type: mimeType});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
