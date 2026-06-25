-- MLA Constituency Portal Schema
-- Run via: supabase db push OR Supabase SQL Editor

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE complaint_status AS ENUM ('submitted', 'under_review', 'in_progress', 'resolved');
CREATE TYPE complaint_category AS ENUM (
  'drinking_water', 'roads', 'pension', 'healthcare',
  'education', 'infrastructure', 'other'
);
CREATE TYPE project_category AS ENUM (
  'roads', 'education', 'healthcare', 'water', 'infrastructure'
);
CREATE TYPE project_status AS ENUM ('planned', 'in_progress', 'completed');
CREATE TYPE gallery_category AS ENUM (
  'development', 'public_meetings', 'welfare', 'events'
);
CREATE TYPE news_category AS ENUM (
  'announcement', 'development', 'welfare', 'events', 'general'
);

-- Roles reference table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name user_role NOT NULL UNIQUE,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (name, permissions) VALUES
  ('admin', '["all"]'::jsonb),
  ('staff', '["complaints.read", "complaints.update", "news.read", "news.write", "projects.read", "gallery.read"]'::jsonb);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'staff',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id TEXT NOT NULL UNIQUE,
  citizen_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  ward TEXT NOT NULL,
  panchayat TEXT NOT NULL,
  category complaint_category NOT NULL,
  description TEXT NOT NULL,
  status complaint_status DEFAULT 'submitted',
  attachments JSONB DEFAULT '[]'::jsonb,
  assigned_to UUID REFERENCES profiles(id),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status complaint_status NOT NULL,
  remarks TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ml TEXT,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  excerpt_ml TEXT,
  content TEXT NOT NULL,
  content_ml TEXT,
  category news_category DEFAULT 'general',
  featured_image TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ml TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  description_ml TEXT,
  category project_category NOT NULL,
  status project_status DEFAULT 'planned',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  location TEXT,
  budget TEXT,
  start_date DATE,
  end_date DATE,
  featured_image TEXT,
  before_image TEXT,
  after_image TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ml TEXT,
  category gallery_category NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES gallery(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  caption_ml TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_complaint_id ON complaints(complaint_id);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_published ON news(is_published, published_at DESC);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_published ON projects(is_published);
CREATE INDEX idx_gallery_category ON gallery(category);
CREATE INDEX idx_complaint_updates_complaint ON complaint_updates(complaint_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER complaints_updated_at BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER news_updated_at BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER gallery_updated_at BEFORE UPDATE ON gallery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is staff/admin
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_active = true
    AND role IN ('admin', 'staff')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_active = true AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Staff can view profiles" ON profiles FOR SELECT USING (is_staff());
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL USING (is_admin());

-- Complaints: public insert, staff read/update
CREATE POLICY "Anyone can submit complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can track by complaint_id" ON complaints FOR SELECT USING (true);
CREATE POLICY "Staff can update complaints" ON complaints FOR UPDATE USING (is_staff());

-- Complaint updates
CREATE POLICY "Staff can manage complaint updates" ON complaint_updates FOR ALL USING (is_staff());
CREATE POLICY "Public can view complaint updates" ON complaint_updates FOR SELECT USING (true);

-- News: public read published, staff write
CREATE POLICY "Public read published news" ON news FOR SELECT USING (is_published = true OR is_staff());
CREATE POLICY "Staff manage news" ON news FOR ALL USING (is_staff());

-- Projects
CREATE POLICY "Public read published projects" ON projects FOR SELECT USING (is_published = true OR is_staff());
CREATE POLICY "Staff manage projects" ON projects FOR ALL USING (is_staff());

CREATE POLICY "Public read project gallery" ON project_gallery FOR SELECT USING (true);
CREATE POLICY "Staff manage project gallery" ON project_gallery FOR ALL USING (is_staff());

-- Gallery
CREATE POLICY "Public read published gallery" ON gallery FOR SELECT USING (is_published = true OR is_staff());
CREATE POLICY "Staff manage gallery" ON gallery FOR ALL USING (is_staff());

CREATE POLICY "Public read gallery images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Staff manage gallery images" ON gallery_images FOR ALL USING (is_staff());

-- Settings
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON settings FOR ALL USING (is_admin());

-- Roles (admin only)
CREATE POLICY "Staff read roles" ON roles FOR SELECT USING (is_staff());

-- Storage buckets (run in Supabase dashboard or via API)
-- news, projects, gallery, complaints, avatars

-- Seed default settings
INSERT INTO settings (key, value) VALUES
  ('site', '{
    "mla_name": "Hon. Member of Legislative Assembly",
    "mla_name_ml": "മാന്യ നിയമസഭാ അംഗം",
    "constituency": "Sample Constituency",
    "constituency_ml": "നമൂനാ നിയോജകമണ്ഡലം",
  "tagline": "Serving with dedication, transparency, and vision",
    "tagline_ml": "സമർപ്പണം, സുതാര്യത, ദൃഷ്ടിവുമായി സേവനം",
    "office_address": "MLA Office, Main Road, District HQ, Kerala 680001",
    "office_phone": "+91 98765 43210",
    "office_email": "office@mlaconstituency.gov.in",
    "office_hours": "Mon–Fri: 9:00 AM – 5:00 PM",
    "stats": {
      "roads_completed": 127,
      "schools_upgraded": 43,
      "healthcare_projects": 28,
      "welfare_initiatives": 156
    },
    "biography": "A dedicated public servant with over two decades of experience in grassroots development and legislative advocacy.",
    "vision": "To transform our constituency into a model of sustainable development, inclusive growth, and citizen empowerment."
  }'::jsonb);
