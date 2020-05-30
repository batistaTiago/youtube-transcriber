const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require("path");

class BTVideoDownloader {
    constructor(url) {

        this.getBasicVideoInfo = this.getBasicVideoInfo.bind(this);
        this.downloadVideo = this.downloadVideo.bind(this);

        if (url) {
            this.url = url;
        }
    }

    getBasicVideoInfo = async(_url) => {

        const url = this.url ? this.url : _url;

        const videoInfo = await ytdl.getBasicInfo(url)
        return videoInfo;
    };

    downloadVideo = async(_url) => {

        const url = this.url ? this.url : _url;

        const info = await this.getBasicVideoInfo(url);
        const fileNameWithExtension = `${info.title.slugify()}.mp4`
        const video = ytdl(url, { itag: 18 }).pipe(fs.createWriteStream(fileNameWithExtension));

        const fullPath = path.resolve(__dirname + '/../' + video.path);

        return {
            file: video,
            fileName: fileNameWithExtension,
            fullPath: fullPath
        };
    }

    downloadAudioChannel = async(_url) => {

        const url = this.url ? this.url : _url;

        const info = await this.getBasicVideoInfo(url);
        const fileNameWithExtension = `file.mp3`
        const video = ytdl(url, { itag: 251, format: 'audioonly' }).pipe(fs.createWriteStream(fileNameWithExtension));

        const fullPath = path.resolve(__dirname + '/../' + video.path);

        return {
            file: video,
            fileName: fileNameWithExtension,
            fullPath: fullPath
        };
    }
}

module.exports = BTVideoDownloader;