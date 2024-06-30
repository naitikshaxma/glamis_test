import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

async function speechToText(audio) {
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audio),
        model: "whisper-1",
    });

    return transcription.text
}

export default speechToText;