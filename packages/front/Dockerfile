FROM base as build

ENV VUE_APP_API_URL=/api

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM base as production

ENV NODE_ENV=production
COPY package*.json ./

RUN npm install --only=production 

COPY --from=build /app/packages/front/dist ./dist
