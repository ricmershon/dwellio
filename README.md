This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Dwellio
A web site for a fictitious Airbnb-like company. It's sole purpose is to demonstrate my full stack skills with Next.js, React.js, Tailwind CSS and MongoDB with Mongoose.

## Intro
During my job search in 2024-2025, I realized two things:

1. I need a live project that showcases my skills. My prior work accomplishments are hidden behind corporate fire walls.
2. My background is mostly front-end, while many roles expect full-stack experience.

To bridge the gap, I built Dwellio--an Airbnb-like application for a fictional company, designed to demonstrate my full stack skills using Next with React Server Components (RSCs) and MongoDB.

## Notable Features

**Frontend & UX**
- Mobile-first responsive design  
- File-based routing and React Server Components  

**User Features**
- uth: credentials + Google OAuth  
- Internal messaging  
- Favorites  
- Real-time filtered search  

**Media & Data**
- Image galleries + Cloudinary CDN  
- Mapbox + Google Geocoding  
- Google Places predictive address search  

**Testing**
- Jest and React Testing Library (with Claude Code assistance)

# Tech Stack — Deep Dive

## 1. Frontend

### Next.js 15
User Interface:
- Browser Routing: App Router
- Rendering: RSC + SSR

### React 19
User Interface:
- Interactive Components
- Hooks: useContext, useState, useEffect, useActionState, useRef, useMemo, useCallback, useTransition
- Suspense: Maps loading, Property gallery loading
- Custom hooks:
  - `useAuthProviders`
  - `usePlaceAutocomplete`
  - `useClickOutside`

### Tailwind CSS 4
Styling

### NextAuth
User authentication

## 2. Backend

### Next.js 15
Server Side Rendering

### React 19
-React Server Components
- React Server Functions for mutations and server logic.

### Server Actions
Used for:
- Creating properties
- Editing listings
- Favorites + bookings
- Form validation (Zod)

### API Routes
Used for fallback endpoints & external integrations.

---

## 3. Database

### MongoDB Atlas
- Cluster Tier: `M10`
- Backups enabled

### Mongoose
- Models:
  - User
  - Property
  - Booking
  - Review (optional)
  - Amenities

---

## 4. Infrastructure

### Vercel
- Automatic builds
- Previews on PRs
- Edge caching

### GitHub Actions
Pipelines:
- Lint
- Type check
- Unit tests (Vitest)



## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Client | Next | UI, browser routing |
| Client | React | Interactive components |
| Client | Tailwind CSS | Styling |
| Client | Claude Code, Jest, React Testing Library | Unit, functional, and integration tests
| Server | React Server Functions | Mutations & server logic |
| Server | Next and React | React Server Components
| API | Next.js API Routes | REST endpoint for NextAuth |
| Database | MongoDB + Mongoose | Schema models & persistence |
| Auth | NextAuth.js | User authentication |
| Storage | Cloudinary | Image & asset storage |
| Maps | Mapbox/Google Maps | Geocoding & maps |
| Form Validation | Zod | Runtime schema validation |
| Deployment | Vercel | Hosting |

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
