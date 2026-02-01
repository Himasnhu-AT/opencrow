# OpenCrow

OpenCrow is an open-source AI agent platform that allows you to embed intelligent assistants into your applications. inspired by [usecrow.ai](https://usecrow.ai)

<video src="https://opencrow.himanshuat.com/opencrow.mp4" controls muted autoplay></video>
[videoURL](https://opencrow.himanshuat.com/opencrow.mp4)

> [!IMPORTANT]  
> This is in development right now, will break often and pretty fast :)

## Documentation

- [Client-Side Tools & Integration](./DOC.md): Learn how to define tools in the dashboard and implement them in your frontend widget.

## Modules

- **apps/app**: The Dashboard for managing agents and products.
- **apps/backend**: The Node.js backend API and orchestration engine.
- **apps/website**: The landing page.
- **packages/widget**: The embeddable React widget.
- **sample-website**: A demo e-commerce site showcasing the widget.

## How to run:

```bash
pnpm install # install dependencies

###
# SETUP .env
# - in apps/app
# - in apps/backend
###

# start backend
docker compose up -d

# then run:
pnpm dev
```

### ports:

- app: 3000
- backend: 3001
- website: 4000
- ui: 5173
- sample-website ui: 8000
- sample-website backend: 3002

## TODO

- [x] init working
- [x] test with more frontend function
  - [x] button click
  - [x] dialog box open
- [ ] get knowledge base working (vector_db)
- [x] in dashboard, improve UI and get deploy and sandbox UI working
- [ ] in website, make website
- [ ] add docs at: `website/docs`
- [ ] let user define auth method, and fetch it accordigly
- [ ] modify sample-website to cover all edge cases
- [ ] v-0.1 release
