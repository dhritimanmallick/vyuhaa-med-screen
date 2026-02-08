# EC2 Branch Migration Guide

This document explains how to set up the `EC2-Branch` to run entirely on your self-hosted EC2 backend **without Supabase**.

## Quick Setup

On your EC2 machine (after cloning / pulling the EC2-Branch):

```bash
chmod +x scripts/setup-ec2-branch.sh
./scripts/setup-ec2-branch.sh
npm run build
sudo cp -r dist/* /var/www/html/
```

## What Gets Swapped

| Original File | Becomes | EC2 Version Uses |
|--------------|---------|------------------|
| `src/hooks/useAuth.ts` | `.supabase.ts` backup | `src/lib/ec2/useAuth.ts` (JWT login via `/api/auth/login`) |
| `src/hooks/useSamples.ts` | `.supabase.ts` backup | EC2 `/api/samples` |
| `src/hooks/usePatients.ts` | `.supabase.ts` backup | EC2 `/api/patients` |
| `src/hooks/useCustomers.ts` | `.supabase.ts` backup | EC2 `/api/customers` |
| `src/hooks/usePricingTiers.ts` | `.supabase.ts` backup | EC2 `/api/pricing` |
| `src/hooks/useBillingRecords.ts` | `.supabase.ts` backup | EC2 `/api/billing` |
| `src/hooks/useTestResults.ts` | `.supabase.ts` backup | EC2 `/api/test-results` |
| `src/hooks/useLabLocations.ts` | `.supabase.ts` backup | EC2 `/api/lab-locations` |
| `src/hooks/useUsers.ts` | `.supabase.ts` backup | EC2 `/api/users` |
| `src/components/auth/AuthGuard.tsx` | `.supabase.tsx` backup | EC2 JWT auth guard |
| `src/components/auth/LoginForm.tsx` | `.supabase.tsx` backup | EC2 login form |
| `src/pages/Index.tsx` | `.supabase.tsx` backup | EC2 entry point |
| `SlideImageUploader.tsx` | `.supabase.tsx` backup | EC2 `/api/upload/slide` |

## EC2 Module Structure

All EC2-specific code lives in `src/lib/ec2/`:

```
src/lib/ec2/
├── client.ts           # JWT token management, fetch wrapper
├── useAuth.ts          # React hook for login/logout
├── hooks.ts            # React Query hooks (samples, patients, etc.)
├── SlideImageUploader.tsx  # Upload component
└── index.ts            # Barrel export
```

## API Endpoints Required

Your EC2 backend must expose these endpoints (relative URLs behind nginx):

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/login` | POST | Returns `{ access_token, refresh_token, user }` |
| `/api/auth/refresh` | POST | Refreshes JWT |
| `/api/users` | GET, POST | User management |
| `/api/users/:id` | GET, PUT, DELETE | Single user |
| `/api/patients` | GET, POST | Patient management |
| `/api/patients/:id` | GET, PUT, DELETE | Single patient |
| `/api/customers` | GET, POST | Customer management |
| `/api/customers/:id` | GET, PUT, DELETE | Single customer |
| `/api/samples` | GET, POST | Sample management |
| `/api/samples/:id` | GET, PUT, DELETE | Single sample |
| `/api/test-results` | GET, POST | Test results |
| `/api/test-results/:id` | GET, PUT | Single result |
| `/api/pricing` | GET | Pricing tiers |
| `/api/pricing/:id` | PUT | Update pricing |
| `/api/billing` | GET | Billing records |
| `/api/lab-locations` | GET, POST | Lab locations |
| `/api/lab-locations/:id` | PUT, DELETE | Single location |
| `/api/upload/slide` | POST (multipart) | Slide image upload |
| `/api/upload/slides/:sampleId` | GET | List slides for sample |

## Nginx Configuration

Your nginx should proxy `/api/*` to your backend and `/tiles/*` to your tile server:

```nginx
location /api/ {
    proxy_pass http://localhost:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    client_max_body_size 3G;
}

location /tiles/ {
    proxy_pass http://localhost:8000/;
}
```

## Reverting to Supabase

To revert (e.g., for local development with Supabase):

```bash
# Restore original files from .supabase.ts backups
mv src/hooks/useAuth.supabase.ts src/hooks/useAuth.ts
# ... repeat for other files
```

Or simply switch back to the `main` branch which uses Supabase.
