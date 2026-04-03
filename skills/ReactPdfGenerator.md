---
name: "React-PDF Generator"
description: "Ensures correct usage of @react-pdf/renderer. Invoke when modifying invoice templates, labels, or any PDF generation code."
---

# React-PDF Generator

When working with PDF generation (`@react-pdf/renderer`) in this project:

## 1. Strict Component Usage
- You **cannot** use standard HTML/React components (like `<div>`, `<span>`, `<p>`, `<img>`).
- Use ONLY the primitives provided by `@react-pdf/renderer`: `<Document>`, `<Page>`, `<View>`, `<Text>`, `<Image>`, `<Link>`.

## 2. Styling
- All styles must be created using `StyleSheet.create({})` from `@react-pdf/renderer`.
- Tailwind classes or standard CSS are not supported inside the PDF components.
- Use Flexbox for layout (it is supported by the PDF engine).

## 3. Fonts and Rendering
- Be mindful of font loading. The project uses specific fonts (Roboto, Tinos) for Cyrillic/Kazakh support.
- When generating barcodes (e.g., using `bwip-js`), ensure they are converted to Base64 images before passing to the `<Image>` component in the PDF.
