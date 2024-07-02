const express = require('express');
const fileUpload = require('express-fileupload');
const pdf = require('pdf-parse');
const { create } = require('xmlbuilder2');
const cors = require('cors'); // Importa el módulo cors

const app = express();
const port = 3001;

app.use(cors()); // Usa cors para permitir las conexiones desde el frontend
app.use(fileUpload());

app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.pdf) {
        return res.status(400).send('No files were uploaded.');
    }

    const pdfFile = req.files.pdf;
    const data = await pdf(pdfFile.data);

    const xml = create({ version: '1.0' })
        .ele('root')
        .ele('text')
        .txt(data.text)
        .up()
        .end({ prettyPrint: true });

    res.set('Content-Type', 'application/xml');
    res.send(xml);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

