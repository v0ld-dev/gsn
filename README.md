# Stand for research gsn and like proof of work

## Setup && Startup

- Set user public key in .env

```bash
# In one terminal you should start up gsn node
cd ${project}
yarn run gsn-with-ganache
# In second terminal start up web
yarn run start
```

After that we have prerequisites:

1. TestUniswap + Token wihout Permit + Token with Permit
2. User (from .env) have same tokens like poin 1 for pay tx
3. gsn node has account with native token for pay fee