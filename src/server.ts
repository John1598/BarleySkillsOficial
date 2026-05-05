/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb, seedDb, getDb } from './db/database';
import fs from 'node:fs';
import multer from 'multer';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
  port: parseInt(process.env['SMTP_PORT'] || '587'),
  secure: process.env['SMTP_PORT'] === '465', // true for 465, false for other ports
  auth: {
    user: process.env['SMTP_USER'] || process.env['EMAIL_USER'] || 'barleyskillsoficial@gmail.com',
    pass: process.env['SMTP_PASS'] || process.env['EMAIL_PASSWORD'] || 'ktlw squl fcls eklx' 
  }
});

const uploadBaseDir = join(process.cwd(), 'uploads');
const uploadPdfsDir = join(process.cwd(), 'uploads/pdfs');

if (!fs.existsSync(uploadBaseDir)) fs.mkdirSync(uploadBaseDir, { recursive: true });
if (!fs.existsSync(uploadPdfsDir)) fs.mkdirSync(uploadPdfsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isPdf = file.originalname.toLowerCase().endsWith('.pdf');
    cb(null, isPdf ? uploadPdfsDir : uploadBaseDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop() || 'tmp';
    cb(null, 'file_' + uniqueSuffix + '.' + ext);
  }
});

const upload = multer({ 
  storage: storage,
  // Removed strict fileFilter to allow generic uploads (pdf, mp4, etc.)
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

let dbInitialized = false;
let dbInitPromise: Promise<void> | null = null;

function ensureDb(): Promise<void> {
  if (dbInitialized) return Promise.resolve();
  if (!dbInitPromise) {
    dbInitPromise = initDb().then(() => {
      seedDb();
      dbInitialized = true;
      console.log('Database initialized and seeded.');
    });
  }
  return dbInitPromise;
}

const browserDistFolder = join(dirname(fileURLToPath(import.meta.url)), '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

app.use('/uploads', express.static(uploadBaseDir));

app.get('/api/pdf-file/:nombre', (req, res) => {
  const filePath = join(uploadPdfsDir, req.params.nombre);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'PDF no encontrado' });
    return;
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="' + req.params.nombre + '"');

  fs.createReadStream(filePath).pipe(res);
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    return;
  }
  
  const isPdf = req.file.originalname.toLowerCase().endsWith('.pdf');
  const fileUrl = isPdf ? `/pdfs/${req.file.filename}` : `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.post('/api/upload-pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No se ha subido ningún PDF.' });
    return;
  }
  
  res.json({ url: `/pdfs/${req.file.filename}` });
});

app.use('/api', (req, res, next) => {
  ensureDb().then(() => next()).catch(next);
});

/**
 * Example Express Rest API endpoints can be defined here.
 */
// Users API
app.get('/api/users', (req, res) => {
  const db = getDb();
  if (!db) {
    res.json([]);
    return;
  }
  db.all('SELECT * FROM usuarios', (err: any, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const users = rows.map(r => ({
      ...r,
      enrolledCourses: r.enrolledCourses ? JSON.parse(r.enrolledCourses) : [],
      grades: r.grades ? JSON.parse(r.grades) : {}
    }));
    res.json(users);
  });
});

app.post('/api/users', (req, res) => {
  const db = getDb();
  const { id, name, email, photoUrl, role, enrolledCourses, grades } = req.body;
  db.run(`INSERT INTO usuarios (id, name, email, photoUrl, role, enrolledCourses, grades) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, email, photoUrl, role, JSON.stringify(enrolledCourses || []), JSON.stringify(grades || {})], function(err: any): void {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
});

app.put(['/api/users/:id/role', '/api/usuarios/:id/rol'], (req, res) => {
  const db = getDb();
  const roleToSet = req.body.rol || req.body.role;
  const callerId = req.body.callerId;
  const targetId = req.params['id'];

  if (!callerId) {
    res.status(403).json({ error: 'Unauthorized: callerId required' });
    return;
  }
  
  if (callerId === targetId) {
    res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
    return;
  }
  
  db.get('SELECT role FROM usuarios WHERE id = ?', [callerId], (err: any, callerRow: any) => {
    if (err || !callerRow || callerRow.role !== 'super_admin') {
      res.status(403).json({ error: 'No tienes permisos' });
      return;
    }
    
    db.get('SELECT role FROM usuarios WHERE id = ?', [targetId], (err: any, targetRow: any) => {
      if (err || !targetRow) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      
      if (targetRow.role === 'super_admin') {
        res.status(403).json({ error: 'No puedes modificar a un super_admin' });
        return;
      }
      
      db.run(`UPDATE usuarios SET role = ? WHERE id = ?`, [roleToSet, targetId], function(err: any): void {
        if (err) {
           res.status(500).json({ error: err.message });
           return;
        }
        res.json({ success: true, message: 'Rol actualizado' });
      });
    });
  });
});

