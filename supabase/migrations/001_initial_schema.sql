-- Create organizations table
CREATE TABLE organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create cloud_accounts table
CREATE TABLE cloud_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp')),
    account_name VARCHAR(255) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    credentials JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_scan_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create scan_results table
CREATE TABLE scan_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cloud_account_id UUID REFERENCES cloud_accounts(id) ON DELETE CASCADE,
    scan_type VARCHAR(50) NOT NULL CHECK (scan_type IN ('security', 'cost', 'compliance')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    findings JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    severity_counts JSONB DEFAULT '{"critical": 0, "high": 0, "medium": 0, "low": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create compliance_reports table
CREATE TABLE compliance_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('dsgvo', 'iso27001', 'soc2')),
    status VARCHAR(50) DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
    report_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create alerts table
CREATE TABLE alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    cloud_account_id UUID REFERENCES cloud_accounts(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_id VARCHAR(255),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create alert_configurations table
CREATE TABLE alert_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'slack', 'teams', 'webhook')),
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_cloud_accounts_org_id ON cloud_accounts(organization_id);
CREATE INDEX idx_scan_results_account_id ON scan_results(cloud_account_id);
CREATE INDEX idx_scan_results_created_at ON scan_results(created_at DESC);
CREATE INDEX idx_alerts_org_id ON alerts(organization_id);
CREATE INDEX idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX idx_compliance_reports_org_id ON compliance_reports(organization_id);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_configurations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (
        id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- Cloud Accounts: Users can only see accounts from their organization
CREATE POLICY "Users can view own cloud accounts" ON cloud_accounts
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- Similar policies for other tables
CREATE POLICY "Users can view own scan results" ON scan_results
    FOR SELECT USING (
        cloud_account_id IN (
            SELECT id FROM cloud_accounts 
            WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
        )
    );

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cloud_accounts_updated_at BEFORE UPDATE ON cloud_accounts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_alert_configurations_updated_at BEFORE UPDATE ON alert_configurations
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();