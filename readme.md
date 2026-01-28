# opencrow

opensource alternative of [usecrow.ai](https://usecrow.ai)

<video src="https://opencrow.himanshuat.com/opencrow.mp4" controls muted autoplay></video>
[videoURL](http://opencrow.himanshuat.com/opencrow.mp4)

> [!IMPORTANT]  
> This is in development right now, will break often and pretty fast :)

## how to run:

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

## project structure:

- `apps/app`: admin dashboard
- `apps/backend`: main backend
- `apps/website`: opencrow website, just links to github and docs
- `packages/widget`: @opencrow/ui package. adds the layover chat button, handles the chat widget
- `sample-website`: sample website to test out opencrow functionality

## TODO

- [x] init working
- [ ] test with more frontend function
  - [ ] button click
  - [ ] dialog box open
  - [ ] so on...
- [ ] get knowledge base working (vector_db)
- [ ] in dashboard, improve UI and get deploy and sandbox UI working
- [ ] in website, make website
- [ ] add docs at: `website/docs`
- [ ] let user define auth method, and fetch it accordigly
- [ ] modify sample-website to cover all edge cases
- [ ] v-0.1 release
