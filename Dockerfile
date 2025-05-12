FROM node:23-alpine
EXPOSE 8080 3000 3001 3002 3009

WORKDIR /home/copark

COPY ./package.json /home/copark/package.json
COPY ./package-lock.json /home/copark/package-lock.json
COPY ./.env /home/copark/.env


# Copy the marketing copark
COPY app/marketing/.next/ /home/copark/app/marketing/.next/
COPY app/marketing/public/ /home/copark/app/marketing/public/
COPY app/marketing/.env /home/copark/app/marketing/.env
COPY app/marketing/package.json /home/copark/app/marketing/package.json
COPY app/marketing/package-lock.json /home/copark/app/marketing/package-lock.json
COPY app/marketing/next.config.ts /home/copark/app/marketing/next.config.ts

# Copy the helloworld copark
COPY app/helloworld/.next/ /home/copark/app/helloworld/.next/
COPY app/helloworld/next.config.ts /home/copark/app/helloworld/next.config.ts
COPY app/helloworld/public/ /home/copark/app/helloworld/public/
COPY app/helloworld/package.json /home/copark/app/helloworld/package.json
COPY app/helloworld/package-lock.json /home/copark/app/helloworld/package-lock.json

# Copy the driver copark
COPY app/driver/.next/ /home/copark/app/driver/.next/
COPY app/driver/public/ /home/copark/app/driver/public/
COPY app/driver/messages/ /home/copark/app/driver/messages/
COPY app/driver/package.json /home/copark/app/driver/package.json
COPY app/driver/package-lock.json /home/copark/app/driver/package-lock.json
COPY app/driver/next.config.ts /home/copark/app/driver/next.config.ts
COPY app/driver/.env /home/copark/app/driver/.env

# Copy the admin copark
COPY app/admin/.next/ /home/copark/app/admin/.next/
COPY app/admin/public/ /home/copark/app/admin/public/
COPY app/admin/package.json /home/copark/app/admin/package.json
COPY app/admin/package-lock.json /home/copark/app/admin/package-lock.json
COPY app/admin/next.config.ts /home/copark/app/admin/next.config.ts

# Copy the enforcement copark
COPY app/enforcement/.next/ /home/copark/app/enforcement/.next/
COPY app/enforcement/public/ /home/copark/app/enforcement/public/
COPY app/enforcement/package.json /home/copark/app/enforcement/package.json
COPY app/enforcement/package-lock.json /home/copark/app/enforcement/package-lock.json
COPY app/enforcement/next.config.ts /home/copark/app/enforcement/next.config.ts

# Copy Admin microservice
COPY microservice/AdminService/sql/ /home/copark/microservice/AdminService/sql/
COPY microservice/AdminService/build/ /home/copark/microservice/AdminService/build/
COPY microservice/AdminService/package.json /home/copark/microservice/AdminService/package.json
COPY microservice/AdminService/package-lock.json /home/copark/microservice/AdminService/package-lock.json

# Copy Auth microservice
COPY microservice/AuthService/sql/ /home/copark/microservice/AuthService/sql/
COPY microservice/AuthService/build/ /home/copark/microservice/AuthService/build/
COPY microservice/AuthService/package.json /home/copark/microservice/AuthService/package.json
COPY microservice/AuthService/package-lock.json /home/copark/microservice/AuthService/package-lock.json

# Copy Permit microservice
COPY microservice/PermitService/sql/ /home/copark/microservice/PermitService/sql/
COPY microservice/PermitService/build/ /home/copark/microservice/PermitService/build/
COPY microservice/PermitService/package.json /home/copark/microservice/PermitService/package.json
COPY microservice/PermitService/package-lock.json /home/copark/microservice/PermitService/package-lock.json

# Copy Ticket microservice
COPY microservice/TicketService/sql/ /home/copark/microservice/TicketService/sql/
COPY microservice/TicketService/build/ /home/copark/microservice/TicketService/build/
COPY microservice/TicketService/package.json /home/copark/microservice/TicketService/package.json
COPY microservice/TicketService/package-lock.json /home/copark/microservice/TicketService/package-lock.json

# Copy Vehicle microservice
COPY microservice/VehicleService/sql/ /home/copark/microservice/VehicleService/sql/
COPY microservice/VehicleService/build/ /home/copark/microservice/VehicleService/build/
COPY microservice/VehicleService/package.json /home/copark/microservice/VehicleService/package.json
COPY microservice/VehicleService/package-lock.json /home/copark/microservice/VehicleService/package-lock.json

RUN npm run cis
CMD [ "npm", "start" ]