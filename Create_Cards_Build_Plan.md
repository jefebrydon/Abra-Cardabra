# Create_Cards Page Implementation Plan

Based on the PROJECT_OVERVIEW.md, here's a detailed plan to build the Create_Cards page with full transparency into prompts and API responses:

## Phase 1: Project Setup & Structure

### 1.1 Initialize React Frontend ✅
- Set up React app with Vite (for fast development)
- Install Tailwind CSS for styling
- Set up ShadCN UI components library
- Create basic routing structure

### 1.2 Initialize Node.js Backend ✅
- Set up Express server
- Create API routes structure
- Set up environment variables for API keys

### 1.3 ShadCN UI Integration ✅
- Initialize ShadCN UI components library
- Configure import aliases (`@/` pointing to `./src/`)
- Set up TypeScript configuration for component support
- Install and configure required dependencies:
  - Radix UI primitives
  - Lucide React icons
  - Class Variance Authority
  - Tailwind Merge
- Add ShadCN components:
  - Button, Input, Label, Textarea, Select, Card, Collapsible

## Phase 2: Create_Cards Form Implementation ✅

### 2.1 Form Fields (Based on Project Overview) ✅
- **Recipient Name**: ShadCN Input component
- **Occasion**: ShadCN Select component (Birthday, Wedding, Anniversary, New Baby, Graduation, Valentine's Day, Mother's Day, Father's Day)
- **Tone**: ShadCN Select component (Funny, Sentimental, Casual, Formal)
- **About the Recipient**: ShadCN Textarea component for extra context

### 2.2 Form Validation & State Management ✅
- Client-side validation for required fields
- Form state management with React hooks
- ShadCN Button component with loading state
- Accessible form labels and error handling

## Phase 3: Prompt Building & Debug Visibility

### 3.1 Prompt Template System
- Create a pre-written prompt template
- Build prompt builder function that injects form data
- **Debug Feature**: Display the complete generated prompt in a collapsible debug panel

### 3.2 Debug Panel Implementation ✅
- ShadCN Collapsible component for toggle-able debug section showing:
  - Raw form data
  - Generated prompt (before sending to API)
  - API request details
  - Full API response
  - Error handling details
- Lucide React icons for visual clarity
- Copy-to-clipboard functionality for debug data

## Phase 4: Backend API Integration

### 4.1 Express API Endpoint
- Create `POST /api/generate-concepts` endpoint
- Accept form data and construct OpenAI prompt
- **Debug Feature**: Log and return the exact prompt being sent

### 4.2 OpenAI Integration
- Integrate with OpenAI API (using ChatGPT-5)

- **Debug Feature**: Return the full API response for inspection

## Phase 5: Connect Nano Banana image generator

- create function to send illustration_prompt (from OpenAI's API response) to Gemini API
- Connect to Gemini API (model:"gemini-2.5-flash-image-preview")
- OpenAI's API response might have 1, 2, or 3 instances of the illustration_prompt, and the function should request a new image for each.
- Handle loading states during API calls
- Implement error handling with user feedback

## Phase 6: Card Display Components

### 6.1 Card Concept Layout
- Image area (initially with loading placeholder),then display the generated images (returned from Gemini API) in the top part of each card component.
- Make sure that each image is shown in the correct card (the image's original illustration_prompt should already be associated with one of the 3 card_concepts)
- Card phrase area (editable text)
- Send button (placeholder for now)

### 6.2 Loading States
- Skeleton loading for card concepts
- Progress indicators for API calls

## Phase 7: Testing & Debugging Features

### 7.1 Debug Panel Features
- **Prompt Inspector**: Shows the exact prompt being sent to OpenAI
- **Response Inspector**: Shows the raw JSON response from OpenAI
- **Request/Response Timing**: Shows how long each API call took
- **Error Logs**: Detailed error information if API calls fail

### 7.2 User Experience
- Toggle debug panel on/off
- Copy prompts/responses for manual testing
- Clear visual separation between debug info and user interface

## Technical Implementation Details

### Frontend Structure
```
src/
├── components/
│   ├── CreateCards/
│   │   ├── CardForm.jsx
│   │   ├── CardConcept.jsx
│   │   └── DebugPanel.jsx
│   └── common/
├── services/
│   └── api.js
└── pages/
    └── CreateCards.jsx
```

### Backend Structure
```
server/
├── routes/
│   └── api.js
├── services/
│   └── openai.js
└── server.js
```

### Key Debug Features
1. **Real-time Prompt Preview**: As user types, show how the prompt is being built
2. **API Response Inspector**: Full JSON response visible in debug panel
3. **Request/Response Headers**: See all HTTP details
4. **Error Details**: Comprehensive error logging and display

This plan ensures you can see exactly what's happening at every step - from form data collection to prompt generation to API responses - making debugging and optimization straightforward.

Would you like me to start implementing this plan, beginning with the project setup and basic form structure?