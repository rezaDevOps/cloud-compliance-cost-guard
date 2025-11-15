# Cloud Compliance & Cost Guard

Eine SaaS-Platform für KMUs zur automatischen Überwachung von Cloud-Kosten, Sicherheit und Compliance.

## 🚀 Features

- **Multi-Cloud Support**: AWS, Azure, Google Cloud Platform
- **Automatische Security-Scans**: IAM, Netzwerk-Security, Storage-Permissions
- **AI-gestützte Kostenoptimierung**: Intelligente Empfehlungen basierend auf Nutzungsverhalten
- **Compliance Reports**: DSGVO, ISO 27001, SOC 2 auf Knopfdruck
- **Echtzeit-Alerts**: E-Mail, Slack, Teams, Webhooks
- **Dashboard**: Übersichtliche Visualisierung aller Metriken

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Go (für Scanner)
- **Database**: Supabase (PostgreSQL)
- **Workflow Automation**: n8n
- **AI**: OpenAI API für Empfehlungen
- **Infrastructure**: AWS Lambda, EventBridge, DynamoDB
- **CI/CD**: GitHub Actions, Terraform

## 📦 Installation

### Voraussetzungen

- Node.js 18+
- npm oder yarn
- Supabase Account
- n8n Instance (lokal oder gehostet)
- OpenAI API Key

### 1. Repository klonen

```bash
git clone https://github.com/yourusername/cloud-compliance-cost-guard.git
cd cloud-compliance-cost-guard
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

Erstelle eine `.env.local` Datei:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n
N8N_WEBHOOK_URL=http://localhost:5678/webhook/cloud-scan-trigger

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# AWS (für Scanner)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-central-1
```

### 4. Supabase Setup

1. Erstelle ein neues Supabase-Projekt
2. Führe die SQL-Migrations aus:

```sql
-- Siehe /supabase/migrations/
```

### 5. n8n Workflow importieren

1. Starte n8n lokal: `npx n8n`
2. Importiere den Workflow aus `/lib/n8n/security-scanner-workflow.json`
3. Konfiguriere die Credentials für AWS, Supabase und OpenAI

### 6. Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung ist jetzt unter http://localhost:3000 verfügbar.

## 📁 Projektstruktur

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard Pages
│   └── page.tsx           # Landing Page
├── components/            # React Components
│   ├── dashboard/         # Dashboard Components
│   ├── landing/           # Landing Page Components
│   └── ui/               # shadcn/ui Components
├── lib/                   # Utilities & Configs
│   ├── supabase/         # Supabase Client & Types
│   └── n8n/              # n8n Workflows
└── public/               # Static Assets
```

## 🔧 Hauptkomponenten

### Landing Page
- Hero Section mit Value Proposition
- Pain Points & Lösungen
- Feature-Übersicht
- Preispakete
- Testimonials & Trust-Signale

### Dashboard
- Übersicht mit Metriken
- Cloud-Account-Verwaltung
- Security Scanner
- Kostenanalyse
- Compliance Reports
- Alert-Management

### API Endpoints
- `/api/scan` - Trigger für Cloud-Scans
- `/api/reports` - Compliance-Report-Generation
- `/api/alerts` - Alert-Konfiguration

## 💰 Preismodell

| Paket | Preis | Features |
|-------|-------|----------|
| Basic | €99/Monat | 1 Account, Monatliche Reports |
| Pro | €299/Monat | 3 Accounts, AI-Optimierung, Alerts |
| Enterprise | €499/Monat | Unlimited, Multi-Cloud, API, White-Label |

## 🚢 Deployment

### Vercel Deployment

```bash
vercel --prod
```

### Docker

```bash
docker build -t cloudguard .
docker run -p 3000:3000 cloudguard
```

## 🤝 Contributing

Beiträge sind willkommen! Bitte erstelle einen Pull Request mit deinen Änderungen.

## 📄 Lizenz

MIT License - siehe LICENSE Datei

## 📞 Support

- Email: support@cloudguard.io
- Dokumentation: https://docs.cloudguard.io
- Status: https://status.cloudguard.io

---

Built with ❤️ by CloudGuard Team

## 🔄 Wie funktioniert CloudGuard? (Step-by-Step)

### Architektur-Übersicht

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Next.js App   │────▶│   API Routes    │────▶│    Supabase     │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                  │
                                  ▼
                        ┌─────────────────┐
                        │                 │
                        │   n8n Workflow  │
                        │  (Automation)   │
                        │                 │
                        └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
          ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
          │  Go Scanner  │ │ OpenAI API   │ │ Slack/Email  │
          │   Service    │ │   (AI)       │ │   Alerts     │
          └──────────────┘ └──────────────┘ └──────────────┘
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
      ┌──────┐  ┌──────┐  ┌──────┐
      │ AWS  │  │Azure │  │ GCP  │
      └──────┘  └──────┘  └──────┘
```

