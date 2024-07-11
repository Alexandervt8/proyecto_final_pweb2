const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'prediccion_matriculas'
});

db.getConnection()
    .then(() => {
        console.log('Conectado a la base de datos MySQL');
    })
    .catch((err) => {
        console.error('Error conectando a la base de datos MySQL:', err);
    });

export class Connection {
    static async insertPrerequisite({ code, name, approved, semester }) {
        const courseExists = async function (code) {
            try {
                const [rows] = await db.execute('SELECT * FROM prerrequisitos WHERE codigo_curso = ?', [code]);
                return rows.length > 0;
            } catch (error) {
                console.error('Error al comprobar el curso:', error);
                return false;
            }
        };

        if (await courseExists(code)) {
            const [rows] = await db.execute('SELECT aprobados_curso FROM prerrequisitos WHERE codigo_curso = ?', [code]);
            const currentApproved = rows[0].aprobados_curso;

            approved += currentApproved;

            await db.execute('UPDATE prerrequisitos SET aprobados_curso = ? WHERE codigo_curso = ?', [approved, code]);
        } else {
            await db.execute('INSERT INTO prerrequisitos (codigo_curso, nombre_curso, aprobados_curso, semestre_curso) VALUES (?, ?, ?, ?)', [code, name, approved, semester]);
        }
    }

    static async determineVacancies() {
        const [rows] = await db.execute('SELECT codigo_curso, vacantes, prerrequisitos FROM vacantes')

        for (let row of rows) {
            const { code, vacancies, prerequisites } = row;

            if (vacancies === NULL) {
                let jsonString = prerequisites.jsonString;
                let jsonArray = JSON.parse(jsonString);

                if (jsonArray.length == 2) { // Podemos mejorarlo si asi lo desean pero faltara tiempo
                    const rws1 = await db.execute('SELECT aprobados_curso FROM prerrequisitos WHERE codigo_curso = ?', [jsonArray[0]]);
                    const rws2 = await db.execute('SELECT aprobados_curso FROM prerrequisitos WHERE codigo_curso = ?', [jsonArray[1]]);

                    let vacanciesFinal = Math.min(rws1[0], rws2[0])
                    await db.execute('UPDATE vacantes SET vacantes = ? WHERE codigo_curso = ?', [vacanciesFinal, code])
                } 
                else { // Aqui no hay problem
                    const rws = await db.execute('SELECT aprobados_curso FROM prerrequisitos WHERE codigo_curso = ?', [jsonArray[0]]);
                    await db.execute('UPDATE vacantes SET vacantes = ? WHERE codigo_curso = ?', [rws[0], code])
                }
            }
        }
    }

    static async getVacancies() {
        try {
            const [rows] = await db.execute('SELECT nombre_curso, vacantes FROM vacantes');
            return rows;
        } catch {
            return [];
        }
    }

    static closeConnection() {
        db.end((err) => {
            if (err) {
                console.error('Error al cerrar la conexión a la base de datos', err);
            } else {
                console.log('Conexión a la base de datos cerrada');
            }
        });
    }
}
