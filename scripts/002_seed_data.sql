-- Seed emergency contacts
INSERT INTO emergency_contacts (name, phone, category, region) VALUES
  ('National Commission for Women', '7827-170-170', 'women', 'India'),
  ('Women Helpline (All India)', '181', 'women', 'India'),
  ('Police Emergency', '100', 'emergency', 'India'),
  ('National Human Rights Commission', '1800-1800-1235', 'human_rights', 'India'),
  ('Child Helpline', '1098', 'children', 'India'),
  ('Senior Citizen Helpline', '14567', 'seniors', 'India'),
  ('Legal Aid Helpline', '15100', 'legal', 'India'),
  ('Cyber Crime Helpline', '1930', 'cyber', 'India'),
  ('Domestic Violence Helpline', '1091', 'domestic_violence', 'India'),
  ('Anti-Corruption Helpline', '1064', 'corruption', 'India')
ON CONFLICT DO NOTHING;

-- Seed legal resources
INSERT INTO legal_resources (title, description, category, language) VALUES
  ('Right to Information Act, 2005', 'Provides citizens the right to request information from public authorities', 'information_rights', 'en'),
  ('Consumer Protection Act, 2019', 'Protects consumer rights and provides remedies for consumer disputes', 'consumer_rights', 'en'),
  ('Protection of Women from Domestic Violence Act, 2005', 'Provides protection to women from domestic violence', 'women_rights', 'en'),
  ('The Constitution of India - Fundamental Rights', 'Articles 12-35 of the Indian Constitution guaranteeing fundamental rights', 'constitutional_rights', 'en'),
  ('Motor Vehicles Act, 1988', 'Governs road transport vehicles and compensation for accidents', 'traffic', 'en'),
  ('Rent Control Act', 'Provides protection to tenants and regulates rent in certain areas', 'property', 'en'),
  ('Labour Laws', 'Various acts protecting workers rights including minimum wages, safety, and benefits', 'labor_rights', 'en'),
  ('Cyber Laws - IT Act 2000', 'Legal framework for electronic governance and cybercrime', 'cyber_law', 'en'),
  ('Family Law', 'Laws governing marriage, divorce, maintenance, and custody', 'family', 'en'),
  ('Criminal Law Basics', 'Overview of IPC and CrPC for common citizens', 'criminal', 'en')
ON CONFLICT DO NOTHING;
