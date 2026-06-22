export type CodeItem = { code: string; description: string; providerLabel?: string };
export type OrderItem = { id: string; label: string; baseLabel?: string; company?: string; detail: string; checked: boolean; relatedIcd?: string };

export type OrderSetChild = {
  id: string;
  label: string;       // base label, matches ordersPool baseLabel for company lookup
  type: "lab" | "imaging";
  company: string;
  relatedIcd?: string;
  checked: boolean;
};

export type OrderSetItem = {
  id: string;
  label: string;
  baseLabel?: string;
  defaultLabCompany?: string;     // vendor for lab-type children
  defaultImagingCompany?: string; // vendor for imaging-type children
  relatedIcd?: string;
  children: OrderSetChild[];
};

// Pool entry for the set-title picker (always has baseLabel)
export type OrderSetPoolItem = {
  id: string;
  baseLabel: string;
  defaultLabCompany?: string;
  defaultImagingCompany?: string;
  relatedIcd?: string;
  children: OrderSetChild[];
};

// ─── Code pools ───────────────────────────────────────────────────────────────

export const icd10Pool: CodeItem[] = [
  { code: "R07.9",   providerLabel: "Chest pain",                     description: "Chest pain, unspecified" },
  { code: "R07.1",   providerLabel: "Pleuritic chest pain",           description: "Chest pain on breathing" },
  { code: "R07.2",   providerLabel: "Precordial chest pain",          description: "Precordial pain" },
  { code: "R07.89",  providerLabel: "Atypical chest pain",            description: "Other chest pain" },
  { code: "I10",     providerLabel: "High blood pressure",            description: "Essential (primary) hypertension" },
  { code: "I11.9",   providerLabel: "Hypertensive heart disease",     description: "Hypertensive heart disease without heart failure" },
  { code: "I20.9",   providerLabel: "Angina",                         description: "Angina pectoris, unspecified" },
  { code: "I21.9",   providerLabel: "Heart attack",                   description: "Acute myocardial infarction, unspecified" },
  { code: "I25.10",  providerLabel: "Coronary artery disease",        description: "Atherosclerotic heart disease of native coronary artery" },
  { code: "E78.5",   providerLabel: "High cholesterol",               description: "Hyperlipidemia, unspecified" },
  { code: "E78.00",  providerLabel: "High LDL",                       description: "Pure hypercholesterolemia, unspecified" },
  { code: "E78.1",   providerLabel: "High triglycerides",             description: "Pure hyperglyceridemia" },
  { code: "E11.9",   providerLabel: "Type 2 diabetes",                description: "Type 2 diabetes mellitus without complications" },
  { code: "Z82.49",  providerLabel: "Family Hx of heart disease",     description: "Family history of ischemic heart disease" },
  { code: "R00.0",   providerLabel: "Fast heart rate",                description: "Tachycardia, unspecified" },
  { code: "R00.1",   providerLabel: "Slow heart rate",                description: "Bradycardia, unspecified" },
  { code: "J18.9",   providerLabel: "Pneumonia",                      description: "Pneumonia, unspecified organism" },
  { code: "M54.6",   providerLabel: "Mid-back pain",                  description: "Pain in thoracic spine" },
  // Ankle / foot
  { code: "S93.401", providerLabel: "Right ankle sprain",             description: "Sprain of unspecified ligament of right ankle" },
  { code: "S93.402", providerLabel: "Left ankle sprain",              description: "Sprain of unspecified ligament of left ankle" },
  { code: "S93.601", providerLabel: "Right foot sprain",              description: "Sprain of right foot, unspecified" },
  { code: "M25.371", providerLabel: "Right ankle stiffness",          description: "Stiffness of right ankle, not elsewhere classified" },
  { code: "M79.671", providerLabel: "Right foot pain",                description: "Pain in right foot" },
];

