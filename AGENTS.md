# CM Portal - Agent Guidelines

## Commands
- **Dev**: `npm run dev` (Next.js 14 + Turbo)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (ESLint + Prettier)
- **Test**: No framework configured

## Code Style
- **Framework**: Next.js 14 App Router, TypeScript (strict: false)
- **Client Components**: Use `"use client"` directive
- **Paths**: `@/` → `./src/`

### Formatting
- Prettier: 120 width, 4 spaces, Prisma plugin
- ESLint: Next.js core web vitals
- No code comments

### Naming
- Files: kebab-case (`user-search.tsx`)
- Components: PascalCase (`UserSearch`)
- Variables/Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Models: PascalCase

### Components
- Use `React.forwardRef` + `displayName`
- Extend `React.ComponentProps`
- Variants: `class-variance-authority`
- Imports: React → third-party → local
- Error handling: try/catch with error states

### UI & Database
- **Styling**: Tailwind + shadcn/ui (New York)
- **Icons**: Lucide React
- **Database**: Prisma + MongoDB
- **Auth**: JWT (`cm-token` cookie)
- **Roles**: BOSS, OE, TE, TL, HR, INDIV, QA</content>
</xai:function_call/>
</xai:function_call name="bash">
<parameter name="command">cd D:\Code\cm-portal && npm run lint