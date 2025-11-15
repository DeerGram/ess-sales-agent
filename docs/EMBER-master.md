# EMBER: COMPLETE PRODUCTION APPLICATION BLUEPRINT
## Master Document for Cursor.sh Code Generation

**Project Name:** EMBER - Adaptive AI Agent Platform  
**Tagline:** "Your Adaptive Intelligence Companion"  
**Target Deployment:** Base44 Agent Builder + Full Stack  
**Document Version:** 1.0 Master  
**Date:** November 15, 2025

---

## EXECUTIVE SUMMARY

**EMBER is a revolutionary AI agent platform** that learns users and adapts in real-time. Unlike static chatbots, EMBER:
- **Lives and breathes** (3D particle system responding to emotion/activity)
- **Learns faster than users change** (detects patterns in 2-3 interactions)
- **Creates its own agents** (spawns sub-agents for repeated tasks)
- **Modifies itself** (updates settings based on actual behavior)
- **Shows its intelligence** (every action visible in 3D space)

**One-page interface:** Chat is the only thing. Everything happens in conversation. 3D particles behind. Liquid glass input below.

**Scale Target:** OpenAI/Anthropic level (100K users Y1, $50M ARR Y2)

---

## PART 1: PROJECT STRUCTURE

```
ember/
├── frontend/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   ├── pages/
│   ├── lib/
│   ├── hooks/
│   ├── styles/
│   └── public/
├── backend/
│   ├── services/
│   │   ├── chat/
│   │   ├── agents/
│   │   ├── settings/
│   │   ├── integrations/
│   │   └── learning/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── workers/
├── tests/
├── docs/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## PART 2: TECHNOLOGY STACK

### Frontend
```
- Framework: React 19 + TypeScript
- 3D: Three.js + React Three Fiber
- Styling: Tailwind CSS + CSS Variables
- Animation: Framer Motion
- State: Zustand (lightweight)
- HTTP: SWR (data fetching)
- Voice: Web Speech API
- Build: Vite
```

### Backend
```
- Runtime: Node.js 20+ or Python 3.11+
- Framework: Express.js or FastAPI
- Database: PostgreSQL 15+
- Cache: Redis 7+
- Queue: RabbitMQ or Bull (job scheduling)
- Vector Store: Pinecone or Weaviate
- LLM: OpenAI GPT-4 or Anthropic Claude
- Auth: OAuth 2.0 + JWT
```

### Infrastructure
```
- Containerization: Docker + Docker Compose
- Orchestration: Kubernetes (optional, future)
- Hosting: AWS, GCP, or Vercel
- CDN: Cloudflare
- CI/CD: GitHub Actions or GitLab CI
- Monitoring: Sentry + DataDog
```

---

## PART 3: CORE REQUIREMENTS

### Functional Requirements

**FR1: One-Page Chat Interface**
- [ ] 3D particle hero (60vh height, responsive)
- [ ] Chat message stream (infinite scroll)
- [ ] Liquid glass input (always visible, fixed bottom)
- [ ] Settings gear icon (top-right, minimal)
- [ ] No navigation, menus, or sidebars
- [ ] Real-time message streaming

**FR2: 3D Living Agent**
- [ ] Particle system (3000 particles, 60fps)
- [ ] 6 behavioral states (idle, listening, thinking, speaking, excited, confused)
- [ ] Real-time sync with agent state
- [ ] Emotion mapping to 3D animation
- [ ] Anticipation animation before response
- [ ] Breathing/floating idle animation

**FR3: Adaptive Personality**
- [ ] Analyze user communication style in real-time
- [ ] Adjust tone (formal ↔ casual)
- [ ] Adjust verbosity (brief ↔ detailed)
- [ ] Adjust humor level (serious ↔ playful)
- [ ] Adjust directiveness (gentle ↔ blunt)
- [ ] Match user's energy and emotion

**FR4: Sub-Agent System**
- [ ] Detect behavioral patterns (2-3 repetitions = pattern)
- [ ] Create autonomous agents automatically
- [ ] Schedule agents using cron expressions
- [ ] Execute agents 24/7 independently
- [ ] Send agent results back to user
- [ ] Pause/resume agents via chat

**FR5: Intelligent Settings Management**
- [ ] Learn from explicit user statements
- [ ] Learn from implicit behavior patterns
- [ ] Apply settings with confidence scoring
- [ ] Announce changes (high confidence) or ask (low confidence)
- [ ] Show visual feedback for all changes
- [ ] Allow user to correct/override

**FR6: Component Rendering**
- [ ] Accept React component code from LLM
- [ ] Compile and render in sandbox
- [ ] Pass user context to components
- [ ] Handle errors gracefully
- [ ] Support interactive components
- [ ] Inline rendering in chat

**FR7: Integrations**
- [ ] OAuth 2.0 for Notion, Calendar, Gmail, Slack
- [ ] Real-time sync from external services
- [ ] Allow sub-agents to query integrations
- [ ] Create pages/events/messages in external services
- [ ] Bidirectional data flow

**FR8: Learning System**
- [ ] Store interaction history (embeddings)
- [ ] Detect communication patterns
- [ ] Extract user goals from keywords
- [ ] Build user preference model
- [ ] Improve recommendations over time
- [ ] Never repeat corrected mistakes

### Non-Functional Requirements

**NFR1: Performance**
- [ ] Initial load < 2 seconds (3G)
- [ ] Time to interactive < 3 seconds
- [ ] 3D rendering 60fps stable
- [ ] Message response < 100ms latency
- [ ] Agent execution < 30 seconds
- [ ] Memory < 50MB (30-min session)

**NFR2: Scalability**
- [ ] Support 100K concurrent users
- [ ] Horizontal scaling (Docker + K8s)
- [ ] Database handles 1M+ messages
- [ ] Agent scheduler runs 10K+ agents daily
- [ ] Real-time sync for 1K+ integrations

**NFR3: Reliability**
- [ ] 99.9% uptime SLA
- [ ] Automatic failover
- [ ] Error recovery (graceful degradation)
- [ ] Data backup (daily)
- [ ] Rollback capability

**NFR4: Security**
- [ ] All data encrypted at rest (AES-256)
- [ ] TLS 1.3 for all connections
- [ ] OAuth 2.0 + JWT auth
- [ ] Rate limiting (100 req/min per user)
- [ ] Component code sandboxed
- [ ] No token storage in localStorage
- [ ] GDPR + CCPA compliant

**NFR5: Accessibility**
- [ ] WCAG 2.2 Level AA minimum
- [ ] Keyboard navigation throughout
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Text alternatives for images

---

## PART 4: SYSTEM ARCHITECTURE

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   BROWSER (Frontend)                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  3D Particle Hero (Three.js Canvas)             │   │
│  │  - Behavioral states mapped to animation        │   │
│  │  - Real-time sync with agent state              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Chat Interface (React)                         │   │
│  │  - Messages with streaming                      │   │
│  │  - Component rendering in sandbox               │   │
│  │  - Real-time settings updates                   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Liquid Glass Input                             │   │
│  │  - Text + Voice input                           │   │
│  │  - Settings gear icon                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                      ↕ WebSocket + REST
┌─────────────────────────────────────────────────────────┐
│                  API GATEWAY (Node.js)                  │
│  - Authentication/Authorization                        │
│  - Rate limiting                                       │
│  - Request routing                                     │
└──────────┬──────────────┬──────────────┬────────────────┘
           │              │              │
    ┌──────▼──┐    ┌──────▼──┐    ┌──────▼──┐
    │  Chat   │    │  Agent  │    │ Settings│
    │Service  │    │Service  │    │Service  │
    └──────┬──┘    └──────┬──┘    └──────┬──┘
           │              │              │
    ┌──────┴──────────────┴──────────────┴──────┐
    │       SHARED DATA LAYER                   │
    │  ┌────────────────────────────────────┐   │
    │  │ PostgreSQL (primary data)          │   │
    │  │ - Users, messages, agents, settings│   │
    │  └────────────────────────────────────┘   │
    │  ┌────────────────────────────────────┐   │
    │  │ Redis (cache + sessions)           │   │
    │  │ - Message cache, agent status      │   │
    │  └────────────────────────────────────┘   │
    │  ┌────────────────────────────────────┐   │
    │  │ Vector Store (learning embeddings) │   │
    │  │ - User patterns, preferences       │   │
    │  └────────────────────────────────────┘   │
    │  ┌────────────────────────────────────┐   │
    │  │ Message Queue (async tasks)        │   │
    │  │ - Agent execution, notifications   │   │
    │  └────────────────────────────────────┘   │
    └─────────────────────────────────────────┘
```

