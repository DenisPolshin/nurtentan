---
name: "Next-Intl Translator"
description: "Manages translations across RU, KZ, and EN locales. Invoke when adding new user-facing text, notifications, or UI labels."
---

# Next-Intl Translator

This project uses `next-intl` for localization (RU, KZ, EN). When adding new text to the UI:

## 1. Updating Translation Files
- Always update **all three** translation files simultaneously:
  - `src/locales/ru/translation.json`
  - `src/locales/kz/translation.json`
  - `src/locales/en/translation.json`
- Ensure the JSON structure remains valid and keys are placed in the correct nested sections (e.g., `common`, `dashboard`, `products`).

## 2. Syntax Rules
- Use **single curly braces** `{variable}` for interpolation (ICU MessageFormat). 
- **CRITICAL**: Do NOT use double curly braces `{{variable}}` as it will cause a `MALFORMED_ARGUMENT` error.

## 3. Implementation in Code
- Use the `useTranslations` hook in client/server components.
- Avoid hardcoding text in the UI; always use translation keys.