export const cptPool: CodeItem[] = [
  { code: "99213", description: "Office visit, low medical decision making" },
  { code: "99214", description: "Office visit, moderate medical decision making" },
  { code: "99215", description: "Office visit, high medical decision making" },
  { code: "93000", description: "Electrocardiogram, routine ECG with interpretation" },
  { code: "93010", description: "ECG, interpretation and report only" },
  { code: "71046", description: "Chest X-ray, 2 views" },
  { code: "71048", description: "Chest X-ray, 4 or more views" },
  { code: "71250", description: "CT chest, without contrast" },
  { code: "93306", description: "Echocardiography, complete with Doppler" },
  { code: "80048", description: "Basic Metabolic Panel" },
  { code: "80053", description: "Comprehensive Metabolic Panel" },
  { code: "85025", description: "CBC with automated differential" },
  { code: "83036", description: "Hemoglobin A1c" },
  { code: "48066", description: "D-Dimer, quantitative" },
  { code: "73600", description: "Ankle X-ray, 2 views" },
  { code: "73610", description: "Ankle X-ray, minimum 3 views" },
  { code: "73620", description: "Foot X-ray, 2 views" },
  { code: "73630", description: "Foot X-ray, minimum 3 views" },
];

export const icd10Adjacent: Record<string, string[]> = {
  "R07.9":   ["R07.1", "R07.2", "R07.89", "I20.9", "I21.9"],
  "R07.1":   ["R07.9", "R07.2", "R07.89", "J18.9", "M54.6"],
  "I10":     ["I11.9", "I20.9", "I25.10"],
  "E78.5":   ["E78.00", "E78.1", "E11.9"],
  "Z82.49":  ["I25.10", "I20.9", "I21.9"],
  "S93.401": ["S93.402", "S93.601", "M25.371", "M79.671"],
  "S93.402": ["S93.401", "S93.601", "M25.371"],
  "S93.601": ["S93.401", "S93.402", "M79.671"],
};

export const cptAdjacent: Record<string, string[]> = {
  "99214": ["99213", "99215"],
  "99213": ["99214", "99215"],
  "93000": ["93010", "71046", "93306"],
  "93010": ["93000", "93306", "71046"],
  "71046": ["93000", "71048", "93306"],
  "73610": ["73600", "73620", "73630"],
  "73600": ["73610", "73620", "73630"],
  "73620": ["73630", "73600", "73610"],
  "73630": ["73620", "73600", "73610"],
};

// ─── Orders pool ──────────────────────────────────────────────────────────────