### 📝 Step-by-Step Workflow

#### **1️⃣ Benutzer-Registrierung & Onboarding**

```mermaid
User → Landing Page → Signup → Email Verification → Dashboard
```

1. **Benutzer besucht Landing Page** (`/`)
   - Sieht Value Proposition und Features
   - Klickt auf "14 Tage kostenlos testen"

2. **Registrierung** (`/signup`)
   - Gibt Firmendaten ein
   - Account wird in Supabase Auth erstellt
   - Organization & User Records werden angelegt

3. **Dashboard-Zugang** (`/dashboard`)
   - Nach Login Redirect zum Dashboard
   - Leeres Dashboard mit Onboarding-Hinweisen

#### **2️⃣ Cloud-Account Verbindung**

```javascript
// User fügt Cloud-Account hinzu
POST /api/accounts
{
  "provider": "aws",
  "account_name": "Production AWS",
  "credentials": {
    "access_key": "...",
    "secret_key": "..."
  }
}
```

1. **Cloud Provider wählen** (AWS/Azure/GCP)
2. **Credentials eingeben**
   - AWS: Access Key & Secret Key
   - Azure: Subscription ID & Service Principal
   - GCP: Service Account JSON
3. **Verbindung testen**
4. **Account wird in DB gespeichert** (verschlüsselt)

#### **3️⃣ Scan-Prozess Initiierung**

```javascript
// Frontend triggert Scan
POST /api/scan
{
  "cloud_account_id": "uuid-123",
  "scan_type": "security"
}
```

**Was passiert intern:**

1. **API Route** (`/api/scan/route.ts`)
   - Validiert Request
   - Prüft User-Berechtigung
   - Erstellt Scan-Record in DB

2. **n8n Workflow Trigger**
   ```javascript
   // API ruft n8n Webhook auf
   fetch('http://localhost:5678/webhook/cloud-scan-trigger', {
     method: 'POST',
     body: JSON.stringify(scanData)
   })
   ```

3. **n8n Workflow Ablauf**
   ```
   Webhook empfängt → Scanner Service aufrufen → 
   Ergebnisse verarbeiten → In DB speichern → 
   Alerts senden (wenn kritisch)
   ```

#### **4️⃣ Scanner Service Analyse**

**Go Scanner** (`scanner/main.go`) macht folgendes:

```go
func scanAWS() {
  // 1. EC2 Instances prüfen
  - Öffentliche IPs?
  - Unverschlüsselte Volumes?
  
  // 2. S3 Buckets analysieren
  - Public Access?
  - Fehlende Verschlüsselung?
  
  // 3. IAM Security Check
  - Root Account ohne MFA?
  - User ohne MFA?
  
  return findings
}
```

**Beispiel Finding:**
```json
{
  "type": "security",
  "severity": "critical",
  "resource_id": "s3-bucket-public",
  "issue": "S3 Bucket has public access",
  "recommendation": "Remove public access, use CloudFront"
}
```

#### **5️⃣ AI-Optimierung & Empfehlungen**

```javascript
// n8n ruft OpenAI API auf
const recommendations = await openai.complete({
  prompt: `Analysiere diese Cloud-Findings und gib Optimierungsvorschläge:
    ${findings}
    Fokus auf: Kosteneinsparung, Security, Best Practices`,
  model: "gpt-4"
})
```

**AI generiert:**
- Konkrete Handlungsempfehlungen
- Geschätzte Kosteneinsparungen
- Prioritäten-Ranking
- Schritt-für-Schritt Fixes

#### **6️⃣ Ergebnis-Speicherung**

```sql
-- Scan-Ergebnisse werden gespeichert
INSERT INTO scan_results (
  cloud_account_id,
  scan_type,
  findings,
  recommendations,
  severity_counts,
  status
) VALUES (...)
```

**Datenstruktur:**
- Findings als JSON
- AI-Empfehlungen
- Severity-Zählung
- Zeitstempel

#### **7️⃣ Alert-System**

**Bei kritischen Findings:**

1. **Slack-Notification**
   ```javascript
   await slackNotifier.sendAlert({
     title: "🚨 Critical Security Issue",
     text: "Public S3 bucket detected",
     severity: "critical"
   })
   ```

