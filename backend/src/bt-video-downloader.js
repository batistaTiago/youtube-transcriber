const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

class BTVideoDownloader {
    constructor(url) {

        this.getBasicVideoInfo = this.getBasicVideoInfo.bind(this);
        this.downloadVideo = this.downloadVideo.bind(this);
        this.experimentalDownload = this.experimentalDownload.bind(this);

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
        // const fileNameWithExtension = `${info.title.slugify()}.mp3`;
        const fileName = `420_coding.mp3`;
        const stream = fs.createWriteStream(fileName);
        const download = ytdl(url, { filter: 'audioonly' }).pipe(stream);
        download.close();

        return {
            video: download,
            fileName: fileName
        };
    }


    experimentalDownload = async(_url) => {

        const url = this.url ? this.url : _url;

        const audioOutput = path.resolve(__dirname, 'sound.mp4');
        const mainOutput = path.resolve(__dirname, 'output.mp4');

        const onProgress = (chunkLength, downloaded, total) => {
            const percent = downloaded / total;
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
            process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)`);
        };

        console.log('downloading audio track');

        ytdl(url, {
                filter: format => format.container === 'mp4' && !format.qualityLabel,
            }).on('error', console.error)
            .on('progress', onProgress)

        // Write audio to file since ffmpeg supports only one input stream.
        .pipe(fs.createWriteStream(audioOutput))
            .on('finish', () => {
                console.log('\ndownloading video');
                const video = ytdl(url, {
                    filter: format => format.container === 'mp4' && !format.audioEncoding,
                });
                video.on('progress', onProgress);
                ffmpeg()
                    .input(video)
                    .videoCodec('copy')
                    .input(audioOutput)
                    .audioCodec('copy')
                    .save(mainOutput)
                    .on('error', console.error)
                    .on('end', () => {
                        fs.unlink(audioOutput, err => {
                            if (err) console.error(err);
                            else console.log(`\nfinished downloading, saved to ${mainOutput}`);
                        });
                    });
            });

        return mainOutput;
    }
}

module.exports = BTVideoDownloader;