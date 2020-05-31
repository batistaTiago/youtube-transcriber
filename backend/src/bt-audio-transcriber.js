// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');

class BTAudioTranscriber {
    constructor(languageCode) {
        this.client = new speech.SpeechClient();

        this.transcribeAudio = this.transcribeAudio.bind(this);
        this.languageCode = languageCode && languageCode.length == 5 ? languageCode : 'pt-BR';
    }


    transcribeAudio = async(filename) => {

        const filePath = path.resolve(__dirname + '/../' + filename);
        const encoding = 'MP3';
        const sampleRateHertz = 44100;

        const config = {
            encoding: encoding,
            sampleRateHertz: sampleRateHertz,
            languageCode: this.languageCode,
        };

        const audio = {
            content: fs.readFileSync(filename, { encoding: 'base64' })
        };

        return {
            audio,
            filename,
            filePath
        };

        const request = {
            config: config,
            audio: audio,
        };

        // Detects speech in the audio file. This creates a recognition job that you
        // can wait for now, or get its result later.
        const [operation] = await this.client.longRunningRecognize(request);

        // Get a Promise representation of the final result of the job
        const [response] = await operation.promise();

        let transcription = '';

        response.results.forEach(result => {
            transcription += result.alternatives[0].transcript
        })

        console.log(`\n\n\n\n\n\nTranscription: ${transcription}\n\n\n\n\n\n`);

        return transcription;
    }
}

module.exports = BTAudioTranscriber;