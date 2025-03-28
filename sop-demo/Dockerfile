FROM node:18

# Set working directory
WORKDIR /app

COPY package.json package-lock.json ./

# Install dependencies required by Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libgbm-dev \
    libgtk-3-0 \
    libnss3 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxshmfence1 \
    libxss1 \
    libxtst6 \
    && rm -rf /var/lib/apt/lists/*

RUN npm install

# Copy bot script
COPY . .

# Install Puppeteer
RUN npm install puppeteer

EXPOSE 9003

# Run the bot
CMD ["npm", "start"]
