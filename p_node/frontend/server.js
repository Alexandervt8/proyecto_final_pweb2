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

// Ruta para obtener códigos de los planes
app.get('/get-planes-codes', async (req, res) => {
    try {
        const rows = await Connection.getPlanes(); // Usar el método estático de la clase Connection
        if (!Array.isArray(rows)) {
            throw new Error('La respuesta de la base de datos no es un array');
        }

        const codes = rows.map(row => row.codigo);
        res.json(codes);
    } catch (error) {
        console.error('Error al obtener los códigos de los planes:', error);
        res.status(500).send('Error al obtener los códigos de los planes');
    }
});

// Ruta para obtener las filas con notas >= 11
app.get('/get-grade-count/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const [rows] = await Connection.getGradeCount(code);
        console.log('Resultado de getGradeCount en el servidor:', rows); // Depuración
        
        // Verifica si rows tiene la estructura esperada
        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404).send('No se encontraron datos con nota mayor o igual a 11.');
        }
    } catch (error) {
        console.error('Error al obtener las filas con notas >= 11:', error);
        res.status(500).send('Error al obtener las filas con notas.');
    }
});



// Ruta para obtener la lista de tablas de la base de datos
app.get('/tables', async (req, res) => {
    try {
        const tables = await Connection.getTables();
        res.json(tables);
    } catch (error) {
        console.error('Error al obtener las tablas:', error);
        res.status(500).send('Error al obtener las tablas.');
    }
});

// Ruta para borrar una tabla de la base de datos
app.delete('/tables/:tableName', async (req, res) => {
    const tableName = req.params.tableName;
    try {
        await Connection.deleteTable(tableName);
        res.status(200).send(`Tabla ${tableName} eliminada correctamente.`);
    } catch (error) {
        console.error('Error al eliminar la tabla:', error);
        res.status(500).send('Error al eliminar la tabla.');
    }
});

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

app.get('/get-cursos', async (req, res) => {
    try {
        const cursos = await Connection.getCursos();
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/get-planes', async (req, res) => {
    try {
        const planes = await Connection.getPlanes();
        res.json(planes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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

    const filePath = join(__dirname, 'uploads', 'cursos.xml');

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

    const filePath = join(__dirname, 'uploads', 'plan.xml');

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
        let codigo_curso = result.root ? result.root.codigo_curso[0] : result.codigo_curso[0];
        let nombre_curso = result.root ? result.root.nombre_curso[0] : result.nombre_curso[0];

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
            await Connection.insertCurso({
                code: codigo_curso,
                name_curso: nombre_curso,
                name: nombres,
                nota: nota,
                matricula: matricula
            });
        }

        res.status(200).send('Datos XML subidos a la base de datos exitosamente.');
    } catch (error) {
        console.error('Error al procesar el XML:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.post('/upload-xml-to-db-plan', async (req, res) => {
    const xml = req.body;
    let parser = new xml2js.Parser();

    try {
        const result = await parser.parseStringPromise(xml);

        // Log del resultado para ver la estructura real del XML
        console.log('XML parseado:', result);

        // Extraer los planes correctamente
        let plans = result.root ? result.root.plan : result.plan;

        if (!Array.isArray(plans)) {
            // Si plans no es un arreglo, conviértelo en un arreglo
            if (plans !== undefined) {
                plans = [plans];
            } else {
                console.error('Estructura XML inválida:', result);
                return res.status(400).send('Estructura XML inválida');
            }
        }

        for (let plan of plans) {
            let componente = plan.componente[0];
            let codigo = plan.codigo[0];
            let curso = plan.curso[0];
            let creditaje = plan.creditaje[0];
            let prerequisito1 = plan.prerequisito1[0] || null;
            let prerequisito2 = plan.prerequisito2[0] || null;

            // Insertar datos en la base de datos (asegúrate de que la tabla y los campos coincidan con tu estructura)
            await Connection.insertPlan({
                component: componente,
                code: codigo,
                course: curso,
                credits: creditaje,
                prerequisite1: prerequisito1,
                prerequisite2: prerequisito2
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


