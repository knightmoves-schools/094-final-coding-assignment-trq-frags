FROM node:18-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY server ./server
ENV NODE_ENV=production
EXPOSE 3010
CMD ["node", "server/send-email.js"]
