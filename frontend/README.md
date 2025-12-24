# 🎓 SoftLearn Frontend

SoftLearn platformunun React + TypeScript + Vite ile geliştirilmiş modern frontend uygulaması.

## 🚀 Teknolojiler

- **React 18** - UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı build tool
- **React Router** - Sayfa yönlendirme
- **Axios** - HTTP istekleri
- **Zustand** - State management
- **Tailwind CSS** - Utility-first CSS framework

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🌐 Çalışma Portları

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📁 Proje Yapısı

```
src/
├── components/      # Yeniden kullanılabilir componentler
├── pages/          # Sayfa componentleri
│   ├── Home.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── services/       # API servisleri
│   ├── api.ts
│   ├── authService.ts
│   ├── categoryService.ts
│   └── pathService.ts
├── store/          # Zustand state management
│   └── authStore.ts
├── types/          # TypeScript tip tanımlamaları
├── App.tsx         # Ana uygulama
└── main.tsx        # Entry point
```

## 🎨 Özellikler

### ✅ Tamamlanan

- ✅ Modern ve responsive tasarım
- ✅ Kullanıcı girişi ve kaydı
- ✅ Kategori listeleme ve filtreleme
- ✅ Learning path listeleme
- ✅ Token tabanlı authentication
- ✅ Global state management (Zustand)
- ✅ Error handling

### 🚧 Geliştirme Aşamasında

- 🚧 Path detay sayfası
- 🚧 Admin paneli
- 🚧 Kullanıcı profili
- 🚧 Path oluşturma/düzenleme
- 🚧 Node sistemi

## 🔧 Geliştirme

### Backend Bağlantısı

Backend API adresi `src/services/api.ts` dosyasında tanımlıdır:

```typescript
const API_BASE_URL = "http://localhost:5000/api";
```

Backend'iniz farklı bir portta çalışıyorsa bu değeri güncelleyin.

### Yeni Sayfa Ekleme

1. `src/pages/` klasörüne yeni component ekleyin
2. `src/App.tsx` içinde route tanımlayın

```typescript
<Route path="/yeni-sayfa" element={<YeniSayfa />} />
```

## 📝 Notlar

- Backend'in çalışıyor olması gerekir
- CORS ayarları backend'de yapılandırılmıştır
- Token localStorage'da saklanır

## 🎯 Sonraki Adımlar

1. Backend'i başlatın: `cd .. && npm run dev`
2. Frontend'i başlatın: `npm run dev`
3. Tarayıcıda http://localhost:5173 adresini açın

Keyifli kodlamalar! 🚀
