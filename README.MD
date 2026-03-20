# This Will track daily code build


# /usr/share/nginx/html/    → static files
# /etc/nginx/nginx.conf     → main config
# /etc/nginx/conf.d/        → additional configs
# /etc/nginx/default.d/     → custom server configs

#🔹 1. /etc/nginx/nginx.conf (MAIN CONFIG)

👉 This is the entry point for Nginx.

What it contains:

Global settings

Worker processes

Logging

Includes other config files

🔹 Example
user nginx;
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    include /etc/nginx/conf.d/*.conf;
}
🔹 Key Point
nginx.conf → controls entire Nginx behavior

👉 You rarely modify this in Docker unless doing advanced tuning.

🔹 2. /etc/nginx/conf.d/ (ADDITIONAL CONFIGS)

👉 This folder is included by nginx.conf

include /etc/nginx/conf.d/*.conf;
What goes here?

👉 Full server blocks

Example:

server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
🔹 Usage

Multiple apps

Reverse proxy configs

API routing

🔹 3. /etc/nginx/default.d/ (CUSTOM EXTENSIONS)

👉 This is included inside a default server block

In many images:

include /etc/nginx/default.d/*.conf;
What goes here?

👉 Only partial configs, like:

location blocks

extra rules

Example
location /api/ {
    proxy_pass http://catalogue:8080;
}
🔴 Important Difference
Folder	Content type
conf.d	FULL server block
default.d	PART of server block
🔹 How they connect (FLOW)
nginx.conf
   ↓
includes conf.d/*.conf
   ↓
server block
   ↓
includes default.d/*.conf
   ↓
location / rules
🔹 Real Example (your case)
You used:
COPY roboshop.conf /etc/nginx/default.d/roboshop.conf

👉 So your file should contain ONLY:

location / {
    root /usr/share/nginx/html;
    index index.html;
}
❌ If you put full server block there:
server { ... }

👉 It may break or conflict

🔹 When to use which
Scenario	Use
Full site config	/etc/nginx/conf.d/
Add route inside existing config	/etc/nginx/default.d/
Change core behavior	/etc/nginx/nginx.conf
🔥 Real DevOps Practice

Keep nginx.conf untouched ✅

Use conf.d for services ✅

Use default.d for extensions ✅

🔥 Interview Answer

“nginx.conf is the main configuration file that includes other configs. conf.d is used for defining full server blocks, while default.d is used for adding partial configurations like location blocks inside an existing server.”

🔥 Simple Memory Trick
nginx.conf → brain
conf.d → full apps
default.d → small add-ons