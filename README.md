# 🎓 SoftLearn API

Modern bir öğrenme platformu için geliştirilmiş RESTful API. TypeScript, Express.js ve Prisma ORM kullanılarak oluşturulmuştur.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [API Endpoints](#-api-endpoints)
- [Veritabanı Şeması](#-veritabanı-şeması)
- [Proje Yapısı](#-proje-yapısı)
- [Geliştirme](#-geliştirme)
- [Ortam Değişkenleri](#-ortam-değişkenleri)

## ✨ Özellikler

- ✅ **Kullanıcı Yönetimi**: Kayıt, giriş ve JWT tabanlı kimlik doğrulama
- ✅ **Kategori Sistemi**: Öğrenme kategorilerini yönetme
- ✅ **Öğrenme Yolları**: Kategorilere bağlı öğrenme içerikleri
- ✅ **Rol Tabanlı Yetkilendirme**: Student, Teacher, Admin rolleri
- ✅ **Güvenli Şifreleme**: Bcrypt ile şifre hashleme
- ✅ **Veri Validasyonu**: Zod ile güçlü tip kontrolü
- ✅ **TypeScript**: Tam tip güvenliği
- ✅ **Prisma ORM**: Modern veritabanı yönetimi

## 🛠 Teknolojiler

### Backend Framework

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Tip güvenli JavaScript

### Veritabanı

- **PostgreSQL** - İlişkisel veritabanı
- **Prisma ORM** - Modern ORM
- **@prisma/adapter-pg** - PostgreSQL adaptörü

### Güvenlik & Doğrulama

- **JWT (jsonwebtoken)** - Token tabanlı kimlik doğrulama
- **Bcrypt** - Şifre hashleme
- **Zod** - Schema validasyonu
- **CORS** - Cross-origin resource sharing

### Geliştirme Araçları

- **tsx** - TypeScript executor
- **nodemon** - Otomatik yeniden başlatma
- **ts-node** - TypeScript çalıştırıcı

## 🚀 Kurulum

### Gereksinimler

- Node.js (v18 veya üzeri)
- PostgreSQL (v14 veya üzeri)
- npm veya yarn

### Adım 1: Projeyi Klonlayın

```bash
git clone <repository-url>
cd SoftLearnPort
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
```

### Adım 3: Ortam Değişkenlerini Ayarlayın

`.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Sunucu Ayarları
PORT=3000
NODE_ENV=development

# Veritabanı
DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/softlearn"

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

### Adım 4: Veritabanını Hazırlayın

```bash
# Prisma client oluştur
npx prisma generate

# Veritabanı migration'larını çalıştır
npx prisma migrate dev --name init

# (Opsiyonel) Prisma Studio ile veritabanını görüntüle
npx prisma studio
```

### Adım 5: Sunucuyu Başlatın

```bash
# Geliştirme modu (hot reload)
npm run dev

# Production build
npm run build
npm start
```

Sunucu `http://localhost:3000` adresinde çalışacaktır.

## 💻 Kullanım

### Geliştirme Modu

```bash
npm run dev
```

Kod değişikliklerinde otomatik olarak yeniden başlar.

### Production Build

```bash
npm run build
npm start
```

### Veritabanı Yönetimi

```bash
# Migration oluştur
npx prisma migrate dev --name migration_adi

# Veritabanını sıfırla
npx prisma migrate reset

# Prisma Studio'yu aç
npx prisma studio
```

## 📡 API Endpoints

### Authentication (Kimlik Doğrulama)

| Method | Endpoint             | Açıklama             | Auth |
| ------ | -------------------- | -------------------- | ---- |
| POST   | `/api/auth/register` | Yeni kullanıcı kaydı | ❌   |
| POST   | `/api/auth/login`    | Kullanıcı girişi     | ❌   |

#### Kayıt Örneği

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Ahmet Yılmaz"
}
```

**Yanıt:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Ahmet Yılmaz",
      "role": "STUDENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Giriş Örneği

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Categories (Kategoriler)

| Method | Endpoint              | Açıklama                 | Auth |
| ------ | --------------------- | ------------------------ | ---- |
| GET    | `/api/categories`     | Tüm kategorileri listele | ❌   |
| GET    | `/api/categories/:id` | Kategori detayı          | ❌   |
| POST   | `/api/categories`     | Yeni kategori oluştur    | ✅   |
| PUT    | `/api/categories/:id` | Kategori güncelle        | ✅   |
| DELETE | `/api/categories/:id` | Kategori sil             | ✅   |

#### Kategori Listesi Örneği

```bash
GET /api/categories
```

**Yanıt:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Web Development",
      "description": "Modern web geliştirme teknolojileri",
      "slug": "web-development",
      "_count": {
        "path": 5
      }
    }
  ]
}
```

## 🗄 Veritabanı Şeması

### User (Kullanıcı)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}
```

### Category (Kategori)

```prisma
model Category {
  id          Int            @id @default(autoincrement())
  name        String         @unique
  description String?
  slug        String         @unique
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  path        LearningPath[]
}
```

### LearningPath (Öğrenme Yolu)

```prisma
model LearningPath {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  categoryId  Int
  category    Category @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 📁 Proje Yapısı

```
SoftLearnPort/
├── prisma/
│   ├── schema.prisma          # Veritabanı şeması
│   └── migrations/            # Veritabanı migration'ları
├── src/
│   ├── config/
│   │   ├── database.ts        # Veritabanı bağlantısı
│   │   └── index.ts           # Genel konfigürasyon
│   ├── controllers/
│   │   ├── auth.controller.ts # Auth controller
│   │   └── category.controller.ts # Category controller
│   ├── services/
│   │   ├── auth.services.ts   # Auth business logic
│   │   └── category.services.ts # Category business logic
│   ├── routers/
│   │   └── auth.routers.ts    # Route tanımları
│   ├── middleware/
│   │   └── auth.middleware.ts # JWT middleware
│   ├── validations/
│   │   ├── auth.validation.ts # Auth validasyonları
│   │   └── common.validation.ts # Ortak validasyonlar
│   ├── types/
│   │   ├── auth.types.ts      # Auth tipleri
│   │   └── category.types.ts  # Category tipleri
│   ├── utils/                 # Yardımcı fonksiyonlar
│   └── app.ts                 # Ana uygulama dosyası
├── .env                       # Ortam değişkenleri
├── .gitignore                 # Git ignore dosyası
├── package.json               # Proje bağımlılıkları
├── tsconfig.json              # TypeScript konfigürasyonu
└── README.md                  # Bu dosya
```

## 🔧 Geliştirme

### Kod Stili

Proje TypeScript strict mode kullanır:

```typescript
// Tip güvenliği
const user: User = await prisma.user.findUnique({ where: { id } });

// Zod validasyonu
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### Yeni Endpoint Ekleme

1. **Validation oluştur** (`src/validations/`)
2. **Type tanımla** (`src/types/`)
3. **Service yaz** (`src/services/`)
4. **Controller oluştur** (`src/controllers/`)
5. **Route ekle** (`src/routers/`)

### Veritabanı Değişiklikleri

```bash
# Schema'yı düzenle
nano prisma/schema.prisma

# Migration oluştur
npx prisma migrate dev --name degisiklik_adi

# Client'ı güncelle
npx prisma generate
```

## 🔐 Ortam Değişkenleri

| Değişken         | Açıklama                  | Örnek                                      |
| ---------------- | ------------------------- | ------------------------------------------ |
| `PORT`           | Sunucu portu              | `3000`                                     |
| `NODE_ENV`       | Çalışma ortamı            | `development` / `production`               |
| `DATABASE_URL`   | PostgreSQL bağlantı URL'i | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET`     | JWT şifreleme anahtarı    | `your-secret-key`                          |
| `JWT_EXPIRES_IN` | Token geçerlilik süresi   | `7d`                                       |

## 🧪 Test

```bash
# Unit testler (yakında)
npm test

# Integration testler (yakında)
npm run test:integration
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

---

**Not:** Bu proje aktif geliştirme aşamasındadır. Yeni özellikler eklenmeye devam edilecektir.

## 🎯 Gelecek Özellikler

- [ ] Ders (Lesson) modülü
- [ ] Quiz sistemi
- [ ] İlerleme takibi
- [ ] Sertifika sistemi
- [ ] Dosya yükleme
- [ ] Email bildirimleri
- [ ] Sosyal özellikler
- [ ] Admin paneli
- [ ] API rate limiting
- [ ] Caching (Redis)
- [ ] Unit & Integration testler
- [ ] API dokümantasyonu (Swagger)
