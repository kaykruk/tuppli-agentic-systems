# Tuppli n8n Dockerfile
# Using latest n8n (1.70.3 has oclif startup bug)
FROM n8nio/n8n:latest

# Labels for image metadata
LABEL maintainer="Lysis Team"
LABEL version="1.0.0"
LABEL description="Lysis SaaS - Forensic Content Protection Engine"

# Set environment variables
ENV NODE_ENV=production
ENV N8N_LOG_LEVEL=info
ENV N8N_LOG_OUTPUT=console

# Set working directory
WORKDIR /home/node

# Create workflows directory with correct permissions
USER root
RUN mkdir -p /home/node/.n8n/workflows && \
    chown -R node:node /home/node/.n8n
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:5678/healthz || exit 1

# Expose n8n port
EXPOSE 5678

# Default command (inherited from base image)
CMD ["n8n"]
