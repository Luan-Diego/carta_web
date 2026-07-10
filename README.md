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
- **Animated, interactive backgrounds** (canvas, no extra libraries): floating particles, cosmic nebula, aurora, starry sky, waves, rain on a window, flower garden, fire and embers, glowing circuits, falling petals / hearts / stars, or your own image. Move the mouse/finger over them and tap. They pause when the tab is hidden and respect "reduce motion".
- **Independent parts**: the background, the letter colors (envelope, paper, text, seal) and the envelope decorations are separate; changing one never changes the others.
- **Seals** (19 shapes + initials), envelope patterns (airmail, dots, stripes, checks, hearts, stars, waves), a postage stamp, a dedication, ~80 emoji stickers or your own PNG/WebP sticker with adjustable size.
- **"Minha imagem"** opens a pop-up: add an image by URL or from your computer; everything added is kept in a "Minhas imagens" gallery (saved in this browser).
- **Colors** tab: ready palettes, "Desfazer alterações" (back to how it was when you opened the tab) and "Voltar ao padrão".
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
- **Personalized links**: open `/criar/` (a glass, iOS-style editor): the letter sits in an "aquarium" with a live preview and a dock below, one option per customization (Message, Colors, Background, Seal, Envelope, Link). Tapping an option opens a sheet with only its controls; copy the link in the last one.
- The editor uses an iOS "liquid glass" look: the letter fills the screen, glass app icons float at the bottom (no bar), a soft water-drop sound plays when picking an option, and the letter shrinks above the icons and the options sheet so nothing covers it.
- Look & feel lives in the `visual` block (`fundo`, `imagem`, `lacre`, `inicial`, `para`, `adesivo`, `adesivoImg`, `adesivoTam`, `matiz`, `estampa`, `postal`). The accepted values are listed in `src/config/options.js`. To add a background, write a scene in `src/lib/scenes/` (`create(w, h, dark, hue)` returning `{ resize, step, draw, tap }`), register it in `scenes/index.js` and add it to `FUNDOS`.
- Your own images travel inside the link: stickers are shrunk to ~100px WebP and backgrounds to a small JPEG so they fit (link limit ~22,000 characters; some chat apps cut very long links). For a sharp background, host the image and paste its `https://` address instead.
- Invalid or missing fields fall back to the defaults in `src/config/defaults.js`. Values outside the lists in `options.js` are ignored.
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
  components/editor/  GlassDock, GlassSheet and one Panel* per option
  components/         EnvelopeScene (3D), LetterPlayer, ControlBar, ReadingMode, LetterContent,
                      BackgroundLayer (canvas scenes / image), SealMark (seal shapes)
  composables/        useOrbit (rotation), useEnvelope (open/close), useFit (scale), useSound, useScene (canvas loop),
                      useLetterDraft (editor state), useImageLibrary (my images)
  config/             defaults, options (allowed looks), schema (validation), theme (CSS variables), carta.config (your letter)
  lib/                link (encode/decode), sound (Web Audio engine), image (shrink uploads), scenes/ (one file per animated background)
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

## Backgrounds, colors and stickers

- Animated backgrounds are canvas 2D scenes: watercolor-style wave (`waves.js`, reacts to the pointer), ring nebula (`nebula.js`), aurora with vertical ray curtains over a mountain (`aurora.js`; touch triggers a light storm), volumetric fire with embers (`fire.js`), a detailed garden with butterflies (`garden.js`) and faint cherry trees behind the petals (`sakura.js`).
- Scenes marked `cor: true` in `FUNDOS` accept a hue (`visual.matiz`, 0-359; -1 = original colors) chosen with the rainbow slider in the Fundo panel.
- The Adesivo panel has two tabs: **Do app** (about 636 emojis in categories, including 🍥) and **Meus adesivos** (your own images, kept only in your browser). Stickers are stored at up to 128x128 px; a larger image can be reduced (whole image) or cropped (pick the part) before it is added.
- Images travel inside the link, so very large ones make long links; a database would remove that limit.