export const ordersPool: Array<{ id: string; label: string; baseLabel?: string; company?: string; detail: string; relatedIcd?: string }> = [
  // ECG
  { id: "ecg-inhouse",       baseLabel: "ECG 12-lead",               company: "In-house",  label: "ECG 12-lead (In-house)",                detail: "In-office",            relatedIcd: "R07.9" },
  { id: "ecg-cardiology",    baseLabel: "ECG 12-lead",               company: "Cardiology", label: "ECG 12-lead (Cardiology)",              detail: "Cardiology referral",   relatedIcd: "R07.9" },
  // Chest X-ray PA & Lateral
  { id: "cxr-pa-inhouse",    baseLabel: "Chest X-ray, PA & Lateral", company: "In-house",  label: "Chest X-ray, PA & Lateral (In-house)",  detail: "In-office",            relatedIcd: "R07.9" },
  { id: "cxr-pa-radnet",     baseLabel: "Chest X-ray, PA & Lateral", company: "RadNet",    label: "Chest X-ray, PA & Lateral (RadNet)",    detail: "RadNet Imaging",       relatedIcd: "R07.9" },
  { id: "cxr-pa-simonmed",   baseLabel: "Chest X-ray, PA & Lateral", company: "SimonMed",  label: "Chest X-ray, PA & Lateral (SimonMed)",  detail: "SimonMed Imaging",     relatedIcd: "R07.9" },
  // Chest X-ray 2-view (kept for adjacency)
  { id: "cxr-inhouse",       baseLabel: "Chest X-ray, 2-view",       company: "In-house",  label: "Chest X-ray, 2-view (In-house)",        detail: "In-office",            relatedIcd: "R07.9" },
  { id: "cxr-radnet",        baseLabel: "Chest X-ray, 2-view",       company: "RadNet",    label: "Chest X-ray, 2-view (RadNet)",          detail: "RadNet Imaging",       relatedIcd: "R07.9" },
  // Echocardiogram
  { id: "echo-inhouse",      baseLabel: "Echocardiogram",            company: "In-house",  label: "Echocardiogram (In-house)",             detail: "In-office",            relatedIcd: "I25.10" },
  { id: "echo-cardiology",   baseLabel: "Echocardiogram",            company: "Cardiology", label: "Echocardiogram (Cardiology)",           detail: "Cardiology referral",   relatedIcd: "I25.10" },
  // Stress test
  { id: "stress-inhouse",    baseLabel: "Stress Test",               company: "In-house",  label: "Stress Test (In-house)",                detail: "Treadmill, in-office",  relatedIcd: "I20.9" },
  { id: "stress-cardiology", baseLabel: "Stress Test",               company: "Cardiology", label: "Stress Test (Cardiology)",              detail: "Treadmill, cardiology",  relatedIcd: "I20.9" },
  // D-Dimer
  { id: "ddimer-quest",      baseLabel: "D-Dimer",                   company: "Quest",     label: "D-Dimer (Quest)",                       detail: "Quest Diagnostics",    relatedIcd: "R07.9" },
  { id: "ddimer-labcorp",    baseLabel: "D-Dimer",                   company: "Labcorp",   label: "D-Dimer (Labcorp)",                     detail: "Labcorp",              relatedIcd: "R07.9" },
  // Troponin
  { id: "trop-quest",        baseLabel: "Troponin I, High-Sensitivity", company: "Quest",  label: "Troponin I, High-Sensitivity (Quest)",  detail: "Quest Diagnostics",    relatedIcd: "R07.9" },
  { id: "trop-labcorp",      baseLabel: "Troponin I, High-Sensitivity", company: "Labcorp", label: "Troponin I, High-Sensitivity (Labcorp)", detail: "Labcorp",             relatedIcd: "R07.9" },
  // BMP
  { id: "bmp-quest",         baseLabel: "Basic Metabolic Panel",     company: "Quest",     label: "Basic Metabolic Panel (Quest)",         detail: "Quest Diagnostics",    relatedIcd: "I10" },
  { id: "bmp-labcorp",       baseLabel: "Basic Metabolic Panel",     company: "Labcorp",   label: "Basic Metabolic Panel (Labcorp)",       detail: "Labcorp",              relatedIcd: "I10" },
  // CMP
  { id: "cmp-quest",         baseLabel: "Comprehensive Metabolic Panel", company: "Quest", label: "Comprehensive Metabolic Panel (Quest)", detail: "Quest Diagnostics",    relatedIcd: "I10" },
  { id: "cmp-labcorp",       baseLabel: "Comprehensive Metabolic Panel", company: "Labcorp", label: "Comprehensive Metabolic Panel (Labcorp)", detail: "Labcorp",           relatedIcd: "I10" },
  // CBC
  { id: "cbc-quest",         baseLabel: "CBC with Differential",     company: "Quest",     label: "CBC with Differential (Quest)",         detail: "Quest Diagnostics" },
  { id: "cbc-labcorp",       baseLabel: "CBC with Differential",     company: "Labcorp",   label: "CBC with Differential (Labcorp)",       detail: "Labcorp" },
  // Lipid
  { id: "lipid-quest",       baseLabel: "Lipid Panel",               company: "Quest",     label: "Lipid Panel (Quest)",                   detail: "Quest Diagnostics",    relatedIcd: "E78.5" },
  { id: "lipid-labcorp",     baseLabel: "Lipid Panel",               company: "Labcorp",   label: "Lipid Panel (Labcorp)",                 detail: "Labcorp",              relatedIcd: "E78.5" },
  // A1c
  { id: "a1c-quest",              baseLabel: "Hemoglobin A1c",                   company: "Quest",     label: "Hemoglobin A1c (Quest)",                            detail: "Quest Diagnostics",    relatedIcd: "E11.9" },
  { id: "a1c-labcorp",            baseLabel: "Hemoglobin A1c",                   company: "Labcorp",   label: "Hemoglobin A1c (Labcorp)",                          detail: "Labcorp",              relatedIcd: "E11.9" },
  // Ankle X-ray — 2 views (AP & lateral)
  { id: "ankle-xr-2v-inhouse",    baseLabel: "Ankle X-ray, 2 views",             company: "In-house",  label: "Ankle X-ray, 2 views (In-house)",                   detail: "In-office",            relatedIcd: "S93.401" },
  { id: "ankle-xr-2v-radnet",     baseLabel: "Ankle X-ray, 2 views",             company: "RadNet",    label: "Ankle X-ray, 2 views (RadNet)",                     detail: "RadNet Imaging",       relatedIcd: "S93.401" },
  { id: "ankle-xr-2v-simonmed",   baseLabel: "Ankle X-ray, 2 views",             company: "SimonMed",  label: "Ankle X-ray, 2 views (SimonMed)",                   detail: "SimonMed Imaging",     relatedIcd: "S93.401" },
  // Ankle X-ray — 3 views (AP, lateral & mortise) — standard for acute ankle sprain
  { id: "ankle-xr-3v-inhouse",    baseLabel: "Ankle X-ray, 3 views",             company: "In-house",  label: "Ankle X-ray, 3 views (In-house)",                   detail: "In-office",            relatedIcd: "S93.401" },
  { id: "ankle-xr-3v-radnet",     baseLabel: "Ankle X-ray, 3 views",             company: "RadNet",    label: "Ankle X-ray, 3 views (RadNet)",                     detail: "RadNet Imaging",       relatedIcd: "S93.401" },
  { id: "ankle-xr-3v-simonmed",   baseLabel: "Ankle X-ray, 3 views",             company: "SimonMed",  label: "Ankle X-ray, 3 views (SimonMed)",                   detail: "SimonMed Imaging",     relatedIcd: "S93.401" },
  // Ankle X-ray — stress views (for ligament integrity evaluation)
  { id: "ankle-xr-stress-radnet",   baseLabel: "Ankle X-ray, stress views",      company: "RadNet",    label: "Ankle X-ray, stress views (RadNet)",                detail: "RadNet Imaging",       relatedIcd: "S93.401" },
  { id: "ankle-xr-stress-simonmed", baseLabel: "Ankle X-ray, stress views",      company: "SimonMed",  label: "Ankle X-ray, stress views (SimonMed)",              detail: "SimonMed Imaging",     relatedIcd: "S93.401" },
  // Foot X-ray — 2 views
  { id: "foot-xr-2v-inhouse",     baseLabel: "Foot X-ray, 2 views",              company: "In-house",  label: "Foot X-ray, 2 views (In-house)",                    detail: "In-office",            relatedIcd: "S93.601" },
  { id: "foot-xr-2v-radnet",      baseLabel: "Foot X-ray, 2 views",              company: "RadNet",    label: "Foot X-ray, 2 views (RadNet)",                      detail: "RadNet Imaging",       relatedIcd: "S93.601" },
  { id: "foot-xr-2v-simonmed",    baseLabel: "Foot X-ray, 2 views",              company: "SimonMed",  label: "Foot X-ray, 2 views (SimonMed)",                    detail: "SimonMed Imaging",     relatedIcd: "S93.601" },
  // Foot X-ray — 3 views (AP, lateral & oblique)
  { id: "foot-xr-3v-inhouse",     baseLabel: "Foot X-ray, 3 views",              company: "In-house",  label: "Foot X-ray, 3 views (In-house)",                    detail: "In-office",            relatedIcd: "S93.601" },
  { id: "foot-xr-3v-radnet",      baseLabel: "Foot X-ray, 3 views",              company: "RadNet",    label: "Foot X-ray, 3 views (RadNet)",                      detail: "RadNet Imaging",       relatedIcd: "S93.601" },
  // Ankle MRI (no contrast) — for ligament/tendon evaluation
  { id: "ankle-mri-radnet",        baseLabel: "Ankle MRI, without contrast",      company: "RadNet",    label: "Ankle MRI, without contrast (RadNet)",              detail: "RadNet Imaging",       relatedIcd: "S93.401" },
  { id: "ankle-mri-simonmed",      baseLabel: "Ankle MRI, without contrast",      company: "SimonMed",  label: "Ankle MRI, without contrast (SimonMed)",            detail: "SimonMed Imaging",     relatedIcd: "S93.401" },
];

