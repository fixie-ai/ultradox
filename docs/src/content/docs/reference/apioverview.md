---
title: API Overview
description: Ultravox API reference information.
---
:::caution[Under Construction]
The Ultravox API is under active development. This means you should expect it to get better, faster, stronger, etc. It also means you should that things could break.

If you have questions or would like us to change/add something, please reach out on the [Ultravox Discord](https://discord.gg/Qw6KHxv8YB) or [submit an issue or PR](https://github.com/fixie-ai/ultravox).
:::

## Ultravox REST API

The Ultravox API base url is `http://api.ultravox.ai`.

The API requires an API key and currently provides two endpoints:
* Calls (`/api/calls`)
* Voices (`/api/voices`)

### Authorization
Pass in an API key using the `X-API-Key` header.

### OpenAPI Specification
There is an [OpenAPI spec](https://github.com/fixie-ai/ultradox/blob/main/docs/src/content/schemas/ultravox.yml) file available in the repo.

### Playground
Checkout the [Ultravox API Playground](https://api.ultravox.ai/api/schema/swagger-ui/) to quickly explore and test the API.

## Ultravox Web Service
After creating a call using the `/calls` endpoint, you will receive a `joinUrl` that points to a secure WebSocket URI (e.g.`wss://voice...app/calls/9b74f1aa-0802-4198-a5f3-cfa89871aebb`). This URI is used to join a real-time, voice call with an AI agent.

## `ultravox-client`
We recommend using the `ultravox-client` in any web-based applications. You can [find it](https://www.npmjs.com/package/ultravox-client) in the npm registry.