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

   // Route untuk halaman utama
   app.get('/login', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/login.html'));
   });

   app.get('/register', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/register.html'));
   });

   app.get('/dashboard', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/dashboard.html'));
   });

   // Route untuk halaman pengguna
   app.get('/pengguna', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/pengguna/index.html'));
   });

   app.get('/pengguna/detail-jasa', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/pengguna/detail-jasa.html'));
   });

   app.get('/pengguna/form-pemesanan', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/pengguna/form-pemesanan.html'));
   });

   app.get('/pengguna/form-ulasan', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/pengguna/form-ulasan.html'));
   });

   app.get('/pengguna/keranjang', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/pengguna/keranjang.html'));
   });

   app.get('/pengguna/pembayaran', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/pengguna/pembayaran.html'));
   });

   app.get('/pengguna/pembayaran-sukses', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/pengguna/pembayaran-sukses.html'));
   });

   app.get('/pengguna/profil', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/pengguna/profil.html'));
   });

   app.get('/pengguna/riwayat-pemesanan', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/pengguna/riwayat-pemesanan.html'));
   });

   // Route untuk halaman penyedia jasa
   app.get('/penyedia-jasa', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/penyedia_jasa/penyedia-jasa.html'));
   });

   app.get('/penyedia-jasa/daftar-pesanan-masuk', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/penyedia_jasa/daftar-pesanan-masuk.html'));
   });

   app.get('/penyedia-jasa/profile-jasa', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/penyedia_jasa/profile-jasa.html'));
   });

   app.get('/penyedia-jasa/tambah-jasa-layanan', (req, res) => {
       res.sendFile(path.join(__dirname, '../public/penyedia_jasa/tambah-jasa-layanan.html'));
   });


   app.listen(3000, () => {
       console.log('Server berjalan di http://localhost:3000');
   });
