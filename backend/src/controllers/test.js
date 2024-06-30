import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

async function speechToText(audio) {
    const transcription = await openai.audio.transcriptions.create({
<<<<<<< Updated upstream
        file: fs.createReadStream(audio),
=======
        file: fs.createReadStream("./answer01.webm"),
>>>>>>> Stashed changes
        model: "whisper-1",
    });

    return transcription.text
}

export default speechToText;