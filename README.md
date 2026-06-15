# 💌 Carta Web

A simple and interactive digital letter, originally created as a personal gift for my girlfriend.

What started as a small personal project became something I thought could be shared with others. I realized that a simple digital letter could also be a meaningful way for people to express their feelings, create memories, and surprise someone special.

So, I decided to make this project public, hoping it could inspire others to create their own digital messages.

## ✨ Features

- Interactive envelope animation.
- Animated letter-opening experience.
- **Real 3D envelope**: drag (mouse or touch) to rotate it in any direction, with inertia, and see the back and sides.
- **Sound effects** when you tap the envelope (paper rustle, soft chimes, rotation whoosh), generated in the browser, with no audio files.
- Control bar: auto-rotate, reset view and sound on/off. Keyboard support (Enter/Space to open, arrow keys to rotate, Home to reset).
- Personalized digital messages.
- Simple and responsive design.
- Lightweight implementation using web technologies, no frameworks.

## 🛠️ Built With

- HTML5
- CSS3 (3D transforms)
- JavaScript (Pointer Events + Web Audio API)

## ✏️ Customizing

- Edit the letter text inside `.texto` in `index.html` (about 400 characters fit comfortably).
- Colors live in the `:root` variables at the top of `style.css`.
- Sounds are in the `Sound` object in `script.js`; tweak the notes in `open()` and `close()`.

## 🚀 Getting Started

You can run this project locally by following these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/Luan-Diego/carta_web.git
   ```

2. Navigate to the project directory:

   ```bash
   cd carta_web
   ```

3. Open `index.html` in your browser.

No additional dependencies or installations are required.

## 💡 Inspiration

This project was originally made for someone special to me. I wanted to create something simple, personal, and different from a traditional letter.

Eventually, I thought other people might enjoy using this idea too. After all, sometimes a small gesture can mean a lot.

Feel free to explore the project, customize it, and make it your own.

## 👨‍💻 Author

**Luan Diego**

- GitHub: [@Luan-Diego](https://github.com/Luan-Diego)

---

<p align="center">
  Made with ❤️ and a little bit of code.
</p>