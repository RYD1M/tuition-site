-- Demo data for `npm run db:seed` (local wrangler state only).
-- The CREATE TABLE blocks mirror server/schema.ts so the seed can run on its own.
-- Everything here is fictional sample data for the local preview.

CREATE TABLE IF NOT EXISTS users (
  sub TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  picture TEXT,
  phone TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS tutor_profiles (
  sub TEXT PRIMARY KEY,
  headline TEXT NOT NULL DEFAULT '',
  qualification TEXT NOT NULL DEFAULT '',
  subjects TEXT NOT NULL DEFAULT '[]',
  class_levels TEXT NOT NULL DEFAULT '[]',
  districts TEXT NOT NULL DEFAULT '[]',
  mode TEXT NOT NULL DEFAULT 'both',
  fee_amount INTEGER,
  fee_note TEXT NOT NULL DEFAULT '',
  experience_years INTEGER,
  bio TEXT NOT NULL DEFAULT '',
  available_days TEXT NOT NULL DEFAULT '[]',
  available_time TEXT NOT NULL DEFAULT '[]',
  phone TEXT NOT NULL DEFAULT '',
  open_to_offers INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS tuition_requests (
  id TEXT PRIMARY KEY,
  sub TEXT NOT NULL,
  student_name TEXT NOT NULL DEFAULT '',
  subjects TEXT NOT NULL DEFAULT '[]',
  class_levels TEXT NOT NULL DEFAULT '[]',
  district TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'home',
  budget_amount INTEGER,
  days TEXT NOT NULL DEFAULT '[]',
  time_slots TEXT NOT NULL DEFAULT '[]',
  start_date TEXT,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  tutor_sub TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (request_id, tutor_sub)
);

-- ------------------------------------------------------------------ students
INSERT OR REPLACE INTO users (sub, name, email, phone, created_at) VALUES
  ('demo-student-1', 'রাফিদ হাসান',  'rafid@example.com',   '01712345601', strftime('%Y-%m-%dT%H:%M:%fZ','now','-9 days')),
  ('demo-student-2', 'নুসরাত জাহান', 'nusrat@example.com',  '01812345602', strftime('%Y-%m-%dT%H:%M:%fZ','now','-7 days')),
  ('demo-student-3', 'তানভীর আহমেদ', 'tanvir@example.com',  '01912345603', strftime('%Y-%m-%dT%H:%M:%fZ','now','-5 days')),
  ('demo-student-4', 'সাদিয়া ইসলাম', 'sadia@example.com',   '01612345604', strftime('%Y-%m-%dT%H:%M:%fZ','now','-3 days')),
  ('demo-student-5', 'মাহিন রহমান',  'mahin@example.com',   '01512345605', strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 days'));

-- -------------------------------------------------------------------- tutors
INSERT OR REPLACE INTO users (sub, name, email, phone, created_at) VALUES
  ('demo-tutor-1', 'তাসনিম আক্তার',   'tasnim@example.com', '01798765401', strftime('%Y-%m-%dT%H:%M:%fZ','now','-30 days')),
  ('demo-tutor-2', 'আরিফুল ইসলাম',    'ariful@example.com', '01798765402', strftime('%Y-%m-%dT%H:%M:%fZ','now','-26 days')),
  ('demo-tutor-3', 'ফারহানা হক',      'farhana@example.com','01798765403', strftime('%Y-%m-%dT%H:%M:%fZ','now','-21 days')),
  ('demo-tutor-4', 'সাইফুল আলম',      'saiful@example.com', '01798765404', strftime('%Y-%m-%dT%H:%M:%fZ','now','-16 days')),
  ('demo-tutor-5', 'রুবাইয়াত হোসেন', 'rubaiyat@example.com','01798765405', strftime('%Y-%m-%dT%H:%M:%fZ','now','-12 days')),
  ('demo-tutor-6', 'মেহজাবিন নূর',    'mehjabin@example.com','01798765406', strftime('%Y-%m-%dT%H:%M:%fZ','now','-8 days'));

INSERT OR REPLACE INTO tutor_profiles
  (sub, headline, qualification, subjects, class_levels, districts, mode, fee_amount, fee_note,
   experience_years, bio, available_days, available_time, open_to_offers, created_at)
VALUES
  ('demo-tutor-1',
   'ঢাকা বিশ্ববিদ্যালয়, পদার্থবিজ্ঞান অনার্স',
   'বিএসসি (অনার্স) পদার্থবিজ্ঞান, ঢাকা বিশ্ববিদ্যালয়',
   '["physics","math","higher-math"]', '["c9_10","c11_12","admission"]', '["Dhaka","Gazipur"]', 'both',
   4500, '', 3,
   'কনসেপ্ট ধরে ধরে বোঝাই, তারপর বোর্ড ও ভর্তি পরীক্ষার প্যাটার্নে অনুশীলন করাই। প্রতি সপ্তাহে একটি মনোগ্রাফ টেস্ট নিই।',
   '["sun","mon","tue","wed","thu"]', '["evening","night"]', 1,
   strftime('%Y-%m-%dT%H:%M:%fZ','now','-30 days')),

  ('demo-tutor-2',
   'রাজশাহী বিশ্ববিদ্যালয়, গণিত অনার্স',
   'এমএসসি গণিত, রাজশাহী বিশ্ববিদ্যালয়',
   '["math","higher-math","ict"]', '["c6_8","c9_10","c11_12"]', '["Rajshahi","Bogura","Pabna"]', 'both',
   3500, '', 5,
   'গণিতকে ভয় পাওয়া বন্ধ। প্রতিটি সূত্র উদ্ভব সহ বোঝাই, হাজারো সমস্যা সমাধানের অভ্যাস গড়ে তুলি।',
   '["sun","mon","tue","wed","thu","fri"]', '["morning","afternoon","evening"]', 1,
   strftime('%Y-%m-%dT%H:%M:%fZ','now','-26 days')),

  ('demo-tutor-3',
   'চট্টগ্রাম বিশ্ববিদ্যালয়, রসায়ন বিভাগ',
   'এমএসসি রসায়ন, চট্টগ্রাম বিশ্ববিদ্যালয়',
   '["chemistry","biology","science"]', '["c9_10","c11_12"]', '["Chattogram","Coxs Bazar"]', 'online',
   4000, '', 4,
   'অনলাইনে ল্যাব ডেমো ও ভিজ্যুয়ালাইজেশন দিয়ে পড়াই। রসায়নের গাণিতিক অংশ ধাপে ধাপে সমাধান করি।',
   '["sun","tue","thu","sat"]', '["night"]', 1,
   strftime('%Y-%m-%dT%H:%M:%fZ','now','-21 days')),

  ('demo-tutor-4',
   'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়, ইংরেজি',
   'এমএ ইংরেজি, জাহাঙ্গীরনগর বিশ্ববিদ্যালয়',
   '["english","creative-writing","bangla"]', '["c6_8","c9_10","c11_12","admission"]', '["Dhaka","Narayanganj"]', 'home',
   3000, '', 6,
   'স্পোকেন ইংরেজি ও বোর্ড প্রস্তুতি একসাথে। প্রতি ক্লাসে নতুন শব্দভাণ্ডার ও বাক্যগঠনের অনুশীলন।',
   '["sun","mon","wed","fri"]', '["afternoon","evening"]', 1,
   strftime('%Y-%m-%dT%H:%M:%fZ','now','-16 days')),

  ('demo-tutor-5',
   'শাহজালাল বিশ্ববিদ্যালয়, হিসাববিজ্ঞান',
   'বিকম (অনার্স) হিসাববিজ্ঞান, শাহজালাল বিশ্ববিদ্যালয়',
   '["accounting","business-organisation","economics"]', '["c11_12","university"]', '["Sylhet","Moulvibazar"]', 'both',
   3800, '', 2,
   'হিসাববিজ্ঞানের প্রতিটি এন্ট্রি কেন হয় — সেটা আগে বোঝাই, তারপর স্পিড বাড়াই।',
   '["sun","mon","tue","thu"]', '["evening"]', 1,
   strftime('%Y-%m-%dT%H:%M:%fZ','now','-12 days')),

  ('demo-tutor-6',
   'বঙ্গবন্ধু শেখ মুজিব বিশ্ববিদ্যালয়, জীববিজ্ঞান',
   'এমএসসি জীববিজ্ঞান, বিএসএমএসটি বিশ্ববিদ্যালয়',
   '["biology","chemistry","science"]', '["c9_10","c11_12"]', '["Mymensingh","Gazipur"]', 'home',
   3200, '', 3,
   'নিউরোবায়োলজি ও জেনেটিক্সে বিশেষ অভিজ্ঞতা। ডায়াগ্রাম অনুশীলনের ওপর বিশেষ গুরুত্ব দিই।',
   '["sun","mon","tue","wed","thu","sat"]', '["morning","afternoon"]', 1,
   strftime('%Y-%m-%dT%H:%M:%fZ','now','-8 days'));

-- ----------------------------------------------------------------- requests
INSERT OR REPLACE INTO tuition_requests
  (id, sub, student_name, subjects, class_levels, district, area, mode, budget_amount,
   days, time_slots, start_date, details, status, created_at)
VALUES
  ('demo-req-1','demo-student-1','রাফিদ হাসান','["math","physics"]','["c9_10"]','Dhaka','মিরপুর ১০','home',5000,
   '["sun","tue","thu"]','["evening"]','2026-11-01',
   'নবম শ্রেণির ছেলে, গণিত ও পদার্থে দুর্বল। বোর্ড পরীক্ষার প্রস্তুতি শুরু করতে চাই। বাসা মিরপুর ১০, লিফটসহ।',
   'open', strftime('%Y-%m-%dT%H:%M:%fZ','now','-2 days')),

  ('demo-req-2','demo-student-2','নুসরাত জাহান','["english","bangla"]','["c6_8"]','Chattogram','পাহাড়তলী','online',3000,
   '["sun","wed","fri"]','["night"]',NULL,
   'ষষ্ঠ শ্রেণির মেয়ের জন্য ইংরেজি ও বাংলা। অনলাইনে পড়ালেখা হবে, সময় রাতে।',
   'open', strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 days')),

  ('demo-req-3','demo-student-3','তানভীর আহমেد','["chemistry","biology"]','["c11_12"]','Rajshahi','বোয়ালিয়া','home',6000,
   '["sun","mon","tue","thu"]','["afternoon"]','2026-11-05',
   'একাদশে ভর্তি, রসায়ন ও জীববিজ্ঞান দুটোই পড়তে হবে। ভর্তি পরীক্ষার প্রস্তুতিও দরকার।',
   'open', strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 days')),

  ('demo-req-4','demo-student-4','সাদিয়া ইসলাম','["accounting","economics"]','["c11_12"]','Sylhet','জিন্দাবাজার','both',4500,
   '["sun","mon","wed"]','["evening"]',NULL,
   'কমার্স বিভাগ, হিসাববিজ্ঞান ও অর্থনীতি। অনলাইন বা বাসায় — যেটা সুবিধাজনক।',
   'open', strftime('%Y-%m-%dT%H:%M:%fZ','now','-16 hours')),

  ('demo-req-5','demo-student-5','মাহিন রহমান','["math","ict"]','["c9_10"]','Narayanganj','ফতুল্লা','home',4000,
   '["sun","tue","sat"]','["morning"]',NULL,
   'দশম শ্রেণি, গণিতে অঙ্কভয়। শুক্র ও শনিছাড়া অন্য দিন সকালে সময় মিলবে।',
   'open', strftime('%Y-%m-%dT%H:%M:%fZ','now','-6 hours')),

  ('demo-req-6','demo-student-1','রাফিদ হাসান','["physics"]','["admission"]','Dhaka','ধানমন্ডি','online',7000,
   '["sun","wed"]','["night"]',NULL,
   'ঢাকা বিশ্ববিদ্যালয় ভর্তি পরীক্ষার প্রস্তুতি — পদার্থবিজ্ঞান বিভাগ। পূর্ববর্তী বছরের প্রশ্ন সমাধান দরকার।',
   'open', strftime('%Y-%m-%dT%H:%M:%fZ','now','-3 hours')),

  ('demo-req-7','demo-student-2','নুসরাত জাহান','["science","gk"]','["c1_5"]','Cumilla','কান্দিরপাড়','home',2500,
   '["sun","tue","thu"]','["afternoon"]',NULL,
   'তৃতীয় শ্রেণির ছেলের জন্য সাধারণ বিজ্ঞান ও সাধারণ জ্ঞান। পড়া মজার হলে ভালো।',
   'open', strftime('%Y-%m-%dT%H:%M:%fZ','now','-40 minutes')),

  ('demo-req-8','demo-student-5','মাহিন রহমান','["higher-math","physics"]','["c11_12"]','Gazipur','টঙ্গী','both',5500,
   '["mon","wed","fri"]','["evening","night"]',NULL,
   'উচ্চ মাধ্যমিক সায়েন্স, উচ্চতর গণিত ও পদার্থবিজ্ঞান। ভর্তি পরীক্ষার ফোকাস থাকবে।',
   'open', strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 minutes'));

-- ------------------------------------------------------------ applications
INSERT OR REPLACE INTO applications (id, request_id, tutor_sub, message, status, created_at) VALUES
  ('demo-app-1','demo-req-1','demo-tutor-1','পদার্থ ও গণিত দুটোতেই তিন বছরের অভিজ্ঞতা আছে। প্রথম ক্লাস ফ্রি দিতে পারি।',
   'accepted', strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 days')),
  ('demo-app-2','demo-req-1','demo-tutor-2','আমি মিরপুরেই থাকি, প্রতি সপ্তাহে তিন দিন আসতে পারব।',
   'rejected', strftime('%Y-%m-%dT%H:%M:%fZ','now','-20 hours')),
  ('demo-app-3','demo-req-3','demo-tutor-3','রসায়নে এমএসসি করেছি, ভর্তি পরীক্ষার ব্যাচ নিয়েছি।',
   'pending', strftime('%Y-%m-%dT%H:%M:%fZ','now','-10 hours')),
  ('demo-app-4','demo-req-4','demo-tutor-5','হিসাববিজ্ঞানে বিশেষায়িত, অনলাইনে পড়াতে পারি।',
   'pending', strftime('%Y-%m-%dT%H:%M:%fZ','now','-5 hours')),
  ('demo-app-5','demo-req-2','demo-tutor-4','ইংরেজি স্পোকেন ও বোর্ড দুটোতেই সহায়তা করব, রাতে সময় দিতে পারি।',
   'pending', strftime('%Y-%m-%dT%H:%M:%fZ','now','-2 hours'));
