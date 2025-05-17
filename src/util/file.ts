import {Capacitor} from "@capacitor/core";

import {Share} from '@capacitor/share';
import {Directory, Encoding, Filesystem} from '@capacitor/filesystem';

export async function downloadTextFile(fileName: string, mimeType: string, text: string) {
    if (Capacitor.isNativePlatform()) {
        const path = `${Date.now()}-${fileName}`;

        await Filesystem.writeFile({
            path,
            data: text,
            encoding: Encoding.UTF8,
            directory: Directory.Cache,
        });

        const fileUri = await Filesystem.getUri({
            path,
            directory: Directory.Cache,
        });

        await Share.share({
            title: 'Export file',
            url: fileUri.uri,
            dialogTitle: 'Save or share your export file',
        });
    } else {
        const blob = new Blob([text], {type: mimeType});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
