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
* Mobile-first responsive design  
* File*based routing and React Server Components  

**User Features**
* Auth: credentials + Google OAuth  
* Internal messaging  
* Favorites  
* Real*time filtered search  

**Media & Data**
* Image galleries + Cloudinary CDN  
* Mapbox + Google Geocoding  
* Google Places predictive address search  

**Testing**
* Jest and React Testing Library (with Claude Code assistance)

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Client | Next | UI, browser routing, rendering RSC |
| Client | React | Interactive components, hooks, React Suspense, custom hooks, higher order components |
| Client | Tailwind CSS | Styling |
| Client | Claude Code, Jest, React Testing Library | Unit, functional, and integration tests
| Server | React Server Functions | Mutations & server logic |
| Server | Next and React | React Server Components and Server Side Rendering (SSR)
| API | Next.js API Routes | REST endpoint for NextAuth |
| Database | MongoDB + Mongoose | Schema models & persistence |
| Auth | NextAuth.js, OAuth (Google) | User authentication |
| Storage | Cloudinary | Image & asset storage |
| Maps | Mapbox/Google Maps | Geocoding & maps |
| Form Validation | Zod | Runtime schema validation |
| Infrastructure | Vercel | Hosting, builds, edge caching |

## Technologies Used

* [React](https://react.dev/) - frontend user interface framework.
* [Next](https://nextjs.org/) - React framework that facilitates React Server Components, Server Side Rendering and React Server Functions (Actions).
* [MongoDB](https://www.mongodb.com/) - general purpose, document-based, distributed database.
* [Mongoose](https://mongoosejs.com/) - MongoDB object modeling for Node.js.
* [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) - hosting platform within Amazon Web Services for distributed MongoDB databases.
* [Jest](https://jestjs.io/) - JavsScript testing framework.
* [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - library for testing React applications with Jest.
* [bcryptjs](https://github.com/dcodeIO/bcrypt.js#readme) - library for hashing passwords, used for verifying users who use credentials (username and password) to login.
* [Cloudinary](https://cloudinary.com/) - image storage for property images.
* [Mapbox](https://www.mapbox.com/) - for rendering location maps for properties.
* [NextAuth](https://next-auth.js.org/) - authentication library for Next applications.
* [PhotoSwipe](https://photoswipe.com/) - JavaScript image library and lightbox for property images.
* [Zod](https://zod.dev/) - TypeScript-first schema validation with static type inference for form validation.