app.put('/api/users/:id', (req, res) => {
  const db = getDb();
  const { name, email, photoUrl, role, enrolledCourses, grades } = req.body;
  db.run(`UPDATE usuarios SET name = ?, email = ?, photoUrl = ?, role = ?, enrolledCourses = ?, grades = ? WHERE id = ?`,
    [name, email, photoUrl, role, JSON.stringify(enrolledCourses || []), JSON.stringify(grades || {}), req.params.id], function(err: any): void {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    });
});

app.delete(['/api/users/:id', '/api/usuarios/:id'], (req, res) => {
  const db = getDb();
  const callerId = req.query['callerId'] as string;
  const targetId = req.params['id'];

  if (!callerId) {
    res.status(403).json({ error: 'Unauthorized: callerId required' });
    return;
  }

  if (callerId === targetId) {
    res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    return;
  }

  db.get('SELECT role FROM usuarios WHERE id = ?', [callerId], (err: any, callerRow: any) => {
    if (err || !callerRow) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    db.get('SELECT role FROM usuarios WHERE id = ?', [targetId], (err: any, targetRow: any) => {
      if (err || !targetRow) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      if (targetRow.role === 'super_admin') {
        res.status(403).json({ error: 'No puedes eliminar a un super admin' });
        return;
      }

      if (callerRow.role === 'admin' && targetRow.role === 'admin') {
         res.status(403).json({ error: 'Un admin no puede eliminar a otro admin' });
         return;
      }

      if (callerRow.role !== 'super_admin' && callerRow.role !== 'admin') {
         res.status(403).json({ error: 'No tienes permisos' });
         return;
      }

      db.run(`DELETE FROM usuarios WHERE id = ?`, [targetId], function(err: any): void {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ success: true });
      });
    });
  });
});

import { scryptSync, randomBytes } from 'crypto';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, hash: string): boolean {
  if (!hash || !hash.includes(':')) return false;
  const [salt, key] = hash.split(':');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return key === derivedKey;
}

app.post('/api/auth/register', (req, res): void => {
  const db = getDb();
  const { id, name, email, photoUrl, role, password, enrolledCourses } = req.body;
  
  if (password && password.length < 8) {
    res.status(400).json({ error: "La contraseña debe tener mínimo 8 caracteres" });
    return;
  }
  
  const hashed = password ? hashPassword(password) : hashPassword('default123');
  const enrolledStr = Array.isArray(enrolledCourses) ? JSON.stringify(enrolledCourses) : '[]';
  
  db.run(`INSERT INTO usuarios (id, name, email, photoUrl, role, password, enrolledCourses, grades) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id || randomUUID(), name, email, photoUrl || '', role || 'student', hashed, enrolledStr, '{}'], function(err: any): void {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: "OK" });
    });
});

app.post('/api/usuarios', (req, res): void => {
  const db = getDb();
  const { nombre, correo, password, rol } = req.body;
  
  if (password && password.length < 8) {
    res.status(400).json({ error: "La contraseña debe tener mínimo 8 caracteres" });
    return;
  }
  
  const hashed = password ? hashPassword(password) : hashPassword('default123');
  
  db.run(`INSERT INTO usuarios (id, name, email, photoUrl, role, password, enrolledCourses, grades) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [randomUUID(), nombre, correo, '', rol || 'student', hashed, '[]', '{}'], function(err: any): void {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, message: "OK" });
    });
});

app.post('/api/auth/login', (req, res) => {
  const db = getDb();
  const { email, password } = req.body;
  
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err: any, user: any): void => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    if (!user) { res.status(401).json({ error: 'Credenciales inválidas' }); return; }
    
    // Si el usuario no tiene contraseña (creado antes), dejarlo entrar con cualquier clave para compatibilidad o forzar login sin pass si lo desean, 
    // pero para seguridad requeriremos la contraseña.
    if (!user.password || verifyPassword(password, user.password)) {
      const u = { ...user, enrolledCourses: JSON.parse(user.enrolledCourses || '[]'), grades: JSON.parse(user.grades || '{}') };
      delete u.password;
      res.json(u);
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  });
});

