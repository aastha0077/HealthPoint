export const handleDownload = async (url: string, filename: string) => {
    try {
        let downloadUrl = url;
        if (url.includes('cloudinary.com') && !url.includes('fl_attachment')) {
            downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
        }

        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error('Fetch failed');
        
        const blob = await response.blob();
        const localUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = localUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(localUrl);
    } catch (error) {
        console.error("Download failed", error);
        let fallbackUrl = url;
        if (url.includes('cloudinary.com') && !url.includes('fl_attachment')) {
            fallbackUrl = url.replace('/upload/', '/upload/fl_attachment/');
        }
        window.open(fallbackUrl, '_blank');
    }
};
