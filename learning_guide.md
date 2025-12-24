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
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
};
```

**NE YAPIYORUZ?** .env dosyasındaki değerleri tek bir yerden yönetiyoruz.

### Adım 2.3: src/server.ts oluştur (İlk basit versiyonu)

```typescript
import express from "express";
import cors from "cors";
import { config } from "./config";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
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
import { PrismaClient } from "@prisma/client";

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
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Geçerli email giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
```

**NE İŞE YARIYOR?** Kullanıcı girişlerini kontrol ediyoruz.

### Adım 4.3: Auth Service oluştur

`src/services/auth.service.ts` oluştur:

```typescript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { config } from "../config";
import { RegisterInput, LoginInput, JWTPayload } from "../types/auth.types";

export class AuthService {
  // Kullanıcı kayıt
  async register(data: RegisterInput) {
    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Bu email zaten kullanılıyor");
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    // Şifreyi response'dan çıkar
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Kullanıcı giriş
  async login(data: LoginInput) {
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Email veya şifre hatalı");
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Email veya şifre hatalı");
    }

    // JWT token oluştur
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
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
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../utils/validation";

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
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
}
```

**CONTROLLER NE YAPAR?** HTTP isteklerini alır, service'e gönderir, cevap döner.

### Adım 4.5: Auth Routes oluştur

`src/routes/auth.routes.ts` oluştur:

```typescript
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

export default router;
```

### Adım 4.6: Routes'u server.ts'e bağla

`src/server.ts` dosyasını güncelle:

```typescript
import express from "express";
import cors from "cors";
import { config } from "./config";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
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
import { prisma } from "../config/database";

export class CategoryService {
  async getAll() {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { paths: true },
        },
      },
    });
  }

  async getById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        paths: true,
      },
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
import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";

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
        return res
          .status(404)
          .json({ success: false, message: "Kategori bulunamadı" });
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
import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router = Router();
const controller = new CategoryController();

router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.post("/", (req, res) => controller.create(req, res));

export default router;
```

### Adım 5.5: server.ts'e ekle:

```typescript
import categoryRoutes from "./routes/category.routes";
app.use("/api/categories", categoryRoutes);
```

---

## 6. AUTH MIDDLEWARE - TOKEN KORUMASI (20 dk)

### Adım 6.1: Auth Middleware Oluştur

`src/middleware/auth.middleware.ts` dosyası oluştur:

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { JWTPayload } from "../types/auth.types";

// Request tipini genişlet
declare global {
    namespace Express {
        interface Request {
              user?: JWTPayload;
                  }
                    }
                    }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Header'dan token al
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token bulunamadı",
      });
    }

    // Bearer kısmını çıkar
    const token = authHeader.substring(7);

    // Token'ı doğrula
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // User bilgisini request'e ekle
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Geçersiz veya süresi dolmuş token",
    });
  }
};

// Role kontrolü için middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Kimlik doğrulaması gerekli",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için yetkiniz yok",
      });
    }

    next();
  };
};
```

**NE YAPIYOR?**

- `authenticate`: JWT token'ı kontrol eder, geçerliyse kullanıcı bilgisini `req.user`'a ekler
- `authorize`: Belirli rollere sahip kullanıcıları kontrol eder (ADMIN, INSTRUCTOR vs.)

### Adım 6.2: Korumalı Route Örneği

`src/routes/category.routes.ts` dosyasını güncelle:

```typescript
import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const controller = new CategoryController();

// Herkese açık
router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));

// Sadece ADMIN ve INSTRUCTOR
router.post("/", authenticate, authorize("ADMIN", "INSTRUCTOR"), (req, res) =>
  controller.create(req, res)
);

export default router;
```

**KULLANIM:**

```bash
# Token ile istek at
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Web Development", "slug": "web-dev"}'
```

---

## 7. ERROR HANDLING - MERKEZI HATA YÖNETİMİ (15 dk)

### Adım 7.1: Error Middleware Oluştur

`src/middleware/error.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ Error:", error);

  // Zod validation hatası
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation hatası",
      errors: error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Prisma unique constraint hatası
  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Bu kayıt zaten mevcut",
    });
  }

  // Genel hata
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Sunucu hatası",
  });
};
```

### Adım 7.2: server.ts'e Ekle

`src/server.ts` dosyasını güncelle:

```typescript
import express from "express";
import cors from "cors";
import { config } from "./config";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handler (EN SONDA OLMALI!)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
});
```

---

## 8. LEARNING PATH - TAM CRUD ÖRNEĞİ (30 dk)

### Adım 8.1: Validation Şemaları

`src/utils/validation.ts` dosyasına ekle:

```typescript
export const createPathSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalı"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Geçerli kategori ID giriniz"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});

export const updatePathSchema = createPathSchema.partial();
```

### Adım 8.2: LearningPath Service

`src/services/path.service.ts`:

