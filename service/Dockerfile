FROM node:22-alpine
WORKDIR /app
# Copy only runtime code. No private build documents, cases or local env files.
COPY --chown=node:node service/server.mjs ./service/server.mjs
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8787
USER node
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "service/server.mjs"]
