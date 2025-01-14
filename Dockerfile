FROM node:lts-alpine

WORKDIR /app

# Install server dependencies
COPY server/package*.json server/
RUN npm install --omit=dev --prefix server

# Install client dependencies and build
COPY client/package*.json client/
RUN npm install --omit=dev --prefix client
COPY client/ client/
RUN npm run build --prefix client

# Copy the frontend build files to the server/public directory
RUN mkdir -p server/public && cp -R client/build/* server/public/

# Copy the server code
COPY server/ server/

# Use non-root user for security
USER node

# Start the server
CMD ["npm", "start", "--prefix", "server"]

EXPOSE 8000
