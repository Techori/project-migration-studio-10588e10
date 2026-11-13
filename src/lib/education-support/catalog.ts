// Browser-safe lists for the Education Support registration: sectors, courses, states.

export const educationSectors = [
  "Medical & Healthcare", "Dental Science", "Nursing & Paramedical", "Pharmacy", "Biotechnology & Life Sciences",
  "Robotics & Automation", "Artificial Intelligence & Machine Learning", "Data Science & Analytics", "Computer Science & IT", "Cyber Security",
  "Engineering & Technology", "Mechanical Engineering", "Civil Engineering", "Electrical & Electronics", "Aerospace & Aviation",
  "Agriculture & Agritech", "Management & Business Administration", "Finance & Banking", "Commerce & Accounting", "Economics",
  "Law & Legal Studies", "Education & Teaching", "Humanities & Social Sciences", "Psychology & Mental Health", "Architecture & Urban Planning",
  "Design & Fashion", "Media & Journalism", "Hospitality & Tourism", "Hotel Management", "Sports & Physical Education",
  "Environmental Science & Sustainability", "Renewable Energy", "Research & Development", "Pharmaceutical Research", "Food Technology",
  "Logistics & Supply Chain Management", "Entrepreneurship & Innovation", "Public Administration", "Defence & Security Studies", "Other / Interdisciplinary Studies",
] as const;
export type EducationSector = (typeof educationSectors)[number];

export type Course = { name: string; sector: EducationSector };

const H: EducationSector = "Humanities & Social Sciences";
const CS: EducationSector = "Computer Science & IT";
const DS: EducationSector = "Data Science & Analytics";
const AI: EducationSector = "Artificial Intelligence & Machine Learning";
const BIO: EducationSector = "Biotechnology & Life Sciences";
const RD: EducationSector = "Research & Development";
const ENV: EducationSector = "Environmental Science & Sustainability";
const AGRI: EducationSector = "Agriculture & Agritech";
const MGMT: EducationSector = "Management & Business Administration";
const FIN: EducationSector = "Finance & Banking";
const COM: EducationSector = "Commerce & Accounting";
const ENG: EducationSector = "Engineering & Technology";
const EEE: EducationSector = "Electrical & Electronics";
const MED: EducationSector = "Medical & Healthcare";
const NUR: EducationSector = "Nursing & Paramedical";
const DES: EducationSector = "Design & Fashion";
const MEDIA: EducationSector = "Media & Journalism";

const withPrefix = (prefix: string, list: [string, EducationSector][]): Course[] => list.map(([name, sector]) => ({ name: `${prefix} ${name}`, sector }));

