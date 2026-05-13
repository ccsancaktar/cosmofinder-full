# Cosmofinder Full

Cosmofinder'in tek repoda toplanmis tam proje yapisi. Bu repo mobil uygulamayi, backend API'yi ve web arayuzunu birlikte barindirir.

## Proje Yapisi

- `frontend/`: Expo tabanli React Native mobil uygulama
- `backend/`: Flask tabanli API, kimlik dogrulama, token/premium/odeme ve fal endpointleri
- `web/`: Vite + React tabanli web arayuzu

## Teknoloji Ozeti

- Mobil: React Native, Expo, React Navigation, React Query, Stripe
- Backend: Flask, JWT, MongoDB, Redis, APScheduler, Stripe
- Web: React, Vite, Redux Toolkit, Tailwind CSS, Stripe

## Baslangic

Gereksinimler:

- Node.js 18+
- npm
- Python 3.10+
- MongoDB
- Redis

Her uygulama kendi `.env` dosyasini kullanir. Gizli anahtarlar repoya eklenmez.

## Kurulum

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Varsayilan olarak backend `http://localhost:5050` uzerinde calisir.

### 2. Mobil uygulama

```bash
cd frontend
npm install
npm start
```

Ihtiyaca gore:

```bash
npm run ios
npm run android
```

### 3. Web arayuzu

```bash
cd web
npm install
npm run dev
```

Varsayilan olarak web arayuzu `http://localhost:5173` uzerinde calisir.

## Gelistirme Notlari

- Once backend'i kaldirmak en rahati olur.
- `frontend/.env`, `backend/.env`, `web/.env` ve `web/.env.local` yerel kalmalidir.
- Kokteki `.gitignore`, ortak repo icin `node_modules`, `venv`, build ciktilari ve gizli dosyalari disarida tutar.

## GitHub Akisi

Bu repo tek kok Git deposu olarak yonetilir:

```bash
git status
git add .
git commit -m "Aciklayici commit mesaji"
git push
```

Repo:

- GitHub: [ccsancaktar/cosmofinder-full](https://github.com/ccsancaktar/cosmofinder-full)

## Sonraki Iyilestirmeler

- Kok seviyede `.env.example` dosyalari eklemek
- Her servis icin daha ayrintili kurulum notlari yazmak
- Ortak gelistirme ve deploy akisini belgelemek
