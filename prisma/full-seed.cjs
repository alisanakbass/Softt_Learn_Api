require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Detaylı seed verisi ekleniyor...');

    // Önce mevcut verileri temizle
    await prisma.question.deleteMany();
    await prisma.content.deleteMany();
    await prisma.userProgress.deleteMany();
    await prisma.node.deleteMany();
    await prisma.learningPath.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Eski veriler temizlendi');

    // Kategoriler oluştur
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'JavaScript',
                slug: 'javascript',
                description: 'Modern JavaScript programlama dili ve ekosistemi',
            },
        }),
        prisma.category.create({
            data: {
                name: 'TypeScript',
                slug: 'typescript',
                description: "JavaScript'in tip güvenli versiyonu",
            },
        }),
        prisma.category.create({
            data: {
                name: 'Node.js',
                slug: 'nodejs',
                description: 'Backend JavaScript runtime ve framework\'ler',
            },
        }),
        prisma.category.create({
            data: {
                name: 'React',
                slug: 'react',
                description: 'Modern UI kütüphanesi ve ekosistemi',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Database',
                slug: 'database',
                description: 'SQL ve NoSQL veritabanı yönetimi',
            },
        }),
    ]);

    console.log('✅ 5 Kategori oluşturuldu');

    // ========== JAVASCRIPT PATHS ==========
    const jsBasicsPath = await prisma.learningPath.create({
        data: {
            title: 'JavaScript Temelleri',
            description: "JavaScript'in temel kavramlarını sıfırdan öğrenin",
            difficulty: 'BEGINNER',
            categoryId: categories[0].id,
        },
    });

    const jsAdvancedPath = await prisma.learningPath.create({
        data: {
            title: 'İleri Seviye JavaScript',
            description: 'Async/Await, Promises, Closures ve daha fazlası',
            difficulty: 'ADVANCED',
            categoryId: categories[0].id,
        },
    });

    const jsES6Path = await prisma.learningPath.create({
        data: {
            title: 'Modern JavaScript (ES6+)',
            description: 'Arrow functions, destructuring, spread operator',
            difficulty: 'INTERMEDIATE',
            categoryId: categories[0].id,
        },
    });

    // ========== TYPESCRIPT PATHS ==========
    const tsBasicsPath = await prisma.learningPath.create({
        data: {
            title: 'TypeScript Başlangıç',
            description: 'TypeScript ile tip güvenli kod yazın',
            difficulty: 'INTERMEDIATE',
            categoryId: categories[1].id,
        },
    });

    const tsAdvancedPath = await prisma.learningPath.create({
        data: {
            title: 'İleri TypeScript',
            description: 'Generics, Decorators, Advanced Types',
            difficulty: 'ADVANCED',
            categoryId: categories[1].id,
        },
    });

    // ========== NODE.JS PATHS ==========
    const nodeBasicsPath = await prisma.learningPath.create({
        data: {
            title: 'Node.js Temelleri',
            description: 'Node.js runtime ve temel modüller',
            difficulty: 'BEGINNER',
            categoryId: categories[2].id,
        },
    });

    const expressPath = await prisma.learningPath.create({
        data: {
            title: 'Express.js ile API Geliştirme',
            description: 'RESTful API oluşturma ve best practices',
            difficulty: 'INTERMEDIATE',
            categoryId: categories[2].id,
        },
    });

    // ========== REACT PATHS ==========
    const reactBasicsPath = await prisma.learningPath.create({
        data: {
            title: 'React Temelleri',
            description: 'Component-based UI geliştirme',
            difficulty: 'BEGINNER',
            categoryId: categories[3].id,
        },
    });

    const reactHooksPath = await prisma.learningPath.create({
        data: {
            title: 'React Hooks Mastery',
            description: 'useState, useEffect, custom hooks',
            difficulty: 'INTERMEDIATE',
            categoryId: categories[3].id,
        },
    });

    // ========== DATABASE PATHS ==========
    const sqlPath = await prisma.learningPath.create({
        data: {
            title: 'SQL Temelleri',
            description: 'PostgreSQL ile veritabanı yönetimi',
            difficulty: 'BEGINNER',
            categoryId: categories[4].id,
        },
    });

    console.log('✅ 10 Learning Path oluşturuldu');

    // ========== JAVASCRIPT BASICS CONTENT ==========
    const jsIntroContent = await prisma.content.create({
        data: {
            type: 'VIDEO',
            title: 'JavaScript Nedir?',
            description: "JavaScript'e kapsamlı giriş",
            videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
            duration: 600,
        },
    });

    await prisma.node.create({
        data: {
            title: "1. JavaScript'e Giriş",
            description: "JavaScript'in tarihçesi ve kullanım alanları",
            order: 1,
            pathId: jsBasicsPath.id,
            contentId: jsIntroContent.id,
        },
    });

    const variablesContent = await prisma.content.create({
        data: {
            type: 'ARTICLE',
            title: 'Değişkenler: var, let, const',
            description: "JavaScript'te değişken tanımlama yöntemleri",
            articleText: `# JavaScript Değişkenleri

## var, let ve const Farkları

JavaScript'te değişken tanımlamanın üç yolu vardır.

### 1. var (Eski yöntem)
- Function scope
- Hoisting var
- Yeniden tanımlanabilir

### 2. let (Modern)
- Block scope
- Yeniden tanımlanamaz
- Değer değiştirilebilir

### 3. const (Sabit)
- Block scope
- Yeniden tanımlanamaz
- Değer değiştirilemez

## Best Practice
Modern JavaScript'te **let** ve **const** kullanın!`,
        },
    });

    await prisma.node.create({
        data: {
            title: '2. Değişkenler',
            description: 'var, let ve const kullanımı',
            order: 2,
            pathId: jsBasicsPath.id,
            contentId: variablesContent.id,
        },
    });

    const dataTypesQuiz = await prisma.content.create({
        data: {
            type: 'QUIZ',
            title: 'Veri Tipleri Quiz',
            description: 'JavaScript veri tiplerini test edin',
        },
    });

    await Promise.all([
        prisma.question.create({
            data: {
                contentId: dataTypesQuiz.id,
                question: "JavaScript'te kaç tane primitive veri tipi vardır?",
                options: ['5', '6', '7', '8'],
                correctAnswer: 2,
                explanation: '7 primitive tip: string, number, bigint, boolean, undefined, symbol, null',
            },
        }),
        prisma.question.create({
            data: {
                contentId: dataTypesQuiz.id,
                question: 'typeof null sonucu nedir?',
                options: ['null', 'undefined', 'object', 'number'],
                correctAnswer: 2,
                explanation: 'typeof null "object" döner. Bu JavaScript\'in bilinen bir bug\'ıdır.',
            },
        }),
        prisma.question.create({
            data: {
                contentId: dataTypesQuiz.id,
                question: 'Hangi veri tipi immutable değildir?',
                options: ['String', 'Number', 'Object', 'Boolean'],
                correctAnswer: 2,
                explanation: "Object mutable'dır, diğerleri primitive ve immutable'dır.",
            },
        }),
    ]);

    await prisma.node.create({
        data: {
            title: '3. Veri Tipleri Quiz',
            description: 'Primitive ve Reference tipler',
            order: 3,
            pathId: jsBasicsPath.id,
            contentId: dataTypesQuiz.id,
        },
    });

    const functionsContent = await prisma.content.create({
        data: {
            type: 'ARTICLE',
            title: 'Fonksiyonlar',
            description: 'Function declaration, expression ve arrow functions',
            articleText: `# JavaScript Fonksiyonları

## 1. Function Declaration
function greet(name) {
  return "Merhaba " + name;
}

## 2. Function Expression
const greet = function(name) {
  return "Merhaba " + name;
};

## 3. Arrow Function (ES6)
const greet = (name) => "Merhaba " + name;

## Farklar
- Arrow function'ların kendi this binding'i yoktur
- Arrow function constructor olarak kullanılamaz
- Arrow function'larda arguments objesi yoktur`,
        },
    });

    await prisma.node.create({
        data: {
            title: '4. Fonksiyonlar',
            description: 'Function types ve kullanımları',
            order: 4,
            pathId: jsBasicsPath.id,
            contentId: functionsContent.id,
        },
    });

    const arraysContent = await prisma.content.create({
        data: {
            type: 'VIDEO',
            title: 'Arrays ve Array Methods',
            description: 'JavaScript dizileri ve metotları',
            videoUrl: 'https://www.youtube.com/embed/R8rmfD9Y5-c',
            duration: 720,
        },
    });

    await prisma.node.create({
        data: {
            title: '5. Arrays',
            description: 'Diziler ve array metotları (map, filter, reduce)',
            order: 5,
            pathId: jsBasicsPath.id,
            contentId: arraysContent.id,
        },
    });

    // ========== ADVANCED JAVASCRIPT ==========
    const asyncContent = await prisma.content.create({
        data: {
            type: 'VIDEO',
            title: 'Async/Await Nedir?',
            description: 'Asenkron programlama',
            videoUrl: 'https://www.youtube.com/embed/V_Kr9OSfDeU',
            duration: 900,
        },
    });

    await prisma.node.create({
        data: {
            title: '1. Async/Await',
            description: 'Modern asenkron JavaScript',
            order: 1,
            pathId: jsAdvancedPath.id,
            contentId: asyncContent.id,
        },
    });

    const promisesQuiz = await prisma.content.create({
        data: {
            type: 'QUIZ',
            title: 'Promises Quiz',
            description: 'Promise bilginizi test edin',
        },
    });

    await Promise.all([
        prisma.question.create({
            data: {
                contentId: promisesQuiz.id,
                question: "Promise'in kaç state'i vardır?",
                options: ['2', '3', '4', '5'],
                correctAnswer: 1,
                explanation: '3 state: pending, fulfilled, rejected',
            },
        }),
        prisma.question.create({
            data: {
                contentId: promisesQuiz.id,
                question: 'Promise.all() ne zaman reject olur?',
                options: [
                    "Tüm promise'ler reject olunca",
                    'Herhangi biri reject olunca',
                    'İlk promise reject olunca',
                    'Hiçbir zaman',
                ],
                correctAnswer: 1,
                explanation: 'Promise.all() herhangi bir promise reject olduğunda hemen reject olur.',
            },
        }),
    ]);

    await prisma.node.create({
        data: {
            title: '2. Promises',
            description: 'Promise API ve kullanımı',
            order: 2,
            pathId: jsAdvancedPath.id,
            contentId: promisesQuiz.id,
        },
    });

    const closuresContent = await prisma.content.create({
        data: {
            type: 'ARTICLE',
            title: 'Closures',
            description: 'JavaScript closure kavramı',
            articleText: `# Closures

Closure, bir fonksiyonun kendi scope'u dışındaki değişkenlere erişebilmesidir.

## Örnek
function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  }
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2`,
        },
    });

    await prisma.node.create({
        data: {
            title: '3. Closures',
            description: 'Closure kavramı ve kullanımı',
            order: 3,
            pathId: jsAdvancedPath.id,
            contentId: closuresContent.id,
        },
    });

    // ========== TYPESCRIPT ==========
    const tsIntroContent = await prisma.content.create({
        data: {
            type: 'ARTICLE',
            title: "TypeScript'e Giriş",
            description: 'TypeScript nedir ve neden kullanmalıyız?',
            articleText: `# TypeScript Nedir?

TypeScript, Microsoft tarafından geliştirilen, JavaScript'in tip güvenli bir üst kümesidir.

## Avantajları
1. **Tip Güvenliği**: Hataları compile-time'da yakala
2. **Better IDE Support**: Otomatik tamamlama ve refactoring
3. **Modern Features**: ES6+ özellikleri
4. **Scalability**: Büyük projelerde daha iyi`,
        },
    });

    await prisma.node.create({
        data: {
            title: '1. TypeScript Nedir?',
            description: "TypeScript'e giriş",
            order: 1,
            pathId: tsBasicsPath.id,
            contentId: tsIntroContent.id,
        },
    });

    const tsTypesQuiz = await prisma.content.create({
        data: {
            type: 'QUIZ',
            title: 'TypeScript Tipleri',
            description: 'Temel tip bilgisi',
        },
    });

    await Promise.all([
        prisma.question.create({
            data: {
                contentId: tsTypesQuiz.id,
                question: 'TypeScript\'te "any" tipi ne işe yarar?',
                options: [
                    'Tip kontrolünü devre dışı bırakır',
                    'Sadece string kabul eder',
                    'Sadece number kabul eder',
                    'Hata verir',
                ],
                correctAnswer: 0,
                explanation: '"any" tipi tip kontrolünü devre dışı bırakır.',
            },
        }),
        prisma.question.create({
            data: {
                contentId: tsTypesQuiz.id,
                question: 'Interface ve Type arasındaki fark nedir?',
                options: [
                    'Hiçbir fark yok',
                    'Interface extend edilebilir',
                    'Type union yapabilir',
                    'Interface sadece object için',
                ],
                correctAnswer: 2,
                explanation: 'Type union ve intersection yapabilir.',
            },
        }),
    ]);

    await prisma.node.create({
        data: {
            title: '2. Temel Tipler',
            description: 'TypeScript tip sistemi',
            order: 2,
            pathId: tsBasicsPath.id,
            contentId: tsTypesQuiz.id,
        },
    });

    // ========== NODE.JS ==========
    const nodeIntroContent = await prisma.content.create({
        data: {
            type: 'VIDEO',
            title: 'Node.js Nedir?',
            description: 'Backend JavaScript',
            videoUrl: 'https://www.youtube.com/embed/TlB_eWDSMt4',
            duration: 720,
        },
    });

    await prisma.node.create({
        data: {
            title: "1. Node.js'e Giriş",
            description: 'Node.js runtime environment',
            order: 1,
            pathId: nodeBasicsPath.id,
            contentId: nodeIntroContent.id,
        },
    });

    const expressContent = await prisma.content.create({
        data: {
            type: 'ARTICLE',
            title: 'Express.js ile API',
            description: 'RESTful API oluşturma',
            articleText: `# Express.js ile RESTful API

## Kurulum
npm install express

## Basit Server
const express = require('express');
const app = express();

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000);`,
        },
    });

    await prisma.node.create({
        data: {
            title: '1. Express.js Basics',
            description: 'Web framework temelleri',
            order: 1,
            pathId: expressPath.id,
            contentId: expressContent.id,
        },
    });

    // ========== REACT ==========
    const reactIntroContent = await prisma.content.create({
        data: {
            type: 'VIDEO',
            title: 'React Nedir?',
            description: 'Modern UI library',
            videoUrl: 'https://www.youtube.com/embed/Tn6-PIqc4UM',
            duration: 840,
        },
    });

    await prisma.node.create({
        data: {
            title: "1. React'e Giriş",
            description: 'Component-based UI',
            order: 1,
            pathId: reactBasicsPath.id,
            contentId: reactIntroContent.id,
        },
    });

    const hooksQuiz = await prisma.content.create({
        data: {
            type: 'QUIZ',
            title: 'React Hooks Quiz',
            description: 'Hooks bilginizi test edin',
        },
    });

    await Promise.all([
        prisma.question.create({
            data: {
                contentId: hooksQuiz.id,
                question: "useState hook'u ne işe yarar?",
                options: ['API çağrısı yapar', 'State yönetimi sağlar', 'Routing yapar', 'Stil ekler'],
                correctAnswer: 1,
                explanation: "useState functional component'lerde state yönetimi sağlar.",
            },
        }),
        prisma.question.create({
            data: {
                contentId: hooksQuiz.id,
                question: 'useEffect ne zaman çalışır?',
                options: ["Sadece mount'ta", "Sadece unmount'ta", "Her render'da", "Dependency array'e göre"],
                correctAnswer: 3,
                explanation: "useEffect dependency array'deki değerler değiştiğinde çalışır.",
            },
        }),
    ]);

    await prisma.node.create({
        data: {
            title: '1. React Hooks',
            description: 'useState, useEffect',
            order: 1,
            pathId: reactHooksPath.id,
            contentId: hooksQuiz.id,
        },
    });

    // ========== DATABASE ==========
    const sqlContent = await prisma.content.create({
        data: {
            type: 'ARTICLE',
            title: 'SQL Temelleri',
            description: 'SELECT, INSERT, UPDATE, DELETE',
            articleText: `# SQL Temelleri

## SELECT
SELECT * FROM users;

## INSERT
INSERT INTO users (name, email) VALUES ('Ali', 'ali@test.com');

## UPDATE
UPDATE users SET name = 'Veli' WHERE id = 1;

## DELETE
DELETE FROM users WHERE id = 1;`,
        },
    });

    await prisma.node.create({
        data: {
            title: '1. SQL Basics',
            description: 'Temel SQL komutları',
            order: 1,
            pathId: sqlPath.id,
            contentId: sqlContent.id,
        },
    });

    console.log('✅ Tüm node\'lar ve içerikler oluşturuldu');
    console.log('🎉 Seed tamamlandı!');
    console.log(`
📊 Oluşturulan Veriler:
- 5 Kategori
- 10 Learning Path
- 15+ Node
- 15+ Content (Video, Article, Quiz)
- 10+ Quiz Sorusu
  `);
}

main()
    .catch((e) => {
        console.error('❌ Hata:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
