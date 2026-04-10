# Safed Injera Portfolio Website

A modern, multilingual portfolio website for Safed Injera - an Ethiopian startup producing high-quality injera made from pure teff.

## Features

- 🌍 **Multilingual Support**: English and Amharic (አማርኛ)
- 🎨 **Brand Colors**: Ethiopian Earth (#4E1815), Cloud White (#FFFFFF), Sefed Sand (#A89688)
- 📱 **Fully Responsive**: Mobile-first design for all devices
- ⚡ **Modern Stack**: React 18 + Vite + TypeScript
- 🎭 **Smooth Animations**: Framer Motion for engaging user experience
- 📋 **Contact Form**: React Hook Form with validation
- 🖼️ **Image Gallery**: Lightbox functionality for product showcase

## Sections

1. **Hero** - Eye-catching introduction with call-to-action
2. **About** - Company story, mission, and quality commitment
3. **Products** - Showcase of pure teff injera products
4. **Process** - Step-by-step production process
5. **Distribution** - Mass distribution capabilities and services
6. **Clients** - Target markets (hotels, supermarkets, B2B, international)
7. **Gallery** - Visual showcase of products and facilities
8. **Contact** - Contact form and company information

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

## Run All Apps (Backend + Admin + Portfolio)

This repo contains three apps:

- Backend API: `Safed-Injera-Backend` (http://localhost:5000)
- Admin portal: `Safed-Injera-Admin` (http://localhost:5173)
- Portfolio site (this folder): http://localhost:3000

From the repo root:

1. Install all dependencies (root + admin + backend):
```bash
npm run install:all
```

2. Start all three in dev mode:
```bash
npm run dev:all
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Project Structure

```
Safed-Injera/
├── public/
│   └── images/          # Add your product images here
├── src/
│   ├── components/      # React components
│   ├── locales/         # Translation files (en, am)
│   ├── styles/          # Global styles and Tailwind config
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── i18n.ts          # i18n configuration
└── package.json
```

## Adding Images

1. Place your images in `public/images/`
2. Update `src/components/Gallery.tsx` to reference your images:
```typescript
const images = [
  { id: 1, src: '/images/injera-1.jpg', alt: 'Injera product' },
  // ... more images
];
```

## Customization

### Brand Colors

Colors are defined in `tailwind.config.js`:
- `ethiopian-earth`: #4E1815
- `cloud-white`: #FFFFFF
- `sefed-sand`: #A89688

### Translations

Edit translation files in:
- `src/locales/en/translation.json` (English)
- `src/locales/am/translation.json` (Amharic)

### Contact Form

Update the form submission handler in `src/components/Contact.tsx` to connect to your backend API or email service.

## Deployment

The site can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: Connect your Git repository
- **Any static hosting**: Upload the `dist` folder after running `npm run build`

## License

All rights reserved. Safed Injera © 2024