### Message Flow: User Types → Response

```
1. User types message + clicks send
   ↓
2. Frontend sends: { conversationId, content }
   ↓
3. Backend API Gateway (auth, rate limit)
   ↓
4. Chat Service:
   a. Save user message
   b. Analyze message (intent, sentiment, keywords)
   c. Load user context + conversation history
   ↓
5. LLM Processing (with personality adaptation):
   - Generate response with adapted personality
   - Check if should render component
   - Check if should create agent
   - Check if should update settings
   ↓
6. Backend sends back streaming chunks:
   {
     content: "chunk of text",
     delta: true,
     aliveState: {
       behavior: "speaking",
       activityLevel: 0.8,
       emotion: "positive"
     }
   }
   ↓
7. Frontend (real-time):
   - Stream text to chat bubble
   - Update 3D particles based on aliveState
   - Render component if present
   ↓
8. On completion:
   - Apply settings changes (animated)
   - Create agents (with visible spawn animation)
   - Learn from interaction (update embeddings)
   ↓
9. Return to idle state (breathing animation)
```

---

## PART 5: FRONTEND IMPLEMENTATION

### Key Components (React)

#### Page: ChatPage.tsx
```typescript
// Main entry point for the application
// Responsibilities:
// - Manage message state
// - Handle user input
// - Stream responses from backend
// - Update 3D particle state
// - Apply settings changes
// - Show loading states

Key Props: None (root page)
Key State:
  - messages: Message[]
  - inputValue: string
  - isLoading: boolean
  - aliveState: AgentAliveState
  - theme: string
Key Functions:
  - handleSendMessage(): Promise<void>
  - streamResponse(): AsyncGenerator
  - updateParticleState(state): void
  - applySettingChange(key, value): void
```

