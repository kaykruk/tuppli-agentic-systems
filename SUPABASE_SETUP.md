# Supabase Setup Guide for Lysis

This guide walks you through setting up Supabase for the Lysis automation platform.

## Prerequisites

- [ ] Supabase account (sign up at [supabase.com](https://supabase.com))
- [ ] Docker and Docker Compose installed
- [ ] Basic understanding of PostgreSQL and n8n

## Step 1: Create Supabase Project

1. **Login to Supabase Dashboard**
   - Navigate to [app.supabase.com](https://app.supabase.com)
   - Click "New Project"

2. **Configure Project Settings**
   - **Name**: `lysis` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your location
   - **Pricing Plan**: Free tier is sufficient for development

3. **Wait for Project Initialization**
   - This takes 1-2 minutes
   - You'll see a "Project is ready" notification

## Step 2: Gather Credentials

Once your project is ready, collect the following from the Supabase dashboard:

### Project Settings → API

1. **Project URL**
   ```
   https://[your-project-ref].supabase.co
   ```

2. **API Keys**
   - **anon/public key**: Safe to use in client-side code
   - **service_role key**: ⚠️ **NEVER expose this in client code** - server-side only

### Project Settings → Database

3. **Connection String**
   - Click "Connection string" → "URI"
   - Copy the connection string (replace `[YOUR-PASSWORD]` with your database password)
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[your-project-ref].supabase.co:5432/postgres
   ```

## Step 3: Configure Environment Variables

1. **Update `.env` file** in the Lysis project root:

   ```bash
   cd /Users/user/agents/lysis
   nano .env
   ```

2. **Replace placeholder values** with your actual Supabase credentials:

   ```env
   # Supabase Configuration
   SUPABASE_URL=https://[your-project-ref].supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...your-actual-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-actual-service-role-key
   SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[your-project-ref].supabase.co:5432/postgres
   ```

3. **Save and close** the file

> [!CAUTION]
> Never commit the `.env` file to version control! It's already in `.gitignore`.

## Step 4: Initialize Database Schema

Run the SQL migration script to create all required tables:

1. **Open Supabase SQL Editor**
   - In Supabase Dashboard → SQL Editor
   - Click "New query"

2. **Copy and paste** the contents of `supabase/migrations/001_initial_schema.sql`

3. **Execute the query**
   - Click "Run" or press `Ctrl+Enter`
   - Verify all tables are created successfully

4. **Verify Tables**
   - Navigate to Table Editor
   - You should see:
     - `recon_targets`
     - `forensic_evidence`
     - `legal_cases`
     - `vault_items`
     - `intelligence_data`

## Step 5: Configure Storage Buckets

Create storage buckets for file uploads:

1. **Navigate to Storage** in Supabase Dashboard

2. **Create Buckets**:
   
   | Bucket Name | Public | Description |
   |-------------|--------|-------------|
   | `forensic-evidence` | No | Stores forensic evidence files |
   | `intelligence-files` | No | Stores intelligence documents |
   | `reports` | No | Generated reports and exports |

3. **Configure Bucket Policies**
   - For each bucket, set up Row Level Security (RLS) policies
   - Example policy for `forensic-evidence`:
   
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'forensic-evidence');

   -- Allow authenticated users to read their own files
   CREATE POLICY "Allow authenticated reads"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'forensic-evidence');
   ```

## Step 6: Configure Authentication (Optional)

If you plan to build a web interface:

1. **Navigate to Authentication** → Settings

2. **Configure Email Templates**
   - Customize confirmation and password reset emails

3. **Enable Auth Providers** (optional)
   - Email/Password (enabled by default)
   - OAuth providers (Google, GitHub, etc.)

4. **Set Site URL**
   - For local development: `http://localhost:3000`
   - For production: Your actual domain

## Step 7: Start Docker Services

1. **Stop any conflicting services**:
   ```bash
   # Check for port conflicts
   docker ps | grep 5678
   docker ps | grep 6379
   
   # Stop if needed
   docker stop leakshield-n8n-1  # or other conflicting containers
   ```

2. **Start Lysis services**:
   ```bash
   cd /Users/user/agents/lysis
   docker-compose down  # Clean up any previous instances
   docker-compose up --build -d
   ```

3. **Verify services are running**:
   ```bash
   docker-compose ps
   ```
   
   You should see:
   - `lysis-redis` - healthy
   - `lysis-n8n` - running

4. **Check logs** if there are issues:
   ```bash
   docker-compose logs -f n8n
   docker-compose logs -f redis
   ```

## Step 8: Access n8n Interface

1. **Open browser** to [http://localhost:5678](http://localhost:5678)

2. **Login** with credentials from `.env`:
   - Username: `admin` (or your configured value)
   - Password: `changeme` (⚠️ **change this in production!**)

3. **Verify Supabase Connection**
   - Create a test workflow
   - Add an "HTTP Request" node
   - Configure:
     - Method: `GET`
     - URL: `{{$env.SUPABASE_URL}}/rest/v1/recon_targets`
     - Headers:
       - `apikey`: `{{$env.SUPABASE_ANON_KEY}}`
       - `Authorization`: `Bearer {{$env.SUPABASE_ANON_KEY}}`
   - Execute the node
   - Should return empty array `[]` (table exists but no data yet)

## Step 9: Import Workflows

The Lysis workflows will be automatically available in the `workflows/` directory:

1. **RECON_HOURLY** - Automated reconnaissance
2. **FORENSIC_VERIFY** - Evidence verification
3. **LEGAL_ENFORCER** - Legal case management
4. **MASTER_VAULT_SYNC** - Vault synchronization
5. **DECODE_INTELLIGENCE** - Intelligence processing

Each workflow is pre-configured to use Supabase environment variables.

## Troubleshooting

### Connection Issues

**Problem**: n8n can't connect to Supabase

**Solutions**:
- Verify environment variables are correctly set in `.env`
- Check Supabase project is not paused (free tier pauses after inactivity)
- Ensure database password doesn't contain special characters that need URL encoding
- Test connection string with `psql`:
  ```bash
  docker exec -it lysis-n8n sh
  apt-get update && apt-get install -y postgresql-client
  psql "$SUPABASE_DB_URL" -c "SELECT version();"
  ```

### Port Conflicts

**Problem**: Port 5678 or 6379 already in use

**Solutions**:
- Stop conflicting containers: `docker stop <container-name>`
- Or modify `docker-compose.yaml` to use different ports:
  ```yaml
  ports:
    - "5679:5678"  # Use 5679 instead
  ```

### Authentication Errors

**Problem**: 401 Unauthorized when accessing Supabase

**Solutions**:
- Verify API keys are correct (no extra spaces)
- Check RLS policies allow the operation
- For service_role operations, use `SUPABASE_SERVICE_ROLE_KEY`

### Database Migration Errors

**Problem**: SQL migration fails

**Solutions**:
- Run migrations one table at a time
- Check for existing tables: `DROP TABLE IF EXISTS table_name CASCADE;`
- Verify you're using the SQL Editor, not the Table Editor

## Security Best Practices

> [!IMPORTANT]
> **Production Checklist**

- [ ] Change default n8n password
- [ ] Use strong, unique passwords for all services
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Never commit `.env` to version control
- [ ] Rotate API keys regularly
- [ ] Use `service_role` key only in server-side code
- [ ] Enable Supabase database backups
- [ ] Set up monitoring and alerts
- [ ] Use HTTPS in production (configure reverse proxy)
- [ ] Implement rate limiting on webhooks

## Next Steps

Once setup is complete:

1. **Test each workflow** individually
2. **Configure webhook endpoints** for external integrations
3. **Set up monitoring** (Supabase Dashboard → Logs)
4. **Create backup strategy** for critical data
5. **Document custom workflows** as you create them

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [n8n Documentation](https://docs.n8n.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Lysis GitHub Repository](https://github.com/your-repo/lysis)

---

**Need help?** Check the [troubleshooting section](#troubleshooting) or open an issue on GitHub.
