/* packages used */
const cors = require('cors');
const bodyParser = require('body-parser');
const server = require('express')();
const BTVideoDownloader = require('./bt-video-downloader');
const BTAudioTranscriber = require('./bt-audio-transcriber');
const ERRORS = require('./errors');

/* environment */
const PORT = 3000;
process.env.GOOGLE_APPLICATION_CREDENTIALS = __dirname + '/../speech-to-text-demo-keys.json';

String.prototype.slugify = function() {

    return this.toString().toLowerCase()
        .replace(/[àÀáÁâÂãäÄÅåª]+/g, 'a') // Special Characters #1
        .replace(/[èÈéÉêÊëË]+/g, 'e') // Special Characters #2
        .replace(/[ìÌíÍîÎïÏ]+/g, 'i') // Special Characters #3
        .replace(/[òÒóÓôÔõÕöÖº]+/g, 'o') // Special Characters #4
        .replace(/[ùÙúÚûÛüÜ]+/g, 'u') // Special Characters #5
        .replace(/[ýÝÿŸ]+/g, 'y') // Special Characters #6
        .replace(/[ñÑ]+/g, 'n') // Special Characters #7
        .replace(/[çÇ]+/g, 'c') // Special Characters #8
        .replace(/[ß]+/g, 'ss') // Special Characters #9
        .replace(/[Ææ]+/g, 'ae') // Special Characters #10
        .replace(/[Øøœ]+/g, 'oe') // Special Characters #11
        .replace(/[%]+/g, 'pct') // Special Characters #12
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text

};


/* middlewares */
server.use(cors());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.getRequestUrl = (req, res) => {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
};

server.getStoragePath = (relativePath) => {
    return `${__dirname}/${relativePath}`;
}

/* routes */
server.get('/service-status', (req, res) => {
    res.send('<h3>YTTranscript\'s Webservice is ONLINE and RUNNING!</h3>');
});


server.post('/get-info', async(req, res) => {

    try {

        if (!req.body.url) {
            return res.json({
                success: false,
                route: server.getRequestUrl(req),
                error: ERRORS.ERROR_VIDEO_URL_MISSING
            });
        }

        const downloader = new BTVideoDownloader(req.body.url);
        const info = await downloader.getBasicVideoInfo();

        return res.json(info.formats);

    } catch (e) {
        console.log(e);
        return res.send({
            success: false,
            route: server.getRequestUrl(req),
            error: ERRORS.GENERIC_500,
            message: e.message
        });
    }
});


server.post('/download', async(req, res) => {

    try {

        if (!req.body.url) {
            return res.json({
                success: false,
                route: server.getRequestUrl(req),
                error: ERRORS.ERROR_VIDEO_URL_MISSING
            });
        }

        const downloader = new BTVideoDownloader(req.body.url);
        const video = await downloader.downloadVideo();

        return res.sendFile(video.fullPath);

    } catch (e) {
        console.log(e);
        return res.send({
            success: false,
            route: server.getRequestUrl(req),
            error: ERRORS.GENERIC_500,
            message: e.message
        });
    }
});


server.post('/transcribe-file', async(req, res) => {
    try {

        if (!req.body.url) {
            return res.json({
                success: false,
                route: server.getRequestUrl(req),
                error: ERRORS.ERROR_VIDEO_URL_MISSING
            });
        }

        const downloader = new BTVideoDownloader(req.body.url);
        const audioChannel = await downloader.downloadAudioChannel();

        const transcriber = new BTAudioTranscriber();
        const transcriptionResult = await transcriber.transcribeAudio(audioChannel.fileName);

        return res.json({
            success: true,
            text: transcriptionResult
        });

    } catch (e) {
        console.log(e);
        return res.send({
            success: false,
            route: server.getRequestUrl(req),
            error: ERRORS.GENERIC_500,
            message: e.message
        });
    }

});



/* initialing server */
server.listen(PORT, () => {
    console.log('listening on PORT: ' + PORT);
});