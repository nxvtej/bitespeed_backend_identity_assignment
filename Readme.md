## Identity Recon API

Run it using Docker

```
docker run -p 3000:3000 -p 5432:5432 nxvtej/bitespeed_full:latest

hit

curl --location 'http://localhost:3000/identify' \
--header 'Content-Type: application/json' \
--data-raw '{"phoneNumber": "450090",
	"email": "te@exe.com"
}'
```

## 🛠️ Tech Stack

- **Node.js, TypeScript, Express, Prisma, PostgresDB, Docker**

## 🚀 Original Assignment

```
https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-1fb21bb2a930802eb896d4409460375c
```
