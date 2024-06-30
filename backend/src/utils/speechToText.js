import fs from "fs";
import OpenAI from "openai";


async function speechToText(audio) {
    const openai = new OpenAI();
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audio),
        model: "whisper-1",
        response_format: "json",
        prompt: "input will be in english language only",
    });

    return transcription.text
}

export { speechToText };