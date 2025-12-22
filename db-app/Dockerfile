FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=school_management_system
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=password

COPY init.sql /docker-entrypoint-initdb.d/
