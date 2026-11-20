# Game Emporium Collection

A web-based collection of browser games built with HTML, CSS, and JavaScript, configured for automatic deployment to [Firebase Hosting](https://firebase.google.com/docs/hosting) via GitHub Actions.

## Project Structure

```text
game-emporium-collection/
├── .github/workflows/   # GitHub Actions workflows for Firebase Hosting deploys
├── games/               # Individual game files and assets
├── index.html           # Main landing page / game hub
├── serve.mjs            # Local development server
├── styles.css           # Global stylesheets
├── .firebaserc          # Firebase project mapping
└── firebase.json        # Firebase Hosting configuration
```

## Running Locally

You can run the site locally using Node.js and `serve.mjs`:

```bash
node serve.mjs
```

Open the local URL printed in your terminal to test the site and games in your browser.

## Deployment

This repository is connected to Firebase Hosting using GitHub Actions:

- **Pull Requests:** Generates a preview deployment channel automatically.
- **Merges / Pushes to `main`:** Deploys changes to the live Firebase Hosting channel.

## Author

Created and maintained by **Liam Kurylak** ([@taekfighter](https://github.com/taekfighter)).