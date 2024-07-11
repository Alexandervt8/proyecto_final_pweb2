import Connection from './connection.js';

const express = require('express')
const fileUpload = require('express-fileupload')
const pdf = require('pdf-parse')
const { create } = require('xmlbuilder2')
const cors = require('cors') // Importa el módulo cors
const bodyParser = require('body-parser');
const { Connection } = require('./connection')

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
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xml, "application/xml");

    let root = xmlDoc.documentElement;

    let code = root.children[0].textContent; // <?>1234567</?>
    let name = root.children[1].textContent; // <?>FUNDAMENTOS DE PROGRAMACION 2</?>
    let semester = root.children[2].textContent; // <?>2024A</?> or <?>2024-A</?>

    let approved = 0;
    for (let i = 3; i < root.children.length; i++) {
        let linea = root.children[i]; // Acceder al elemento <linea>
        let status = linea.getElementsByTagName('estado')[0].textContent; // Acceder al elemento <estado> dentro de <linea>
        
        if (status === "APROBADO") {
            approved++;
        }
    }

    await Connection.insertPrerrequisite({ code, name, approved, semester });

    res.status(200).send('Data received and processed');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

