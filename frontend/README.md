# CloutPrint Frontend

A React/Next.js frontend for CloutPrint that integrates with Solace Agent Mesh for AI-powered merchandise creation.

## Features

- **From Scratch Mode**: Generate new provocative merch via AI
- **Template/Clone Mode**: Reverse-engineer successful brands and create inspired merch
- **Real-time Activity Feed**: Live updates from the Solace event system
- **Solace Integration**: Event-driven communication with backend agents

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Solace Agent Mesh running locally (see main project setup)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `env.example` to `.env.local` and update with your Solace credentials:
   ```bash
   cp env.example .env.local
   ```

   Update the following variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SOLACE_HOST=ws://localhost:8080
   NEXT_PUBLIC_SOLACE_VPN=default
   NEXT_PUBLIC_SOLACE_USERNAME=default
   NEXT_PUBLIC_SOLACE_PASSWORD=default
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Solace Integration

The frontend communicates with Solace Agent Mesh through WebSocket connections and publishes/subscribes to specific topics:

### Event Topics

#### From Scratch Flow
- `ai/design/requested` - Request AI-generated design ideas
- `ai/design/ideas/generated` - Receive generated ideas
- `ai/image/requested` - Request image rendering
- `ai/image/generated` - Receive rendered images
- `shopify/product/created` - Product created on Shopify

#### Template/Clone Flow
- `intel/template/seed/requested` - Request brand analysis
- `intel/template/seed/generated` - Receive strategy insights
- `ai/design/from-template/requested` - Generate ideas from template
- `ai/design/ideas/generated` - Receive adapted ideas
- `ai/image/requested` - Request image rendering
- `ai/image/generated` - Receive rendered images
- `shopify/product/created` - Product created on Shopify

### Error Handling
- `ai/design/error` - Design generation errors
- `ai/image/error` - Image rendering errors
- `shopify/product/error` - Shopify integration errors
- `intel/template/error` - Template analysis errors

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page with mode selection
│   ├── from-scratch/
│   │   └── page.tsx          # From Scratch mode page
│   └── template/
│       └── page.tsx          # Template/Clone mode page
├── components/
│   └── ui/                   # shadcn/ui components
└── lib/
    ├── solace.ts             # Solace client integration
    └── utils.ts              # Utility functions
```

## Development

### Adding New Features

1. **New Event Types**: Add types to `src/lib/solace.ts`
2. **New Pages**: Create in `src/app/` following Next.js 13+ app router
3. **New Components**: Add to `src/components/`

### Solace Client Usage

```typescript
import { publish, subscribe, connect, disconnect } from '@/lib/solace'

// Connect to Solace
await connect()

// Publish an event
await publish('ai/design/requested', {
  requestId: 'req_123',
  brand: 'MyBrand',
  vibe: 'provocative',
  items: ['tshirt']
})

// Subscribe to events
await subscribe('ai/design/ideas/generated', (payload) => {
  console.log('Received ideas:', payload)
})

// Disconnect
await disconnect()
```

## Troubleshooting

### Connection Issues
- Ensure Solace Agent Mesh is running locally
- Check environment variables in `.env.local`
- Verify WebSocket URL is correct

### Build Issues
- Clear `.next` folder and rebuild
- Check for TypeScript errors
- Ensure all dependencies are installed

### Solace Integration Issues
- Check browser console for WebSocket errors
- Verify topic names match backend expectations
- Ensure proper error handling for failed connections

## Next Steps

Once you have Solace credentials from your team:

1. Update `.env.local` with real Solace connection details
2. Test the integration with the running SAM backend
3. Verify all event flows work end-to-end
4. Deploy to your preferred hosting platform

## Support

For issues related to:
- **Frontend**: Check this README and component documentation
- **Solace Integration**: Refer to Solace Agent Mesh documentation
- **Backend Agents**: Coordinate with your team members working on the mesh