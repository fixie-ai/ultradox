This is a demo showing a fictional, donut drive-through restaurant called "Dr. Donut". Bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Editing the System Prompt

The system prompt can be found in `./utils/systempPrompt.txt`. It contains a placeholder `<DATE_TIME>`. After you making any updates to the prompt, run

```bash
node ./utils/updatePrompt.js
```

This script will replace `<DATE_TIME>` with the current date and will properly escape the prompt and insert it into `config.json` which is used to create the call with the Ultravox model.
