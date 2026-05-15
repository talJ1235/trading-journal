# Trading Journal — Claude Code Instructions

## Project
A PWA trading journal for personal use.
Stack: React 18 + Vite + Supabase + Tailwind CSS.
Deployed on Vercel.

## Skills — Read Before Every Task
Read and follow all skills in .claude/skills/:
- fullstack-developer — coding standards and workflow
- trading-journal — domain logic, schema, CSV import, AI review
- ui-trading — design system, colors, components

## Core Rules
1. Mobile-first always
2. Dark theme — no light mode ever
3. Every async operation has loading + error states
4. RLS on every Supabase table — locked to auth.uid()
5. No placeholder or mock data in production code
6. TypeScript strict — no `any` types
7. Do not modify Supabase schema without asking first

## Folder Structure
src/
├── components/     # Reusable UI components
├── pages/          # Trades, Review, Patterns, Goals
├── hooks/          # All Supabase queries as custom hooks
├── store/          # Zustand stores
├── lib/            # supabase.ts, gemini.ts, utils.ts
├── types/          # TypeScript interfaces
└── assets/

## What NOT to Do
- No Next.js patterns
- No CSS modules — Tailwind only
- No light theme
- No mock data
- Do not expose Supabase service role key on client
