const express = require('express');
   const mysql = require('mysql2');
   const bcrypt = require('bcrypt');
   const path = require('path');
   const app = express();

   app.use(express.json());
   // Perbaikan: Gunakan jalur absolut untuk folder public
   app.use(express.static(path.join(__dirname, '../public')));

   // Rute eksplisit untuk root (/)
   app.get('/', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/index.html'));
   });

   const db = mysql.createConnection({
       host: 'localhost',
       user: 'root',
       password: '', // Ganti dengan kata sandi MySQL Anda
       database: 'findus_db'
   });

   db.connect(err => {
       if (err) {
           console.error('Gagal terhubung ke database:', err);
           throw err;
       }
       console.log('Terhubung ke database MySQL');
   });

   app.post('/register', async (req, res) => {
       const { username, email, password } = req.body;
       try {
           const hashedPassword = await bcrypt.hash(password, 10);
           const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
           db.query(query, [username, email, hashedPassword], (err, result) => {
               if (err) {
                   if (err.code === 'ER_DUP_ENTRY') {
                       return res.status(400).json({ message: 'Email sudah terdaftar' });
                   }
                   throw err;
               }
               res.status(201).json({ message: 'Pendaftaran berhasil' });
           });
       } catch (error) {
           res.status(500).json({ message: 'Error server' });
       }
   });

   app.post('/login', (req, res) => {
       const { email, password } = req.body;
       const query = 'SELECT * FROM users WHERE email = ?';
       db.query(query, [email], async (err, results) => {
           if (err) throw err;
           if (results.length === 0) {
               return res.status(400).json({ message: 'Email tidak ditemukan' });
           }
           const user = results[0];
           const match = await bcrypt.compare(password, user.password);
           if (!match) {
               return res.status(400).json({ message: 'Kata sandi salah' });
           }
           res.json({ message: 'Login berhasil' });
       });
   });

   app.listen(3000, () => {
       console.log('Server berjalan di http://localhost:3000');
   });
