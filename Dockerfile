FROM node:18-alpine

RUN apk update && apk add postgresql postgresql-contrib su-exec

ENV POSTGRES_USER=myuser \
    POSTGRES_PASSWORD=password \
    POSTGRES_DB=bitespeed_db \
    PGDATA=/var/lib/postgresql/data

RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql && \
    mkdir -p /run/postgresql && \
    chown -R postgres:postgres /run/postgresql

WORKDIR /app

COPY . .

RUN npm install

RUN su postgres -c "initdb -D /var/lib/postgresql/data"

COPY init.sql /init.sql

EXPOSE 3000 5432

CMD su postgres -c "/usr/bin/postgres -D /var/lib/postgresql/data &" && \
    sleep 5 && \
    psql -U postgres -f /init.sql && \
    npx prisma generate && \
    npx prisma migrate deploy && \
    npm run dev
