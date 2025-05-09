#!/bin/bash

# To build and install use `npm run install-dev` or `npm run install-prod`

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Check if workspace is set
if [ -z "$FORGE_WORKSPACE" ]; then
  read -p "Enter workspace name (e.g., example.atlassian.net): " workspace_name
  if [ -z "$workspace_name" ]; then
    echo "Error: Workspace name cannot be empty."
    exit 1
  fi
  echo "FORGE_WORKSPACE=$workspace_name" > .env
  echo "Workspace name added to .env file."
  FORGE_WORKSPACE=$workspace_name
fi

PRODUCT=Confluence
BUILD_TYPE=${1:-dev} # Default to dev if no argument provided

# Validate build type
if [ "$BUILD_TYPE" != "dev" ] && [ "$BUILD_TYPE" != "prod" ]; then
  echo "Error: Build type must be 'dev' or 'prod'. Received: $BUILD_TYPE"
  exit 1
fi

if [ "$BUILD_TYPE" = "prod" ]; then
  ENVIRONMENT="production"
else
  ENVIRONMENT="development"
fi

# Check if the site has the app installed for the specific environment
if forge install list | grep -E "${ENVIRONMENT}.*${FORGE_WORKSPACE}" > /dev/null; then
  echo "Upgrading app on '$FORGE_WORKSPACE' ($BUILD_TYPE)..."
  forge install --upgrade --confirm-scopes -s $FORGE_WORKSPACE -p $PRODUCT -e $ENVIRONMENT
else
  echo "Installing app on '$FORGE_WORKSPACE' ($BUILD_TYPE)..."
  forge install --confirm-scopes -s $FORGE_WORKSPACE -p $PRODUCT -e $ENVIRONMENT
fi

# Uninstall app
# forge uninstall -s $FORGE_WORKSPACE -p $PRODUCT -e $ENVIRONMENT