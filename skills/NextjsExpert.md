---
name: "Next.js Expert"
description: "Enforces Next.js App Router and shadcn/ui best practices. Invoke when creating or modifying UI components, pages, or layouts."
---

# Next.js App Router & Shadcn Expert

When working on UI components or pages in this project, adhere to the following rules:

## 1. Components & UI
- **Always** check if a component exists in `src/components/ui` (shadcn) before creating a custom one.
- Use `lucide-react` for icons.
- Style exclusively with Tailwind CSS (`className`). Avoid inline styles or standard CSS modules unless strictly necessary.

## 2. Next.js App Router
- Default to **Server Components**. Only add `"use client"` at the very top of the file when interactivity (hooks like `useState`, `useEffect`, `onClick`) is explicitly required.
- Maintain the project's folder structure (e.g., `src/app/(main)` for protected routes, `src/app/(public)` for public routes).
- Handle loading and error states using Next.js conventions (`loading.tsx`, `error.tsx`).

## 3. Mobile First
- Ensure all new UI elements are responsive. Test mentally against mobile viewports (e.g., using `md:`, `lg:` prefixes in Tailwind).
- Prefer native select elements (`NativeSelect` or `UnitSelect` in this project) for dropdowns on mobile devices.
