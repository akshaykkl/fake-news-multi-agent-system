FROM node:20-alpine

WORKDIR /app

# Copy package json and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy the rest of the frontend source code
COPY . .

# Expose port
EXPOSE 5173

# Start the Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
