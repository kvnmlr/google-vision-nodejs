const express = require('express');
const app = express();
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const vision = require('@google-cloud/vision');


app.listen(5000, '127.0.0.1', () => {
    console.log('Listening!');
    sample();
});


async function sample() {
    const filename = './samples/textimagelong.jpg';
    console.log("Using " + filename)

    // Imports the Google Cloud client library
    const content = await readFile(filename);

    const requestBody = {
        "keyFilename": './keyfile.json',
    }

    const requests = {
        "requests": [
            {
                "image": {
                    "content": content.toString('base64')
                },
                "features": [
                    {
                        "type": "DOCUMENT_TEXT_DETECTION"
                    }
                ],
                "imageContext": {
                    "languageHints": ["de"]
                }
            }]
    }

    // Creates a client
    const client = new vision.ImageAnnotatorClient(requestBody);

    // Read a local image as a text document
    let [result] = await client.batchAnnotateImages(requests);
    result = result.responses[0];
    const fullTextAnnotation = result.fullTextAnnotation;
    console.log(`Full text: ${fullTextAnnotation.text}`);

    // Remove return to print full response
    return; 
    fullTextAnnotation.pages.forEach(page => {
        page.blocks.forEach(block => {
            console.log(`Block confidence: ${block.confidence}`);
            block.paragraphs.forEach(paragraph => {
                console.log(`Paragraph confidence: ${paragraph.confidence}`);
                paragraph.words.forEach(word => {
                    const wordText = word.symbols.map(s => s.text).join('');
                    console.log(`Word text: ${wordText}`);
                    console.log(`Word confidence: ${word.confidence}`);
                    word.symbols.forEach(symbol => {
                        console.log(`Symbol text: ${symbol.text}`);
                        console.log(`Symbol confidence: ${symbol.confidence}`);
                    });
                });
            });
        });
    });
}