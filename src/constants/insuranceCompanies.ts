// Predefined list of insurance companies
export const INSURANCE_COMPANIES = [
  { id: 'lic', name: 'Life Insurance Corporation of India (LIC)', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/LIC_of_India.svg' },
  { id: 'hdfc-life', name: 'HDFC Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg' },
  { id: 'icici-prudential', name: 'ICICI Prudential Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg' },
  { id: 'sbi-life', name: 'SBI Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg' },
  { id: 'max-life', name: 'Max Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/en/6/64/Max_Life_Insurance_logo.svg' },
  { id: 'bajaj-allianz', name: 'Bajaj Allianz Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Bajaj_Allianz_logo.png' },
  { id: 'kotak-mahindra', name: 'Kotak Mahindra Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Kotak_Mahindra_Bank_logo.svg' },
  { id: 'aditya-birla', name: 'Aditya Birla Sun Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Aditya_Birla_Group_Logo.svg' },
  { id: 'tata-aia', name: 'Tata AIA Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg' },
  { id: 'pnb-metlife', name: 'PNB MetLife Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/PNB_new_logo.png' },
  { id: 'canara-hsbc', name: 'Canara HSBC Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Canara_Bank_Logo.svg' },
  { id: 'reliance-nippon', name: 'Reliance Nippon Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/en/8/8e/Reliance_Industries_Logo.svg' },
  { id: 'exide-life', name: 'Exide Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/en/3/3e/Exide_Industries_logo.png' },
  { id: 'indiafirst-life', name: 'IndiaFirst Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/en/2/21/Bank_of_Baroda_logo.svg' },
  { id: 'aegon-life', name: 'Aegon Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Aegon_N.V._Logo.svg' },
  { id: 'edelweiss-tokio', name: 'Edelweiss Tokio Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Edelweiss_Financial_Services_logo.svg' },
  { id: 'aviva-life', name: 'Aviva Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Aviva_Logo.svg' },
  { id: 'shriram-life', name: 'Shriram Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/en/3/33/Shriram_Transport_Finance_Company_logo.svg' },
  { id: 'pramerica-life', name: 'Pramerica Life Insurance', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Prudential_plc_logo.svg' },
] as const;

export type InsuranceCompanyId = typeof INSURANCE_COMPANIES[number]['id'];