```typescript
import { prisma } from "../config/database";

export class PathService {
  async getAll(categoryId?: string) {
    return await prisma.learningPath.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: true,
        _count: {
          select: { nodes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string) {
    const path = await prisma.learningPath.findUnique({
      where: { id },
      include: {
        category: true,
        nodes: {
          orderBy: { order: "asc" },
          include: {
            content: true,
          },
        },
      },
    });

    if (!path) {
      throw new Error("Learning path bulunamadı");
    }

    return path;
  }

  async create(data: {
    title: string;
    description?: string;
    categoryId: string;
  }) {
    return await prisma.learningPath.create({
      data,
      include: { category: true },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      categoryId?: string;
    }
  ) {
    return await prisma.learningPath.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string) {
    return await prisma.learningPath.delete({
      where: { id },
    });
  }
}
```

### Adım 8.3: LearningPath Controller

`src/controllers/path.controller.ts`:

```typescript
import { Request, Response } from "express";
import { PathService } from "../services/path.service";
import { createPathSchema, updatePathSchema } from "../utils/validation";

const pathService = new PathService();

export class PathController {
  async getAll(req: Request, res: Response) {
    try {
      const { categoryId } = req.query;
      const paths = await pathService.getAll(categoryId as string);
      res.json({ success: true, data: paths });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const path = await pathService.getById(req.params.id);
      res.json({ success: true, data: path });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = createPathSchema.parse(req.body);
      const path = await pathService.create(validatedData);
      res.status(201).json({ success: true, data: path });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const validatedData = updatePathSchema.parse(req.body);
      const path = await pathService.update(req.params.id, validatedData);
      res.json({ success: true, data: path });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await pathService.delete(req.params.id);
      res.json({ success: true, message: "Learning path silindi" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
```

### Adım 8.4: LearningPath Routes

`src/routes/path.routes.ts`:

```typescript
import { Router } from "express";
import { PathController } from "../controllers/path.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const controller = new PathController();

// Public routes
router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));

// Protected routes
router.post("/", authenticate, authorize("ADMIN", "INSTRUCTOR"), (req, res) =>
  controller.create(req, res)
);
router.put("/:id", authenticate, authorize("ADMIN", "INSTRUCTOR"), (req, res) =>
  controller.update(req, res)
);
router.delete("/:id", authenticate, authorize("ADMIN"), (req, res) =>
  controller.delete(req, res)
);

export default router;
```

### Adım 8.5: server.ts'e Ekle

```typescript
import pathRoutes from "./routes/path.routes";
app.use("/api/paths", pathRoutes);
```

---

## 9. NODE SİSTEMİ - AĞAÇ YAPISI (35 dk)

### Adım 9.1: Prisma Schema'yı Güncelle

`prisma/schema.prisma` dosyasına ekle:

```prisma
model Node {
  id             String       @id @default(uuid())
  title          String
  description    String?
  order          Int
  pathId         String
  path           LearningPath @relation(fields: [pathId], references: [id], onDelete: Cascade)

  // Self-referencing relation (ağaç yapısı)
  parentId       String?
  parent         Node?        @relation("NodeChildren", fields: [parentId], references: [id], onDelete: Cascade)
  children       Node[]       @relation("NodeChildren")

  contentId      String?      @unique
  content        Content?     @relation(fields: [contentId], references: [id])

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([pathId])
  @@index([parentId])
}

model Content {
  id          String      @id @default(uuid())
  type        ContentType
  title       String
  description String?

  // Video için
  videoUrl    String?
  duration    Int?        // saniye cinsinden

  // Quiz için
  questions   Question[]

  node        Node?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum ContentType {
  VIDEO
  ARTICLE
  QUIZ
  EXERCISE
}

model Question {
  id          String   @id @default(uuid())
  contentId   String
  content     Content  @relation(fields: [contentId], references: [id], onDelete: Cascade)

  question    String
  options     String[] // JSON array
  correctAnswer Int    // Doğru cevabın index'i
  explanation String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([contentId])
}
```

**AĞAÇ YAPISI NASIL ÇALIŞIR?**

- Her `Node` bir `parentId`'ye sahip olabilir
- `parent` ve `children` ilişkileri ile ağaç oluşur
- Örnek: "JavaScript Temelleri" → "Değişkenler" → "let vs const"

Migration çalıştır:

```bash
npx prisma migrate dev --name add_nodes_and_content
```

---

## 10. PROGRESS TRACKING - İLERLEME TAKİBİ (25 dk)

### Adım 10.1: Prisma Schema'ya Ekle

```prisma
model UserProgress {
  id              String       @id @default(uuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  pathId          String
  path            LearningPath @relation(fields: [pathId], references: [id], onDelete: Cascade)

  completedNodes  String[]     // Tamamlanan node ID'leri
  currentNodeId   String?

  startedAt       DateTime     @default(now())
  lastAccessedAt  DateTime     @updatedAt
  completedAt     DateTime?

  @@unique([userId, pathId])
  @@index([userId])
  @@index([pathId])
}
```

