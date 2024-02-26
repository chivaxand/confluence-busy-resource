#!/bin/bash

read -p "Enter workspace name (e.g., example.atlassian.net): " workspace_name

if [ -n "$workspace_name" ]; then
    if [ ! -f .env ]; then
        touch .env
    fi
    echo "FORGE_WORKSPACE=$workspace_name" > .env
    echo "Workspace name added to .env file."
fi
