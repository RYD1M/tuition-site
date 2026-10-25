/**
 * Shared taxonomy for tuition requests and tutor profiles.
 * Every option carries a stable key (stored in D1) plus Bangla and English labels,
 * so the UI can switch language without touching stored data.
 */

export interface Option {
  key: string
  bn: string
  en: string
}

/** All 64 districts of Bangladesh, Bangla first. */
export const DISTRICTS: Option[] = [
  { key: 'Bagerhat', bn: 'বাগেরহান', en: 'Bagerhat' },
  { key: 'Bandarban', bn: 'বান্দরবান', en: 'Bandarban' },
  { key: 'Barguna', bn: 'বরগুনা', en: 'Barguna' },
  { key: 'Barishal', bn: 'বরিশাল', en: 'Barishal' },
  { key: 'Bhola', bn: 'ভোলা', en: 'Bhola' },
  { key: 'Bogura', bn: 'বগুড়া', en: 'Bogura' },
  { key: 'Brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া', en: 'Brahmanbaria' },
  { key: 'Chandpur', bn: 'চাঁদপুর', en: 'Chandpur' },
  { key: 'Chapainawabganj', bn: 'চাঁপাইনবাবগঞ্জ', en: 'Chapainawabganj' },
  { key: 'Chattogram', bn: 'চট্টগ্রাম', en: 'Chattogram' },
  { key: 'Chuadanga', bn: 'চুয়াডাঙ্গা', en: 'Chuadanga' },
  { key: "Coxs Bazar", bn: 'কক্সবাজার', en: "Cox's Bazar" },
  { key: 'Cumilla', bn: 'কুমিল্লা', en: 'Cumilla' },
  { key: 'Dhaka', bn: 'ঢাকা', en: 'Dhaka' },
  { key: 'Dinajpur', bn: 'দিনাজপুর', en: 'Dinajpur' },
  { key: 'Faridpur', bn: 'ফরিদপুর', en: 'Faridpur' },
  { key: 'Feni', bn: 'ফেনী', en: 'Feni' },
  { key: 'Gazipur', bn: 'গাজীপুর', en: 'Gazipur' },
  { key: 'Gopalganj', bn: 'গোপালগঞ্জ', en: 'Gopalganj' },
  { key: 'Habiganj', bn: 'হবিগঞ্জ', en: 'Habiganj' },
  { key: 'Jamalpur', bn: 'জামালপুর', en: 'Jamalpur' },
  { key: 'Jashore', bn: 'যশোর', en: 'Jashore' },
  { key: 'Jhalokathi', bn: 'ঝালকাঠি', en: 'Jhalokathi' },
  { key: 'Jhenaidah', bn: 'ঝিনাইদহ', en: 'Jhenaidah' },
  { key: 'Joypurhat', bn: 'জয়পুরহাট', en: 'Joypurhat' },
  { key: 'Khagrachhari', bn: 'খাগড়াছড়ি', en: 'Khagrachhari' },
  { key: 'Khulna', bn: 'খুলনা', en: 'Khulna' },
  { key: 'Kishoreganj', bn: 'কিশোরগঞ্জ', en: 'Kishoreganj' },
  { key: 'Kurigram', bn: 'কুড়িগ্রাম', en: 'Kurigram' },
  { key: 'Kushtia', bn: 'কুষ্টিয়া', en: 'Kushtia' },
  { key: 'Lakshmipur', bn: 'লক্ষ্মীপুর', en: 'Lakshmipur' },
  { key: 'Lalmonirhat', bn: 'লালমনিরহাট', en: 'Lalmonirhat' },
  { key: 'Madaripur', bn: 'মাদারীপুর', en: 'Madaripur' },
  { key: 'Magura', bn: 'মাগুরা', en: 'Magura' },
  { key: 'Manikganj', bn: 'মানিকগঞ্জ', en: 'Manikganj' },
  { key: 'Meherpur', bn: 'মেহেরপুর', en: 'Meherpur' },
  { key: 'Moulvibazar', bn: 'মৌলভীবাজার', en: 'Moulvibazar' },
  { key: 'Munshiganj', bn: 'মুন্সিগঞ্জ', en: 'Munshiganj' },
  { key: 'Mymensingh', bn: 'ময়মনসিংহ', en: 'Mymensingh' },
  { key: 'Naogaon', bn: 'নাওগাঁও', en: 'Naogaon' },
  { key: 'Narail', bn: 'নড়াইল', en: 'Narail' },
  { key: 'Narayanganj', bn: 'নারায়ণগঞ্জ', en: 'Narayanganj' },
  { key: 'Narsingdi', bn: 'নরসিংদী', en: 'Narsingdi' },
  { key: 'Natore', bn: 'নাটোর', en: 'Natore' },
  { key: 'Netrokona', bn: 'নেত্রকোণা', en: 'Netrokona' },
  { key: 'Nilphamari', bn: 'নীলফামারী', en: 'Nilphamari' },
  { key: 'Noakhali', bn: 'নোয়াখালী', en: 'Noakhali' },
  { key: 'Pabna', bn: 'পাবনা', en: 'Pabna' },
  { key: 'Panchagarh', bn: 'পঞ্চগড়', en: 'Panchagarh' },
  { key: 'Patuakhali', bn: 'পটুয়াখালী', en: 'Patuakhali' },
  { key: 'Pirojpur', bn: 'পিরোজপুর', en: 'Pirojpur' },
  { key: 'Rajbari', bn: 'রাজবাড়ী', en: 'Rajbari' },
  { key: 'Rajshahi', bn: 'রাজশাহী', en: 'Rajshahi' },
  { key: 'Rangamati', bn: 'রাঙ্গামাটি', en: 'Rangamati' },
  { key: 'Rangpur', bn: 'রংপুর', en: 'Rangpur' },
  { key: 'Satkhira', bn: 'সাতক্ষীরা', en: 'Satkhira' },
  { key: 'Shariatpur', bn: 'শরীয়তপুর', en: 'Shariatpur' },
  { key: 'Sherpur', bn: 'শেরপুর', en: 'Sherpur' },
  { key: 'Sirajganj', bn: 'সিরাজগঞ্জ', en: 'Sirajganj' },
  { key: 'Sunamganj', bn: 'সুনামগঞ্জ', en: 'Sunamganj' },
  { key: 'Sylhet', bn: 'সিলেট', en: 'Sylhet' },
  { key: 'Tangail', bn: 'টাঙ্গাইল', en: 'Tangail' },
  { key: 'Thakurgaon', bn: 'ঠাকুরগাঁও', en: 'Thakurgaon' },
]