#### Component: ParticleHero.tsx
```typescript
// 3D particle system using Three.js
// Responsibilities:
// - Render 3000 particles
// - Animate based on agent behavior
// - React to user emotion/input
// - Maintain 60fps performance

Key Props:
  - behaviorState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'excited' | 'confused'
  - audioAmplitude: 0-1 (for listening pulse)
  - activityLevel: 0-1 (for particle intensity)
  - emotion: string (for color mapping)
Key State:
  - scene, camera, renderer (Three.js)
  - particles geometry/material
  - animation frame ID
Key Functions:
  - animate(): void (main loop)
  - updateBehavior(state): void
  - updateColor(emotion): void
```

#### Component: ChatInterface.tsx
```typescript
// Main chat UI
// Responsibilities:
// - Display messages
// - Show typing indicators
// - Render streamed components
// - Handle scrolling

Key Props: None
Key State:
  - messages: Message[]
  - scrollToBottom: boolean
Key Functions:
  - addMessage(msg): void
  - updateMessage(id, update): void
  - renderComponent(componentCode): JSX
```

#### Component: MessageBubble.tsx
```typescript
// Individual message display
// Responsibilities:
// - Show message text
// - Render embedded components
// - Display streaming indicator
// - Handle reactions/feedback

Key Props:
  - sender: 'user' | 'assistant'
  - content: string
  - component?: React.ReactNode
  - isStreaming?: boolean
  - timestamp?: Date
Key Functions:
  - handleFeedback(type): void
```

