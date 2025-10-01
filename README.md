# Abra Cardabra 2.0 🎉✨

AI-powered personalized greeting card generator that makes sending meaningful, personalized cards simple. Instead of browsing through generic store-bought cards, users can generate unique cards tailored to their recipient in just seconds.

## Problem Statement

Traditional card shopping is time-consuming and impersonal. Cards often fail to reflect the recipient's unique personality, humor, or interests. Abra Cardabra solves this by instantly creating cards that feel personal and fun, while still giving the sender control to edit before sharing.

## Overview

By entering a few details about the recipient and the occasion, the app uses AI to:
1. Generate **custom text phrases** for each card concept
2. Generate **matching card illustrations** 
3. Present multiple card options that can be easily edited and (in the future) sent directly

## Project Structure

```
Abra-Cardabra-2.0/
├── frontend/          # React app with Vite + Tailwind CSS
├── backend/           # Node.js + Express API server
├── README.md          # This file
└── Create_Cards_Build_Plan.md  # Development roadmap
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Edit `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:3000

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   App will run on http://localhost:5173

## ShadCN UI Setup

This project uses ShadCN UI components for a modern, accessible interface. The setup includes:

### Components Used
- **Form Components**: Button, Input, Label, Select, Textarea, Card
- **Layout Components**: Collapsible
- **Icons**: Lucide React icons for visual clarity

### Adding New Components
To add new ShadCN components:

```bash
cd frontend
npx shadcn@latest add [component-name]
```

### Component Configuration
- **Style**: New York style components
- **Color Scheme**: Neutral base color
- **Import Alias**: `@/` points to `./src/`
- **Styling**: Tailwind CSS with CSS variables for theming
- **Icon Library**: Lucide React
- **TypeScript**: Full TypeScript support enabled

## Core Functionality

### Create_Cards Page
- Displays a simple form where users enter recipient details (e.g., name, occasion, tone)
- On submit:
  - Details are added to a pre-written prompt
  - The prompt is sent to **OpenAI**, which returns **3 card concepts** as JSON:
    - `card_phrase` (the text message for the card)
    - `illustration_prompt` (instructions for image generation)

### Image Generation
- Each `illustration_prompt` is sent to **Google Gemini** (`gemini-2.5-flash-image-preview`)
- While images are being generated, each card shows a **loading state** in the image area
- Once Gemini responds, the images replace the loading states

### Card Concept Components
Each card has two main areas:
1. **Image Area (top)**
   - Shows loading state first
   - Displays AI-generated image once ready
2. **Card Phrase Area (bottom)**
   - Displays the `card_phrase` immediately
   - Editable inline: clicking the phrase or pencil icon converts it into a text area
   - Changes auto-save on blur (click away)

### Actions
- Below each card, a **Send (icon) button** is displayed
- Currently a placeholder — future versions will handle saving, sending, or downloading the card

## Development Status

### ✅ Phase 1: Project Setup & Structure (Complete)
- React frontend with Vite and Tailwind CSS
- Node.js backend with Express
- CORS enabled for development
- Basic project structure ready

### ✅ Phase 2: Create_Cards Form Implementation (Complete)
- Form fields for recipient details with ShadCN UI components
- Form validation & state management
- Prompt building & debug visibility
- Modern, accessible UI with ShadCN components

### 📋 Upcoming Phases
- Backend API Integration
- OpenAI Integration
- Card Display Components
- Testing & Debugging Features

## UI Components

The application now uses **ShadCN UI** components for a modern, accessible, and consistent user interface:

### Form Components
- **Card** - Clean container for the form
- **Input** - Text input for recipient name
- **Select** - Dropdown selectors for occasion and tone
- **Textarea** - Multi-line input for recipient details
- **Button** - Primary action button with loading states
- **Label** - Accessible form labels

### Debug Panel Components
- **Collapsible** - Expandable/collapsible debug information
- **Icons** - Lucide React icons for visual clarity
- **Card** - Organized display of debug data

### Key Features
- **Accessibility** - All components follow WCAG guidelines
- **Responsive Design** - Works seamlessly across devices
- **Dark Mode Ready** - Built-in support for theme switching
- **TypeScript Support** - Full type safety for components

## API Endpoints

- `GET /` - Health check
- `POST /api/generate-concepts` - Calls OpenAI to generate `card_phrase` + `illustration_prompt`
- `POST /api/generate-images` - Calls Google Gemini to generate illustrations

## Tech Stack

### Frontend
- **React** → Component-based UI
- **Vite** → Fast development server
- **Tailwind CSS** → Utility-first CSS framework
- **ShadCN UI** → High-quality, accessible component library
- **Radix UI** → Unstyled, accessible UI primitives
- **Lucide React** → Beautiful, customizable icons

### Backend
- **Node.js + Express** → Lightweight API server to keep keys safe
- **OpenAI API** → Generates card text concepts
- **Google Gemini** (`gemini-2.5-flash-image-preview`) → Generates preview images

### Deployment (Future)
- **Frontend**: Vercel or Netlify
- **Backend**: Vercel Serverless Functions, Netlify Functions, or Render

### Future Integrations
- **Supabase** → Planned for authentication, persistence, and media storage

## Development Principles

1. **Simplicity First** - Always prefer the simplest working solution
2. **Security** - Never expose API keys in the browser
3. **Separation of Concerns** - Frontend handles rendering, backend proxies API calls
4. **Debug Visibility** - Full transparency into prompts and API responses
5. **Accessibility First** - All UI components are built with accessibility in mind
6. **Component-Driven Development** - Reusable, composable UI components using ShadCN

## Roadmap

- **MVP**: Working card generator (form → OpenAI → Gemini → editable cards)
- **Next Steps**: Add landing page, add Supabase persistence, auth, and "Send" functionality
- **Later**: Payment flows, templates, and social sharing