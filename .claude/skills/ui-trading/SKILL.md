---
name: "UI Trading"
description: "Design system and UI patterns for the trading journal PWA. Activate for any UI, component, or styling task."
---

# Trading Journal — UI & Design System

## Core Principles
- Mobile-first: design for 390px, scale up to desktop
- Dark theme only — no light mode
- Data-forward: numbers are the hero
- Micro-interactions on every action
- Never show blank screens — always skeleton or empty state

## Color Palette
- Background: #0F0F0F
- Surface: #1A1A1A
- Border: #2A2A2A
- Text primary: #F5F5F5
- Text secondary: #A0A0A0
- Profit / Green: #22C55E
- Loss / Red: #EF4444
- Accent / Blue: #3B82F6
- Warning / Yellow: #EAB308

## Typography
- Font: Inter (Google Fonts)
- Numbers and P&L: font-mono for alignment
- Large numbers: text-3xl font-bold
- Labels: text-xs text-zinc-400 uppercase tracking-wide

## Navigation
- Mobile: fixed bottom bar, 4 icons, 60px height
- Desktop: fixed left sidebar, 240px width
- Active state: blue accent with subtle background highlight

## Component Patterns

### Stat Card
bg-zinc-900 rounded-2xl p-4 border border-zinc-800
- Title: text-xs text-zinc-400 uppercase mb-1
- Value: text-2xl font-bold font-mono
- Profit: text-green-500
- Loss: text-red-500

### Trade Row
bg-zinc-900 rounded-xl p-3 mb-2 border border-zinc-800
- Left: Symbol (font-bold) + tag badge
- Right: P&L amount + percentage
- Bottom: date + emotion emoji

### Tag Badges
- planned: bg-blue-500/20 text-blue-400
- impulse: bg-yellow-500/20 text-yellow-400
- surgical: bg-green-500/20 text-green-400
- emotional_exit: bg-red-500/20 text-red-400
- news_play: bg-purple-500/20 text-purple-400

### Buttons
- Primary: bg-blue-500 hover:bg-blue-600 rounded-xl px-4 py-2
- Danger: bg-red-500/20 text-red-400 hover:bg-red-500/30
- Ghost: bg-zinc-800 hover:bg-zinc-700

### Form Inputs
- bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2
- Focus: border-blue-500 outline-none
- Label: text-xs text-zinc-400 mb-1 uppercase

### Emotion Selector
5 emoji buttons in a row: 😰 😟 😐 🙂 😄
Selected state: ring-2 ring-blue-500 bg-blue-500/20 rounded-full

## Animations (Framer Motion)
- Page transition: opacity 0→1, y: 10→0, duration 0.2s
- Card entrance: staggered, delay 0.05s each
- P&L counter: animate number on load
- Success action: brief green flash

## PWA
- Theme color: #0F0F0F
- Status bar style: dark
- Splash screen: logo centered on #0F0F0F background
- Add apple-mobile-web-app-capable meta tag
