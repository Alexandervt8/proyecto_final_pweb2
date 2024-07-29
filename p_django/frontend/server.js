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

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(fileUpload());
app.use(bodyParser.text({ type: 'application/xml' }));

// Servir archivos estáticos de la carpeta 'build'
app.use(express.static(join(__dirname, 'build')));

app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.pdf) {
        return res.status(400).send('No se subieron archivos.');
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

app.get('/get-uploaded-xml', async (req, res) => {
    try {
        const [rows] = await Connection.getUploadedXMLData();
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los datos del XML:', error);
        res.status(500).send('Error al obtener los datos del XML.');
    }
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

        res.status(200).send('Datos recibidos y procesados');
    } catch (error) {
        console.error('Error al procesar el XML:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Guardar el archivo XML en el servidor
app.post('/save-xml', (req, res) => {
    const xmlData = req.body;

    if (!xmlData) {
        return res.status(400).send('No se proporcionaron datos XML.');
    }

    const filePath = join(__dirname, 'uploads', 'converted.xml');

    fs.writeFile(filePath, xmlData, (err) => {
        if (err) {
            console.error('Error al guardar el archivo XML:', err);
            return res.status(500).send('Error al guardar el archivo XML.');
        }

        res.status(200).send('Archivo XML guardado exitosamente.');
    });
});

// Guardar el archivo XML en el servidor
app.post('/save-plan-xml', (req, res) => {
    const xmlData = req.body;

    if (!xmlData) {
        return res.status(400).send('No se proporcionaron datos XML.');
    }

    const filePath = join(__dirname, 'uploads', 'converted.xml');

    fs.writeFile(filePath, xmlData, (err) => {
        if (err) {
            console.error('Error al guardar el archivo XML:', err);
            return res.status(500).send('Error al guardar el archivo XML.');
        }

        res.status(200).send('Archivo XML guardado exitosamente.');
    });
});

// Cargar el contenido del XML en la base de datos
app.post('/upload-xml-to-db', async (req, res) => {
    const xml = req.body;
    let parser = new xml2js.Parser();

    try {
        const result = await parser.parseStringPromise(xml);

        // Log del resultado para ver la estructura real del XML
        console.log('XML parseado:', result);

        // Extraer líneas correctamente
        let lines = result.root ? result.root.linea : result.linea;

        if (!Array.isArray(lines)) {
            // Si lines no es un arreglo, conviértelo en un arreglo
            if (lines !== undefined) {
                lines = [lines];
            } else {
                console.error('Estructura XML inválida:', result);
                return res.status(400).send('Estructura XML inválida');
            }
        }

        for (let line of lines) {
            let id = line.id[0];
            let cui = line.cui[0];
            let nombres = line.nombres[0];
            let matricula = line.matricula[0];
            let nota = line.nota[0];
            let estado = line.estado[0];

            // Insertar datos en la base de datos (asegúrate de que la tabla y los campos coincidan con tu estructura)
            await Connection.insertPrerequisite({
                code: id,
                name: nombres,
                approved: estado === 'APROBADO' ? 1 : 0,
                semester: matricula
            });
        }

        res.status(200).send('Datos XML subidos a la base de datos exitosamente.');
    } catch (error) {
        console.error('Error al procesar el XML:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});


