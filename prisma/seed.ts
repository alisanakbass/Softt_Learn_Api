import "dotenv/config";
import { PrismaClient, Role, ContentType, Difficulty } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";

// --- VERITABANI BAĞLANTISI ---
const connectionString = process.env.DATABASE_URL;
// Bağlantı havuzunu yapılandırıyoruz
const pool = new Pool({
  connectionString,
  max: 20, // Pool size
  idleTimeoutMillis: 30000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- SABİT VERİLER ---
const CATEGORIES = [
  {
    name: "Yazılım Geliştirme",
    slug: "software-dev",
    desc: "Backend, Frontend, Mobile ve daha fazlası.",
  },
  {
    name: "Veri Bilimi & AI",
    slug: "data-science",
    desc: "Makine öğrenmesi, istatistik ve büyük veri.",
  },
  {
    name: "Siber Güvenlik",
    slug: "cyber-security",
    desc: "Ağ güvenliği, penetrasyon testleri ve etik hack.",
  },
  {
    name: "DevOps & Cloud",
    slug: "devops-cloud",
    desc: "AWS, Azure, Docker, Kubernetes dünyası.",
  },
  {
    name: "Mobil Uygulama",
    slug: "mobile-app",
    desc: "iOS, Android, React Native ve Flutter.",
  },
  {
    name: "Oyun Geliştirme",
    slug: "game-dev",
    desc: "Unity, Unreal Engine ve oyun tasarımı.",
  },
  {
    name: "Veritabanı Yönetimi",
    slug: "database-admin",
    desc: "SQL, NoSQL, Tuning ve Mimariler.",
  },
  {
    name: "UI/UX Tasarım",
    slug: "ui-ux-design",
    desc: "Kullanıcı deneyimi ve arayüz tasarımı.",
  },
];

const TECHNOLOGIES = [
  "React",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "Go",
  "Rust",
  "Docker",
  "Kubernetes",
  "AWS",
  "TensorFlow",
  "SQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "Next.js",
  "Vue",
  "Angular",
  "Swift",
  "Kotlin",
];

const ADJECTIVES = [
  "Kapsamlı",
  "İleri Seviye",
  "Yeni Başlayanlar İçin",
  "Uçtan Uca",
  "Pratik",
  "Modern",
  "Hızlandırılmış",
  "Profesyonel",
  "A'dan Z'ye",
  "Masterclass",
];

const LOREM_DESC = `Bu eğitim serisinde, sektör standartlarına uygun projeler geliştirerek yeteneklerinizi bir üst seviyeye taşıyacaksınız. 
Gerçek hayat senaryoları, best-practice'ler ve performans optimizasyonları üzerine yoğunlaşacağız. 
Hem teorik bilgi hem de pratik uygulama imkanı bulacaksınız.`;

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateQuestions(count: number) {
  return Array.from({ length: count }).map((_, i) => ({
    question: `Soru ${
      i + 1
    }: Bu konuyla ilgili aşağıdakilerden hangisi en doğru ifadedir?`,
    options: [
      "Yanlış cevap seçeneği A",
      "Yanlış cevap seçeneği B",
      "Doğru cevap budur",
      "Yanlış cevap seçeneği D",
    ],
    correctAnswer: 2,
    explanation: "Çünkü mantıksal açıklaması budur.",
  }));
}

async function main() {
  console.log("🚀 SEED Başlatılıyor...");

  // 1. Temizlik
  try {
    const tableNames = [
      "UserProgress",
      "Question",
      "Node",
      "Content",
      "LearningPath",
      "Category",
      "User",
    ];
    for (const tableName of tableNames) {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`
      );
    }
    console.log("🧹 Temizlik tamam.");
  } catch (error) {
    console.warn("⚠️ Temizlik uyarısı:", error);
  }

  // 2. Kullanıcılar
  const password = await bcrypt.hash("123456", 10);

  await prisma.user.create({
    data: {
      email: "admin@softlearn.com",
      name: "Süper Admin",
      password,
      role: Role.ADMIN,
    },
  });

  // Batch create users to save time
  const teachers = Array.from({ length: 5 }, (_, i) => ({
    email: `teacher${i + 1}@softlearn.com`,
    name: `Eğitmen ${i + 1}`,
    password,
    role: Role.TEACHER,
  }));
  await prisma.user.createMany({ data: teachers });

  const students = Array.from({ length: 20 }, (_, i) => ({
    email: `student${i + 1}@softlearn.com`,
    name: `Öğrenci ${i + 1}`,
    password,
    role: Role.STUDENT,
  }));
  await prisma.user.createMany({ data: students });

  console.log("👥 Kullanıcılar oluşturuldu.");

  // 3. İçerik Döngüsü
  let totalPaths = 0;
  let totalContents = 0;

  for (const catData of CATEGORIES) {
    const category = await prisma.category.create({
      data: {
        name: catData.name,
        slug: catData.slug,
        description: catData.desc,
      },
    });

    // Her kategori için 4-6 Path
    const pathCount = getRandomInt(4, 6);

    for (let p = 1; p <= pathCount; p++) {
      const tech = getRandomItem(TECHNOLOGIES);
      const adj = getRandomItem(ADJECTIVES);
      const difficulty = Object.values(Difficulty)[getRandomInt(0, 2)];

      const path = await prisma.learningPath.create({
        data: {
          title: `${adj} ${tech} Eğitimi ${p}`,
          description: `${tech} detaylı incelemesi. ${LOREM_DESC}`,
          difficulty: difficulty,
          categoryId: category.id,
        },
      });
      totalPaths++;

      // Her Path için 6-8 Bölüm
      const nodeCount = getRandomInt(6, 8);

      for (let n = 1; n <= nodeCount; n++) {
        const section = await prisma.node.create({
          data: {
            title: `Bölüm ${n}: ${tech} Modülü`,
            order: n,
            pathId: path.id,
          },
        });

        // Her Bölüm için 3-5 İçerik
        const lessonCount = getRandomInt(3, 5);
        for (let l = 1; l <= lessonCount; l++) {
          const contentTypeStr = Object.keys(ContentType)[
            getRandomInt(0, 3)
          ] as keyof typeof ContentType;

          const contentData: any = {
            type: contentTypeStr,
            title: `Ders ${n}.${l}: ${tech} - ${contentTypeStr}`,
            description: `Ders açıklaması burada yer alır.`,
          };

          if (contentTypeStr === "VIDEO") {
            contentData.videoUrl =
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
            contentData.duration = 300 + l * 10;
          } else if (contentTypeStr === "ARTICLE") {
            contentData.articleText = `# ${tech}\n\n${LOREM_DESC}`;
          } else if (contentTypeStr === "QUIZ") {
            contentData.questions = {
              create: generateQuestions(3),
            };
          }

          // Tek tek create işlemi (buralarda hata olursa loglayıp geçeceğiz)
          try {
            const content = await prisma.content.create({ data: contentData });

            await prisma.node.create({
              data: {
                title: content.title,
                order: l,
                pathId: path.id,
                parentId: section.id,
                contentId: content.id,
              },
            });
            totalContents++;
          } catch (err) {
            console.error(
              `❌ İçerik oluşturma hatası (P:${p} N:${n} L:${l}):`,
              err
            );
          }
        }
      }
    }
    // İlerleme çubuğu gibi bir şey
    console.log(`✅ Kategori Tamamlandı: ${catData.name}`);
  }

  console.log("🏁 SEED İŞLEMİ SONA ERDİ.");
  console.log(`📊 Toplam Path: ${totalPaths}`);
  console.log(`📊 Toplam İçerik: ${totalContents}`);
}

main()
  .catch((e) => {
    console.error("❌ Kritik Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Pool'u kapat
  });
