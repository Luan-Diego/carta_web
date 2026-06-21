# 💌 Carta Web

A simple and interactive digital letter, originally created as a personal gift for my girlfriend.

What started as a small personal project became something I thought could be shared with others. I realized that a simple digital letter could also be a meaningful way for people to express their feelings, create memories, and surprise someone special.

So, I decided to make this project public, hoping it could inspire others to create their own digital messages.

## ✨ Features

- **Real 3D envelope**: drag (mouse or touch) to rotate it in any direction, with inertia, and see the back and sides.
- Animated letter-opening experience; tap the open letter to read it full screen (reading mode, with scrolling for long messages).
- **Sound effects** (paper rustle, soft chimes, rotation whoosh), generated in the browser, with no audio files.
- Control bar: auto-rotate / stop, reset view (also puts the letter back in the envelope) and sound on/off.
- Keyboard support: Enter/Space to open, arrow keys to rotate, Home to reset, `L` to read.
- **Personalized links**: customize text and colors in the editor (`/criar/`) and share a link. Whoever opens it can only open the letter and interact with it; nothing can be changed.
- Responsive, and respects `prefers-reduced-motion`.

## 🛠️ Built With

- Vue 3 (Composition API, `<script setup>`) + Vite
- CSS3 3D transforms, in plain `.css` files (no styles inside components)
- Pointer Events + Web Audio API
- No other runtime dependencies

## 🚀 Getting Started

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
git clone https://github.com/Luan-Diego/carta_web.git
cd carta_web
npm install
npm run dev        # http://localhost:5173  (the letter)  and  /criar/  (the editor)
```

Other commands:

```bash
npm run build      # production files in dist/
npm run preview    # serve dist/ locally to check the build
```

> The built site is made of ES modules, so it must be served over HTTP(S) (any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages...). Opening `dist/index.html` by double click (`file://`) will not work in most browsers; use `npm run preview` instead.

## ✏️ Customizing

- **Default letter** (shown when the site is opened without a link): edit `src/config/carta.config.js` (title, greeting, paragraphs, signature, colors, sound).
- **Personalized links**: open `/criar/`, change the text and colors with a live preview, and copy the link.
- Invalid or missing fields fall back to the defaults in `src/config/defaults.js`.
- About 400 characters fit on the paper; the full text (up to 8 paragraphs of 800 characters) appears in reading mode.
- The envelope needs only one base color; the other tones are derived from it in `src/styles/tokens.css`.

### How the link works

The letter is stored in the part of the URL after `#` (`.../#c=z.<data>`): the configuration as JSON, compressed (deflate) and encoded in base64url. That part is **never sent to a server**, so no database or backend is needed. Everything read from a link is validated before use (known fields only, colors checked, sizes limited) and rendered as plain text, never as HTML.

Links are not secret: anyone who has one can read it, and it can be forwarded.

## 🗂️ Project structure

```
index.html            the letter page (entry)
criar/index.html      the editor page (entry)
src/
  viewer.js           boots the letter: reads the link, validates, mounts
  editor.js           boots the editor
  views/              one component per page (LetterViewer, LetterEditor)
  components/         EnvelopeScene (3D), LetterPlayer, ControlBar, ReadingMode, LetterContent
  composables/        useOrbit (rotation), useEnvelope (open/close), useFit (scale), useSound
  config/             defaults, schema (validation), theme (CSS variables), carta.config (your letter)
  lib/                link (encode/decode), sound (Web Audio engine, no Vue)
  styles/             tokens, scene, envelope, ui, reader, player, editor... (all plain CSS)
legacy/               the previous single-file version (index.html + style.css)
```

## 💡 Inspiration

This project was originally made for someone special to me. I wanted to create something simple, personal, and different from a traditional letter.

Eventually, I thought other people might enjoy using this idea too. After all, sometimes a small gesture can mean a lot.

Feel free to explore the project, customize it, and make it your own.

## 👨‍💻 Author

**Luan Diego**

- GitHub: [@Luan-Diego](https://github.com/Luan-Diego)

---

<p align="center">
  Made with a fury of the <b>Hawk</b>.
</p>
