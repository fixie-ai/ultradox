# Ultradox

Click on `Use this template` to copy the Mintlify starter kit. The starter kit contains examples including

## Examples
1. `twilio-incoming-quickstart-js` → Connect an incoming call on Twilio to Ultravox.
1. `twilio-outgoing-quickstart-js` → Initiate an outgoing call with Twilio that uses an AI agent.
1. `quickstart-js` → Provides a simple HTML front-end and a server to create calls.
  * Create `./.env` and populate your API key: `ULTRAVOX_API_KEY=<YOUR_KEY_HERE>`.
  * Install dependencies with `pnpm install`.
  * Run the front-end and back-end simultaneously with `pnpm dev`.
1. `simple-vanilla-html` → Provides a vanilla HTML example. Note: this example requires you to manually create a call and then paste in the joinUrl.
1. `drdonut-nextjs` → NextJS app that provides an AI agent for taking orders at a fictional drive-thru donut chain. Consult `README.md` in the project folder for more information.

### Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview the documentation changes locally. To install, use the following command

```
npm i -g mintlify
```

Run the following command at the root of your documentation (where mint.json is)

```
mintlify dev
```

### Publishing Changes

Install our Github App to auto propagate changes from your repo to your deployment. Changes will be deployed to production automatically after pushing to the default branch. Find the link to install on your dashboard. 

#### Troubleshooting

- Mintlify dev isn't running - Run `mintlify install` it'll re-install dependencies.
- Page loads as a 404 - Make sure you are running in a folder with `mint.json`