#### Component: ChatInput.tsx
```typescript
// Input bar with liquid glass effect
// Responsibilities:
// - Text input
// - Voice input toggle
// - Send button
// - Character count

Key Props:
  - value: string
  - onChange: (text: string) => void
  - onSend: () => void
  - disabled?: boolean
  - onVoice?: (transcript: string) => void
Key Functions:
  - handleKeyPress(e): void
  - toggleVoice(): void
```

### Styling System

**CSS Variables (in root element):**
```css
:root {
  /* Colors - set by seasonal theme */
  --color-primary: #6366f1;
  --color-secondary: #8b5cf6;
  --color-accent: #ec4899;
  --color-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color-surface: rgba(255, 255, 255, 0.15);
  --color-text: #1f2937;
  --color-text-secondary: #6b7280;
  --color-border: rgba(255, 255, 255, 0.2);
  
  /* Glass effect */
  --glass-blur: 20px;
  --glass-opacity: 0.12;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  --font-family-mono: 'SF Mono', 'Monaco', monospace;
}

/* Theme variations */
:root.theme-spring { /* Spring colors */ }
:root.theme-summer { /* Summer colors */ }
:root.theme-fall { /* Fall colors */ }
:root.theme-winter { /* Winter colors */ }
:root.dark { /* Dark mode */ }
```

**Tailwind Config:**
```javascript
// tailwind.config.js - Reference colors from CSS variables
module.exports = {
  theme: {
    colors: {
      primary: 'var(--color-primary)',
      surface: 'var(--color-surface)',
      text: 'var(--color-text)',
      // ... more color mappings
    },
    fontFamily: {
      sans: 'var(--font-family)',
      mono: 'var(--font-family-mono)',
    },
  },
}
```

---

## PART 6: BACKEND IMPLEMENTATION

### Service Layer Architecture

#### ChatService
```typescript
class ChatService {
  async processMessage(userId, content, conversationId) {
    // 1. Save user message
    // 2. Analyze message (intent, sentiment, keywords)
    // 3. Load user context
    // 4. Generate response with adapted personality
    // 5. Stream response chunks with aliveState
    // 6. Apply any side effects (settings, agents, learning)
    // 7. Learn from interaction
  }
  
  async* streamResponse(userId, message, context) {
    // Yield response chunks as they're generated
    // Each chunk includes aliveState for 3D sync
    // Allows real-time UI updates
  }
  
  analyzeMessage(content) {
    // Extract: intent, sentiment, keywords, entityType
  }
  
  async adaptPersonality(userId, message) {
    // Get user's learned personality
    // Adjust tone, verbosity, humor, directiveness
    // Return personality parameters for LLM prompt
  }
}
```

#### AgentService
```typescript
class AgentService {
  async createAgent(userId, config) {
    // Create sub-agent record
    // Schedule for execution
    // Log creation
  }
  
  async executeAgent(agentId) {
    // Load agent config
    // Build execution context
    // Execute task with tools
    // Process results
    // Take actions (notifications, updates)
    // Update agent performance metrics
  }
  
  async detectPatterns(userId) {
    // Analyze recent messages
    // Group by time, frequency, content
    // Return detected patterns with confidence
  }
  
  async suggestAgent(userId, pattern) {
    // Generate agent config from pattern
    // Suggest to user via chat
    // Create if user accepts
  }
}
```