2. **Email-Alert**
   ```javascript
   await sendEmail({
     to: user.email,
     subject: "Critical Security Findings",
     template: "security-alert",
     data: findings
   })
   ```

3. **Dashboard-Update**
   - Real-time via WebSocket (optional)
   - Oder bei nächstem Page-Refresh

#### **8️⃣ Dashboard-Visualisierung**

```typescript
// Dashboard lädt Daten
const { data: scans } = await supabase
  .from('scan_results')
  .select('*')
  .order('created_at', { ascending: false })
```

**User sieht:**
- 📊 **Metriken**: Kosten, Security Score, Compliance %
- 📈 **Charts**: Kostenentwicklung, Security Trends
- 📋 **Findings-Liste**: Nach Severity sortiert
- 💡 **AI-Empfehlungen**: Priorisierte Actions
- 📄 **Reports**: PDF-Export möglich

#### **9️⃣ Compliance-Report Generation**

```javascript
// User fordert Report an
POST /api/reports/generate
{
  "type": "dsgvo",
  "format": "pdf"
}
```

**Report-Prozess:**
1. Sammle alle relevanten Scan-Daten
2. Prüfe gegen Compliance-Anforderungen
3. Generiere PDF mit Puppeteer
4. Speichere in Supabase Storage
5. Sende Download-Link an User

#### **🔄 Continuous Monitoring**

**Automatische Scans:**
```javascript
// Cron-Job in n8n oder Vercel
schedule.daily(() => {
  const accounts = await getActiveCloudAccounts()
  for (const account of accounts) {
    await triggerScan(account.id, 'security')
  }
})
```

### 🏗️ Technische Komponenten im Detail

#### **Frontend (Next.js)**
- **Pages**: Landing, Dashboard, Reports, Settings
- **Components**: Reusable UI-Komponenten
- **State Management**: React Hooks + Zustand
- **Styling**: Tailwind CSS + shadcn/ui

#### **Backend (API Routes)**
- **Authentication**: Supabase Auth mit RLS
- **API Endpoints**: RESTful JSON APIs
- **Validation**: Zod Schema Validation
- **Error Handling**: Structured Error Responses

#### **Database (Supabase)**
- **PostgreSQL**: Relationale Datenbank
- **Row Level Security**: User-basierte Zugriffskontrolle
- **Real-time**: Subscriptions für Live-Updates
- **Storage**: Für Reports & Assets

#### **Scanner (Go Service)**
- **Cloud SDKs**: AWS, Azure, GCP SDKs
- **Concurrent Scanning**: Goroutines für Performance
- **Rule Engine**: Konfigurierbare Security Rules
- **API Server**: HTTP REST Endpoint

#### **Workflow Engine (n8n)**
- **Webhook Triggers**: Event-basierte Ausführung
- **Integrations**: Slack, Email, APIs
- **Error Handling**: Retry-Logic
- **Monitoring**: Execution Logs

### 🔐 Security & Best Practices

1. **Verschlüsselung**
   - Cloud-Credentials verschlüsselt in DB
   - HTTPS für alle Verbindungen
   - Secrets in Environment Variables

2. **Authentication**
   - JWT-basierte Auth
   - Session Management
   - MFA-Support (optional)

3. **Rate Limiting**
   - API-Endpoints limitiert
   - Scan-Frequency begrenzt
   - DDoS-Protection

4. **Monitoring**
   - Error Tracking (Sentry)
   - Performance Monitoring
   - Audit Logs

### 📈 Skalierung

**Für 10 Kunden:**
- Single Server ausreichend
- Basic Monitoring

**Für 100 Kunden:**
- Load Balancer
- Multiple Scanner Instances
- Redis Cache

**Für 1000+ Kunden:**
- Kubernetes Cluster
- Auto-Scaling
- Multi-Region Deployment
- Enterprise Features

### 🎯 Business Model Umsetzung

```
Basic (€99/mo) → 17 Kunden = €1,683/mo
Pro (€299/mo) → 17 Kunden = €5,083/mo  ← Target für €5k MRR
Enterprise (€499/mo) → 10 Kunden = €4,990/mo
```

**Customer Journey:**
1. Free Trial (14 Tage) → Onboarding
2. Erste Scans → Value erkennen
3. Upgrade auf Pro → Mehr Features
4. Expansion → Mehr Cloud-Accounts
5. Enterprise → Custom Features

---

Das ist der komplette Flow von CloudGuard - von der Registrierung bis zur kontinuierlichen Cloud-Überwachung! 🚀