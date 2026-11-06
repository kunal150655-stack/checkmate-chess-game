# Checkmate — Play Chess

A responsive browser chess game built with React, Vite, and [chess.js](https://github.com/jhlywa/chess.js).

## Features
- Legal chess moves and turn tracking
- Check, checkmate, stalemate, and draw detection
- Highlighted legal destinations and last move
- Move history, undo, restart, and board flip
- Copy current position as FEN
- Responsive layout for desktop and mobile

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Add a workflow that installs dependencies and runs `npm run build`, then deploys the `dist` folder with GitHub Pages.

For a simple static deployment, configure the Vite `base` option to `/<repository-name>/` in `vite.config.js` if the site is hosted at `https://USERNAME.github.io/REPOSITORY/`.
