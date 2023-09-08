# Smart Vault API

This application serves data related to The Standard Smart Vaults project.

### Endpoints

- `GET /asset_prices` delivers simple pricing data in $, by network (Arbitrum One, Arbitrum Goerli), then by asset. It includes prices for all assets which are accepted as collateral by the Smart Vaults. Designed to be consumed for pricing charts on https://app.thestandard.io/
- `GET /stats` delivers statistical data about the Smart Vault projects as a whole

## Setup

Install the project dependencies:

```npm install```

Edit the [example env file](.env.example), and rename it to `.env` in the root of the project.

Start the application:

```npm start```

The data served by this API is indexed at intervals by the [Smart Vault Jobs application](https://github.com/the-standard/smart-vault-jobs). You will need to run the jobs application in the background to use this API locally.