## Link curto (Vercel + MongoDB)

The normal link carries the whole letter after the `#` and works with no server. The **Link curto** button in the editor instead saves the letter in MongoDB and gives `site/#i=<id>`.

1. Create a free cluster on MongoDB Atlas and a database user; allow access from anywhere (`0.0.0.0/0`), since Vercel IPs change.
2. Import the project on Vercel (framework: Vite). `api/carta.js` becomes the serverless function `/api/carta`.
3. In Vercel > Settings > Environment Variables set `MONGODB_URI` (and optionally `MONGODB_DB`, default `carta`), see `.env.example`.
4. Locally, `npm run dev` only serves the front end; use `vercel dev` to test the API.

The letter is stored as JSON text (max 1 MB) and is re-validated by the viewer when opened. Anyone with the id can read it, so it is not private.

## Water

`caustics.js` is a WebGL fragment shader (no library, no external API) that draws pool-style refracted light. It powers the **Água cristalina** background and adds realistic light inside the **Ondas** wave. Without WebGL, Água shows a plain gradient and Ondas keeps its 2D drawing. Scenes may export `destroy()` to free the GL context.

## Lacre

The Lacre panel works like Adesivo: **Do app** has the drawn shapes (colored by the seal color) and every emoji category, **Meus lacres** keeps your own PNG/WebP seals (same crop/reduce window, stored in this browser only), and a size slider (`lacreTam`, 60-160%). Precedence on the envelope: own image, then emoji, then shape.

## Zoom

The envelope zooms from 60% to 240%: mouse wheel, two-finger pinch, the + and - buttons in the toolbar, or the keys `+`, `-`, `0`. The reset button (and `Home`) also resets the zoom. `composables/useZoom.js` holds the logic; the value is the CSS variable `--zoom`.

## Fonts

The Mensagem panel has a Fonte section: 10 app fonts (from `@fontsource` packages, bundled by Vite so every viewer sees the same font without installing anything) and **Minha fonte** to import a .woff2/.woff/.ttf/.otf (max 250 KB). An imported font travels inside the letter data (`fonteArq`), so it is too big for the `#c=` link and needs the short link. Only import fonts you are allowed to share. Run `npm install` after pulling, to fetch the new font packages.

## Aba Papel

- **Marca d'água**: texturas do papel (pautado, quadriculado, pontilhado), emojis do app ou imagem própria (`Minhas marcas d'água`, guardadas só neste navegador), com opacidade e tamanho. Fica atrás do texto.
- **Decorações**: emojis ou "Meus adesivos" colocados numa mesa plana (`PlaceBoard.vue`) e arrastados para qualquer ponto. Posições em % (`decor` / `envDecor` em `visual`), então aparecem no mesmo lugar no papel 3D, no modo leitura e no editor. Limites: 12 por superfície, 4 imagens próprias diferentes (`config/options.js`).
- **Envelope** (aba Capa): "Minhas estampas" (imagem repetida na frente) e adesivos soltos arrastáveis.
- Imagens próprias só cabem no link longo se forem pequenas; use o link curto para cartas com várias.

## Idiomas e "Criar a minha carta"

- Seletor no canto superior direito (`components/TopBar.vue`): Português, English, Español, Italiano, 中文, 日本語, 한국어, हिन्दी. A escolha fica salva no navegador; na primeira visita usa o idioma do navegador.
- Textos da interface em `src/i18n/<codigo>.js` (mesmas chaves em todos; o português é o reserva). Para acrescentar um idioma, crie o arquivo e registre-o em `src/i18n/index.js`.
- Na página da carta aparece também o botão **Criar a minha carta**, que leva ao editor (`criar/`).
- O texto da carta é de quem a escreve e nunca é traduzido. Os painéis do editor ainda estão só em português (a dock e os títulos já são traduzidos).
