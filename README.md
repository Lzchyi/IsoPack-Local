# IsoPack

IsoPack is a minimalist, cinematic travel packing utility designed for the modern traveler who values simplicity and privacy. IsoPack is a fully local-first, offline-ready application that ensures your packing lists are always with you, regardless of internet connectivity.

## Core Philosophy

- **Local-First**: Your data stays on your device. No cloud, no tracking, no internet required.
- **Minimalist**: A distraction-free, cinematic interface that lets you focus on your gear.
- **Reliable**: Built for the traveler who needs their packing list in remote locations.

## Key Features

- **Local Storage**: All your trips and inventory are stored securely on your device using IndexedDB, ensuring your data is private and accessible offline.
- **Data Sovereignty**: Easily export your entire data library to a JSON file and import it back to any device.
- **Password Protection**: Secure your local data with a password-protected account.
- **Trip Management**: Create, edit, and manage your travel itineraries and packing lists.
- **Inventory Library**: Build and maintain your personal gear library. Categorize items, track quantities, and mark essential "must-bring" items.
- **Custom Templates**: Create custom packing templates for different types of trips to get started quickly.
- **PWA Support**: Install IsoPack as a Progressive Web App on your device for a native-like experience.
- **Responsive Design**: A clean, high-contrast interface optimized for both mobile and desktop.

## Tech Stack

- **Frontend**: React 18+, TypeScript, Tailwind CSS
- **Database**: Dexie.js (IndexedDB)
- **UI Components**: Lucide React, Motion (for animations)
- **Internationalization**: react-i18next
- **Build/PWA**: Vite, vite-plugin-pwa
- **Security**: Web Crypto API (for password hashing)

## Getting Started

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```

## License

This project is open-source and available for personal use.