export const ordersAdjacent: Record<string, string[]> = {
  "ecg-inhouse":       ["ecg-cardiology",    "stress-inhouse",    "echo-inhouse",    "cxr-pa-inhouse"],
  "ecg-cardiology":    ["ecg-inhouse",       "stress-cardiology", "echo-cardiology", "cxr-pa-radnet"],
  "cxr-pa-inhouse":    ["cxr-pa-radnet",     "cxr-pa-simonmed",   "cxr-inhouse",     "ecg-inhouse"],
  "cxr-pa-radnet":     ["cxr-pa-inhouse",    "cxr-pa-simonmed",   "cxr-radnet",      "ecg-cardiology"],
  "cxr-pa-simonmed":   ["cxr-pa-radnet",     "cxr-pa-inhouse",    "cxr-radnet"],
  "cxr-inhouse":       ["cxr-radnet",        "cxr-pa-inhouse",    "ecg-inhouse",     "echo-inhouse"],
  "cxr-radnet":        ["cxr-inhouse",       "cxr-pa-radnet",     "ecg-cardiology",  "echo-cardiology"],
  "echo-inhouse":      ["echo-cardiology",   "stress-inhouse",    "ecg-inhouse"],
  "echo-cardiology":   ["echo-inhouse",      "stress-cardiology", "ecg-cardiology"],
  "stress-inhouse":    ["stress-cardiology", "echo-inhouse",      "ecg-inhouse"],
  "stress-cardiology": ["stress-inhouse",    "echo-cardiology",   "ecg-cardiology"],
  "ddimer-quest":      ["ddimer-labcorp",    "trop-quest",        "bmp-quest"],
  "ddimer-labcorp":    ["ddimer-quest",      "trop-labcorp",      "bmp-labcorp"],
  "trop-quest":        ["trop-labcorp",      "bmp-quest",         "ddimer-quest",    "cbc-quest"],
  "trop-labcorp":      ["trop-quest",        "bmp-labcorp",       "ddimer-labcorp",  "cbc-labcorp"],
  "bmp-quest":         ["bmp-labcorp",       "cmp-quest",         "trop-quest"],
  "bmp-labcorp":       ["bmp-quest",         "cmp-labcorp",       "trop-labcorp"],
  "cmp-quest":         ["cmp-labcorp",       "bmp-quest",         "a1c-quest"],
  "cmp-labcorp":       ["cmp-quest",         "bmp-labcorp",       "a1c-labcorp"],
  "cbc-quest":         ["cbc-labcorp",       "bmp-quest",         "cmp-quest"],
  "cbc-labcorp":       ["cbc-quest",         "bmp-labcorp",       "cmp-labcorp"],
  "lipid-quest":       ["lipid-labcorp",     "a1c-quest",         "cmp-quest"],
  "lipid-labcorp":     ["lipid-quest",       "a1c-labcorp",       "cmp-labcorp"],
  "a1c-quest":              ["a1c-labcorp",            "lipid-quest",            "cmp-quest"],
  "a1c-labcorp":            ["a1c-quest",              "lipid-labcorp",          "cmp-labcorp"],
  // Ankle / foot X-ray adjacency — suggest across view-count and modality variants
  "ankle-xr-2v-inhouse":    ["ankle-xr-3v-inhouse",   "foot-xr-2v-inhouse",   "ankle-xr-2v-radnet",   "ankle-xr-2v-simonmed"],
  "ankle-xr-2v-radnet":     ["ankle-xr-3v-radnet",    "ankle-xr-2v-inhouse",  "foot-xr-2v-radnet",    "ankle-xr-stress-radnet"],
  "ankle-xr-2v-simonmed":   ["ankle-xr-3v-simonmed",  "ankle-xr-2v-radnet",   "ankle-xr-stress-simonmed"],
  "ankle-xr-3v-inhouse":    ["ankle-xr-2v-inhouse",   "foot-xr-3v-inhouse",   "ankle-xr-3v-radnet",   "ankle-xr-3v-simonmed"],
  "ankle-xr-3v-radnet":     ["ankle-xr-3v-inhouse",   "ankle-xr-2v-radnet",   "ankle-xr-stress-radnet", "ankle-mri-radnet", "foot-xr-3v-radnet"],
  "ankle-xr-3v-simonmed":   ["ankle-xr-3v-inhouse",   "ankle-xr-2v-simonmed", "ankle-xr-stress-simonmed", "ankle-mri-simonmed"],
  "ankle-xr-stress-radnet":   ["ankle-xr-3v-radnet",  "ankle-mri-radnet",     "ankle-xr-stress-simonmed"],
  "ankle-xr-stress-simonmed": ["ankle-xr-3v-simonmed","ankle-mri-simonmed",   "ankle-xr-stress-radnet"],
  "foot-xr-2v-inhouse":     ["foot-xr-3v-inhouse",    "ankle-xr-2v-inhouse",  "foot-xr-2v-radnet"],
  "foot-xr-2v-radnet":      ["foot-xr-3v-radnet",     "foot-xr-2v-inhouse",   "ankle-xr-2v-radnet",   "foot-xr-2v-simonmed"],
  "foot-xr-2v-simonmed":    ["foot-xr-2v-radnet",     "ankle-xr-2v-simonmed"],
  "foot-xr-3v-inhouse":     ["foot-xr-2v-inhouse",    "ankle-xr-3v-inhouse",  "foot-xr-3v-radnet"],
  "foot-xr-3v-radnet":      ["foot-xr-3v-inhouse",    "foot-xr-2v-radnet",    "ankle-xr-3v-radnet"],
  "ankle-mri-radnet":        ["ankle-xr-3v-radnet",   "ankle-xr-stress-radnet", "ankle-mri-simonmed"],
  "ankle-mri-simonmed":      ["ankle-xr-3v-simonmed", "ankle-xr-stress-simonmed", "ankle-mri-radnet"],
};