export const ugCourses: Course[] = [
  ...withPrefix("BA", [["English", H], ["Hindi", H], ["History", H], ["Political Science", H], ["Sociology", H], ["Geography", H], ["Philosophy", H], ["Economics", "Economics"], ["Psychology", "Psychology & Mental Health"], ["Public Administration", "Public Administration"], ["Sanskrit", H], ["Urdu", H], ["Fine Arts", DES], ["Music", H], ["Journalism", MEDIA], ["Social Work", H], ["Anthropology", H], ["Home Science", H], ["Education", "Education & Teaching"], ["Defence Studies", "Defence & Security Studies"], ["Physical Education", "Sports & Physical Education"], ["Mass Communication", MEDIA], ["Archaeology", H], ["Linguistics", H], ["Tourism", "Hospitality & Tourism"]]),
  ...withPrefix("BSc", [["Physics", RD], ["Chemistry", RD], ["Mathematics", RD], ["Botany", BIO], ["Zoology", BIO], ["Statistics", DS], ["Computer Science", CS], ["Information Technology", CS], ["Data Science", DS], ["Artificial Intelligence", AI], ["Robotics", "Robotics & Automation"], ["Cyber Security", "Cyber Security"], ["Biotechnology", BIO], ["Microbiology", BIO], ["Biochemistry", BIO], ["Genetics", BIO], ["Forensic Science", RD], ["Environmental Science", ENV], ["Agriculture", AGRI], ["Horticulture", AGRI], ["Forestry", AGRI], ["Food Technology", "Food Technology"], ["Nutrition & Dietetics", MED], ["Nursing", NUR], ["Medical Laboratory Technology", NUR], ["Radiology & Imaging", NUR], ["Optometry", MED], ["Aviation", "Aerospace & Aviation"], ["Animation", DES], ["Fashion Technology", DES], ["Hotel Management", "Hotel Management"], ["Psychology", "Psychology & Mental Health"], ["Economics", "Economics"], ["Geology", ENV], ["Electronics", EEE], ["Interior Design", DES], ["Renewable Energy", "Renewable Energy"], ["Sports Science", "Sports & Physical Education"]]),
  ...withPrefix("BTech", [["Computer Science & Engineering", CS], ["AI & Machine Learning", AI], ["Data Science", DS], ["Cyber Security", "Cyber Security"], ["Information Technology", CS], ["Electronics & Communication", EEE], ["Electrical & Electronics", EEE], ["Mechanical Engineering", "Mechanical Engineering"], ["Civil Engineering", "Civil Engineering"], ["Chemical Engineering", ENG], ["Aerospace Engineering", "Aerospace & Aviation"], ["Aeronautical Engineering", "Aerospace & Aviation"], ["Biotechnology", BIO], ["Biomedical Engineering", MED], ["Robotics & Automation", "Robotics & Automation"], ["Mechatronics", "Robotics & Automation"], ["Automobile Engineering", "Mechanical Engineering"], ["Agricultural Engineering", AGRI], ["Food Technology", "Food Technology"], ["Environmental Engineering", ENV], ["Petroleum Engineering", ENG], ["Mining Engineering", ENG], ["Textile Engineering", ENG], ["Instrumentation Engineering", EEE], ["Renewable Energy", "Renewable Energy"], ["Production & Industrial Engineering", ENG]]),
  ...withPrefix("BE", [["Computer Engineering", CS], ["Mechanical Engineering", "Mechanical Engineering"], ["Civil Engineering", "Civil Engineering"], ["Electrical Engineering", EEE], ["Electronics Engineering", EEE]]),
  ...withPrefix("BCom", [["General", COM], ["Honours", COM], ["Accounting & Finance", COM], ["Banking & Insurance", FIN], ["Taxation", COM], ["Computer Applications", COM], ["E-Commerce", COM], ["International Business", MGMT]]),
  ...withPrefix("BBA", [["General", MGMT], ["Finance", FIN], ["Marketing", MGMT], ["Human Resources", MGMT], ["International Business", MGMT], ["Business Analytics", DS], ["Entrepreneurship", "Entrepreneurship & Innovation"], ["Logistics", "Logistics & Supply Chain Management"], ["Aviation Management", "Aerospace & Aviation"], ["Hospital Management", MED], ["Digital Marketing", MEDIA], ["Retail Management", MGMT]]),
  ...withPrefix("BCA", [["General", CS], ["AI & ML", AI], ["Cloud Computing", CS], ["Data Analytics", DS], ["Cyber Security", "Cyber Security"], ["Full Stack Development", CS]]),
  ...([["MBBS", MED], ["BDS", "Dental Science"], ["BAMS", MED], ["BHMS", MED], ["BUMS", MED], ["BSMS", MED], ["BNYS", MED], ["BPT – Bachelor of Physiotherapy", MED], ["BOT – Bachelor of Occupational Therapy", MED], ["BPharm", "Pharmacy"], ["DPharm", "Pharmacy"], ["PharmD", "Pharmacy"], ["GNM Nursing", NUR], ["ANM Nursing", NUR], ["BASLP – Audiology & Speech", NUR], ["BVSc & AH – Veterinary Science", AGRI], ["BArch", "Architecture & Urban Planning"], ["BPlan", "Architecture & Urban Planning"], ["BDes", DES], ["BFA", DES], ["BSW", H], ["LLB", "Law & Legal Studies"], ["BA LLB", "Law & Legal Studies"], ["BBA LLB", "Law & Legal Studies"], ["BCom LLB", "Law & Legal Studies"], ["BJMC", MEDIA], ["BHM", "Hotel Management"], ["BHMCT", "Hotel Management"], ["BEd", "Education & Teaching"], ["BPEd", "Sports & Physical Education"], ["BLib", "Education & Teaching"], ["BTTM – Travel & Tourism", "Hospitality & Tourism"], ["BMS – Management Studies", MGMT], ["BVoc", "Other / Interdisciplinary Studies"], ["Diploma in Engineering (Polytechnic)", ENG]] as [string, EducationSector][]).map(([name, sector]) => ({ name, sector })),
];