export const SUBJECTS: Option[] = [
  { key: 'math', bn: 'গণিত', en: 'Mathematics' },
  { key: 'higher-math', bn: 'উচ্চতর গণিত', en: 'Higher Math' },
  { key: 'physics', bn: 'পদার্থবিজ্ঞান', en: 'Physics' },
  { key: 'chemistry', bn: 'রসায়ন', en: 'Chemistry' },
  { key: 'biology', bn: 'জীববিজ্ঞান', en: 'Biology' },
  { key: 'bangla', bn: 'বাংলা', en: 'Bangla' },
  { key: 'english', bn: 'ইংরেজি', en: 'English' },
  { key: 'ict', bn: 'আইসিটি', en: 'ICT' },
  { key: 'accounting', bn: 'হিসাববিজ্ঞান', en: 'Accounting' },
  { key: 'business-organisation', bn: 'ব্যবসায় সংগঠন', en: 'Business Organisation' },
  { key: 'economics', bn: 'অর্থনীতি', en: 'Economics' },
  { key: 'biology-geography', bn: 'ভূগোল', en: 'Geography' },
  { key: 'history', bn: 'ইতিহাস', en: 'History' },
  { key: 'civics', bn: 'সুশাসন ও নাগরিকতা', en: 'Civics' },
  { key: 'islamic-studies', bn: 'ইসলাম শিক্ষা', en: 'Islamic Studies' },
  { key: 'bangladesh-world', bn: 'বাংলাদেশ ও বিশ্বপরিচয়', en: 'Bangladesh & Global Studies' },
  { key: 'science', bn: 'সাধারণ বিজ্ঞান', en: 'General Science' },
  { key: 'religion', bn: 'ধর্মীয় শিক্ষা', en: 'Religion' },
  { key: 'gk', bn: 'সাধারণ জ্ঞান', en: 'General Knowledge' },
  { key: 'creative-writing', bn: 'সৃজনশীল লেখা', en: 'Creative Writing' },
]

export const CLASS_LEVELS: Option[] = [
  { key: 'c1_5', bn: 'প্রথম–পঞ্চম শ্রেণি', en: 'Class 1–5' },
  { key: 'c6_8', bn: 'ষষ্ঠ–অষ্টম শ্রেণি', en: 'Class 6–8' },
  { key: 'c9_10', bn: 'নবম–দশম শ্রেণি', en: 'Class 9–10' },
  { key: 'c11_12', bn: 'একাদশ–দ্বাদশ শ্রেণি', en: 'Class 11–12' },
  { key: 'admission', bn: 'ভর্তি পরীক্ষা', en: 'Admission prep' },
  { key: 'university', bn: 'বিশ্ববিদ্যালয়', en: 'University' },
  { key: 'other', bn: 'অন্যান্য', en: 'Other' },
]

export const MODES: Option[] = [
  { key: 'home', bn: 'হোম টিউশন', en: 'Home tuition' },
  { key: 'online', bn: 'অনলাইন', en: 'Online' },
  { key: 'both', bn: 'দুটোই হবে', en: 'Either' },
]

export const DAYS: Option[] = [
  { key: 'sun', bn: 'রবি', en: 'Sun' },
  { key: 'mon', bn: 'সোম', en: 'Mon' },
  { key: 'tue', bn: 'মঙ্গল', en: 'Tue' },
  { key: 'wed', bn: 'বুধ', en: 'Wed' },
  { key: 'thu', bn: 'বৃহস্পতি', en: 'Thu' },
  { key: 'fri', bn: 'শুক্র', en: 'Fri' },
  { key: 'sat', bn: 'শনি', en: 'Sat' },
]

export const TIME_SLOTS: Option[] = [
  { key: 'morning', bn: 'সকাল (৬–১২)', en: 'Morning (6–12)' },
  { key: 'afternoon', bn: 'দুপুর (১২–৪)', en: 'Afternoon (12–4)' },
  { key: 'evening', bn: 'সন্ধ্যা (৪–৮)', en: 'Evening (4–8)' },
  { key: 'night', bn: 'রাত (৮–১১)', en: 'Night (8–11)' },
]

export const REQUEST_STATUS = ['open', 'filled', 'closed'] as const
export const APPLICATION_STATUS = ['pending', 'invited', 'accepted', 'rejected', 'withdrawn'] as const

export function optionLabel(list: Option[], key: string, lang: 'bn' | 'en'): string {
  const found = list.find((o) => o.key === key)
  if (!found) return key
  return lang === 'bn' ? found.bn : found.en
}

export function findOption(list: Option[], key: string): Option | undefined {
  return list.find((o) => o.key === key)
}
