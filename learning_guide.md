# 🎓 Learning Platform API - Adım Adım Geliştirme Rehberi

## 📚 İçindekiler
1. [Proje Kurulumu](#1-proje-kurulumu)
2. [TypeScript ve Express Ayarları](#2-typescript-ve-express-ayarları)
3. [Veritabanı ve Prisma](#3-veritabanı-ve-prisma)
4. [Auth Sistemi](#4-auth-sistemi)
5. [API Endpoints](#5-api-endpoints)
6. [İlerleme Sistemi](#6-ilerleme-sistemi)
7. [Test ve Deployment](#7-test-ve-deployment)

---

## 1. PROJE KURULUMU (15 dk)

### Adım 1.1: Klasör yapısını oluştur
```bash
mkdir learning-platform
cd learning-platform
npm init -y
```

**NEDEN?** Node.js projesi başlatmak için package.json oluşturuyoruz.

### Adım 1.2: TypeScript ve gerekli paketleri yükle
```bash
npm install express cors dotenv bcrypt jsonwebtoken zod
npm install -D typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken @types/cors ts-node nodemon
```

**NEDEN NE?**
- `express`: Web server framework
- `cors`: Frontend'den API'ye istek atmak için
- `dotenv`: Çevre değişkenleri (.env dosyası)
- `bcrypt`: Şifre hashleme
- `jsonwebtoken`: Kullanıcı authentication
- `zod`: Input validation (girdi doğrulama)
- `-D` ile başlayanlar: Sadece geliştirme için

### Adım 1.3: TypeScript config oluştur
```bash
npx tsc --init
```

Oluşan `tsconfig.json` dosyasını aç ve şunları değiştir:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

**NEDEN?** TypeScript'in nasıl çalışacağını belirliyoruz.

### Adım 1.4: package.json'a script'ler ekle
`package.json` dosyasını aç ve `"scripts"` bölümüne ekle:
```json
"scripts": {
  "dev": "nodemon src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

### Adım 1.5: Klasör yapısını oluştur
```bash
mkdir -p src/{controllers,routes,middleware,services,types,utils,config}
mkdir prisma
```

**KLASÖRLERIN ANLAMLARI:**
- `controllers`: Route'ların mantığı (handler fonksiyonlar)
- `routes`: API endpoint tanımları
- `middleware`: Auth, validation, error handling
- `services`: Database işlemleri ve business logic
- `types`: TypeScript type tanımları
- `utils`: Yardımcı fonksiyonlar
- `config`: Konfigürasyon dosyaları

---

## 2. TYPESCRIPT VE EXPRESS AYARLARI (20 dk)

### Adım 2.1: .env dosyası oluştur
Proje kök dizininde `.env` dosyası oluştur:
```
DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/learning_platform"
PORT=3000
NODE_ENV=development
JWT_SECRET=super-gizli-anahtar-12345
JWT_EXPIRES_IN=7d
```

**NEDEN?** Hassas bilgileri kod içinde yazmamak için.

### Adım 2.2: src/config/index.ts oluştur
```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  database: {
    url: process.env.DATABASE_URL!
  }
};
```

**NE YAPIYORUZ?** .env dosyasındaki değerleri tek bir yerden yönetiyoruz.

### Adım 2.3: src/server.ts oluştur (İlk basit versiyonu)
```typescript
import express from 'express';
import cors from 'cors';
import { config } from './config';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Server başlat
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
});
```

### Adım 2.4: Test et!
```bash
npm run dev
```

Tarayıcıda `http://localhost:3000/health` aç. `{"status":"OK"}` göreceksin! 🎉

**ŞİMDİ NE OLDU?** İlk API endpoint'ini çalıştırdın!

---

## 3. VERİTABANI VE PRISMA (30 dk)

### Adım 3.1: Prisma'yı yükle ve başlat
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

**NE OLDU?** `prisma` klasörü ve içinde `schema.prisma` dosyası oluştu.

### Adım 3.2: prisma/schema.prisma dosyasını düzenle

Dosyayı aç ve şunu yaz (İLK BASIT VERSYON):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**NEDEN BU KADAR BASIT?** Önce temel User modelini kurup test edeceğiz, sonra geri kalanı ekleyeceğiz.

### Adım 3.3: PostgreSQL veritabanını oluştur

PostgreSQL'de yeni database oluştur:
```sql
CREATE DATABASE learning_platform;
```

### Adım 3.4: Migration çalıştır
```bash
npx prisma migrate dev --name init
```

**NE OLDU?** Prisma veritabanında `User` tablosunu oluşturdu!

### Adım 3.5: Prisma Client'ı hazırla

`src/config/database.ts` dosyası oluştur:
```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

**NEDEN?** Artık kodda `prisma` kullanarak veritabanı işlemleri yapacağız.

---

## 4. AUTH SİSTEMİ (45 dk)

### Adım 4.1: Type tanımları yap

`src/types/auth.types.ts` oluştur:
```typescript
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
```

**NEDEN?** TypeScript'te tip güvenliği için.

### Adım 4.2: Validation şemaları yaz

`src/utils/validation.ts` oluştur:
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Geçerli email giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalı')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});
```

**NE İŞE YARIYOR?** Kullanıcı girişlerini kontrol ediyoruz.

### Adım 4.3: Auth Service oluştur

`src/services/auth.service.ts` oluştur:
```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config';
import { RegisterInput, LoginInput, JWTPayload } from '../types/auth.types';

export class AuthService {
  // Kullanıcı kayıt
  async register(data: RegisterInput) {
    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Bu email zaten kullanılıyor');
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name
      }
    });

    // Şifreyi response'dan çıkar
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Kullanıcı giriş
  async login(data: LoginInput) {
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Email veya şifre hatalı');
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Email veya şifre hatalı');
    }

    // JWT token oluştur
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
}
```

**BU KOD NE YAPIYOR?**
1. `register`: Yeni kullanıcı oluşturur, şifreyi hashler
2. `login`: Email/şifre kontrol eder, JWT token üretir

### Adım 4.4: Auth Controller oluştur

`src/controllers/auth.controller.ts` oluştur:
```typescript
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validation';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      // Input validation
      const validatedData = registerSchema.parse(req.body);
      
      // Kullanıcı oluştur
      const user = await authService.register(validatedData);
      
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
}
```

**CONTROLLER NE YAPAR?** HTTP isteklerini alır, service'e gönderir, cevap döner.

### Adım 4.5: Auth Routes oluştur

`src/routes/auth.routes.ts` oluştur:
```typescript
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));

export default router;
```

### Adım 4.6: Routes'u server.ts'e bağla

`src/server.ts` dosyasını güncelle:
```typescript
import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
});
```

### Adım 4.7: TEST ET! 🎯

Postman veya curl ile test et:

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

**BAŞARILI!** Token aldıysan auth sistemi çalışıyor! 🎉

---

## 5. API ENDPOINTS (Kategori Örneği - 30 dk)

### Adım 5.1: Prisma schema'ya Category ekle

`prisma/schema.prisma` dosyasını aç ve ekle:
```prisma
model Category {
  id          String         @id @default(uuid())
  name        String         @unique
  description String?
  slug        String         @unique
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  paths       LearningPath[]
}

model LearningPath {
  id          String   @id @default(uuid())
  title       String
  description String?
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Migration çalıştır:
```bash
npx prisma migrate dev --name add_categories
```

### Adım 5.2: Category Service

`src/services/category.service.ts`:
```typescript
import { prisma } from '../config/database';

export class CategoryService {
  async getAll() {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { paths: true }
        }
      }
    });
  }

  async getById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        paths: true
      }
    });
  }

  async create(data: { name: string; description?: string; slug: string }) {
    return await prisma.category.create({ data });
  }
}
```

### Adım 5.3: Category Controller

`src/controllers/category.controller.ts`:
```typescript
import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

