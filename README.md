# SSDoces

Source code for the SSDoces online store.

The application lives in `ssdocespt-main/` and uses TanStack Start, React, TypeScript, Vite and Supabase. It also includes integrations for transactional email and messaging.

## Run locally

Requirements: Node.js and npm.

```bash
cd ssdocespt-main
npm install
npm run dev
```

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run build:dev` | Create a development build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format source files with Prettier |

## Environment configuration

Use `ssdocespt-main/.env.example` as a variable-name reference and create a local environment file for development.

**Never copy real production values into this repository.** Keep service-role credentials, Resend API keys, Twilio credentials, database passwords and other private values in the hosting provider's server-side environment settings.

Important distinctions:

- Variables prefixed with `VITE_` are exposed to browser code after building. Only public values belong there.
- Supabase service-role credentials must remain server-side.
- Do not commit `.env`, `.env.local`, `.env.production`, credential files or production data.
- If a credential is ever exposed, revoke and rotate it immediately. Removing it from Git history does not invalidate it.

## Deployment

Review the deployment and infrastructure requirements in [PRODUCTION_DEPLOYMENT.md](ssdocespt-main/PRODUCTION_DEPLOYMENT.md) before deploying. Validate authentication, database permissions, Row Level Security policies, backups and server-side environment variables in the target environment.

## Live project

- Website: https://ssdoces.vercel.app
- Source: https://github.com/ArthurSant0s01/SSDoces
