#!/bin/bash
export NODE_PATH=.:node_modules/@819/service-ts/dist && cd /app && exec su-exec nobody node backend/main.js