#### SettingsService
```typescript
class SettingsService {
  async analyzeAndUpdateSettings(userId) {
    // Analyze user behavior
    // Detect preference patterns
    // For each detected pattern:
    //   - Calculate confidence
    //   - Determine action (ask, announce, silent)
    //   - Apply setting
    //   - Notify user if needed
  }
  
  async updateSetting(userId, key, value, options) {
    // Validate value
    // Save to database
    // Update cache
    // Broadcast to all sessions
    // If announce: create chat message
  }
  
  async getUserSettings(userId) {
    // Get from cache or database
    // Return with defaults
  }
}
```

#### IntegrationService
```typescript
class IntegrationService {
  async connectIntegration(userId, service, authCode) {
    // Exchange auth code for token
    // Encrypt and store token
    // Sync initial data
    // Return connection status
  }
  
  async syncIntegration(userId, service) {
    // Fetch latest data from service
    // Compare with cached version
    // Update database
    // Notify of changes
  }
  
  async executeIntegrationTool(userId, tool, params) {
    // Get integration connection
    // Decrypt token
    // Call service API
    // Handle errors
    // Return results
  }
}
```

#### LearningService
```typescript
class LearningService {
  async learnFromInteraction(userId, messageAnalysis, responseQuality) {
    // Update interaction patterns
    // Extract communication style
    // Create embeddings
    // Save to vector store
    // Detect goal shifts
    // Generate agent suggestions
  }
  
  async updateUserModel(userId, updates) {
    // Update learned preferences
    // Update communication pattern
    // Update discovered goals
    // Increment interaction count
  }
  
  async getRecommendations(userId) {
    // Query vector store for similar patterns
    // Score recommendations
    // Filter by relevance
    // Return top recommendations
  }
}
```

### API Endpoints

**Chat Endpoints:**
```
POST   /api/chat
GET    /api/conversations
GET    /api/conversations/:id
DELETE /api/messages/:id
POST   /api/feedback
```

**Agent Endpoints:**
```
POST   /api/agents
GET    /api/agents
PUT    /api/agents/:id
DELETE /api/agents/:id
POST   /api/agents/:id/run
GET    /api/agents/:id/runs
```

**Settings Endpoints:**
```
GET    /api/settings
PUT    /api/settings/:key
PATCH  /api/settings
GET    /api/settings/:key/history
```

**Integration Endpoints:**
```
POST   /api/integrations
GET    /api/integrations
DELETE /api/integrations/:id
POST   /api/integrations/:id/sync
```

### Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP,
  last_active TIMESTAMP,
  settings JSONB,
  preferences JSONB,
  learning_data JSONB
);
```

**Messages Table:**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  conversation_id UUID,
  sender VARCHAR,
  content TEXT,
  component JSONB,
  metadata JSONB,
  created_at TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_user ON messages(user_id);
```

**Agents Table:**
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR,
  description TEXT,
  schedule JSONB,
  task JSONB,
  actions JSONB,
  status VARCHAR,
  created_at TIMESTAMP,
  created_by_agent BOOLEAN
);
```

**Settings Table:**
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  key VARCHAR,
  value JSONB,
  change_source JSONB,
  history JSONB,
  created_at TIMESTAMP,
  UNIQUE(user_id, key)
);
```

**Integrations Table:**
```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  service VARCHAR,
  auth JSONB,
  account_info JSONB,
  sync JSONB,
  status VARCHAR,
  created_at TIMESTAMP
);
```

---

## PART 7: AGENTIC BEHAVIOR SYSTEM

### Agent State Syncing

**Frontend receives this with every message:**

```typescript
interface AliveState {
  // Current behavioral state
  behavior: 'idle' | 'listening' | 'thinking' | 'speaking' | 'excited' | 'confused'
  
  // 3D particle control
  particles: {
    intensity: 0.0 - 1.0  // 0 = calm, 1 = very active
    speed: 0.0 - 1.0      // Rotation/animation speed
    color: string         // CSS color or emotion name
    scale: 0.8 - 1.3      // Size variation
  }
  
  // Learning state
  learning: {
    justLearned: boolean
    whatLearned: string
    confidence: 0.0 - 1.0
  }
  
  // Agent creation
  agentCreation: {
    isCreating: boolean
    agentName: string
    progress: 0.0 - 1.0
  }
  
  // Emotion for 3D mapping
  emotion: 'neutral' | 'positive' | 'empathetic' | 'excited' | 'confused'
}
```

