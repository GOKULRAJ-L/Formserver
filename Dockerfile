FROM node:20-alpine3.20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8500
CMD ["npm","start" ]