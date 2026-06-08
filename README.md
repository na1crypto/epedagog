# E-PEDAGOG

**Maktab va texnikumlar uchun elektron hujjatlar va boshqaruv tizimi.**

## Loyiha haqida

E-PEDAGOG — ta'lim muassasalarida qog'ozbozlikni kamaytirish, pedagoglarning metodik hujjatlarini markazlashgan holda saqlash va boshqaruv jarayonlarini raqamlashtirish uchun yaratilgan zamonaviy web tizim.

## Texnologiyalar

- **Frontend**: Vite + Tailwind CSS v3 + Vanilla JavaScript (ES6+)
- **Backend**: Node.js + Express.js
- **Ma'lumotlar bazasi**: PostgreSQL
- **Fayl saqlash**: Google Drive API v3
- **Autentifikatsiya**: JWT (JSON Web Tokens)

## Ishga tushirish

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
cp ../.env.example ../.env  # .env faylni to'ldiring
npm run dev
```

### Database
```bash
psql -U postgres -d epedagog -f database/init.sql
psql -U postgres -d epedagog -f database/seed.sql
```

## Demo kirish

| Rol | Email | Parol |
|-----|-------|-------|
| Admin | admin@epedagog.uz | admin123 |
| Pedagog | olimjon@epedagog.uz | pedagog123 |
| Mehmon | mehmon@epedagog.uz | mehmon123 |

## Litsenziya

© 2026 E-PEDAGOG. Barcha huquqlar himoyalangan.
