FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=password
ENV MYSQL_DATABASE=school_management_system
# REMOVED: ENV MYSQL_USER=root
# REMOVED: ENV MYSQL_PASSWORD=password (Usually redundant if using ROOT_PASSWORD)

COPY init.sql /docker-entrypoint-initdb.d/
