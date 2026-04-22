# metrics-track (Edge Function)

Server-side tracking endpoint that enriches visitor events with geo data from request IP and inserts rows into `public.analytics_visits`.

## Deploy

```bash
supabase login
supabase link --project-ref agbujbvhczyrzowxrvxt
supabase functions deploy metrics-track --project-ref agbujbvhczyrzowxrvxt
```

## Optional local serve

```bash
supabase functions serve metrics-track --no-verify-jwt
```

