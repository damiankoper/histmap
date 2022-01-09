FROM node:16-slim as base
WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY ./lerna.json ./
COPY ./data/data ./data/data
# Package pre-processor
FROM base as pre-processor-build
WORKDIR /app/packages/pre-processor
COPY  packages/pre-processor/package*.json ./
COPY  packages/pre-processor/types ./types
# Package renderer
FROM base as renderer-build
WORKDIR /app/packages/renderer
COPY  packages/renderer/package*.json ./
WORKDIR /app/
RUN npx lerna bootstrap --scope=renderer --includeDependencies
WORKDIR /app/packages/renderer
COPY  packages/renderer .
RUN npm run build
FROM base as renderer-production
WORKDIR /app/packages/renderer
ENV NODE_ENV=production
COPY  packages/renderer/package*.json ./
WORKDIR /app/
RUN npx lerna bootstrap --scope=renderer --includeDependencies
WORKDIR /app/packages/renderer
COPY --from=renderer-build  /app/packages/renderer/dist ./dist
# Package api
FROM base as api-build
WORKDIR /app/packages/api
COPY  packages/api/package*.json ./
WORKDIR /app/
COPY --from=pre-processor-build /app/packages/pre-processor/package.json /app/packages/pre-processor/
COPY --from=renderer-production /app/packages/renderer/package.json /app/packages/renderer/
RUN npx lerna bootstrap --scope=api --includeDependencies
COPY --from=pre-processor-build /app/packages/pre-processor/ /app/packages/pre-processor/
COPY --from=renderer-production /app/packages/renderer/ /app/packages/renderer/
WORKDIR /app/packages/api
COPY  packages/api .
RUN npm run build
FROM base as api-production
WORKDIR /app/packages/api
ENV NODE_ENV=production
COPY  packages/api/package*.json ./
WORKDIR /app/
COPY --from=pre-processor-build /app/packages/pre-processor/package.json /app/packages/pre-processor/
COPY --from=renderer-production /app/packages/renderer/package.json /app/packages/renderer/
RUN npx lerna bootstrap --scope=api --includeDependencies
COPY --from=pre-processor-build /app/packages/pre-processor/ /app/packages/pre-processor/
COPY --from=renderer-production /app/packages/renderer/ /app/packages/renderer/
WORKDIR /app/packages/api
COPY --from=api-build  /app/packages/api/dist ./dist
# Package front
FROM base as front-build
WORKDIR /app/packages/front
ENV VUE_APP_API_URL=/api
COPY  packages/front/package*.json ./
WORKDIR /app/
COPY --from=pre-processor-build /app/packages/pre-processor/package.json /app/packages/pre-processor/
COPY --from=api-production /app/packages/api/package.json /app/packages/api/
COPY --from=renderer-production /app/packages/renderer/package.json /app/packages/renderer/
RUN npx lerna bootstrap --scope=front --includeDependencies
COPY --from=pre-processor-build /app/packages/pre-processor/ /app/packages/pre-processor/
COPY --from=api-production /app/packages/api/ /app/packages/api/
COPY --from=renderer-production /app/packages/renderer/ /app/packages/renderer/
WORKDIR /app/packages/front
COPY  packages/front .
RUN npm run build
FROM base as front-production
WORKDIR /app/packages/front
ENV NODE_ENV=production
COPY  packages/front/package*.json ./
WORKDIR /app/
COPY --from=pre-processor-build /app/packages/pre-processor/package.json /app/packages/pre-processor/
COPY --from=api-production /app/packages/api/package.json /app/packages/api/
COPY --from=renderer-production /app/packages/renderer/package.json /app/packages/renderer/
RUN npx lerna bootstrap --scope=front --includeDependencies
COPY --from=pre-processor-build /app/packages/pre-processor/ /app/packages/pre-processor/
COPY --from=api-production /app/packages/api/ /app/packages/api/
COPY --from=renderer-production /app/packages/renderer/ /app/packages/renderer/
WORKDIR /app/packages/front
COPY --from=front-build  /app/packages/front/dist ./dist
# final stage
FROM base
COPY --from=pre-processor-build /app/packages/pre-processor /app/packages/pre-processor
COPY --from=renderer-production /app/packages/renderer /app/packages/renderer
COPY --from=api-production /app/packages/api /app/packages/api
COPY --from=front-production /app/packages/front /app/packages/front