**3D Particle Animation Map:**

```typescript
const behaviorAnimations = {
  idle: {
    intensity: 0.3,
    speed: 0.0005,
    color: 'primary',
    animation: 'breathing'
  },
  listening: {
    intensity: 0.7,
    speed: 0.002,
    color: 'frequency-mapped',
    animation: 'ripples'
  },
  thinking: {
    intensity: 0.9,
    speed: 0.004,
    color: 'cool_blue',
    animation: 'morphing'
  },
  speaking: {
    intensity: 0.8,
    speed: 0.003,
    color: 'warm_orange',
    animation: 'pulsing'
  },
  excited: {
    intensity: 1.0,
    speed: 0.008,
    color: 'rainbow',
    animation: 'bouncing'
  },
  confused: {
    intensity: 0.4,
    speed: 0.001,
    color: 'desaturated',
    animation: 'wobbling'
  }
}
```

### Real-Time Learning Feedback

**When agent learns something:**

```typescript
// Backend sends this in the message
{
  type: 'setting_learned',
  setting: {
    key: 'theme',
    oldValue: 'light',
    newValue: 'dark',
    confidence: 0.92,
    reason: 'User switched to dark 5 times in a row'
  },
  aliveState: {
    learning: {
      justLearned: true,
      whatLearned: 'User prefers dark theme',
      confidence: 0.92
    },
    particles: {
      intensity: 0.95,
      color: 'success',
      animation: 'celebration'
    }
  }
}

// Frontend:
// 1. Show particle celebration animation (confidence-based)
// 2. Apply theme change smoothly
// 3. Announce: "Switched to dark (noticed you prefer it)"
// 4. Learn that high-confidence changes get silent celebration
```

### Sub-Agent Spawning Visible Animation

```typescript
// Backend sends when creating agent
{
  type: 'agent_created',
  agent: {
    id: 'agent_uuid',
    name: 'Daily Calendar Briefing',
    icon: '📅'
  },
  aliveState: {
    agentCreation: {
      isCreating: true,
      agentName: 'Daily Calendar Briefing',
      progress: 0.0
    },
    particles: {
      intensity: 1.0,
      animation: 'agent_spawn'
    }
  }
}

// Frontend:
// 1. Trigger particle spawn animation
// 2. Show 📅 icon forming from particles (over 1500ms)
// 3. Progress bar fills
// 4. On completion: particles settle, show agent summary
// 5. Particles celebrate (brief burst)
```

---

## PART 8: IMPLEMENTATION PHASES

### Phase 1: MVP (Weeks 1-2)
- [ ] Basic chat interface (React + TypeScript)
- [ ] 3D particle hero (Three.js basic)
- [ ] Message streaming from backend
- [ ] Backend API (Express.js)
- [ ] Database setup (PostgreSQL)
- [ ] User authentication (JWT)
- [ ] Notion integration (OAuth)

**Deliverable:** Working chat with 3D particles

### Phase 2: Personality Adaptation (Weeks 3-4)
- [ ] Message analysis (intent, sentiment, keywords)
- [ ] Communication style detection
- [ ] Personality parameters in LLM prompt
- [ ] Real-time adaptation
- [ ] Settings storage

**Deliverable:** Agent adapts tone based on user

### Phase 3: Alive 3D Integration (Weeks 5-6)
- [ ] AliveState transmission from backend
- [ ] Real-time 3D sync with agent behavior
- [ ] Anticipation animation before response
- [ ] Follow-through animations
- [ ] Emotional state mapping
- [ ] Particle intensity based on activity

