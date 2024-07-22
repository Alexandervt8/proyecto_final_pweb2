import Connection from './connection.js';

const express = require('express')
const fileUpload = require('express-fileupload')
const pdf = require('pdf-parse')
const { create } = require('xmlbuilder2')
const cors = require('cors') // Importa el módulo cors
const bodyParser = require('body-parser')
const { Connection } = require('./connection')
const xml2js = require('xml2js');

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
    console.log(xml)
    res.send(xml);
});

app.get('/get-vacancies', async (req, res) => {
    await Connection.determineVacancies();
    
    const data = await Connection.getVacancies();
    let dataObject = {};

    data.array.forEach(([key, value]) => {
        dataObject[key] = value;
    });

    res.send(JSON.stringify(dataObject, null, 4));
})

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

