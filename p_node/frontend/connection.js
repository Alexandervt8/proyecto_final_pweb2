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
    const createCursosTableQuery = `
        CREATE TABLE IF NOT EXISTS cursos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            codigo_curso VARCHAR(50) NOT NULL,
            nombre_curso VARCHAR(255) NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            nota_curso INT NOT NULL,
            matricula_curso VARCHAR(50) NOT NULL
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

    const createPlansTableQuery = `
    CREATE TABLE IF NOT EXISTS planes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        componente VARCHAR(1) NOT NULL,
        codigo VARCHAR(10) NOT NULL,
        curso VARCHAR(255) NOT NULL,
        creditaje VARCHAR(2) NOT NULL,
        prerequisito1 VARCHAR(10),
        prerequisito2 VARCHAR(10)
    )
`;

    await db.query(createCursosTableQuery);
    await db.query(createUsersTableQuery);
    await db.query(createPlansTableQuery);
}

class Connection {
    
    static async getGradeCount(code) {
        const query = `
            SELECT * 
            FROM cursos 
            WHERE codigo_curso = ? AND nota_curso >= 11
        `;
        return await db.execute(query, [code]);
    }

    static async insertCurso({ code,name_curso,name, nota, matricula }) {
        try {
            
            // Insertar el nuevo curso
            const insertCursoQuery = `
                INSERT INTO cursos (codigo_curso, nombre_curso, nombre, nota_curso, matricula_curso)
                VALUES (?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(insertCursoQuery, [code,name_curso,name, nota, matricula]);
            return result;
        } catch (error) {
            console.error('Error al insertar el curso:', error);
            throw error;
        }
    }

    static async insertPlan({ component, code, course, credits, prerequisite1, prerequisite2 }) {
        // Verifica si credits es null, undefined o vacío, y proporciona un valor predeterminado
        const creditValue = credits && credits.trim() !== '' ? credits : '0';

        try {
            const query = `
                INSERT INTO planes (componente, codigo, curso, creditaje, prerequisito1, prerequisito2)
                VALUES (?, ?, ?, ?, ?, ?);
            `;
            await db.execute(query, [component, code, course, creditValue, prerequisite1, prerequisite2]);
        } catch (error) {
            console.error('Error al insertar el plan:', error);
            throw error;
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

    static async getCursos() {
        try {
            const [rows] = await db.execute('SELECT * FROM cursos');
            return rows;
        } catch (error) {
            console.error('Error al obtener los cursos:', error);
            throw error;
        }
    }

    static async getPlanes() {
        try {
            const [rows] = await db.execute('SELECT * FROM planes');
            return rows;
        } catch (error) {
            console.error('Error al obtener los planes:', error);
            throw error;
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

    static async getTables() {
        try {
            const [rows] = await db.query("SHOW TABLES");
            return rows.map(row => Object.values(row)[0]);
        } catch (error) {
            console.error('Error al obtener las tablas:', error);
            throw error;
        }
    }

    static async deleteTable(tableName) {
        try {
            await db.query(`DROP TABLE ??`, [tableName]);
            console.log(`Tabla ${tableName} eliminada correctamente`);
        } catch (error) {
            console.error(`Error al eliminar la tabla ${tableName}:`, error);
            throw error;
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

