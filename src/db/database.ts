import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const dbDir = join(process.cwd(), 'data');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, 'database.sqlite');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

export async function initDb() {
  if (!db) {
    const sqlite3 = (await import('sqlite3')).default;
    db = new sqlite3.Database(dbPath);
    // MUST enable foreign keys on each new connection
    db.run('PRAGMA foreign_keys = ON;');
  }
  return new Promise<void>((resolve) => {
    db.serialize(() => {
      // Eliminar tablas existentes (Reset)
      // db.run(`DROP TABLE IF EXISTS modulos_completados`);
      // db.run(`DROP TABLE IF EXISTS diplomas`);
      // db.run(`DROP TABLE IF EXISTS resultados_examen`);
      // db.run(`DROP TABLE IF EXISTS progreso_usuario`);
      // db.run(`DROP TABLE IF EXISTS opciones`);
      // db.run(`DROP TABLE IF EXISTS preguntas`);
      // db.run(`DROP TABLE IF EXISTS examenes`);
      // db.run(`DROP TABLE IF EXISTS contenidos`);
      // db.run(`DROP TABLE IF EXISTS modulos`);
      // db.run(`DROP TABLE IF EXISTS cursos`);

      // Crear tablas
      db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          photoUrl TEXT,
          role TEXT NOT NULL DEFAULT 'student',
          enrolledCourses TEXT,
          grades TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS cursos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          duracion VARCHAR(50),
          categoria VARCHAR(100),
          imagen TEXT,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS modulos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          curso_id INTEGER NOT NULL,
          titulo VARCHAR(255) NOT NULL,
          orden INTEGER NOT NULL,
          FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS contenidos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          modulo_id INTEGER NOT NULL,
          titulo VARCHAR(255) NOT NULL,
          descripcion TEXT,
          tipo VARCHAR(50),
          url TEXT,
          FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS examenes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          modulo_id INTEGER NOT NULL,
          titulo VARCHAR(255) NOT NULL,
          descripcion TEXT,
          FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS preguntas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          examen_id INTEGER NOT NULL,
          pregunta TEXT NOT NULL,
          tipo VARCHAR(50),
          FOREIGN KEY (examen_id) REFERENCES examenes(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS opciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pregunta_id INTEGER NOT NULL,
          texto TEXT NOT NULL,
          es_correcta BOOLEAN NOT NULL CHECK (es_correcta IN (0, 1)),
          FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS progreso_usuario (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id VARCHAR(255) NOT NULL,
          curso_id INTEGER NOT NULL,
          contenido_id VARCHAR(255) NOT NULL,
          completado BOOLEAN NOT NULL CHECK (completado IN (0, 1)),
          fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(usuario_id, curso_id, contenido_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS resultados_examen (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id VARCHAR(255) NOT NULL,
          curso_id INTEGER NOT NULL,
          examen_id VARCHAR(255) NOT NULL,
          puntaje INTEGER NOT NULL,
          fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(usuario_id, curso_id, examen_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS modulos_completados (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id VARCHAR(255) NOT NULL,
          curso_id INTEGER NOT NULL,
          modulo_id INTEGER NOT NULL,
          completado BOOLEAN NOT NULL CHECK (completado IN (0, 1)),
          fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(usuario_id, curso_id, modulo_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS diplomas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id VARCHAR(255) NOT NULL,
          usuario_nombre VARCHAR(255) NOT NULL,
          curso_id INTEGER NOT NULL,
          codigo_certificado VARCHAR(255) UNIQUE NOT NULL,
          fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(usuario_id, curso_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS configuracion (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre_instituto VARCHAR(255) NOT NULL,
          logo TEXT,
          footer TEXT,
          descripcion TEXT,
          direccion TEXT,
          telefono TEXT,
          correo TEXT,
          x TEXT,
          instagram TEXT,
          tiktok TEXT,
          mapa_url TEXT
        )
      `);

      // Safe alter table for existing DBs
      const noop = () => { /* ignore */ };
      db.run('ALTER TABLE configuracion RENAME COLUMN nombre_instituto TO nombre_institucion', noop);
      db.run('ALTER TABLE configuracion RENAME COLUMN footer TO copyright', noop);
      db.run('ALTER TABLE configuracion ADD COLUMN footer TEXT', noop);
      db.run('ALTER TABLE configuracion ADD COLUMN descripcion TEXT', noop);
      db.run('ALTER TABLE configuracion ADD COLUMN direccion TEXT', noop);
      db.run('ALTER TABLE configuracion ADD COLUMN telefono TEXT', noop);
      db.run('ALTER TABLE configuracion ADD COLUMN correo TEXT', noop);
      db.run('ALTER TABLE configuracion ADD COLUMN x TEXT', noop);
      db.run('ALTER TABLE configuracion ADD COLUMN instagram TEXT', noop);
      db.run('ALTER TABLE configuracion ADD COLUMN tiktok TEXT', noop);
      db.run('ALTER TABLE configuracion ADD COLUMN mapa_url TEXT', noop);
      
      db.run('ALTER TABLE usuarios ADD COLUMN password TEXT', noop);
      
      db.run(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at DATETIME NOT NULL
        )
      `);

      db.run('DROP TABLE IF EXISTS chatbot_respuestas');
      db.run('DROP TABLE IF EXISTS chatbot_uso');
      db.run('DROP TABLE IF EXISTS chatbot_mensajes');

      db.run(`
        CREATE TABLE IF NOT EXISTS certificados (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id VARCHAR(255) NOT NULL,
          curso_id INTEGER NOT NULL,
          fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
          codigo_certificado VARCHAR(100) UNIQUE NOT NULL
        )
      `);

      db.get('SELECT * FROM configuracion', (err: Error | null, row: unknown) => {
        if (!row) {
          db.run(`INSERT INTO configuracion (nombre_instituto, logo, footer) VALUES (?, ?, ?)`, ['Barley Skills', '', '© 2026 Barley Skills - Todos los derechos reservados'], () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  });
}

export function seedDb() {
  db.get('SELECT COUNT(*) as count FROM cursos', (err: Error | null, row: { count?: number } | undefined) => {
    if (row && row.count !== undefined && row.count > 0) {
      console.log('Database already seeded, skipping seed process.');
      return;
    }

    const cursos = [
      { nombre: 'Belleza', desc: 'Aprende los fundamentos de la belleza y cuidado personal.', duracion: '3 meses', cat: 'Estética' },
      { nombre: 'Uñas Acrílicas', desc: 'Técnicas profesionales para esculpido y decoración de uñas.', duracion: '2 meses', cat: 'Estética' },
      { nombre: 'Auxiliar de Farmacia', desc: 'Conocimientos básicos para asistencia en farmacias.', duracion: '6 meses', cat: 'Salud' },
      { nombre: 'Informática Básica', desc: 'Domina las herramientas ofimáticas y el uso del PC.', duracion: '2 meses', cat: 'Tecnología' },
      { nombre: 'Inglés Básico', desc: 'Iníciate en el idioma inglés con vocabulario y gramática esencial.', duracion: '4 meses', cat: 'Idiomas' },
      { nombre: 'Corte Básico', desc: 'Técnicas fundamentales de corte de cabello.', duracion: '3 meses', cat: 'Estética' },
      { nombre: 'Barbería Profesional', desc: 'Cortes masculinos, perfilado de barba y tendencias.', duracion: '4 meses', cat: 'Estética' },
      { nombre: 'Estilista en Uñas y Pestañas', desc: 'Especialízate en extensiones de pestañas y diseño de uñas.', duracion: '3 meses', cat: 'Estética' },
      { nombre: 'Maquillaje Profesional', desc: 'Técnicas avanzadas de maquillaje para eventos y fotografía.', duracion: '5 meses', cat: 'Estética' },
      { nombre: 'Auxiliar de Enfermería', desc: 'Cuidados básicos de pacientes y asistencia médica.', duracion: '8 meses', cat: 'Salud' },
      { nombre: 'Masaje Profesional', desc: 'Técnicas de masajes relajantes y terapéuticos.', duracion: '4 meses', cat: 'Salud' },
      { nombre: 'Cosmetología', desc: 'Cuidado de la piel, tratamientos faciales y corporales.', duracion: '6 meses', cat: 'Estética' }
    ];

    db.serialize(() => {
      const insertCurso = db.prepare(`INSERT INTO cursos (nombre, descripcion, duracion, categoria) VALUES (?, ?, ?, ?)`);
      const insertModulo = db.prepare(`INSERT INTO modulos (curso_id, titulo, orden) VALUES (?, ?, ?)`);
      const insertContenido = db.prepare(`INSERT INTO contenidos (modulo_id, titulo, descripcion, tipo, url) VALUES (?, ?, ?, ?, ?)`);
      const insertExamen = db.prepare(`INSERT INTO examenes (modulo_id, titulo, descripcion) VALUES (?, ?, ?)`);
      const insertPregunta = db.prepare(`INSERT INTO preguntas (examen_id, pregunta, tipo) VALUES (?, ?, ?)`);
      const insertOpcion = db.prepare(`INSERT INTO opciones (pregunta_id, texto, es_correcta) VALUES (?, ?, ?)`);

      let moduloIdCounter = 1;
      let preguntaIdCounter = 1;

      cursos.forEach((curso, index) => {
        const cursoId = index + 1;
        insertCurso.run(curso.nombre, curso.desc, curso.duracion, curso.cat);

        // Crear 2 módulos por curso
        for (let m = 1; m <= 2; m++) {
          const moduloId = moduloIdCounter++;
          insertModulo.run(cursoId, 'Módulo ' + m + ': ' + curso.nombre, m);

          // 1 contenido por módulo
          insertContenido.run(moduloId, 'Introducción a ' + curso.nombre + ' - Parte ' + m, 'Conceptos básicos y teoría inicial.', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ');

          // 1 examen por módulo
          insertExamen.run(moduloId, 'Examen Módulo ' + m + ': ' + curso.nombre, 'Evalúa tus conocimientos adquiridos en el módulo.');
          
          // 3 preguntas por examen
          for (let i = 1; i <= 3; i++) {
            const preguntaId = preguntaIdCounter++;
            insertPregunta.run(moduloId, '¿Pregunta de prueba ' + i + ' sobre el módulo ' + m + '?', 'opcion_multiple');
            
            // 3 opciones por pregunta (solo 1 correcta)
            insertOpcion.run(preguntaId, 'Opción A (Correcta)', 1);
            insertOpcion.run(preguntaId, 'Opción B', 0);
            insertOpcion.run(preguntaId, 'Opción C', 0);
          }
        }
      });

      insertCurso.finalize();
      insertModulo.finalize();
      insertContenido.finalize();
      insertExamen.finalize();
      insertPregunta.finalize();
      insertOpcion.finalize();
    });
  });
}

export function getDb() {
  return db;
}
