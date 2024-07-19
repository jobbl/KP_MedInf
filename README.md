https://tex.zih.tu-dresden.de/3372896927hmbrvqwgkqnt#2ab5b3

Publish via tunnel:
    - npm install -g localtunnel
    - lt --port 3000 --subdomain aki-tool
    - use pw from https://loca.lt/mytunnelpassword

Deploy in docker:
- docker-compose up in /web

Change for local deploy:
- change "proxy": "http://backend:8000" for "proxy": "http://localhost:8000" in web/aki-frontend/package.json

