# n8n Workflow Import & Setup Guide

## 📥 Workflow Import Anleitung

### Schritt 1: n8n starten

```bash
# Option A: Global installiert
n8n start

# Option B: Mit npx
npx n8n

# Option C: Mit Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Option D: Mit docker-compose (im Projekt)
docker-compose up n8n
```

### Schritt 2: Workflow importieren

1. **Öffne n8n**: http://localhost:5678
2. **Erstelle neuen Workflow**: Click auf "New" Button
3. **Import-Methoden**:

#### Methode A: Copy & Paste (Empfohlen)
1. Öffne die Datei: `lib/n8n/cloudguard-scanner-workflow.json`
2. Kopiere den gesamten JSON-Inhalt
3. In n8n: Klicke irgendwo auf die Canvas
4. Drücke `Ctrl+A` (alles auswählen)
5. Drücke `Ctrl+V` (einfügen)

#### Methode B: Import from File
1. Klicke auf das Menü (3 Punkte) oben rechts
2. Wähle "Import from File"
3. Navigiere zu: `lib/n8n/cloudguard-scanner-workflow.json`
4. Klicke "Open"

#### Methode C: Drag & Drop
1. Öffne den Ordner mit der JSON-Datei
2. Ziehe die Datei direkt auf die n8n Canvas

## 🔐 Credentials einrichten

Nach dem Import musst du die Credentials konfigurieren:

### 1. Supabase Credentials

1. Doppelklick auf "Save to Supabase" Node
2. Bei Credentials: Click auf "Create New"
3. Fülle aus:
   ```
   Host: https://YOUR-PROJECT.supabase.co
   Service Role Key: YOUR-SERVICE-ROLE-KEY
   ```
4. Click "Save"

### 2. Slack Webhook (Optional)

1. Doppelklick auf "Send Critical Alert to Slack" Node
2. Die Webhook URL wird aus Environment Variable gelesen
3. Oder hardcode sie direkt im Node

### 3. SMTP Email (Optional)

1. Doppelklick auf "Send Email Report" Node
2. Bei Credentials: Click auf "Create New"
3. Fülle aus:
   ```
   Host: smtp.gmail.com (oder dein SMTP)
   Port: 587
   User: your-email@gmail.com
   Password: your-app-password
   ```

## 🔧 Environment Variables in n8n

### Setze Environment Variables vor dem Start:

```bash
# Linux/Mac
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/URL"
export APP_URL="http://localhost:3000"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key"

# Dann n8n starten
n8n start
```

### Oder verwende .env Datei:

```bash
# Erstelle .n8n.env Datei
cat > .n8n.env << EOF
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/URL
APP_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
EOF

# Starte mit env file
env $(cat .n8n.env | xargs) n8n start
```

## 🧪 Workflow testen

### 1. Test Webhook Trigger

```bash
curl -X POST http://localhost:5678/webhook/cloud-scan-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "scan_id": "test-123",
    "cloud_account_id": "aws-prod",
    "provider": "aws",
    "scan_type": "security",
    "scanner_url": "http://localhost:8080",
    "user_email": "test@example.com",
    "credentials": {
      "access_key": "test",
      "secret_key": "test"
    }
  }'
```

### 2. Test mit Mock Data

1. In n8n: Click auf "Execute Workflow" Button
2. Oder nutze den "Test" Button beim Webhook Node
3. Füge Test-Daten ein und execute

## 📊 Workflow Übersicht

Der Workflow macht folgendes:

1. **Webhook Trigger** → Empfängt Scan-Request
2. **Call Scanner** → Ruft Go Scanner Service auf
3. **Process Findings** → Verarbeitet und kategorisiert Ergebnisse
4. **Save to DB** → Speichert in Supabase
5. **Check Critical** → Prüft auf kritische Findings
6. **Send Alerts** → Sendet Slack/Email bei kritischen Issues

## 🐛 Troubleshooting

### Problem: "Webhook URL not registered"
**Lösung**: Workflow muss aktiv sein. Click auf "Active" Toggle oben.

### Problem: "Connection refused"
**Lösung**: Prüfe ob Scanner Service läuft:
```bash
cd scanner
go run main.go
# Oder mit Docker
docker build -t scanner .
docker run -p 8080:8080 scanner
```

### Problem: "Invalid credentials"
**Lösung**: Doppelklick auf Node → Credentials → Edit → Test Connection

### Problem: "Workflow not triggering"
**Lösung**: 
1. Check Webhook URL: http://localhost:5678/webhook/cloud-scan-trigger
2. Workflow muss "Active" sein
3. Check n8n logs für Fehler

## 🎯 Best Practices

1. **Versionierung**: Exportiere Workflows regelmäßig als Backup
2. **Testing**: Nutze den "Test" Modus vor Aktivierung
3. **Monitoring**: Aktiviere Execution Logs in n8n Settings
4. **Error Handling**: Füge Error-Trigger Nodes hinzu
5. **Documentation**: Kommentiere komplexe Nodes

## 📚 Nützliche n8n Features

- **Execution History**: Siehe alle Workflow-Ausführungen
- **Manual Execution**: Teste mit Mock-Daten
- **Debug Mode**: Siehe Output jedes Nodes
- **Retry on Failure**: Automatische Wiederholung bei Fehlern
- **Webhook Test**: Generiere Test-Requests direkt in n8n

## 🔗 Weitere Ressourcen

- [n8n Documentation](https://docs.n8n.io)
- [n8n Community](https://community.n8n.io)
- [Workflow Templates](https://n8n.io/workflows)