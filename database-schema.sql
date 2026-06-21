-- RecycleZone Supabase Database Schema

-- 1. Projects Table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    technologies TEXT,
    image_url TEXT,
    live_url TEXT,
    github_url TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Contacts Table
CREATE TABLE contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Certificates Table
CREATE TABLE certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    certificate_id TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    college_name TEXT,
    internship_domain TEXT,
    start_date DATE,
    end_date DATE,
    issue_date DATE,
    verification_status TEXT DEFAULT 'Verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Admin Users Table (Optional, for role verification used in supabase.js)
CREATE TABLE admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin'
);

-- Note: You should also enable Row Level Security (RLS) 
-- and set up your security policies depending on your access requirements.

-- Example RLS policies (Open for read, authenticated for write - adjust as needed):

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access on projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert on contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on contacts" ON contacts FOR ALL USING (auth.role() = 'authenticated');

-- Certificates
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access on certificates" ON certificates FOR ALL USING (auth.role() = 'authenticated');

-- Admin Users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for all on admin_users" ON admin_users FOR SELECT USING (true);
