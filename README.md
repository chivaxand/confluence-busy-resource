# Resource management for Confluence

A tool for managing environments usage - free / busy.
![11](img1.png)

## Create token
- Go to https://id.atlassian.com/manage/api-tokens
- Click Create API token, copy token

## Create workspace:
http://go.atlassian.com/cloud-dev

Example:

https://example.atlassian.net/wiki/spaces

https://example.atlassian.net/jira

## Install forge client
```shell
node -v
npm install -g @forge/cli
forge --version
```

## Login (enter email and token)
```shell
forge logout
forge login
```

## Prepare app
```shell
npm run setup
forge register BusyResource
```

App will be created at `https://developer.atlassian.com/console/myapps`

Specify workspace by using script `add-workspace.sh` or create `.env` file with workspace name manually:
```
FORGE_WORKSPACE=example.atlassian.net
```

## build and deploy for the first time
```shell
npm run forge-deploy
npm run install-prod-first
```

App will be installed to workspace.
Installed apps list: `https://example.atlassian.net/wiki/plugins/servlet/upm`

## Installation for development (if needed)
```shell
npm run forge-deploy
npm run install-first
```

For update DEV app:
```shell
npm run deploy
```

## Add app to page
Go to any workspace page (`https://example.atlassian.net/wiki/spaces`), press edit page, and type (do not copy):
```
/BusyResource
```

Select app to add. Press edit button on the bottom of loaded app to open app settings.
Type resource names separated by ";", for example:
```
QA1;QA2;QA3;QA4;QA5
```

Close app settings, save page changes ("Update" button).
