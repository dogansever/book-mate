# Book Mate - Copilot Instructions

## Project Overview
Book Mate is a social platform for book lovers built with React, TypeScript, and Vite. The platform allows users to create personal libraries, discover books, connect with fellow readers, and share reading experiences.

## Key Features Implemented

### Visual Bookshelf (My Library)
- BookShelf component with visual bookcase display
- Two display modes: shelf view and grid view  
- Book status filtering and visual indicators
- Interactive book details modal
- Star rating system for read books
- Responsive design for all screen sizes

### Core Components
- **BookShelf.tsx**: Main visual bookshelf component
- **BookLibrary.tsx**: Alternative library view component
- **Dashboard.tsx**: Main dashboard with mini bookshelf preview
- **AddBook.tsx**: Book addition functionality
- **Authentication components**: Login, Register, ProfileSetup
- **Social features**: FollowSystem, SocialConnections

### Technical Architecture
- React 18 with TypeScript
- Custom hooks for state management (useAuth, useUserBooks, useFollow)
- Context API for global state (AuthContext)
- Google Books API integration
- CSS3 with custom animations and responsive design

## Development Guidelines

When working on this project:

1. **Component Structure**: Follow the established pattern of separating logic (hooks), presentation (components), and styling (CSS files)

2. **TypeScript**: Maintain strict typing using the established type definitions in `types/` directory

3. **Styling**: Use CSS custom properties and modern CSS features (Grid, Flexbox, animations)

4. **State Management**: Use custom hooks and Context API instead of external state management libraries

5. **API Integration**: Follow the pattern established in `services/googleBooksService.ts` for external API calls

6. **Responsive Design**: Ensure all new features work well on mobile, tablet, and desktop

## Code Style Preferences
- Use functional components with hooks
- Implement proper error handling and loading states
- Include hover effects and smooth transitions
- Use semantic HTML and accessible design patterns
- Follow the established naming conventions and file structure
