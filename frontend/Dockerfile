# 1. Start from a very small web‑server image:
    FROM nginx:alpine

    # 2. Copy our empty index.html into the place Nginx serves files from:
    COPY index.html /usr/share/nginx/html/
    
    # 3. Tell Docker that the container will listen on port 80:
    EXPOSE 80
    
    # 4. Finally, run Nginx in the foreground so the container doesn’t exit:
    CMD ["nginx", "-g", "daemon off;"]
    