## Install dependencies

```
npm i
```

## Start server

```
npm start
```

## Run tests

```
npm test
```

## Run e2e tests

```
npm run test:e2e
```

## Endpoints

- POST /auth/login { username, password }
- GET /carbon-certificates/available
- GET /carbon-certificates/owned
- PUT /carbon-certificates/transfer/:userId { certificateId }

## Authorization Header

```
Authorization: Bearer {{access_token}}
```

## Seeds with random users and certificates

/db/seeder.ts
