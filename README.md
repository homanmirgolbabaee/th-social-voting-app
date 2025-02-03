 
# Overall Overview
 ![Untitled-2025-01-27-2336](https://github.com/user-attachments/assets/182111d1-ac6c-4397-ad21-5fd2734e13ce)
![Untitled-2025-01-27-233623123123](https://github.com/user-attachments/assets/1b0ce55c-e0ca-43ca-90ba-1880a397eefa)

# Social Voting App

A real-time social platform where users can share messages and vote on content. Built with Next.js 13+ and Supabase.

## Quick Start

### Setup

1. Clone the repository
```bash
git clone https://github.com/homanmirgolbabaee/th-social-voting-app.git
cd th-social-voting-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env.local and add:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Technical Choices

### Frontend
- **Next.js 13+ (App Router)**: For server-side rendering and modern React features
- **Tailwind CSS**: For rapid UI development and consistent styling
- **Framer Motion**: For smooth animations and transitions
- **shadcn/ui**: For pre-built, customizable components

### Backend
- **Supabase**: 
  - Authentication with the following providers: github, google, discord
  - Real-time PostgreSQL (15.8) database
  - Row Level Security for data protection
  - Real-time subscriptions for live updates

### Key Features
- Social authentication (Discord, GitHub, Google)
- Real-time voting system
- Dynamic leaderboard
- Responsive design
- User profiles

## Database Structure

### Database Tables
- `profiles`: User information and metadata
- `pages`: User-created messages
- `votes`: Tracks user votes with constraints

### Security
- Row Level Security (RLS) policies
- Protected routes and API endpoints
- Secure session management

## Trade-offs & Future Improvements

### Current Trade-offs
1. **Real-time Updates**: 
   - Opted for polling in some cases over WebSocket for simplicity
   - Could be optimized for larger scale

2. **Authentication Flow**:
   - Using simple OAuth flow
   - Could implement more sophisticated auth patterns

3. **Data Fetching**:
   - Some N+1 query situations could be optimized
   - Room for better caching strategies

### Future Improvements

1. **Performance**
   - Implement proper caching layer
   - Optimize database queries
   - Add pagination for scalability

2. **Features**
   - Comment system
   - Text editor for messages
   - User notifications


3. **Technical**
   - Add testing suite
   - Implement error boundaries
   - Add proper logging system
   - CI/CD pipeline improvements

4. **UX/UI**
   - Mobile app compatibility
   - Add a mobile app like experience 
   - Dark/light theme toggle
   - Better loading states