export const pgCourses: Course[] = [
  ...withPrefix("MA", [["English", H], ["Hindi", H], ["History", H], ["Political Science", H], ["Sociology", H], ["Geography", H], ["Philosophy", H], ["Economics", "Economics"], ["Psychology", "Psychology & Mental Health"], ["Public Administration", "Public Administration"], ["Sanskrit", H], ["Education", "Education & Teaching"], ["Journalism", MEDIA], ["Fine Arts", DES], ["Music", H], ["Anthropology", H], ["Defence Studies", "Defence & Security Studies"], ["Linguistics", H], ["Development Studies", H], ["Urdu", H], ["Archaeology", H], ["Mass Communication", MEDIA], ["Women's Studies", H]]),
  ...withPrefix("MSc", [["Physics", RD], ["Chemistry", RD], ["Mathematics", RD], ["Botany", BIO], ["Zoology", BIO], ["Statistics", DS], ["Computer Science", CS], ["Information Technology", CS], ["Data Science", DS], ["Artificial Intelligence", AI], ["Robotics", "Robotics & Automation"], ["Cyber Security", "Cyber Security"], ["Biotechnology", BIO], ["Microbiology", BIO], ["Biochemistry", BIO], ["Genetics", BIO], ["Bioinformatics", BIO], ["Forensic Science", RD], ["Environmental Science", ENV], ["Agriculture", AGRI], ["Horticulture", AGRI], ["Food Technology", "Food Technology"], ["Nutrition & Dietetics", MED], ["Nursing", NUR], ["Clinical Research", "Pharmaceutical Research"], ["Psychology", "Psychology & Mental Health"], ["Economics", "Economics"], ["Geology", ENV], ["Electronics", EEE], ["Renewable Energy", "Renewable Energy"], ["Medical Laboratory Technology", NUR], ["Animation", DES], ["Interior Design", DES], ["Sports Science", "Sports & Physical Education"], ["Fashion Design", DES]]),
  ...withPrefix("MTech", [["Computer Science & Engineering", CS], ["Artificial Intelligence", AI], ["Data Science", DS], ["Cyber Security", "Cyber Security"], ["Robotics", "Robotics & Automation"], ["Mechanical Engineering", "Mechanical Engineering"], ["Civil Engineering", "Civil Engineering"], ["Structural Engineering", "Civil Engineering"], ["Electrical Engineering", EEE], ["Electronics", EEE], ["VLSI Design", EEE], ["Embedded Systems", EEE], ["Biotechnology", BIO], ["Biomedical Engineering", MED], ["Aerospace Engineering", "Aerospace & Aviation"], ["Industrial Engineering", ENG], ["Environmental Engineering", ENV], ["Food Technology", "Food Technology"], ["Renewable Energy", "Renewable Energy"], ["Power Systems", EEE], ["Thermal Engineering", "Mechanical Engineering"], ["Transportation Engineering", "Civil Engineering"], ["Geotechnical Engineering", "Civil Engineering"], ["Chemical Engineering", ENG]]),
  ...withPrefix("ME", [["Computer Engineering", CS], ["Mechanical Engineering", "Mechanical Engineering"], ["Civil Engineering", "Civil Engineering"], ["Electrical Engineering", EEE], ["Electronics Engineering", EEE]]),
  ...withPrefix("MBA", [["General", MGMT], ["Finance", FIN], ["Marketing", MGMT], ["Human Resources", MGMT], ["Operations", MGMT], ["International Business", MGMT], ["Business Analytics", DS], ["Healthcare Management", MED], ["Hospital Management", MED], ["Supply Chain Management", "Logistics & Supply Chain Management"], ["Entrepreneurship", "Entrepreneurship & Innovation"], ["Digital Marketing", MEDIA], ["Information Technology", CS], ["Retail Management", MGMT], ["Banking & Finance", FIN], ["Business Economics", "Economics"], ["Project Management", MGMT], ["Agribusiness", AGRI], ["Rural Management", MGMT], ["Tourism Management", "Hospitality & Tourism"], ["Aviation Management", "Aerospace & Aviation"], ["Pharmaceutical Management", "Pharmacy"], ["Media Management", MEDIA], ["Sports Management", "Sports & Physical Education"]]),
  ...withPrefix("MCA", [["General", CS], ["AI & ML", AI], ["Cloud Computing", CS], ["Data Science", DS], ["Cyber Security", "Cyber Security"]]),
  ...withPrefix("MCom", [["General", COM], ["Finance", FIN], ["Accounting & Taxation", COM], ["Banking", FIN]]),
  ...([["MD General Medicine", MED], ["MD Paediatrics", MED], ["MD Dermatology", MED], ["MD Radiology", MED], ["MD Anaesthesiology", MED], ["MD Psychiatry", "Psychology & Mental Health"], ["MS General Surgery", MED], ["MS Orthopaedics", MED], ["MS Ophthalmology", MED], ["MS ENT", MED], ["MS Obstetrics & Gynaecology", MED], ["MDS", "Dental Science"], ["MPharm", "Pharmacy"], ["MPH – Public Health", MED], ["MPT – Physiotherapy", MED], ["MOT – Occupational Therapy", MED], ["MArch", "Architecture & Urban Planning"], ["MPlan", "Architecture & Urban Planning"], ["MDes", DES], ["MFA", DES], ["MSW", H], ["LLM", "Law & Legal Studies"], ["MJMC", MEDIA], ["MEd", "Education & Teaching"], ["MPEd", "Sports & Physical Education"], ["MLib", "Education & Teaching"], ["MHM – Hotel Management", "Hotel Management"], ["MTTM – Travel & Tourism", "Hospitality & Tourism"], ["MVSc – Veterinary Science", AGRI], ["MS by Research (Engineering)", RD], ["PG Diploma in Management", MGMT]] as [string, EducationSector][]).map(([name, sector]) => ({ name, sector })),
];

export function coursesFor(level: "ug" | "pg", sector: string): Course[] {
  const list = level === "ug" ? ugCourses : pgCourses;
  return sector && sector !== "Other / Interdisciplinary Studies" ? list.filter(c => c.sector === sector) : list;
}

export const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export const schoolClasses = ["4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;
export const schoolTypes = ["Government", "Private", "Government-Aided", "Other"] as const;
export const schoolBoards = ["CBSE", "ICSE", "State Board", "IB", "Other"] as const;
export const ugYears = ["1st", "2nd", "3rd", "4th", "5th", "Other"] as const;
export const pgYears = ["1st", "2nd", "Other"] as const;
export const studyModes = ["Regular", "Distance", "Online"] as const;
export const genders = ["Female", "Male", "Other", "Prefer not to say"] as const;
export const guardianRelationships = ["Father", "Mother", "Legal Guardian", "Other"] as const;
export const coordinatorTypes = ["RILOYD Employee", "School Coordinator", "College Coordinator", "University Coordinator", "Institutional Representative", "Independent Student Coordinator", "Other"] as const;
