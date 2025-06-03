#!/bin/bash

scp -r -i ../coparkxyz.pem ./microservice/AdminService/sql/ ubuntu@copark.space:~/copark/microservice/AdminService/sql
scp -r -i ../coparkxyz.pem ./microservice/AuthService/sql/ ubuntu@copark.space:~/copark/microservice/AuthService/sql
scp -r -i ../coparkxyz.pem ./microservice/PaymentService/sql/ ubuntu@copark.space:~/copark/microservice/PaymentService/sql
scp -r -i ../coparkxyz.pem ./microservice/PermitService/sql/ ubuntu@copark.space:~/copark/microservice/PermitService/sql
scp -r -i ../coparkxyz.pem ./microservice/TicketService/sql/ ubuntu@copark.space:~/copark/microservice/TicketService/sql
scp -r -i ../coparkxyz.pem ./microservice/VehicleService/sql/ ubuntu@copark.space:~/copark/microservice/VehicleService/sql
scp -i ../coparkxyz.pem ./demo.sql ubuntu@copark.space:~/copark