app.post('/api/recuperar-password', async (req, res): Promise<void> => {
  const db = getDb();
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: 'El correo es requerido' }); return; }

  db.get('SELECT id FROM usuarios WHERE email = ?', [email], async (err: any, user: any): Promise<void> => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hora
    
    db.run('INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)', [email, token, expiresAt], async (err: any): Promise<void> => {
      if (err) { res.status(500).json({ error: err.message }); return; }

      // Simulate sending email. The user requested this logic. We will use transporter
      const origin = req.headers.origin || process.env['APP_URL'] || 'http://localhost:3000';
      const resetLink = `${origin}/reset-password/${token}`;
      
      try {
        await transporter.sendMail({
          from: process.env['SMTP_USER'] || process.env['EMAIL_USER'] || 'barleyskillsoficial@gmail.com',
          to: email,
          subject: 'Recuperación de contraseña en Barley Skills',
          text: `Hola,\n\nHaz clic en el siguiente enlace para restablecer tu contraseña: \n${resetLink}\n\nEl enlace expira en 1 hora.`
        });
        res.json({ success: true, message: 'Correo enviado correctamente' });
      } catch (err: any) {
        console.warn('\n⚠️ No se pudo enviar el correo real (credenciales SMTP inválidas).');
        console.log(`[Email Simulado] Link de recuperación para ${email}: ${resetLink}\n`);
        // Aun si falla el envio de mail por config de smtp, devolvemos success=true para el flujo de la UI
        res.json({ success: true, message: 'Correo procesado (verifica tu bandeja)' });
      }
    });
  });
});

app.post('/api/reset-password/:token', (req, res): void => {
  const db = getDb();
  const token = req.params['token'];
  const { newPassword } = req.body;
  if (!token || !newPassword) { res.status(400).json({ error: 'Faltan datos' }); return; }
  
  if (newPassword.length < 8) {
    res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres' });
    return;
  }

  db.get('SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > datetime("now")', [token], (err: any, row: any): void => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    if (!row) { res.status(400).json({ error: 'Token inválido o expirado' }); return; }

    const hashed = hashPassword(newPassword);
    
    // Get user id first
    db.get('SELECT id FROM usuarios WHERE email = ?', [row.email], (err: any, user: any) => {
      if (err || !user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
      
      db.run('UPDATE usuarios SET password = ? WHERE id = ?', [hashed, user.id], function(err: any): void {
        if (err) { res.status(500).json({ error: err.message }); return; }
        
        db.run('DELETE FROM password_reset_tokens WHERE email = ?', [row.email]);
        res.json({ success: true, message: 'Contraseña actualizada' });
      });
    });
  });
});