// ─── Initial screen state ─────────────────────────────────────────────────────

export const initialIcd10: CodeItem[] = [
  { code: "R07.9",   providerLabel: "Chest pain",                description: "Chest pain, unspecified" },
  { code: "I10",     providerLabel: "High blood pressure",       description: "Essential (primary) hypertension" },
  { code: "E78.5",   providerLabel: "High cholesterol",          description: "Hyperlipidemia, unspecified" },
  { code: "Z82.49",  providerLabel: "Family Hx of heart disease", description: "Family history of ischemic heart disease" },
  { code: "S93.401", providerLabel: "Right ankle sprain",        description: "Sprain of unspecified ligament of right ankle" },
];

export const initialCpt: CodeItem[] = [
  { code: "99214", description: "Office visit, moderate medical decision making" },
  { code: "93000", description: "Electrocardiogram, routine ECG with interpretation" },
  { code: "73610", description: "Ankle X-ray, minimum 3 views" },
];

export const initialOrders: OrderItem[] = [
  { id: "ecg-inhouse",       label: "ECG 12-lead (In-house)",       baseLabel: "ECG 12-lead",      company: "In-house", detail: "In-office",        checked: true, relatedIcd: "R07.9"   },
  { id: "ddimer-quest",      label: "D-Dimer (Quest)",              baseLabel: "D-Dimer",           company: "Quest",    detail: "Quest Diagnostics", checked: true, relatedIcd: "R07.9"   },
  { id: "ankle-xr-3v-radnet", label: "Ankle X-ray, 3 views (RadNet)", baseLabel: "Ankle X-ray, 3 views", company: "RadNet", detail: "RadNet Imaging", checked: true, relatedIcd: "S93.401" },
];