const categoryService = new CategoryService();

export class CategoryController {
  async getAll(req: Request, res: Response) {
    try {
      const categories = await categoryService.getAll();
      res.json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const category = await categoryService.getById(req.params.id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
      }
      res.json({ success: true, data: category });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const category = await categoryService.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
```

### Adım 5.4: Category Routes

`src/routes/category.routes.ts`:
```typescript
import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';

const router = Router();
const controller = new CategoryController();

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', (req, res) => controller.create(req, res));

export default router;
```

### Adım 5.5: server.ts'e ekle:
```typescript
import categoryRoutes from './routes/category.routes';
app.use('/api/categories', categoryRoutes);
```

---

## 6. SIRADAKI ADIMLAR

### Auth Middleware Ekle (Koruma)
`src/middleware/auth.middleware.ts` oluştur - JWT token kontrolü

### Diğer Modelleri Ekle
- LearningPath (Controller + Service + Routes)
- Node (Ağaç yapısı)
- Content (Video, Test vs.)
- Progress (İlerleme takibi)

### Her biri için aynı pattern:
1. Prisma schema güncelle
2. Migration çalıştır
3. Service yaz (database işlemleri)
4. Controller yaz (HTTP handler)
5. Routes yaz (endpoint tanımla)
6. server.ts'e ekle

---

## 🎯 ÖNEMLİ NOTLAR

**PATTERN'I ANLA:**
```
Request → Route → Controller → Service → Database
                                    ↓
Response ← Controller ← Service ← Database
```

**HER YENİ ÖZELLİK İÇİN:**
1. Schema'ya ekle
2. Migration yap
3. Service yaz
4. Controller yaz
5. Route tanımla
6. Test et

**SIRA SENİN!** 🚀
Şimdi bu rehberi takip ederek adım adım yaz. Takıldığın yerde sor!