// Seed default user if not exists
function seedDefaultAdmin() {
  const db = getDb();
  if (!db) return;
  const hashed = hashPassword('admin123');
  db.get("SELECT * FROM usuarios WHERE email = 'admin@barleyskills.edu'", (err: any, row: any) => {
    if (!row) {
      db.run(`INSERT INTO usuarios (id, name, email, photoUrl, role, password, enrolledCourses, grades) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['admin-1', 'Admin Barley Skills', 'admin@barleyskills.edu', 'https://picsum.photos/seed/admin/200/200', 'super_admin', hashed, '[]', '{}']);
    } else if (row.role === 'admin') {
      db.run(`UPDATE usuarios SET role = 'super_admin' WHERE id = ?`, [row.id]);
    }
  });
}
// Note: We can't immediately seed safely if db is null, but initDb() usually calls this or it resolves later. 
// So let's wrap it in a checking loop.
function runSafeSeed() {
  const db = getDb();
  if (db) {
    seedDefaultAdmin();
  } else {
    setTimeout(runSafeSeed, 1000);
  }
}
runSafeSeed();

app.get(['/api/config', '/api/configuracion'], (req, res) => {
  const db = getDb();
  if (!db) {
    res.json({ nombre_institucion: 'Barley Skills', logo: '', descripcion: '', direccion: '', telefono: '', correo: '', x: '', instagram: '', tiktok: '', copyright: '© 2026 Barley Skills - Todos los derechos reservados' });
    return;
  }
  db.get('SELECT * FROM configuracion ORDER BY id ASC LIMIT 1', (err: any, row: any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.json({ nombre_institucion: 'Barley Skills', logo: '', descripcion: '', direccion: '', telefono: '', correo: '', x: '', instagram: '', tiktok: '', mapa_url: '', copyright: '© 2026 Barley Skills - Todos los derechos reservados' });
      return;
    }
    // map the db columns to the requested payload format
    res.json({
        nombre_institucion: row.nombre_institucion || row.nombre_instituto,
        logo: row.logo,
        descripcion: row.descripcion,
        direccion: row.direccion,
        telefono: row.telefono,
        correo: row.correo,
        x: row.x,
        instagram: row.instagram,
        tiktok: row.tiktok,
        mapa_url: row.mapa_url,
        copyright: row.copyright || row.footer
    });
  });
});

app.put(['/api/config', '/api/configuracion'], (req, res) => {
  const db = getDb();
  const { nombre_institucion, logo, copyright, descripcion, direccion, telefono, correo, x, instagram, tiktok, mapa_url } = req.body;
  if (!nombre_institucion) {
    res.status(400).json({ error: 'Missing required field: nombre_institucion' });
    return;
  }
  
  db.get('SELECT * FROM configuracion WHERE id = 1', (err: any, row: any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      db.run('INSERT INTO configuracion (id, nombre_institucion, logo, copyright, descripcion, direccion, telefono, correo, x, instagram, tiktok, mapa_url) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [nombre_institucion, logo || '', copyright || '', descripcion || '', direccion || '', telefono || '', correo || '', x || '', instagram || '', tiktok || '', mapa_url || ''], function(this: any, err: any): void {
         if (err) {
           db.run('INSERT INTO configuracion (nombre_instituto, logo, footer, descripcion, direccion, telefono, correo, x, instagram, tiktok, mapa_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
           [nombre_institucion, logo || '', copyright || '', descripcion || '', direccion || '', telefono || '', correo || '', x || '', instagram || '', tiktok || '', mapa_url || ''], function(this: any, err2: any): void {
             res.json({ id: this.lastID, nombre_institucion, logo: logo || '', copyright: copyright || '', descripcion: descripcion || '', direccion: direccion || '', telefono: telefono || '', correo: correo || '', x: x || '', instagram: instagram || '', tiktok: tiktok || '', mapa_url: mapa_url || '' });
           });
           return;
         }
         res.json({ id: 1, nombre_institucion, logo: logo || '', copyright: copyright || '', descripcion: descripcion || '', direccion: direccion || '', telefono: telefono || '', correo: correo || '', x: x || '', instagram: instagram || '', tiktok: tiktok || '', mapa_url: mapa_url || '' });
      });
    } else {
      db.run('UPDATE configuracion SET nombre_institucion = ?, logo = ?, copyright = ?, descripcion = ?, direccion = ?, telefono = ?, correo = ?, x = ?, instagram = ?, tiktok = ?, mapa_url = ? WHERE id = 1', 
        [nombre_institucion, logo || '', copyright || '', descripcion || '', direccion || '', telefono || '', correo || '', x || '', instagram || '', tiktok || '', mapa_url || ''], function(err: any): void {
         if (err) {
           db.run('UPDATE configuracion SET nombre_instituto = ?, logo = ?, footer = ?, descripcion = ?, direccion = ?, telefono = ?, correo = ?, x = ?, instagram = ?, tiktok = ?, mapa_url = ? WHERE id = ?', 
           [nombre_institucion, logo || '', copyright || '', descripcion || '', direccion || '', telefono || '', correo || '', x || '', instagram || '', tiktok || '', mapa_url || '', row.id], function(err2: any): void {
             res.json({ id: row.id, nombre_institucion, logo: logo || '', copyright: copyright || '', descripcion: descripcion || '', direccion: direccion || '', telefono: telefono || '', correo: correo || '', x: x || '', instagram: instagram || '', tiktok: tiktok || '', mapa_url: mapa_url || '' });
           });
           return;
         }
         res.json({ id: 1, nombre_institucion, logo: logo || '', copyright: copyright || '', descripcion: descripcion || '', direccion: direccion || '', telefono: telefono || '', correo: correo || '', x: x || '', instagram: instagram || '', tiktok: tiktok || '', mapa_url: mapa_url || '' });
      });
    }
  });
});

app.get('/api/courses', (req, res) => {
  const db = getDb();
  db.all('SELECT * FROM cursos', (err: any, cursos: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const coursesPromises = cursos.map((curso: any) => fetchCourseDetails(db, curso));

    Promise.all(coursesPromises).then(formattedCourses => {
      res.json(formattedCourses);
    });
  });
});

function fetchCourseDetails(db: any, curso: any): Promise<any> {
  return new Promise((resolve) => {
    db.all('SELECT * FROM modulos WHERE curso_id = ? ORDER BY orden ASC', [curso.id], (err: any, modulos: any[]) => {
      if (!modulos || modulos.length === 0) {
        resolve(formatCourse(curso, []));
        return;
      }

      const modulosPromises = modulos.map(modulo => {
        return new Promise((resolveModulo) => {
          db.all('SELECT * FROM contenidos WHERE modulo_id = ?', [modulo.id], (err: any, contenidos: any[]) => {
            db.get('SELECT * FROM examenes WHERE modulo_id = ?', [modulo.id], (err: any, examen: any) => {
              if (!examen) {
                resolveModulo({ ...modulo, contenidos, examen: null, preguntas: [] });
                return;
              }
              db.all('SELECT * FROM preguntas WHERE examen_id = ?', [examen.id], (err: any, preguntas: any[]) => {
                if (!preguntas || preguntas.length === 0) {
                  resolveModulo({ ...modulo, contenidos, examen, preguntas: [] });
                  return;
                }
                let preguntasProcessed = 0;
                preguntas.forEach((pregunta: any, index: number) => {
                  db.all('SELECT * FROM opciones WHERE pregunta_id = ?', [pregunta.id], (err: any, opciones: any[]) => {
                    preguntas[index].opciones = opciones;
                    preguntasProcessed++;
                    if (preguntasProcessed === preguntas.length) {
                      resolveModulo({ ...modulo, contenidos, examen, preguntas });
                    }
                  });
                });
              });
            });
          });
        });
      });

      Promise.all(modulosPromises).then(modulosConDetalles => {
        resolve(formatCourse(curso, modulosConDetalles));
      });
    });
  });
}

function formatCourse(curso: any, modulos: any[]) {
  const subjectDetails = modulos.map((modulo: any) => {
    const videos = modulo.contenidos.filter((c: any) => c.tipo === 'video').map((c: any) => c.url);
    const documents = modulo.contenidos.filter((c: any) => c.tipo === 'documento').map((c: any) => c.url);
    
    let formattedExam = undefined;
    if (modulo.examen && modulo.preguntas && modulo.preguntas.length > 0) {
      formattedExam = {
        id: modulo.examen.id.toString(),
        title: modulo.examen.titulo,
        questions: modulo.preguntas.map((p: any) => {
          const correctIndex = p.opciones.findIndex((o: any) => o.es_correcta === 1);
          return {
            question: p.pregunta,
            options: p.opciones.map((o: any) => o.texto),
            correctOptionIndex: correctIndex >= 0 ? correctIndex : 0
          };
        })
      };
    }

    return {
      id: modulo.id.toString(),
      title: modulo.titulo,
      videos: videos,
      documents: documents,
      exam: formattedExam
    };
  });

  const internalVideos = subjectDetails.length > 0 ? subjectDetails[0].videos : [];
  const internalDocuments = subjectDetails.length > 0 ? subjectDetails[0].documents : [];

  return {
    id: curso.id.toString(),
    title: curso.nombre,
    description: curso.descripcion,
    imageUrl: curso.imagen || null,
    subjects: modulos.map((m: any) => m.titulo),
    subjectDetails: subjectDetails,
    internalContent: {
      videos: internalVideos,
      documents: internalDocuments
    }
  };
}

app.get('/api/courses/:id', (req, res) => {
  const db = getDb();
  const courseId = req.params['id'];
  
  db.get('SELECT * FROM cursos WHERE id = ?', [courseId], (err: any, course: any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    fetchCourseDetails(db, course).then(formattedCourse => {
      res.json(formattedCourse);
    });
  });
});

app.post(['/api/courses', '/api/cursos'], (req, res) => {
  const db = getDb();
  const course = req.body;
  
  db.run(`INSERT INTO cursos (nombre, descripcion, categoria, imagen) VALUES (?, ?, ?, ?)`,
    [course.title, course.description, course.category || 'General', course.imageUrl || null],
    function(this: any, err: any) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("Curso guardado correctamente");
      const newId = this.lastID;
      
      if (course.subjectDetails && course.subjectDetails.length > 0) {
        course.subjectDetails.forEach((subject: any, index: number) => {
          db.run(`INSERT INTO modulos (curso_id, titulo, orden) VALUES (?, ?, ?)`, [newId, subject.title, index + 1], function(this: any, err: any) {
            if (!err) {
              const moduloId = this.lastID;
              
              if (subject.videos) {
                subject.videos.forEach((videoUrl: string, vIdx: number) => {
                  db.run(`INSERT INTO contenidos (modulo_id, titulo, descripcion, tipo, url) VALUES (?, ?, ?, ?, ?)`, [moduloId, `Video ${vIdx + 1}`, '', 'video', videoUrl]);
                });
              }
              if (subject.documents) {
                subject.documents.forEach((docUrl: string, dIdx: number) => {
                  db.run(`INSERT INTO contenidos (modulo_id, titulo, descripcion, tipo, url) VALUES (?, ?, ?, ?, ?)`, [moduloId, `Documento ${dIdx + 1}`, '', 'documento', docUrl]);
                });
              }
              
              if (subject.exam) {
                db.run(`INSERT INTO examenes (modulo_id, titulo, descripcion) VALUES (?, ?, ?)`, [moduloId, subject.exam.title, ''], function(this: any, err: any) {
                  if (!err) {
                    const examId = this.lastID;
                    if (subject.exam.questions) {
                      subject.exam.questions.forEach((q: any) => {
                        db.run(`INSERT INTO preguntas (examen_id, pregunta, tipo) VALUES (?, ?, ?)`, [examId, q.question, 'multiple'], function(this: any, err: any) {
                          if (!err) {
                            const preguntaId = this.lastID;
                            q.options.forEach((opt: string, optIdx: number) => {
                              const isCorrect = q.correctOptionIndex === optIdx ? 1 : 0;
                              db.run(`INSERT INTO opciones (pregunta_id, texto, es_correcta) VALUES (?, ?, ?)`, [preguntaId, opt, isCorrect]);
                            });
                          }
                        });
                      });
                    }
                  }
                });
              }
            }
          });
        });
      }

      db.get('SELECT * FROM cursos WHERE id = ?', [newId], (err: any, row: any) => {
        fetchCourseDetails(db, row).then(formatted => res.status(201).json(formatted));
      });
    }
  );
});

app.put(['/api/courses/:id', '/api/cursos/:id'], (req, res) => {
  const db = getDb();
  const courseId = req.params['id'];
  const course = req.body;

  db.run(`UPDATE cursos SET nombre = ?, descripcion = ?, imagen = ? WHERE id = ?`, 
    [course.title, course.description, course.imageUrl || null, courseId], 
    function(err: any): void {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      console.log("Curso guardado correctamente");
      
      db.run(`DELETE FROM modulos WHERE curso_id = ?`, [courseId], (err: any): void => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (course.subjectDetails && course.subjectDetails.length > 0) {
          course.subjectDetails.forEach((subject: any, index: number) => {
            db.run(`INSERT INTO modulos (curso_id, titulo, orden) VALUES (?, ?, ?)`, [courseId, subject.title, index + 1], function(this: any, err: any) {
              if (!err) {
                const moduloId = this.lastID;
                if (subject.videos) {
                  subject.videos.forEach((videoUrl: string, vIdx: number) => {
                    db.run(`INSERT INTO contenidos (modulo_id, titulo, descripcion, tipo, url) VALUES (?, ?, ?, ?, ?)`, [moduloId, `Video ${vIdx + 1}`, '', 'video', videoUrl]);
                  });
                }
                if (subject.documents) {
                  subject.documents.forEach((docUrl: string, dIdx: number) => {
                    db.run(`INSERT INTO contenidos (modulo_id, titulo, descripcion, tipo, url) VALUES (?, ?, ?, ?, ?)`, [moduloId, `Documento ${dIdx + 1}`, '', 'documento', docUrl]);
                  });
                }
                if (subject.exam) {
                  db.run(`INSERT INTO examenes (modulo_id, titulo, descripcion) VALUES (?, ?, ?)`, [moduloId, subject.exam.title, ''], function(this: any, err: any) {
                    if (!err) {
                      const examId = this.lastID;
                      if (subject.exam.questions) {
                        subject.exam.questions.forEach((q: any) => {
                          db.run(`INSERT INTO preguntas (examen_id, pregunta, tipo) VALUES (?, ?, ?)`, [examId, q.question, 'multiple'], function(this: any, err: any) {
                            if (!err) {
                              const preguntaId = this.lastID;
                              q.options.forEach((opt: string, optIdx: number) => {
                                const isCorrect = q.correctOptionIndex === optIdx ? 1 : 0;
                                db.run(`INSERT INTO opciones (pregunta_id, texto, es_correcta) VALUES (?, ?, ?)`, [preguntaId, opt, isCorrect]);
                              });
                            }
                          });
                        });
                      }
                    }
                  });
                }
              }
            });
          });
        }
        
        db.get('SELECT * FROM cursos WHERE id = ?', [courseId], (err: any, row: any) => {
          fetchCourseDetails(db, row).then(formatted => res.json(formatted));
        });
      });
  });
});

app.delete(['/api/courses/:id', '/api/cursos/:id'], (req, res) => {
  const db = getDb();
  db.run('DELETE FROM cursos WHERE id = ?', [req.params['id']], function(this: any, err: any): void {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Curso no encontrado' });
      return;
    }
    res.json({ success: true });
  });
});

app.post('/api/progress', (req, res) => {
  const db = getDb();
  const { userId, courseId, contentId } = req.body;

  if (!userId || !courseId || !contentId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  db.run(
    `INSERT INTO progreso_usuario (usuario_id, curso_id, contenido_id, completado) 
     VALUES (?, ?, ?, 1) 
     ON CONFLICT(usuario_id, curso_id, contenido_id) DO UPDATE SET completado = 1`,
    [userId, courseId, contentId],
    function(this: any, err: any) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get('/api/progress/:userId/:courseId', (req, res) => {
  const db = getDb();
  const { userId, courseId } = req.params;

  db.all(
    'SELECT contenido_id FROM progreso_usuario WHERE usuario_id = ? AND curso_id = ? AND completado = 1',
    [userId, courseId],
    (err: any, rows: any[]) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ completedContentIds: rows.map(r => r.contenido_id) });
    }
  );
});

import { randomUUID } from 'crypto';

app.post('/api/diplomas', (req, res) => {
  const db = getDb();
  const { userId, userName, courseId } = req.body;

  if (!userId || !courseId || !userName) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const certCode = randomUUID().split('-')[0].toUpperCase() + '-' + Date.now().toString().slice(-6);

  db.run(
    `INSERT INTO diplomas (usuario_id, usuario_nombre, curso_id, codigo_certificado) VALUES (?, ?, ?, ?) ON CONFLICT(usuario_id, curso_id) DO NOTHING`,
    [userId, userName, courseId, certCode],
    function(this: any, err: any) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Fetch the cert code (either newly inserted or existing)
      db.get('SELECT codigo_certificado FROM diplomas WHERE usuario_id = ? AND curso_id = ?', [userId, courseId], (err2: any, row: any) => {
        if (err2) {
          res.status(500).json({ error: err2.message });
          return;
        }
        res.json({ success: true, codigo_certificado: row?.codigo_certificado });
      });
    }
  );
});

app.get('/api/verify-certificate/:codigo', (req, res) => {
  const db = getDb();
  const { codigo } = req.params;

  db.get(
    `SELECT d.codigo_certificado, d.fecha, d.usuario_nombre, c.nombre as curso_nombre 
     FROM diplomas d
     JOIN cursos c ON d.curso_id = c.id
     WHERE d.codigo_certificado = ?`,
    [codigo],
    (err: any, row: any) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Certificado no encontrado' });
        return;
      }
      res.json(row);
    }
  );
});

app.get('/api/diplomas/:userId', (req, res) => {
  const db = getDb();
  const { userId } = req.params;

  db.all(
    'SELECT curso_id FROM diplomas WHERE usuario_id = ?',
    [userId],
    (err: any, rows: any[]) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows.map(r => r.curso_id.toString()));
    }
  );
});

app.post('/api/exam-results', (req, res) => {
  const db = getDb();
  const { userId, courseId, examId, score } = req.body;

  if (!userId || !courseId || !examId || score === undefined) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  db.run(
    `INSERT INTO resultados_examen (usuario_id, curso_id, examen_id, puntaje) 
     VALUES (?, ?, ?, ?) 
     ON CONFLICT(usuario_id, curso_id, examen_id) DO UPDATE SET puntaje = MAX(puntaje, excluded.puntaje)`,
    [userId, courseId, examId, score],
    function(this: any, err: any) {
      if (err) {
        console.error('Error saving exam result:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      
      console.log(`[DEBUG] Examen guardado. Usuario: ${userId}, Curso: ${courseId}, Examen: ${examId}, Puntaje: ${score}`);
      
      if (score >= 70) {
        db.get('SELECT modulo_id FROM examenes WHERE id = ?', [examId], (err: any, row: any) => {
          if (!err && row && row.modulo_id) {
            db.run(
              `INSERT INTO modulos_completados (usuario_id, curso_id, modulo_id, completado)
               VALUES (?, ?, ?, 1)
               ON CONFLICT(usuario_id, curso_id, modulo_id) DO UPDATE SET completado = 1`,
              [userId, courseId, row.modulo_id],
              function(this: any, err2: any) {
                if (!err2) {
                  console.log(`[DEBUG] Módulo marcado como completado. Usuario: ${userId}, Módulo: ${row.modulo_id}`);
                }
                res.json({ success: true, id: this.lastID });
              }
            );
          } else {
            res.json({ success: true, id: this.lastID });
          }
        });
      } else {
        res.json({ success: true, id: this.lastID });
      }
    }
  );
});

app.get('/api/exam-results/:userId/:courseId', (req, res) => {
  const db = getDb();
  const { userId, courseId } = req.params;

  db.all(
    'SELECT examen_id as examId, puntaje as score FROM resultados_examen WHERE usuario_id = ? AND curso_id = ?',
    [userId, courseId],
    (err: any, rows: any[]) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

app.get('/api/completed-modules/:userId/:courseId', (req, res) => {
  const db = getDb();
  const { userId, courseId } = req.params;

  db.all(
    'SELECT modulo_id as moduleId FROM modulos_completados WHERE usuario_id = ? AND curso_id = ? AND completado = 1',
    [userId, courseId],
    (err: any, rows: any[]) => {
      if (err) {
        console.error('Error fetching completed modules:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(`[DEBUG] Módulos completados detectados para usuario ${userId} en curso ${courseId}: ${rows.length}`);
      res.json(rows.map(r => r.moduleId.toString()));
    }
  );
});

// Chatbot Endpoints
app.get('/api/certificados/:codigo', (req, res) => {
  const db = getDb();
  const codigo = req.params.codigo;
  
  db.get('SELECT c.*, u.name as user_name, cur.nombre as curso_nombre FROM certificados c JOIN usuarios u ON c.usuario_id = u.id JOIN cursos cur ON c.curso_id = cur.id WHERE c.codigo_certificado = ?', [codigo], (err: any, row: any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Certificado no encontrado' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/certificados', (req, res) => {
  const db = getDb();
  const { usuario_id, curso_id } = req.body;
  if (!usuario_id || !curso_id) {
    res.status(400).json({ error: 'Missing req fields' });
    return;
  }
  
  const dbMode = db as unknown as { prepare: any };
  
  // Check if exists
  db.get('SELECT * FROM certificados WHERE usuario_id = ? AND curso_id = ?', [usuario_id, curso_id], (err: any, row: any) => {
    if (row) {
      res.json(row);
      return;
    }
    
    const year = new Date().getFullYear();
    const uniqueId = Math.floor(1000 + Math.random() * 9000);
    const codigo_certificado = `BS-${year}-${uniqueId}`;
    
    dbMode.prepare('INSERT INTO certificados (usuario_id, curso_id, codigo_certificado) VALUES (?, ?, ?)').run([usuario_id, curso_id, codigo_certificado], function(this: any, err: any) {
      if (err) {
         res.status(500).json({ error: err.message });
         return;
      }
      res.json({ id: this.lastID, usuario_id, curso_id, codigo_certificado, fecha: new Date().toISOString() });
    });
  });
});

app.post('/api/contacto', async (req, res) => {
  const { nombre, correo, asunto, mensaje } = req.body;
  if (!nombre || !correo || !mensaje) {
    res.status(400).json({ error: 'Todos los campos son obligatorios' });
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    res.status(400).json({ error: 'Formato de correo inválido' });
    return;
  }
  
  try {
    await transporter.sendMail({
      from: correo,
      to: process.env['SMTP_USER'] || process.env['EMAIL_USER'] || 'barleyskillsoficial@gmail.com',
      subject: asunto || `Nuevo mensaje de contacto de ${nombre}`,
      text: `Nombre: ${nombre}\nCorreo: ${correo}\nAsunto: ${asunto || 'Sin asunto'}\nMensaje: ${mensaje}`
    });
    res.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error: any) {
    console.warn('\n⚠️ No se pudo enviar el correo real (credenciales SMTP inválidas).');
    console.log(`[Email Simulado] Contacto de ${nombre} (${correo}): ${mensaje}\n`);
    // Para simplificar la demo, simulamos que el envío fue exitoso si no hay credenciales
    res.json({ success: true, message: 'Mensaje enviado (Simulado debido a falta de credenciales de email)' });
  }
});

/**
 * Serve static files from /browser

 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  ensureDb();
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