export const initialOrderSets: OrderSetItem[] = [
  {
    id: "set-chest-pain-quest-radnet",
    label: "Chest Pain Workup",
    baseLabel: "Chest Pain Workup",
    defaultLabCompany: "Quest",
    defaultImagingCompany: "RadNet",
    relatedIcd: "R07.9",
    children: [
      { id: "set-trop",    label: "Troponin I, High-Sensitivity", type: "lab",     company: "Quest",  relatedIcd: "R07.9", checked: true },
      { id: "set-bmp",     label: "Basic Metabolic Panel",        type: "lab",     company: "Quest",  relatedIcd: "I10",   checked: true },
      { id: "set-cbc",     label: "CBC with Differential",        type: "lab",     company: "Quest",                       checked: true },
      { id: "set-cxr-pa",  label: "Chest X-ray, PA & Lateral",   type: "imaging", company: "RadNet", relatedIcd: "R07.9", checked: true },
    ],
  },
];

// ─── Order-set pool ───────────────────────────────────────────────────────────

export const orderSetsPool: OrderSetPoolItem[] = [
  {
    id: "set-chest-pain-quest-radnet",
    baseLabel: "Chest Pain Workup",
    defaultLabCompany: "Quest",
    defaultImagingCompany: "RadNet",
    relatedIcd: "R07.9",
    children: [
      { id: "p1",  label: "Troponin I, High-Sensitivity", type: "lab",     company: "Quest",  relatedIcd: "R07.9", checked: true },
      { id: "p2",  label: "Basic Metabolic Panel",        type: "lab",     company: "Quest",  relatedIcd: "I10",   checked: true },
      { id: "p3",  label: "CBC with Differential",        type: "lab",     company: "Quest",                       checked: true },
      { id: "p4",  label: "Chest X-ray, PA & Lateral",   type: "imaging", company: "RadNet", relatedIcd: "R07.9", checked: true },
    ],
  },
  {
    id: "set-chest-pain-labcorp-radnet",
    baseLabel: "Chest Pain Workup",
    defaultLabCompany: "Labcorp",
    defaultImagingCompany: "RadNet",
    relatedIcd: "R07.9",
    children: [
      { id: "p1l", label: "Troponin I, High-Sensitivity", type: "lab",     company: "Labcorp", relatedIcd: "R07.9", checked: true },
      { id: "p2l", label: "Basic Metabolic Panel",        type: "lab",     company: "Labcorp", relatedIcd: "I10",   checked: true },
      { id: "p3l", label: "CBC with Differential",        type: "lab",     company: "Labcorp",                      checked: true },
      { id: "p4l", label: "Chest X-ray, PA & Lateral",   type: "imaging", company: "RadNet",  relatedIcd: "R07.9", checked: true },
    ],
  },
  {
    id: "set-htn-workup-quest",
    baseLabel: "Hypertension Workup",
    defaultLabCompany: "Quest",
    relatedIcd: "I10",
    children: [
      { id: "h1", label: "Basic Metabolic Panel",  type: "lab", company: "Quest", relatedIcd: "I10",   checked: true },
      { id: "h2", label: "CBC with Differential",  type: "lab", company: "Quest",                      checked: true },
      { id: "h3", label: "Lipid Panel",            type: "lab", company: "Quest", relatedIcd: "E78.5", checked: true },
      { id: "h4", label: "Hemoglobin A1c",         type: "lab", company: "Quest", relatedIcd: "E11.9", checked: true },
    ],
  },
  {
    id: "set-cardiac-imaging-inhouse",
    baseLabel: "Cardiac Imaging Panel",
    defaultImagingCompany: "In-house",
    relatedIcd: "I25.10",
    children: [
      { id: "ci1", label: "ECG 12-lead",    type: "imaging", company: "In-house",  relatedIcd: "R07.9",  checked: true },
      { id: "ci2", label: "Echocardiogram", type: "imaging", company: "In-house",  relatedIcd: "I25.10", checked: true },
      { id: "ci3", label: "Stress Test",    type: "imaging", company: "In-house",  relatedIcd: "I20.9",  checked: true },
    ],
  },
  {
    id: "set-ankle-workup-radnet",
    baseLabel: "Ankle Injury Workup",
    defaultImagingCompany: "RadNet",
    relatedIcd: "S93.401",
    children: [
      { id: "a1", label: "Ankle X-ray, 3 views", type: "imaging", company: "RadNet", relatedIcd: "S93.401", checked: true },
      { id: "a2", label: "Foot X-ray, 2 views",  type: "imaging", company: "RadNet", relatedIcd: "S93.601", checked: true },
    ],
  },
];

export const orderSetsAdjacent: Record<string, string[]> = {
  "set-chest-pain-quest-radnet":   ["set-cardiac-imaging-inhouse"],
  "set-chest-pain-labcorp-radnet": ["set-cardiac-imaging-inhouse"],
  "set-cardiac-imaging-inhouse":   ["set-chest-pain-quest-radnet", "set-chest-pain-labcorp-radnet"],
  "set-htn-workup-quest":          ["set-cardiac-imaging-inhouse"],
};