Migration:

```bash
npx prisma migrate dev --name add_user_progress
```

---

## 11. TEST STRATEJİLERİ (30 dk)

### Adım 11.1: Test Paketlerini Yükle

```bash
npm install -D jest @types/jest ts-jest supertest @types/supertest
```

### Adım 11.2: Jest Config Oluştur

`jest.config.js` dosyası oluştur:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/server.ts"],
};
```

### Adım 11.3: package.json'a Test Script Ekle

```json
"scripts": {
  "test": "NODE_ENV=test jest",
  "test:watch": "NODE_ENV=test jest --watch",
  "test:coverage": "NODE_ENV=test jest --coverage"
}
```

---

## 12. DEPLOYMENT - PRODUCTION'A ALMA (40 dk)

### Adım 12.1: Production Ortamı Hazırlığı

#### .env.production Oluştur

```
DATABASE_URL="postgresql://user:pass@production-db-host:5432/learning_platform"
PORT=3000
NODE_ENV=production
JWT_SECRET=super-gizli-production-key-random-string-12345
JWT_EXPIRES_IN=7d
```

**ÖNEMLİ:** Production'da güçlü JWT_SECRET kullan!

### Adım 12.2: Build Script Hazırla

`package.json` güncelle:

```json
"scripts": {
  "dev": "nodemon src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate deploy",
  "postinstall": "npm run prisma:generate"
}
```

### Adım 12.3: Production Checklist

✅ **Güvenlik:**

- [ ] Güçlü JWT_SECRET kullan
- [ ] CORS ayarlarını production domain'e göre ayarla
- [ ] Rate limiting ekle (express-rate-limit)
- [ ] Helmet.js ekle (security headers)
- [ ] Input validation her yerde aktif

✅ **Performance:**

- [ ] Database connection pooling
- [ ] Response compression
- [ ] Caching stratejisi
- [ ] Database indexleri optimize et

✅ **Monitoring:**

- [ ] Logging sistemi
- [ ] Error tracking
- [ ] Health check endpoint

---

## 13. BEST PRACTICES & İPUÇLARI 🎯

### Kod Organizasyonu

**✅ DOĞRU:**

```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── middleware/      # Auth, validation, error handling
├── routes/          # API endpoints
├── types/           # TypeScript types
├── utils/           # Helper functions
└── config/          # Configuration
```

**❌ YANLIŞ:**

- Her şeyi tek dosyada yazmak
- Business logic'i controller'da yazmak
- Database query'lerini controller'da yazmak

### Error Handling

**✅ DOĞRU:**

```typescript
// Custom error class
class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
  }
}

// Service'te kullan
if (!user) {
  throw new AppError("Kullanıcı bulunamadı", 404);
}
```

---

## 🎯 ÖZET: PROJE TAMAMLAMA KONTROL LİSTESİ

### Temel Özellikler

- ✅ User Authentication (Register, Login)
- ✅ JWT Token sistemi
- ✅ Category CRUD
- ✅ LearningPath CRUD
- ✅ Node ağaç yapısı
- ✅ Content yönetimi
- ✅ Progress tracking

### Middleware & Utilities

- ✅ Auth middleware
- ✅ Error handling middleware
- ✅ Input validation (Zod)
- ✅ Rate limiting
- ✅ CORS configuration

### Testing

- ✅ Unit testler
- ✅ Integration testler
- ✅ Test coverage %80+

### Deployment

- ✅ Production environment
- ✅ Docker configuration
- ✅ Monitoring & logging

---

## 🚀 SONRAKI SEVİYE ÖZELLİKLER

### 1. Real-time Features

- WebSocket ile canlı ilerleme güncellemeleri
- Canlı sohbet/yorum sistemi
- Bildirim sistemi

### 2. Advanced Features

- AI destekli içerik önerileri
- Gamification (rozetler, liderlik tablosu)
- Sertifika sistemi
- Ödeme entegrasyonu (Stripe/PayPal)

### 3. Analytics

- Kullanıcı davranış analizi
- İçerik performans metrikleri
- A/B testing

---

## 💡 SIRA SENİN!

**Bu rehberi takip ederek:**

1. ✅ Temel yapıyı kurdun
2. ✅ Auth sistemini yazdın
3. ✅ CRUD operasyonlarını öğrendin
4. ✅ İleri seviye özellikleri ekledin
5. ✅ Test yazmayı öğrendin
6. ✅ Production'a almayı öğrendin

**Şimdi ne yapmalısın?**

- 🎯 Kendi özelliklerini ekle
- 🎯 Farklı modeller dene
- 🎯 Frontend ile entegre et
- 🎯 Gerçek bir proje yap

**BAŞARILAR! 🚀🎉**
