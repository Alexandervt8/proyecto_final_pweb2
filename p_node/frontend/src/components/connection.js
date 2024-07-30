import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'prediccion_matriculas'
});

db.getConnection()
    .then(() => {
        console.log('Conectado a la base de datos MySQL');
        ensureTablesExist(); // Llamada para asegurarse de que las tablas existen
    })
    .catch((err) => {
        console.error('Error conectando a la base de datos MySQL:', err);
    });

// Función para asegurarse de que las tablas existen
async function ensureTablesExist() {
    const createPrerequisitesTableQuery = `
        CREATE TABLE IF NOT EXISTS prerrequisitos (
            codigo_curso VARCHAR(50) NOT NULL,
            nombre_curso VARCHAR(255) NOT NULL,
            aprobados_curso INT NOT NULL,
            semestre_curso VARCHAR(50) NOT NULL,
            PRIMARY KEY (codigo_curso)
        )
    `;
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            metodo VARCHAR(50) NOT NULL
        )
    `;

    await db.query(createPrerequisitesTableQuery);
    await db.query(createUsersTableQuery);
}

class Connection {
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

    static async insertPrerequisiteSpecial({ data }) {
        let count = Object.keys(data).length;

        for (let i = 1; i <= count; i++) {
            const { cui, state, code } = data["dt" + i];
            await db.execute('INSERT INTO prerrequisitos_especiales (cui, estado, codigo_curso) VALUES (?, ?, ?)', [cui, state, code]);
        }
    }

    static async determineVacancies() {
        const [rows] = await db.execute('SELECT codigo_curso, vacantes, prerrequisitos FROM vacantes');

        for (let row of rows) {
            const { codigo_curso: code, vacantes: vacancies, prerrequisitos: prerequisites } = row;

            if (vacancies === null) {
                let jsonArray = JSON.parse(prerequisites);

                if (jsonArray.length === 2) {
                    let count = 0;

                    const [rowsFirst] = await db.execute('SELECT cui FROM prerrequisitos_especiales WHERE codigo_curso = ?', [jsonArray[0]]);

                    for (let myRow of rowsFirst) {
                        const { cui: myCUI } = myRow;
                        const [rowsSecond] = await db.execute('SELECT * FROM prerrequisitos_especiales WHERE cui = ? AND codigo_curso = ?', [myCUI, jsonArray[1]]);

                        if (rowsSecond.length > 0) {
                            count++;
                        }
                    }
                    await db.execute('UPDATE vacantes SET vacantes = ? WHERE codigo_curso = ?', [count, code]);
                } else {
                    const [rows] = await db.execute('SELECT aprobados_curso FROM prerrequisitos WHERE codigo_curso = ?', [jsonArray[0]]);
                    await db.execute('UPDATE vacantes SET vacantes = ? WHERE codigo_curso = ?', [rows[0].aprobados_curso, code]);
                }
            }
        }
    }

    static async getVacancies() {
        try {
            const [rows] = await db.execute('SELECT nombre_curso, vacantes FROM vacantes');
            return rows;
        } catch (error) {
            console.error('Error al obtener las vacantes:', error);
            return [];
        }
    }

    static async getUploadedXMLData() {
        try {
            const [rows] = await db.execute('SELECT * FROM prerrequisitos');
            return rows;
        } catch (error) {
            console.error('Error al obtener los datos del XML:', error);
            throw error;
        }
    }

    static async saveUser(email, name, method) {
        try {
            await db.execute(
                'INSERT INTO usuarios (email, nombre, metodo) VALUES (?, ?, ?)',
                [email, name, method]
            );
            console.log('Usuario guardado correctamente');
        } catch (error) {
            console.error('Error al guardar el usuario:', error);
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

export default Connection;

