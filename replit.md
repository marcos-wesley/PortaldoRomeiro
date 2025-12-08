# Portal do Romeiro

## Overview

Portal do Romeiro is a React Native mobile application built with Expo that serves as a comprehensive guide for pilgrims visiting religious sites in Trindade, Brazil. The app provides access to prayers, news, live TV broadcasts, accommodation information, route maps, and various services for pilgrims. It features a modern, polished interface with smooth animations and a consistent design language centered around the primary blue brand color (#4169E1).

The application is designed for cross-platform deployment (iOS, Android, Web) and includes features like offline prayer storage, favorites management, real-time location services for routes, and live streaming capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React Native 0.81.5 with React 19.1.0
- Expo SDK 54 for cross-platform development
- React Navigation 7 for navigation management
- React Native Reanimated 4 for animations
- TypeScript for type safety

**Navigation Structure:**
- Bottom tab navigation with 4 main tabs: Home, Guia (Guide), Notícias (News), Mais (More)
- Stack navigators for each tab to handle nested screens
- Transparent headers with blur effects on iOS using expo-blur
- Custom HeaderTitle component displaying app icon and title

**Design System:**
- Strict adherence to initial prototype visual identity
- Fixed color palette with primary blue (#4169E1) as brand color
- Comprehensive theme system supporting light/dark modes
- Reusable components (Button, Card, ThemedText, ThemedView) with consistent styling
- Animation system using Reanimated with spring physics for interactive feedback
- Spacing, BorderRadius, Typography, and Colors constants for design consistency

**State Management:**
- TanStack Query (React Query) v5 for server state management
- React Native AsyncStorage for local data persistence (favorites, offline prayers)
- No global state management library - using React hooks and context

**Key UI Patterns:**
- Card-based layouts with elevation levels
- Animated pressable components with scale transformations
- Hero banners with gradient overlays
- Category badges with color coding
- Grid and list views for content display
- Keyboard-aware scroll views for forms

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server
- Node.js with TypeScript
- Production build using esbuild for bundling

**API Structure:**
- RESTful API design with /api prefix for all routes
- CORS configuration for Replit deployment domains
- Request body parsing with raw body preservation
- Modular route registration system

**Data Layer:**
- Drizzle ORM v0.39.3 for database abstraction
- PostgreSQL as the database (configured but can be provisioned)
- Schema validation using Drizzle-Zod
- In-memory storage fallback (MemStorage) for development
- User authentication schema (users table with username/password)

**Storage Interface:**
- Abstract IStorage interface for CRUD operations
- Supports getUser, getUserByUsername, createUser methods
- Allows swapping between memory and database storage

### External Dependencies

**Expo Modules:**
- expo-image: Optimized image loading and caching
- expo-linear-gradient: Gradient effects for UI elements
- expo-blur: Header blur effects (iOS)
- expo-location: Geolocation services for route mapping
- expo-web-browser: In-app browser functionality
- expo-haptics: Tactile feedback
- expo-splash-screen: App launch screen
- expo-constants: Access to app/device constants

**Third-Party Libraries:**
- react-native-maps: Interactive map displays for pilgrimage routes with markers and polylines
- react-native-gesture-handler: Touch gesture handling
- react-native-keyboard-controller: Advanced keyboard management
- react-native-safe-area-context: Safe area insets handling
- @expo/vector-icons (Feather icons): Consistent iconography

**Development Tools:**
- tsx: TypeScript execution for development
- drizzle-kit: Database migration management
- ESLint with Expo config and Prettier
- TypeScript compiler with strict mode

**Deployment Environment:**
- Replit-specific configuration with custom domain handling
- Environment variables: REPLIT_DEV_DOMAIN, REPLIT_INTERNAL_APP_DOMAIN
- Proxy configuration for Expo development server
- Static build capabilities for production

**Database:**
- PostgreSQL connection via DATABASE_URL environment variable
- Migrations stored in ./migrations directory
- Schema defined in shared/schema.ts for code sharing between client/server

**Module System:**
- Path aliases: @/ for client, @shared/ for shared code
- Babel module resolver for React Native
- TypeScript path mapping for development tooling