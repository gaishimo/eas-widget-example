
Here is an example of a Widget in Expo's Managed Workflow (EAS).


## Folders

- plugin/: Config Plugins
- widget/: Template files for widget


## Set up

### Install

`yarn install`


### Edit app.json

- Edit `android.package`, `ios.bundleIdentifier`, and `extra.eas.build.experimental.ios.appExtensions`.
- Change `<APPLE_DEV_TEAM_ID>` into your actual dev team id.


## Run on Local

```
yarn android
# or
yarn ios
```

## Build on Server (EAS)

```
eas build --platform all --profile preview
```