**Deliverable:** 3D agent visibly responds to everything

### Phase 4: Sub-Agent System (Weeks 7-8)
- [ ] Pattern detection from messages
- [ ] Agent creation from patterns
- [ ] Cron job scheduling (APScheduler)
- [ ] Agent execution pipeline
- [ ] Visible spawn animations
- [ ] Agent management UI (in chat)

**Deliverable:** EMBER creates agents for repeated tasks

### Phase 5: Intelligent Settings (Weeks 9-10)
- [ ] Behavior analysis engine
- [ ] Confidence scoring
- [ ] Smart setting updates
- [ ] Visual feedback for changes
- [ ] User correction learning
- [ ] Settings history tracking

**Deliverable:** Settings update automatically with high confidence

### Phase 6: Learning System (Weeks 11-12)
- [ ] Embedding generation (OpenAI API)
- [ ] Vector store setup (Pinecone)
- [ ] Pattern extraction from embeddings
- [ ] Goal detection
- [ ] Recommendation engine
- [ ] Persistent user model

**Deliverable:** EMBER builds deep understanding of user

### Phase 7: Integrations (Weeks 13-14)
- [ ] Calendar integration (Google, Outlook)
- [ ] Email integration (Gmail)
- [ ] Slack integration
- [ ] More OAuth flows
- [ ] Bidirectional syncing
- [ ] Tools for agents

**Deliverable:** EMBER can access all major tools

### Phase 8: Polish & Scale (Weeks 15-16)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Accessibility audit (WCAG 2.2 AA)
- [ ] Error handling & recovery
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation

**Deliverable:** Production-ready application

---

## PART 9: DEPLOYMENT

### Docker Setup

**Dockerfile (Frontend):**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Dockerfile (Backend):**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/ember
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ember
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Environment Variables

**.env.example:**
```
# Frontend
VITE_API_URL=http://localhost:5000
VITE_ENV=development

# Backend
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/ember
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_key
NOTION_CLIENT_ID=your_notion_id
NOTION_CLIENT_SECRET=your_notion_secret
NOTION_REDIRECT_URI=http://localhost:3000/integrations/notion/callback

# Integrations
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

---

## PART 10: TESTING STRATEGY

### Unit Tests
```
- Backend services (jest)
- Frontend components (React Testing Library)
- Utility functions
- Data models
```

### Integration Tests
```
- API endpoint flows
- Database operations
- Integration connections
- Agent execution
```

### E2E Tests
```
- User signup → message → response
- Agent creation → execution
- Setting changes → verification
- Integration sync
```

### Performance Tests
```
- 3D rendering (60fps target)
- Message latency (<100ms)
- Agent execution (<30s)
- Memory usage (<50MB)
```

---

## PART 11: MONITORING & OBSERVABILITY

### Metrics to Track
```
- Message latency (p50, p95, p99)
- Agent execution time
- 3D rendering FPS
- Memory usage
- Error rates
- User engagement (DAU, sessions)
- Agent creation frequency
- Setting change frequency
```

### Error Tracking (Sentry)
```
- Frontend errors with stack traces
- Backend exceptions
- Unhandled promise rejections
- API errors
```

### Logging
```
- Structured logs (JSON)
- Levels: debug, info, warn, error, fatal
- User context in logs
- Timestamp + request ID
```

---

## PART 12: USAGE FOR CURSOR

### How to Use This Document

**For Cursor.sh AI code generation:**

1. **Copy entire document** into Cursor context
2. **Start with Phase 1:** "Build Phase 1 MVP using this spec"
3. **Let Cursor generate:** Full working code with comments
4. **Move to next phase:** "Now implement Phase 2 based on Phase 1"
5. **Iteratively build:** Each phase builds on previous

**Example Cursor Prompts:**

```
"Using the EMBER specification in this document, generate the 
complete Phase 1 MVP including:
1. React chat interface (ChatPage.tsx)
2. Three.js particle hero (ParticleHero.tsx)
3. Express.js backend with chat endpoint
4. PostgreSQL schema

