# FindUS - Platform Layanan Mahasiswa

Platform online untuk mahasiswa yang kos! Belanja kebutuhan harian, perlengkapan kamar, serta pesan layanan seperti jasa layanan, bersih-bersih, dan lainnya dengan mudah.

## 📋 Prerequisites

Pastikan sudah terinstall:

- **Node.js** (v14 atau lebih tinggi)
- **MySQL** (v8 atau lebih tinggi)
- **Git**
- **XAMPP/Laragon** (untuk MySQL server)

## 🚀 Langkah Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/barudak-codenatic/findus.git
cd findus
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

#### a. Start MySQL Service

- **XAMPP**: Start Apache & MySQL
- **Laragon**: Start All Services

#### b. Create Database (Manual - Optional)

```sql
CREATE DATABASE findus;
```

atau

```
mysql -u root -e "CREATE DATABASE bursa_talenta;"
```

> **Note**: Database akan otomatis dibuat saat aplikasi dijalankan

### 4. Environment Configuration

Buat file `.env` di root project atau edit .env.example dan ubah menjadi .env dan sesuaikan isi dari env berikut:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=db_contoh
SESSION_SECRET=contoh-rahasia
PORT=3000

MIDTRANS_SERVER_KEY=contoh-server-key
MIDTRANS_CLIENT_KEY=contoh-client-key
```

> **⚠️ Important**: Untuk production, ganti dengan Midtrans Production keys dan ubah `SESSION_SECRET` dengan random string yang aman.

## 🏃‍♂️ Menjalankan Aplikasi

### Development Mode

```bash
npm start
# atau
node app.js
```

### Production Mode

```bash
NODE_ENV=production node app.js
```

Server akan berjalan di: **http://localhost:3000**

## 💳 Payment Integration

Menggunakan **Midtrans** sandbox untuk testing:

### Test Payment Cards

```
# Credit Card (Success)
Card Number: 4811 1111 1111 1114
CVV: 123
Exp: 02/25

# Credit Card (Failed)
Card Number: 4911 1111 1111 1113
CVV: 123
Exp: 02/25
```

## 🛠️ Features

### ✅ Authentication & Authorization

- Login/Register dengan role-based access
- Session management
- Password hashing dengan bcrypt

### ✅ Service Management

- CRUD services untuk provider
- Image upload untuk layanan
- Kategori layanan (Kebersihan, Angkut Barang, Perbaikan)
- Location-based services

### ✅ Order & Payment

- Shopping cart system
- Order management
- Midtrans payment integration
- Order status tracking

### ✅ Review & Rating

- Review system dengan gambar
- Rating untuk layanan

### ✅ Chat System

- Real-time chat antara user dan provider
- Message history

### ✅ Responsive Design

- Mobile-first design
- PWA ready
- Modern UI dengan Tailwind CSS

## 🚀 Deployment

### Environment Variables for Production

```properties
NODE_ENV=production
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASS=your-secure-password
DB_NAME=findus
SESSION_SECRET=your-very-secure-random-string
PORT=3000
MIDTRANS_SERVER_KEY=your-production-server-key
MIDTRANS_CLIENT_KEY=your-production-client-key
```

## 🤝 Development

### Install Development Dependencies

```bash
npm install --save-dev nodemon
```

### Run with Auto-reload

```bash
npx nodemon app.js
```

### Development Workflow

1. Create feature branch
2. Make changes
3. Test locally
4. Commit and push
5. Create pull request

## 📚 API Documentation

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - User logout

### Services

- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (Provider)
- `PUT /api/services` - Update service (Provider)
- `DELETE /api/services/:id` - Delete service (Provider)

### Orders

- `POST /api/order` - Create new order
- `GET /api/order/:id` - Get order by ID
- `PUT /api/order/:id/payment` - Update order payment
- `GET /api/order/history` - Get order history

## 📱 PWA Features

Website dapat di-install sebagai aplikasi:

1. Buka di Chrome/Safari
2. Klik "Add to Home Screen"
3. Website akan berfungsi seperti native app

## 📞 Support

Jika mengalami masalah:

1. Check console log untuk error details
2. Pastikan semua dependencies terinstall
3. Verify database connection
4. Check file permissions
5. Restart MySQL service

## 📄 License

This project is licensed under the MIT License.
