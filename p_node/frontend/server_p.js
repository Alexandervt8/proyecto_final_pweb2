import express from 'express';
import fileUpload from 'express-fileupload';
import pdf from 'pdf-parse';
import { create } from 'xmlbuilder2';
import cors from 'cors';
import bodyParser from 'body-parser';
import xml2js from 'xml2js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import Connection from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(fileUpload());

// Servir archivos estáticos de la carpeta 'build'
app.use(express.static(join(__dirname, 'build')));

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

app.get('/get-vacancies', async (req, res) => {
    await Connection.determineVacancies();

    const data = await Connection.getVacancies();
    let dataObject = {};

    data.forEach(({ nombre_curso, vacantes }) => {
        dataObject[nombre_curso] = vacantes;
    });

    res.send(JSON.stringify(dataObject, null, 4));
});

app.use(bodyParser.text({ type: 'application/xml' }));

app.post('/receive-xml', async (req, res) => {
    const xml = req.body;
    let parser = new xml2js.Parser();

    try {
        const result = await parser.parseStringPromise(xml);
        let root = result.root;

        let code = root.children[0]._;
        let name = root.children[1]._;
        let semester = root.children[2]._;

        if (code === "1702118" || code === "1702122" || code === "1703135" || code === "1703136") {
            let data = {};
            for (let i = 3; i < root.children.length; i++) {
                let linea = root.children[i];
                let cui = linea.cui[0];
                let state = linea.estado[0];

                data["dt" + (i - 2)] = { cui, state, code };
            }

            await Connection.insertPrerequisiteSpecial({ data });
        } else {
            let approved = 0;
            for (let i = 3; i < root.children.length; i++) {
                let linea = root.children[i];
                let status = linea.estado[0];

                if (status === "APROBADO") {
                    approved++;
                }
            }

            await Connection.insertPrerequisite({ code, name, approved, semester });
        }

        res.status(200).send('Data received and processed');
    } catch (error) {
        console.error('Error processing XML:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Guardar el archivo XML en el servidor
app.post('/save-xml', (req, res) => {
    const xmlData = req.body;

    if (!xmlData) {
        return res.status(400).send('No XML data provided.');
    }

    const filePath = join(__dirname, 'uploads', 'converted.xml');

    fs.writeFile(filePath, xmlData, 'utf8', (err) => {
        if (err) {
            console.error('Error saving XML file:', err);
            return res.status(500).send('Error saving XML file.');
        }

        res.status(200).send('XML file saved successfully.');
    });
});

// Leer el archivo XML del servidor
app.get('/get-xml', (req, res) => {
    const filePath = join(__dirname, 'uploads', 'converted.xml');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading XML file:', err);
            return res.status(500).send('Error reading XML file.');
        }

        res.set('Content-Type', 'application/xml');
        res.send(data);
    });
});

// Servir el index.html para todas las rutas no API
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