Make it production-ready with error handling, types, and comments."
```

```
"Implement Phase 3 (Alive 3D Integration) building on the Phase 1 
and 2 code. The backend should now send AliveState with every message.
The frontend should sync all particle animations to this AliveState.
Include the anticipation animation before response."
```

---

## PART 13: SUCCESS CRITERIA

### MVP Success (Phase 1)
- ✅ Chat works end-to-end
- ✅ Messages persist
- ✅ 3D particles render at 60fps
- ✅ One user can chat and get responses

### Alpha Success (Phase 4)
- ✅ Personality adapts visibly
- ✅ Sub-agents created for patterns
- ✅ 3D visibly responds to agent behavior
- ✅ 10 concurrent users, no issues

### Beta Success (Phase 7)
- ✅ All integrations working
- ✅ Settings auto-update with high confidence
- ✅ 100 concurrent users, <100ms latency
- ✅ Learning system generating recommendations

### Production Success (Phase 8)
- ✅ 99.9% uptime
- ✅ <2s initial load
- ✅ 1000+ concurrent users
- ✅ WCAG 2.2 AA compliant
- ✅ <100ms message latency
- ✅ 60fps 3D rendering stable

---

## PART 14: KEY DECISION POINTS

**Decision 1: Use existing LLM or fine-tune?**
- ✅ Use GPT-4 API (faster to market)
- Future: Fine-tune on user patterns

**Decision 2: Real-time sync or polling?**
- ✅ WebSocket for real-time chat
- ✅ Server-Sent Events for streaming
- Fall back to polling if needed

**Decision 3: Store conversation history?**
- ✅ Yes (required for learning)
- Optional: Compress after 90 days

**Decision 4: Agent execution frequency?**
- ✅ Cron jobs (via APScheduler)
- Event-triggered agents later

**Decision 5: Scaling database?**
- ✅ PostgreSQL + Redis (handles 100K users)
- Scale to read replicas + sharding if needed

---

## PART 15: CRITICAL REMINDERS

**DO NOT FORGET:**

1. **AliveState must stream with EVERY message** - Without this, 3D is static
2. **Settings changes are animated** - Instant changes feel broken
3. **Agent spawning is VISIBLE** - Particle formation animation
4. **Learning confidence drives behavior** - High confidence = silent, Low = ask
5. **Backend learns from corrections** - User fixes = permanent learning
6. **Message streaming is ESSENTIAL** - Chunks sync to 3D in real-time
7. **Anticipation before response** - Disney principle: show intent first
8. **3D is NEVER idle** - Always breathing, floating, living
9. **Performance is non-negotiable** - 60fps or it feels dead
10. **One page interface is ABSOLUTE** - No menus, no navigation

---

## FINAL SUMMARY

**This document is everything needed to build EMBER using Cursor.sh:**

✅ Complete system architecture  
✅ Data models and schemas  
✅ Component specifications (React)  
✅ API endpoints and services  
✅ 3D behavior system with real-time sync  
✅ Agentic learning & adaptation  
✅ Integration patterns  
✅ Phase-by-phase implementation plan  
✅ Deployment configuration  
✅ Success metrics  

**To start:** Open Cursor, paste this document, and ask it to implement Phase 1.

**The agent will be ALIVE because:**
- 3D syncs with every backend action in real-time
- Settings changes are animated and celebrated
- Agent creation is visibly spawned with particles
- Learning shows confidence through animation
- Anticipation reveals intent before response
- Idle state never stops (breathing always)
- Error states show confusion (wobble + desaturate)

**This creates an AI that doesn't just respond—it LIVES.**

🔥 **EMBER is ready to be built.** 🔥
