## ESS Sales Agent – Setup

### Local development
1. Create `.env.local` in the repo root from the template below and populate values (Twilio, Airtable, ConvertKit, ElevenLabs, GCP/Vertex).
2. Ensure Node 20+ and pnpm are available (or use `npx pnpm@9`).
3. Install and test:

```bash
npx pnpm@9 install
npx pnpm@9 -r build
npx pnpm@9 -r test
```

#### .env.local template
Copy the following into `.env.local` (never commit real secrets):

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_MESSAGING_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_VOICE_CALLER_ID=+1xxxxxxxxxx

AIRTABLE_API_KEY=keyxxxxxxxxxxxxxxxx
AIRTABLE_BASE_ID=appxxxxxxxxxxxxxx
AIRTABLE_LEADS_TABLE=Leads
AIRTABLE_INTERACTIONS_TABLE=Interactions

CONVERTKIT_API_KEY=ck_xxxxxxxxxxxxxxxx
CONVERTKIT_API_SECRET=cs_xxxxxxxxxxxxxxxx

ELEVENLABS_API_KEY=eleven_xxxxxxxxxxxxxxxx
ELEVENLABS_VOICE_ID=xxxxxxxxxxxxxxxx

GCP_PROJECT_ID=your-project
GCP_LOCATION=us-central1
GEMINI_MODEL=projects/your-project/locations/us-central1/publishers/google/models/gemini-1.5-pro
```

### GCP Secret Manager (staging/prod)
1. Enable Secret Manager and Vertex AI APIs:
```bash
gcloud services enable secretmanager.googleapis.com aiplatform.googleapis.com
```
2. Create secrets and add first versions (repeat for each key):
```bash
gcloud secrets create TWILIO_AUTH_TOKEN --replication-policy=automatic
printf "%s" "your_twilio_auth_token" | gcloud secrets versions add TWILIO_AUTH_TOKEN --data-file=-
```
3. Grant access to your Cloud Run service account:
```bash
SA=cloud-run-ess@YOUR_PROJECT.iam.gserviceaccount.com
for S in TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_MESSAGING_SID TWILIO_VOICE_CALLER_ID \
          AIRTABLE_API_KEY AIRTABLE_BASE_ID AIRTABLE_LEADS_TABLE AIRTABLE_INTERACTIONS_TABLE \
          CONVERTKIT_API_KEY CONVERTKIT_API_SECRET \
          ELEVENLABS_API_KEY ELEVENLABS_VOICE_ID \
          GCP_PROJECT_ID GCP_LOCATION GEMINI_MODEL; do
  gcloud secrets add-iam-policy-binding $S \
    --member="serviceAccount:${SA}" \
    --role="roles/secretmanager.secretAccessor"
done
```
4. At deploy, map secrets to env vars (Terraform module will handle this automatically).

### Vertex AI / Gemini
- Local: `gcloud auth application-default login` and `gcloud config set project <PROJECT>`.
- Model resource example: `projects/<PROJECT>/locations/us-central1/publishers/google/models/gemini-1.5-pro`.

### Terraform
- See `infrastructure/terraform/` for provider config, variables, and Secret Manager wiring.


