#!/bin/bash
cd /home/kavia/workspace/code-generation/task-management-web-app-2a1c2a39/todo_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

