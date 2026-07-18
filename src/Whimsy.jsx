import { useState, useEffect } from "react";
import { X, Sparkles, Trash2, Copy, Check, NotebookPen, TrendingUp, FileText, Scale, Heart, Download, Upload, BookOpen, ChevronDown, ChevronUp, Leaf, Shield, Search, Library, FlaskConical, CalendarCheck, Soup, Flower2, Camera, Palette, Bell, Pill, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Whimsy, by Don't Lose Your Whimsy
// Log your body, keep your proof, know your benefits. Never diagnoses. Always yours.

const SERIF = "'Didot', 'Bodoni 72', 'Playfair Display', 'Baskerville', Georgia, serif";
// Didot/Bodoni are Mac-only; Playfair Display is loaded as a real web font (see index.html)
// so everyone else gets the intended italic-serif brand feel instead of falling through to Georgia.
const BODY = "'Avenir Next', 'Avenir', 'Segoe UI', system-ui, -apple-system, sans-serif";

// COLORS and GRAD are intentionally `let`, not `const`: Whimsy() mutates the accent-carrying
// properties at the top of each render based on the chosen theme, so every sibling component
// declared below (BodyMap, SpoonMeter, TagInput, etc.) picks up the current theme through the
// same shared reference without needing theme threaded through as a prop everywhere.
let COLORS = {
  bg: "#FBF1EC",        // warm blush cream
  ink: "#571F33",       // deep burgundy
  inkSoft: "#835566",   // muted mauve (darkened from #9A6478 to clear 4.5:1 text contrast on bg)
  plum: "#D64F84",      // rose pink, primary (theme accent)
  plumDark: "#A93267",  // deep raspberry (theme accent, dark)
  gold: "#C9A24B",      // gold accent (constant across themes)
  green: "#6BA483",     // sage green day (semantic, constant)
  yellow: "#D4A63F",    // gold yellow day (semantic, constant)
  red: "#C8354F",       // deep rose red day (semantic, constant)
  card: "#FFFFFF",
  line: "#F3D8E0",      // soft pink (theme accent, light)
  pill: "#F7E3E9",      // blush chip (theme accent, lightest)
};

const THEMES = [
  { key: "blush", label: "Blush Rose", plum: "#D64F84", plumDark: "#A93267", pill: "#F7E3E9", line: "#F3D8E0" },
  { key: "berry", label: "Deep Berry", plum: "#8E3B6B", plumDark: "#5C2247", pill: "#EDE0E8", line: "#E5D2E2" },
  { key: "marigold", label: "Marigold", plum: "#C9862F", plumDark: "#8F5A17", pill: "#F7EAD3", line: "#EFDDBB" },
  { key: "sage", label: "Sage", plum: "#5F8F6E", plumDark: "#3C6047", pill: "#E3EDE4", line: "#D3E3D6" },
];

// "glow" is a light highlight/selection-state color derived close to the fill (used for the
// body outline and the ache-selection ring). "feature" is a separate, deliberately higher-
// contrast color for facial contour lines (jaw, cheek, nose, collarbone, bust, navel, spine)
// so the face reads with real definition instead of flattening into the skin fill at every tone.
// Real, warm skin-tone hexes (in the spirit of the widely-vetted emoji/Fitzpatrick-style
// ramp), re-tuned so every stop reads as actual human skin rather than a flat or muddy
// brown — each stays warm (never grey/ashy) and gets richer, not darker-toward-black, as
// the ramp deepens.
const SKIN_TONES = [
  { key: "blush", label: "Blush (default)", fill: "#F6D9DE", glow: "#E3B6BF", feature: "#A9677B" },
  { key: "porcelain", label: "Porcelain", fill: "#FBE3CB", glow: "#EAC8A8", feature: "#A66E42" },
  { key: "light", label: "Light", fill: "#F0C9A0", glow: "#D9A876", feature: "#8A5530" },
  { key: "tan", label: "Tan", fill: "#D9A066", glow: "#BD824C", feature: "#6B3F22" },
  { key: "warm", label: "Warm", fill: "#B9784A", glow: "#9C5F36", feature: "#4A2C16" },
  { key: "rich", label: "Rich", fill: "#8B5A32", glow: "#71431F", feature: "#F0C89C" },
  { key: "deep", label: "Deep", fill: "#5A3825", glow: "#432815", feature: "#E7C39A" },
];

// Body map comes in a few different builds so the silhouette doesn't default to a single
// "ideal" body type. Each scales the same outline horizontally around its center, so limbs,
// waist, and hips all widen together and the tap zones underneath still line up.
// "curve" scales the bust/hip detail overlays independently of the overall frame width
// (scaleX), so the three options read as genuinely different proportions — not just the
// same shape resized. A full per-type outline redesign would need three separate hand-drawn
// silhouettes; this is the safe version that varies proportion without touching the shared
// BODY_OUTLINE path all three sizes rely on.
const BODY_SHAPES = [
  { key: "b1", label: "Body type 1", scaleX: 1.0, curve: 0.78 },
  { key: "b2", label: "Body type 2 (default)", scaleX: 1.16, curve: 1.0 },
  { key: "b3", label: "Body type 3", scaleX: 1.34, curve: 1.3 },
];

// Hairstyle options for the body map's silhouette, styled after natural and protective
// styles Black women actually wear day to day. "Bald / shaved" is included deliberately,
// not just as a placeholder: hair loss (alopecia, chemo, lupus, postpartum, trichotillomania)
// is part of the reality this app documents, so a bare head is offered as its own real option.
const HAIRSTYLES = [
  { key: "afro", label: "Afro" },
  { key: "puff", label: "High puff" },
  { key: "spacebuns", label: "Space buns" },
  { key: "ponytail", label: "Ponytail" },
  { key: "braids", label: "Braids" },
  { key: "bantu", label: "Bantu knots" },
  { key: "locs", label: "Locs" },
  { key: "headwrap", label: "Headwrap" },
  { key: "bald", label: "Bald / shaved" },
];

// Hair color is its own choice, independent of skin tone — hair was previously tinted with
// the skin "glow" color, which read as flat/washed out since it was designed as a highlight,
// not a pigment. These are real hair-color values so the hairstyle actually reads as hair.
const HAIR_COLORS = [
  { key: "black", label: "Black", hex: "#241712" },
  { key: "darkbrown", label: "Dark brown", hex: "#3B2417" },
  { key: "brown", label: "Brown", hex: "#5A3820" },
  { key: "auburn", label: "Auburn", hex: "#7A3B22" },
  { key: "burgundy", label: "Burgundy", hex: "#6B1F3A" },
  { key: "honey", label: "Honey blonde", hex: "#B8823D" },
  { key: "platinum", label: "Platinum blonde", hex: "#D9C79A" },
  { key: "gray", label: "Gray / silver", hex: "#9B9B9B" },
];

// A headwrap is cloth, not hair — it shouldn't be forced to match whatever's picked for hair
// color. Its own small fabric palette, independent of HAIR_COLORS.
const WRAP_COLORS = [
  { key: "plum", label: "Plum", hex: "#7A2E4D" },
  { key: "marigold", label: "Marigold", hex: "#D98E2B" },
  { key: "sage", label: "Sage", hex: "#6B8E6B" },
  { key: "indigo", label: "Indigo", hex: "#2E3A6B" },
  { key: "rust", label: "Rust", hex: "#A84A2B" },
  { key: "cream", label: "Cream", hex: "#E8DCC4" },
  { key: "black", label: "Black", hex: "#241712" },
];

const TEXT_SCALES = [
  { key: "default", label: "Default", pct: 100 },
  { key: "large", label: "Large", pct: 115 },
  { key: "xlarge", label: "Extra large", pct: 130 },
];

const ENERGY = [
  { key: "green", label: "Green day", desc: "Body is cooperating", color: COLORS.green },
  { key: "yellow", label: "Yellow day", desc: "Running on reserve", color: COLORS.yellow },
  { key: "red", label: "Red day", desc: "Flare · rest required", color: COLORS.red },
];

const STORAGE_KEY = "dlyw-flare-entries";
const DISMISSAL_KEY = "dlyw-dismissal-log";
const CUSTOM_KEY = "dlyw-custom-terms";
const TOOLKIT_KEY = "dlyw-benefits";

// Shared limb/head parts render identically in both the front and back views (a body's
// outline from behind is nearly the same silhouette; only the torso interior differs).
// Front torso uses the standard clinical abdominal quadrants (RUQ/LUQ/RLQ/LLQ), which also
// absorb the old separate "pelvis" region, matching how pelvic pain is actually charted.
// Back torso uses shoulder-blade / lumbar / glute regions instead, since quadrants are an
// anterior-abdomen convention and don't map onto how back pain is normally described.
const BODY_MAP = [
  { k: "head", label: "Head", view: "both", d: "M50 2.5 C57 2.5 62.5 7.5 62.8 14 C63 19 61 23.5 57 26.5 C54.5 28.5 52.2 29.8 50 30 C47.8 29.8 45.5 28.5 43 26.5 C39 23.5 37 19 37.2 14 C37.5 7.5 43 2.5 50 2.5 Z" },
  { k: "neck", label: "Neck / throat", view: "both", d: "M47 27.5 L53 27.5 L56.5 36 L43.5 36 Z" },
  { k: "shoulderL", label: "Left shoulder", view: "both", d: "M43 36 C36 37 30 40 26 46 L34 52 C36 45 39 39 43 36 Z" },
  { k: "shoulderR", label: "Right shoulder", view: "both", d: "M57 36 C64 37 70 40 74 46 L66 52 C64 45 61 39 57 36 Z" },
  { k: "armL", label: "Left arm", view: "both", d: "M26 46 C23 55 22 66 22 76 L30 77 C31 67 32 58 34 52 Z" },
  { k: "armR", label: "Right arm", view: "both", d: "M74 46 C77 55 78 66 78 76 L70 77 C69 67 68 58 66 52 Z" },
  { k: "handL", label: "Left hand", view: "both", d: "M22 76 C19 79 18 85 21 88 C25 89 29 86 30 82 C30 80 30 78 30 77 Z" },
  { k: "handR", label: "Right hand", view: "both", d: "M78 76 C81 79 82 85 79 88 C75 89 71 86 70 82 C70 80 70 78 70 77 Z" },
  { k: "legL", label: "Left thigh", view: "both", d: "M36 94 C43 96 48 96 49 96 C49 105 49 114 48 122 C44 123 40 122 38 121 C36 112 35 103 36 94 Z" },
  { k: "legR", label: "Right thigh", view: "both", d: "M64 94 C57 96 52 96 51 96 C51 105 51 114 52 122 C56 123 60 122 62 121 C64 112 65 103 64 94 Z" },
  { k: "kneeL", label: "Left knee", view: "both", d: "M38 121 C41 122 45 123 48 122 C48 126 48 129 48 131 C45 132 41 132 39 131 C38 128 38 124 38 121 Z" },
  { k: "kneeR", label: "Right knee", view: "both", d: "M62 121 C59 122 55 123 52 122 C52 126 52 129 52 131 C55 132 59 132 61 131 C62 128 62 124 62 121 Z" },
  { k: "shinL", label: "Left lower leg", view: "both", d: "M39 131 C42 132 46 132 48 131 C48 141 47 151 46 159 C44 160 41 160 40 159 C39 150 38 140 39 131 Z" },
  { k: "shinR", label: "Right lower leg", view: "both", d: "M61 131 C58 132 54 132 52 131 C52 141 53 151 54 159 C56 160 59 160 60 159 C61 150 62 140 61 131 Z" },
  { k: "footL", label: "Left foot", view: "both", d: "M40 159 C43 160 45 160 46 159 C47 162 47 165 44 167 C40 167 37 165 37 162 C37 160 38 159 40 159 Z" },
  { k: "footR", label: "Right foot", view: "both", d: "M60 159 C57 160 55 160 54 159 C53 162 53 165 56 167 C60 167 63 165 63 162 C63 160 62 159 60 159 Z" },
  { k: "chest", label: "Chest", view: "front", d: "M43 36 C37 36 34 41 33 46 C32 50 36 53 40 54 h20 C64 53 68 50 67 46 C66 41 63 36 57 36 Z" },
  { k: "abdomenRUQ", label: "Stomach — right upper quadrant", view: "front", d: "M50 54 L39 54 L42 73 L50 73 Z" },
  { k: "abdomenLUQ", label: "Stomach — left upper quadrant", view: "front", d: "M50 54 L61 54 L58 73 L50 73 Z" },
  { k: "abdomenRLQ", label: "Stomach / pelvis — right lower quadrant", view: "front", d: "M50 73 L42 73 L36 94 L50 94 Z" },
  { k: "abdomenLLQ", label: "Stomach / pelvis — left lower quadrant", view: "front", d: "M50 73 L58 73 L64 94 L50 94 Z" },
  { k: "upperBackL", label: "Upper back, left (shoulder blade)", view: "back", d: "M50 36 L38 38 C34 43 33 49 36 54 L50 54 Z" },
  { k: "upperBackR", label: "Upper back, right (shoulder blade)", view: "back", d: "M50 36 L62 38 C66 43 67 49 64 54 L50 54 Z" },
  { k: "lowerBack", label: "Lower back (lumbar)", view: "back", d: "M39 54 L61 54 L58 73 L42 73 Z" },
  { k: "glutesL", label: "Left hip / glute", view: "back", d: "M50 73 L42 73 L36 94 L50 94 Z" },
  { k: "glutesR", label: "Right hip / glute", view: "back", d: "M50 73 L58 73 L64 94 L50 94 Z" },
  { k: "allOver", label: "All over", view: "both", d: "" },
  { k: "joints", label: "Joints everywhere", view: "both", d: "" },
];

// Clickable hit-zones for the real front-view photo (percent of image width/height,
// measured from the actual photo's silhouette so the transparent overlay lines up with
// the person in the picture). The back view still uses the hand-drawn BODY_MAP paths
// above, since there's no matching back-view photo yet.
const FRONT_PHOTO_HITZONES = [
  { k: "head", x: 37, y: 4, w: 26, h: 16.5 },
  { k: "neck", x: 43, y: 19, w: 16, h: 5.5 },
  { k: "shoulderL", x: 25, y: 20, w: 16, h: 9 },
  { k: "shoulderR", x: 61, y: 20, w: 16, h: 9 },
  { k: "armL", x: 12, y: 27, w: 22, h: 29 },
  { k: "armR", x: 68, y: 27, w: 22, h: 29 },
  { k: "handL", x: 6, y: 54, w: 19, h: 12 },
  { k: "handR", x: 77, y: 54, w: 19, h: 12 },
  { k: "chest", x: 34, y: 26, w: 32, h: 15 },
  { k: "abdomenRUQ", x: 34, y: 41, w: 16, h: 8 },
  { k: "abdomenLUQ", x: 50, y: 41, w: 16, h: 8 },
  { k: "abdomenRLQ", x: 32, y: 49, w: 18, h: 8 },
  { k: "abdomenLLQ", x: 50, y: 49, w: 18, h: 8 },
  { k: "legL", x: 25, y: 59, w: 25, h: 23 },
  { k: "legR", x: 51, y: 59, w: 25, h: 23 },
  { k: "kneeL", x: 27, y: 81, w: 14, h: 5.5 },
  { k: "kneeR", x: 60, y: 81, w: 14, h: 5.5 },
  { k: "shinL", x: 28, y: 85.5, w: 12, h: 8 },
  { k: "shinR", x: 61, y: 85.5, w: 12, h: 8 },
  { k: "footL", x: 26, y: 92, w: 14, h: 5 },
  { k: "footR", x: 60, y: 92, w: 14, h: 5 },
];

// Pain quality descriptors, paired with location on the body map. This is the same
// location + quality pairing clinical pain body maps use (PainScale, CHOIR), so the
// exported summary reads like something a pain specialist or rheumatologist would use.
const PAIN_QUALITIES = ["Aching", "Burning", "Sharp", "Throbbing", "Stabbing", "Tender", "Numb / tingling"];

const BODY_OUTLINE = "M50 3 C58 3 63 10 63 18 C63 24 59 28 56 29.5 L55.5 36 C64 37.5 70.5 41 74 46 C77.5 55 78.5 66 78.5 76 C81.5 79 82.5 85 79.5 88 C75.5 89 71 86 70 82 C70 79 69.5 78 69.5 77 C69 67 68 58 66 52.5 C64 58 60 62 56 64 C58 72 68 78 67 85 C67 89 66 92 64 94 C64.5 104 64 113 62 121.5 C62.5 127 62 130 61 131.5 C62 141 62 151 60.5 159.5 C63 161 63.5 164 63 165.5 C60 167.5 55.5 167.5 54 165 C53 162 53.5 160.5 54 159.5 C53 151 52 141 52 131.5 L52 122 C51.5 114 51 105 51 96.5 L49 96.5 C49 105 48.5 114 48 122 L48 131.5 C48 141 47 151 46 159.5 C46.5 160.5 47 162 46 165 C44.5 167.5 40 167.5 37 165.5 C36.5 164 37 161 39.5 159.5 C38 151 38 141 39 131.5 C38 130 37.5 127 38 121.5 C36 113 35.5 104 36 94 C34 92 33 89 33 85 C32 78 42 72 44 64 C40 62 36 58 34 52.5 C32 58 31 67 30.5 77 C30.5 78 30 79 30 82 C29 86 24.5 89 20.5 88 C17.5 85 18.5 79 21.5 76 C21.5 66 22.5 55 26 46 C29.5 41 36 37.5 44.5 36 L44 29.5 C41 28 37 24 37 18 C37 10 42 3 50 3 Z";

const SEED_SYMPTOMS = [
  "fatigue", "joint pain", "muscle pain", "brain fog", "headache", "migraine",
  "chronic pain", "nerve pain", "back pain", "chest pain", "pain crisis",
  "shortness of breath", "heart palpitations", "dizziness", "lightheadedness",
  "nausea", "vomiting", "diarrhea", "constipation", "bloating", "abdominal pain",
  "loss of appetite", "fever", "chills", "night sweats", "hair loss",
  "skin rash", "butterfly rash", "hives", "itching", "mouth sores",
  "dry eyes", "dry mouth", "light sensitivity", "sound sensitivity", "sensory overload",
  "swelling", "stiffness", "numbness", "tingling", "weakness", "tremors",
  "insomnia", "unrefreshing sleep", "anxiety", "low mood", "irritability",
  "difficulty concentrating", "memory problems", "restlessness",
  "heat intolerance", "cold intolerance", "painful periods", "heavy periods", "pelvic pain",
];

const SEED_MEDS = [
  "Acetaminophen (Tylenol)", "Ibuprofen (Advil)", "Naproxen (Aleve)", "Aspirin",
  "Hydroxychloroquine (Plaquenil)", "Prednisone", "Methotrexate",
  "Mycophenolate (CellCept)", "Azathioprine (Imuran)", "Belimumab (Benlysta)",
  "Hydroxyurea", "L-glutamine (Endari)", "Folic acid",
  "Gabapentin (Neurontin)", "Pregabalin (Lyrica)", "Duloxetine (Cymbalta)",
  "Amitriptyline", "Nortriptyline", "Milnacipran (Savella)",
  "Cyclobenzaprine (Flexeril)", "Tizanidine", "Baclofen",
  "Tramadol", "Low-dose naltrexone",
  "Sumatriptan (Imitrex)", "Rizatriptan (Maxalt)", "Topiramate (Topamax)", "Propranolol",
  "Adderall", "Vyvanse", "Methylphenidate (Ritalin/Concerta)", "Atomoxetine (Strattera)", "Guanfacine",
  "Sertraline (Zoloft)", "Escitalopram (Lexapro)", "Fluoxetine (Prozac)", "Bupropion (Wellbutrin)", "Buspirone",
  "Levothyroxine (Synthroid)", "Metformin", "Omeprazole (Prilosec)", "Ondansetron (Zofran)",
  "Vitamin D", "Vitamin B12", "Iron", "Magnesium", "Zinc", "Omega-3 / fish oil",
  "Turmeric (curcumin)", "CoQ10", "Melatonin", "Probiotics", "Electrolytes", "Bone broth",
];

const SEED_TRIGGERS = [
  "stress", "emotional stress", "poor sleep", "overexertion", "weather change", "heat", "cold",
  "menstrual cycle", "hormonal changes", "infection or illness", "missed medication",
  "dehydration", "skipped meals", "certain foods", "gluten", "dairy", "sugar",
  "alcohol", "caffeine", "bright lights", "loud noise", "strong smells",
  "travel", "long standing", "prolonged sitting", "screen time", "conflict",
];

const SEED_INSURANCE = [
  "Medicaid", "Medicare", "Medicare Advantage", "Dual eligible (Medicare + Medicaid)",
  "CHIP", "Maryland Medicaid (HealthChoice)", "Priority Partners", "Maryland Physicians Care",
  "Amerigroup / Wellpoint", "CareFirst BlueCross BlueShield", "Blue Cross Blue Shield",
  "Aetna", "Cigna", "UnitedHealthcare", "Humana", "Kaiser Permanente",
  "Anthem", "Molina Healthcare", "Ambetter", "Oscar Health",
  "ACA Marketplace plan", "Employer plan", "TRICARE", "VA health care",
  "Student health plan", "Uninsured / self-pay", "Other",
];

const SEED_SPECIALTIES = [
  "Primary care / family medicine", "Internal medicine", "Rheumatology", "Neurology",
  "Hematology", "Pain management", "OB-GYN", "Gynecology", "Maternal-fetal medicine",
  "Cardiology", "Gastroenterology", "Endocrinology", "Dermatology", "Immunology / allergy",
  "Pulmonology", "Nephrology", "Infectious disease", "Psychiatry", "Therapy / counseling",
  "Emergency medicine", "Urgent care", "Sleep medicine", "Physical therapy",
  "Occupational therapy", "Physiatry (PM&R)", "Orthopedics", "Podiatry",
  "ENT (otolaryngology)", "Ophthalmology", "Urology", "Genetics",
  "Nutrition / dietitian", "Integrative medicine", "Acupuncture", "Chiropractic", "Social work",
];

const SEED_CONDITIONS = [
  "Lupus (SLE)", "Fibromyalgia", "Sickle cell disease", "ME/CFS (chronic fatigue syndrome)",
  "Rheumatoid arthritis", "Psoriatic arthritis", "Ankylosing spondylitis", "Sjogren's syndrome",
  "Endometriosis", "PCOS", "Adenomyosis", "Uterine fibroids",
  "POTS / dysautonomia", "Ehlers-Danlos syndrome (hEDS)", "Gastroparesis",
  "IBS", "Crohn's disease", "Ulcerative colitis", "Celiac disease", "GERD",
  "Chronic migraine", "Epilepsy", "Multiple sclerosis", "Neuropathy", "CRPS", "Chronic pain syndrome",
  "Autism", "ADHD", "Anxiety disorder", "Depression", "Bipolar disorder", "PTSD", "OCD",
  "Type 1 diabetes", "Type 2 diabetes", "Hashimoto's / hypothyroidism", "Graves' / hyperthyroidism",
  "Asthma", "Long COVID", "Chronic kidney disease", "Interstitial cystitis",
  "Hidradenitis suppurativa", "Sarcoidosis", "Myasthenia gravis", "Narcolepsy",
  "Anemia / iron deficiency", "Hearing loss", "Chronic vertigo / Meniere's",
  "Undiagnosed / still searching",
];

const TYPE_LABELS = {
  medicaidMCO: "Medicaid plan (MCO)",
  medicaid: "Medicaid (state-run)",
  medicareAdv: "Medicare Advantage",
  medicare: "Original Medicare",
  dual: "Medicare + Medicaid",
  commercial: "Employer / private",
  marketplace: "Marketplace (ACA)",
  tricare: "TRICARE",
  va: "VA",
  student: "Student plan",
  uninsured: "Uninsured / self-pay",
};

const PLAN_TO_TYPE = {
  "Medicaid": "medicaid",
  "Maryland Medicaid (HealthChoice)": "medicaidMCO",
  "Priority Partners": "medicaidMCO",
  "Maryland Physicians Care": "medicaidMCO",
  "Amerigroup / Wellpoint": "medicaidMCO",
  "Molina Healthcare": "medicaidMCO",
  "CHIP": "medicaid",
  "Medicare": "medicare",
  "Medicare Advantage": "medicareAdv",
  "Dual eligible (Medicare + Medicaid)": "dual",
  "CareFirst BlueCross BlueShield": "commercial",
  "Blue Cross Blue Shield": "commercial",
  "Aetna": "commercial",
  "Cigna": "commercial",
  "UnitedHealthcare": "commercial",
  "Humana": "commercial",
  "Kaiser Permanente": "commercial",
  "Anthem": "commercial",
  "Oscar Health": "marketplace",
  "Ambetter": "marketplace",
  "ACA Marketplace plan": "marketplace",
  "Employer plan": "commercial",
  "TRICARE": "tricare",
  "VA health care": "va",
  "Student health plan": "student",
  "Uninsured / self-pay": "uninsured",
};

const PLAYBOOKS = {
  medicaidMCO: [
    { h: "Free money & extras", pts: [
      "Most Medicaid MCOs include a spending allowance for health items. Plans name it differently: OTC card, healthy benefits, wellness dollars, flex card. It usually resets monthly or quarterly and unused money disappears, so ask what yours is called, how much it is, and how to order (catalog, app, or participating stores).",
      "Rewards programs pay you in gift cards or credits for checkups, screenings, and prenatal visits. You usually have to claim them yourself.",
      "Many MCOs quietly add extras: fitness benefits, meals after a hospital stay, baby supplies, even GED and job support. It is all in the member handbook nobody reads.",
    ]},
    { h: "Getting to care", pts: [
      "Free rides to appointments (called NEMT) are a Medicaid benefit. Book 2 to 3 days ahead through the number on your card.",
      "Ask for a care coordinator or case manager, especially with two or more chronic conditions. It is free, and they chase referrals and prior auths for you.",
      "There is a 24/7 nurse line for flare-day triage, and copays are zero or tiny for most services.",
    ]},
    { h: "When they say no", pts: [
      "You get the plan's internal appeal AND a state fair hearing, a Medicaid-specific right where a judge reviews the denial. Ask for both in writing.",
      "If you appeal quickly (often within 10 days of the notice), you can usually keep the service running during the appeal. The phrase is: continuation of benefits.",
      "Your state's Medicaid ombudsman helps for free.",
    ]},
    { h: "Watch out", pts: [
      "Renewal (redetermination) paperwork comes every year, and missed mail is the number one way people lose coverage. Keep your address updated and answer everything fast.",
      "Networks and drug lists change each January. Recheck that your providers are still in-network every year.",
      "When something needs prior auth, your visit plan and Receipts are the evidence.",
    ]},
  ],
  medicaid: [
    { h: "What you get", pts: [
      "State-run Medicaid covers doctor visits, hospital care, labs, and prescriptions with little or no cost to you. The full list lives in your state's member handbook, on the state Medicaid site.",
      "Free rides to appointments (NEMT) are included. Book ahead through your state's transportation line.",
      "Ask about care management programs for chronic conditions; most states have them, and almost nobody is told.",
    ]},
    { h: "When they say no", pts: [
      "Every denial can go to a state fair hearing, where a judge reviews it. The denial notice must tell you how and by when.",
      "Appeal fast and ask for continuation of benefits so the service keeps running during the appeal.",
    ]},
    { h: "Watch out", pts: [
      "Annual renewal paperwork is how people lose coverage by accident. Keep your address current with the state.",
      "You can switch into a managed care plan (MCO) in most states, which often adds extras like spending allowances.",
    ]},
  ],
  medicareAdv: [
    { h: "Free money & extras", pts: [
      "Medicare Advantage plans compete on extras: a spending allowance (flex card, OTC benefit) for health items, and on some plans groceries or utilities. Ask what yours is called and how it loads.",
      "Dental, vision, and hearing are usually bundled in, plus a gym benefit (SilverSneakers or similar).",
      "Drug coverage is typically built in. Check your meds against the formulary every fall.",
    ]},
    { h: "How it works", pts: [
      "Network rules matter: HMO plans need referrals, PPO plans give more freedom at higher cost.",
      "There is an annual out-of-pocket maximum protecting you, which Original Medicare alone does not have.",
    ]},
    { h: "When they say no", pts: [
      "Prior authorization is heavy in Medicare Advantage, and appeals succeed often, so always appeal.",
      "If your health cannot wait, request an expedited appeal (72-hour decision).",
      "If the plan misses its deadlines, your case escalates automatically to an independent reviewer.",
    ]},
    { h: "Watch out", pts: [
      "October 15 to December 7 is when you can switch plans. Benefits, networks, and drug lists reset every January.",
      "A too-good-to-be-true allowance can hide a narrow network. Check that your specialists are in it before switching.",
    ]},
  ],
  medicare: [
    { h: "How it works", pts: [
      "Part A covers hospital, Part B covers doctors (you pay 20 percent with no yearly cap, which is why Medigap supplement plans exist), Part D covers drugs.",
      "No networks and no referrals: any provider who takes Medicare, anywhere in the country.",
      "Preventive care (annual wellness visit, screenings) is free.",
    ]},
    { h: "Lower your costs", pts: [
      "Extra Help is a federal program that cuts drug costs if your income qualifies. It is worth applying.",
      "Medicare Savings Programs can pay your Part B premium if income qualifies. Your state health insurance assistance program (SHIP) helps for free.",
    ]},
    { h: "When they say no", pts: [
      "Your Medicare Summary Notice (MSN) is your EOB. Check it quarterly and appeal anything wrong; the notice tells you how.",
    ]},
  ],
  dual: [
    { h: "The strongest combo", pts: [
      "Qualifying for both means Medicaid covers most of your Medicare costs: premiums, deductibles, copays.",
      "Ask about D-SNP plans, which are Medicare Advantage plans built for duals and tend to carry the biggest spending allowances (food, OTC, utilities on some plans).",
      "Extra Help for drug costs is automatic for duals.",
    ]},
    { h: "When they say no", pts: [
      "You keep Medicaid rights (state fair hearing) alongside Medicare appeal rights. Use whichever is stronger for the denial in front of you.",
    ]},
  ],
  commercial: [
    { h: "Your own money", pts: [
      "An FSA or HSA is your pre-tax money for health costs, including many OTC items. Check the balance and the deadline; FSA money expires.",
      "The EAP (employee assistance program) usually includes free therapy sessions almost nobody uses.",
      "Wellness reimbursements (gym, apps, classes) hide in the benefits portal. Read it once a year, ideally at open enrollment.",
    ]},
    { h: "How it works", pts: [
      "You pay the deductible first, then coinsurance until the out-of-pocket maximum. After that the plan pays everything.",
      "In-network versus out-of-network is the whole game. Confirm network status before every new provider.",
    ]},
    { h: "When they say no", pts: [
      "You get an internal appeal, then an independent external review. Letters of medical necessity carry real weight.",
      "If insurance is through a job, the HR benefits team can pressure the plan. Use them.",
    ]},
  ],
  marketplace: [
    { h: "Your money", pts: [
      "Subsidies are tied to your income, so report income changes during the year or you may owe money back at tax time.",
      "If your income qualifies, silver-tier plans carry cost-sharing reductions that quietly slash your deductible. This is the most missed deal on the marketplace.",
    ]},
    { h: "How it works", pts: [
      "All marketplace plans must cover the ten essential health benefits, including mental health and prescriptions.",
      "Open enrollment is yearly, plus special enrollment after life events (moving, losing coverage, having a baby).",
    ]},
    { h: "When they say no", pts: [
      "Internal appeal first, then independent external review. The denial letter must explain both.",
    ]},
  ],
  tricare: [
    { h: "The essentials", pts: [
      "Prime means referrals go through your primary care manager; Select means more freedom with cost shares.",
      "Appeal rights exist for both authorization and claim denials, and case management is available for chronic conditions through your regional contractor.",
    ]},
  ],
  va: [
    { h: "The essentials", pts: [
      "Priority groups set your costs, and service-connected conditions are covered fully.",
      "Community Care lets you see outside providers when the VA cannot serve you soon or close enough, but get the authorization first.",
      "Every VA facility has patient advocates. Use them like an ombudsman.",
    ]},
  ],
  student: [
    { h: "The essentials", pts: [
      "Usually a commercial plan with a campus layer: the campus health center is your cheap front door.",
      "Check whether coverage continues over summer and after graduation before you need it to.",
      "Standard appeal rights apply, and the student insurance office can help fight denials.",
    ]},
  ],
  uninsured: [
    { h: "You still have options", pts: [
      "Community health centers (FQHCs) charge on a sliding scale based on income, including for chronic condition care.",
      "Nonprofit hospitals are required to offer financial assistance (charity care). Ask for the application before paying anything, even after the bill arrives.",
      "Pharmacy discount programs and manufacturer copay cards cut drug prices dramatically. Ask the pharmacist to check both.",
      "You can apply for Medicaid any day of the year, and even a denial creates appeal rights and documentation.",
    ]},
  ],
};

const BENEFITS = [
  { k: "otc", name: "Spending allowance", desc: "Money for health items, hiding under many names: OTC card, flex card, healthy benefits, wellness dollars. Usually monthly or quarterly and use-it-or-lose-it. Ask what yours is called." },
  { k: "ride", name: "Transportation to appointments", desc: "Free rides to medical visits are a standard Medicaid benefit in most states. You usually have to book a few days ahead." },
  { k: "care", name: "Care coordinator / case manager", desc: "A person assigned to help you navigate referrals, prior authorizations, and finding specialists who take your plan. You usually have to ask for one." },
  { k: "nurse", name: "24/7 nurse line", desc: "Free clinical advice line. Useful on flare days when you're not sure whether it's an ER situation." },
  { k: "extras", name: "Vision, dental, and hearing extras", desc: "Often included beyond the basics, especially in managed care plans." },
  { k: "fitness", name: "Fitness benefit", desc: "Some plans cover gym memberships or home fitness programs." },
  { k: "meals", name: "Meal support", desc: "Some plans deliver meals after a hospital stay." },
  { k: "appeal", name: "Appeal & grievance rights", desc: "Every denial can be appealed, and plans must tell you how. Your Receipts records can support an appeal." },
];

const PREP_TESTS = [
  { cluster: "Fatigue + joint pain + rashes", tests: "CBC, CMP, ANA, ESR/CRP (inflammation markers), thyroid panel, vitamin D" },
  { cluster: "Widespread pain + unrefreshing sleep", tests: "Tests here mostly rule out other causes: CBC, thyroid, vitamin D, iron/ferritin. Fibromyalgia itself is diagnosed clinically" },
  { cluster: "Heavy periods + exhaustion", tests: "CBC, iron studies, ferritin" },
  { cluster: "Pain crises (sickle cell)", tests: "CBC, reticulocyte count, and ask about putting an individualized pain plan on file so the ER takes you seriously" },
  { cluster: "Brain fog + focus struggles", tests: "Thyroid, B12, vitamin D, and ask what an ADHD evaluation referral would involve" },
  { cluster: "Gut issues + bloating", tests: "Celiac screen, thyroid, and ask what would warrant a GI referral" },
];

const SEED_DECLINED = [
  "bloodwork / labs", "imaging (X-ray, MRI, CT)", "specialist referral", "pain medication",
  "medication refill", "physical therapy referral", "further evaluation", "second opinion support",
  "disability paperwork", "accommodation letter", "earlier appointment", "hospital admission",
  "listening to my full story",
];

const NOURISH = [
  { n: "Salmon", v: "g", why: "omega-3 powerhouse, the most studied anti-inflammatory food", gi: "" },
  { n: "Sardines", v: "g", why: "omega-3s plus calcium, cheap in the can", gi: "" },
  { n: "Mackerel", v: "g", why: "omega-3 rich fatty fish", gi: "" },
  { n: "Tuna", v: "g", why: "lean protein with omega-3s", gi: "" },
  { n: "Olive oil", v: "g", why: "the Mediterranean backbone; swap it in for butter", gi: "" },
  { n: "Avocado", v: "g", why: "gentle fats and potassium", gi: "large portions can bloat sensitive guts" },
  { n: "Spinach", v: "g", why: "leafy green, folate and magnesium", gi: "cooked is far easier than raw" },
  { n: "Kale", v: "g", why: "dense leafy green", gi: "raw is rough; cook it soft" },
  { n: "Blueberries", v: "g", why: "antioxidant heavyweights", gi: "" },
  { n: "Strawberries", v: "g", why: "vitamin C and anthocyanins", gi: "seeds bother some flare guts" },
  { n: "Tart cherries", v: "g", why: "studied for inflammation and sleep", gi: "" },
  { n: "Oranges & citrus", v: "g", why: "vitamin C", gi: "can stir GERD and reflux" },
  { n: "Turmeric", v: "g", why: "curcumin, the famous anti-inflammatory spice; pair with black pepper", gi: "" },
  { n: "Ginger", v: "g", why: "calms inflammation and nausea both", gi: "" },
  { n: "Garlic", v: "g", why: "flavor with benefits", gi: "high FODMAP; can bloat IBS guts" },
  { n: "Green tea", v: "g", why: "gentle caffeine plus antioxidants", gi: "" },
  { n: "Chamomile tea", v: "g", why: "calming, kind to evenings", gi: "" },
  { n: "Peppermint tea", v: "g", why: "settles nausea and bloating", gi: "skip with GERD; it loosens the valve" },
  { n: "Walnuts", v: "g", why: "plant omega-3s", gi: "hard on slow or sensitive stomachs; try nut butters" },
  { n: "Almonds", v: "g", why: "vitamin E and good fats", gi: "rough whole; almond butter is gentler" },
  { n: "Chia seeds", v: "g", why: "omega-3s and fiber", gi: "big fiber load; go slow with gastroparesis or IBS" },
  { n: "Ground flax", v: "g", why: "plant omega-3s", gi: "fiber; ease in slowly" },
  { n: "Beans & lentils", v: "g", why: "plant protein and fiber", gi: "high FODMAP and gassy; small portions, well cooked" },
  { n: "Quinoa", v: "g", why: "complete plant protein", gi: "" },
  { n: "Oats", v: "g", why: "soluble fiber, one of the gentler fibers", gi: "well cooked oatmeal beats granola" },
  { n: "Sweet potato", v: "g", why: "beta carotene and steady carbs", gi: "peeled and soft is gentlest" },
  { n: "White rice", v: "g", why: "the flare-day friend: low residue, easy fuel", gi: "a low-fiber ally when your gut is angry" },
  { n: "Ripe bananas", v: "g", why: "easy energy and potassium", gi: "ripe is gentle; green is not" },
  { n: "Applesauce", v: "g", why: "fruit without the fight", gi: "gentler than whole apples" },
  { n: "Zucchini, peeled & cooked", v: "g", why: "soft vegetable that behaves", gi: "" },
  { n: "Eggs", v: "g", why: "easy complete protein", gi: "" },
  { n: "Greek yogurt", v: "g", why: "protein plus live cultures", gi: "skip or go lactose-free if dairy fights you" },
  { n: "Kefir", v: "g", why: "probiotic-rich and often easier than milk", gi: "" },
  { n: "Bone broth", v: "g", why: "gentle protein, warm comfort, kind to healing guts", gi: "" },
  { n: "Tomatoes", v: "g", why: "lycopene; nightshade worries are mostly myth", gi: "acidic; can stir GERD" },
  { n: "Bell peppers", v: "g", why: "vitamin C dense", gi: "skins bother some; roast and peel" },
  { n: "Broccoli", v: "g", why: "cruciferous good stuff", gi: "famous for gas; steam it soft, small portions" },
  { n: "Dark chocolate (a square)", v: "g", why: "flavonoids and joy both count", gi: "" },
  { n: "Honey (a drizzle)", v: "g", why: "gentler sweetness than sugar", gi: "high FODMAP in quantity" },
  { n: "Water", v: "g", why: "the most underrated anti-inflammatory on this list", gi: "" },
  { n: "Added sugar", v: "l", why: "the clearest inflammation driver in the modern diet", gi: "" },
  { n: "Soda", v: "l", why: "sugar plus carbonation", gi: "bloating and reflux fuel" },
  { n: "Energy drinks", v: "l", why: "sugar and caffeine spikes", gi: "" },
  { n: "Fried food", v: "l", why: "inflammatory oils at high heat", gi: "also slow and heavy on gastroparesis" },
  { n: "Processed meats", v: "l", why: "bacon, hot dogs, deli meat: strong inflammation links", gi: "" },
  { n: "Ultra-processed snacks", v: "l", why: "engineered to be eaten, not to help", gi: "" },
  { n: "Chips & candy", v: "l", why: "empty inflammation fuel", gi: "" },
  { n: "Excess alcohol", v: "l", why: "inflammatory and sleep-wrecking", gi: "harsh on guts and meds alike" },
  { n: "Excess caffeine", v: "l", why: "fine for many, flare fuel for some; know your body", gi: "can stir GERD and IBS" },
  { n: "White bread & refined carbs", v: "l", why: "inflammatory in excess", gi: "the twist: low-fiber versions can be gentle on flare days; balance, not shame" },
  { n: "Heavy cream sauces", v: "l", why: "rich and inflammatory in quantity", gi: "slow to digest" },
  { n: "Artificial sweeteners", v: "l", why: "mixed evidence", gi: "sugar alcohols especially can wreck IBS guts" },
];

const RELIEF = [
  { n: "Heat pad", bestFor: "cramps, endo and adeno pain, tight muscles, back pain", how: "15 to 20 minutes, cloth between you and the heat; continuous low heat for pelvic pain" },
  { n: "Cold pack", bestFor: "swelling, sharp flares, migraines, hot joints", how: "15 minutes on, wrapped in cloth; great alternated with heat" },
  { n: "Warm bath / Epsom soak", bestFor: "whole-body aches, fibro flares, stress", how: "warm not scalding; 20 minutes; add Epsom salts if skin tolerates" },
  { n: "TENS unit", bestFor: "nerve pain, period pain, muscle pain", how: "ask your provider or PT for placement; some plans cover it as equipment (HCPCS E0730)" },
  { n: "Compression gloves", bestFor: "hand and finger joint pain, morning stiffness", how: "wear during flares or overnight" },
  { n: "Pillow under the knees", bestFor: "pelvic pain, low back pain", how: "a wedge or folded pillow takes the strain off" },
  { n: "Pacing: the 50 percent rule", bestFor: "payback crashes, boom-and-bust cycles", how: "on a good day, do half of what you feel you can; the other half is tomorrow's insurance" },
  { n: "Rest before the crash", bestFor: "everything", how: "the golden rule: rest is a strategy, not a surrender" },
  { n: "Gentle stretching", bestFor: "stiffness, green days", how: "slow and short; never anything that costs tomorrow" },
  { n: "Short walk", bestFor: "stiffness, mood, gentle circulation", how: "to the corner and back counts" },
  { n: "Hydration + electrolytes", bestFor: "headaches, fatigue, dizziness, POTS days", how: "sip through the day; electrolytes when plain water is not landing" },
  { n: "Ginger tea", bestFor: "nausea", how: "fresh ginger steeped, or candied ginger in a pinch" },
  { n: "Dark, quiet room", bestFor: "migraine, sensory overload", how: "lights off, sound down, cool cloth over the eyes" },
  { n: "Weighted blanket", bestFor: "anxiety, sensory overwhelm, restless nights", how: "roughly 10 percent of body weight" },
  { n: "Warm compress on eyes", bestFor: "dry eyes, sinus pressure", how: "a warm washcloth for five minutes" },
  { n: "Cycle tracking", bestFor: "pelvic pain, hormonal flare timing", how: "log your cycle in check-in triggers and watch Patterns connect the dots" },
  { n: "Tell one person", bestFor: "the hardest days", how: "asking for backup is a tool, not a weakness; one text counts" },
];

const RESOURCES = [
  {
    k: "codes",
    title: "Decode the codes & jargon",
    points: [
      "CPT codes: five-digit codes for what was done to you. 99213 and 99214 are routine office visits, 80053 is a comprehensive metabolic panel. When fighting a denial, ask the office: what CPT code was billed?",
      "ICD-10 codes: your diagnosis as letters and numbers. Examples: M32.9 lupus, M79.7 fibromyalgia, D57.1 sickle cell disease, N80.9 endometriosis, G43.909 migraine, E11.9 type 2 diabetes. Appeals and prior auths live or die on the right diagnosis code being attached.",
      "EOB (explanation of benefits): the confusing mail stamped THIS IS NOT A BILL. It shows what was billed, what the plan paid, and what they claim you owe. Check it against real bills; errors are common and contestable.",
      "Prior authorization (PA): the plan's permission slip before it pays. Step therapy, also called fail first: the plan makes you try the cheaper option before the one your doctor actually wanted. Documented failures beat step therapy.",
      "Formulary and tiers: the plan's list of covered drugs, priced by tier. If your medication is high-tier or missing, ask for a formulary exception.",
      "DAW, dispense as written: what your prescriber writes when the brand name is medically necessary, for example when generics cause reactions. Pair it with your documented reactions below.",
      "Medical necessity: the phrase everything turns on. Plans deny by claiming care is not medically necessary; appeals win by proving it is, with notes, codes, and history.",
      "Peer-to-peer review: your doctor argues your case directly with the plan's medical director. Asking your provider to request one is often the single move that flips a denial.",
      "Deductible, copay, coinsurance, out-of-pocket max: what you pay before coverage starts, the flat fee per visit, your percentage share, and the yearly ceiling after which the plan pays the rest.",
    ],
  },
  {
    k: "denials",
    title: "Denials & prior authorizations",
    points: [
      "A denial is the start of a process, not the final answer. Most denials can be appealed, and appeals succeed often enough that giving up is exactly what the process counts on.",
      "First: read the denial letter for the specific reason and the appeal deadline, then ask the plan for the clinical criteria they used. They must tell you.",
      "The appeal ladder: internal appeal with the plan first, then external review by an independent reviewer. If your health cannot wait, request an expedited appeal and say those words.",
      "A strong letter of medical necessity includes: your diagnosis with the ICD-10 code, everything already tried with dates and what happened (this is where your med reactions list earns its keep), why the requested care fits your case, and the clinical guidelines that support it.",
      "Honest truth: doctors vary. Some will fight for you and some send one weak paragraph. Ask directly: 'Will you request a peer-to-peer review?' and 'Who in your office handles appeals?' If your provider will not advocate, you can request your complete records and take them to someone who will. Log both kinds of doctor in Receipts.",
      "Prior authorization checklist, to make yes easy: the exact procedure and diagnosis codes from your provider's office, chart notes showing what you already tried, a letter of medical necessity, the plan's own PA form, and a reference number from every phone call.",
      "Your Receipts, med reactions list, and appointment summaries are the evidence for all of this. Medicaid members can also contact their state's Medicaid ombudsman, and anyone can escalate to their state insurance commissioner.",
    ],
  },
  {
    k: "records",
    title: "Getting your medical records",
    points: [
      "Your records are yours by law. Every provider must give you copies, usually within 30 days, often free or cheap when electronic.",
      "How to ask: request the complete record, not just the visit summary. That means chart notes, labs, imaging reports, and the medication list. Patient portals show some of it; a written request to the records department gets all of it.",
      "Why it matters: appeals, second opinions, and switching to a doctor who will actually fight all run on records. Reading your own chart also shows you what was really written, which is where dismissal hides.",
      "If something in your chart is wrong, you have the right to request an amendment in writing. Keep a copy of the request.",
    ],
  },
  {
    k: "er",
    title: "Preparing for the ER",
    points: [
      "The ER is where invisible illness meets the most disbelief, so go armed: your conditions and allergy list (your Whimsy summary covers both), your med list, and one sentence naming your diagnosis and your specialist.",
      "If you live with sickle cell or another pain-crisis condition, ask your specialist to put an individualized pain plan on file with your usual hospital before you ever need it.",
      "Bring a person if you can. An advocate who says 'this is not her baseline' changes how fast you are taken seriously.",
      "Get the doctor's name and write it down. If you are dismissed, say: 'Please document in my chart that you are declining to treat or test.' Then log it in Receipts.",
    ],
  },
  {
    k: "medhx",
    title: "Your med history is evidence",
    points: [
      "Your body's track record is proof, not trivia. Keep a running list of every medication that failed you, every reaction, and every allergy, with what actually happened.",
      "If generics do not work for your body, you are not imagining it: different fillers and binders cause real reactions for some people. Documented reactions let your prescriber write brand medically necessary (DAW) and give your formulary exception teeth.",
      "Step therapy appeals are won with exactly this list: proof you already tried and failed the cheap option, with dates and outcomes.",
      "It also protects you in the ER, where nobody knows your history and minutes matter. Add yours in the Allergies & med reactions card above, and Whimsy puts it on your appointment summary automatically.",
    ],
  },
];

const CODES = [
  // Diagnoses (ICD-10)
  { c: "M32.9", t: "ICD-10", m: "Lupus (SLE), unspecified" },
  { c: "M79.7", t: "ICD-10", m: "Fibromyalgia" },
  { c: "D57.1", t: "ICD-10", m: "Sickle cell disease without crisis" },
  { c: "D57.00", t: "ICD-10", m: "Sickle cell crisis (Hb-SS), unspecified" },
  { c: "G93.32", t: "ICD-10", m: "ME/CFS (myalgic encephalomyelitis / chronic fatigue syndrome)" },
  { c: "R53.83", t: "ICD-10", m: "Fatigue, other" },
  { c: "G89.4", t: "ICD-10", m: "Chronic pain syndrome" },
  { c: "G89.29", t: "ICD-10", m: "Chronic pain, other" },
  { c: "M54.50", t: "ICD-10", m: "Low back pain, unspecified" },
  { c: "M06.9", t: "ICD-10", m: "Rheumatoid arthritis, unspecified" },
  { c: "M45.9", t: "ICD-10", m: "Ankylosing spondylitis, unspecified site" },
  { c: "L40.50", t: "ICD-10", m: "Psoriatic arthritis, unspecified" },
  { c: "M35.00", t: "ICD-10", m: "Sjogren's syndrome, unspecified" },
  { c: "N80.9", t: "ICD-10", m: "Endometriosis, unspecified" },
  { c: "N80.0", t: "ICD-10", m: "Adenomyosis (endometriosis of the uterus)" },
  { c: "D25.9", t: "ICD-10", m: "Uterine fibroids (leiomyoma), unspecified" },
  { c: "E28.2", t: "ICD-10", m: "PCOS (polycystic ovarian syndrome)" },
  { c: "N94.6", t: "ICD-10", m: "Dysmenorrhea (painful periods), unspecified" },
  { c: "G90.A", t: "ICD-10", m: "POTS (postural orthostatic tachycardia syndrome)" },
  { c: "Q79.62", t: "ICD-10", m: "Hypermobile Ehlers-Danlos syndrome (hEDS)" },
  { c: "K31.84", t: "ICD-10", m: "Gastroparesis" },
  { c: "K58.9", t: "ICD-10", m: "IBS without diarrhea" },
  { c: "K58.0", t: "ICD-10", m: "IBS with diarrhea" },
  { c: "K50.90", t: "ICD-10", m: "Crohn's disease, unspecified" },
  { c: "K51.90", t: "ICD-10", m: "Ulcerative colitis, unspecified" },
  { c: "K90.0", t: "ICD-10", m: "Celiac disease" },
  { c: "K21.9", t: "ICD-10", m: "GERD without esophagitis" },
  { c: "G43.909", t: "ICD-10", m: "Migraine, unspecified" },
  { c: "G40.909", t: "ICD-10", m: "Epilepsy, unspecified" },
  { c: "G35", t: "ICD-10", m: "Multiple sclerosis" },
  { c: "G90.50", t: "ICD-10", m: "CRPS (complex regional pain syndrome), unspecified" },
  { c: "F84.0", t: "ICD-10", m: "Autism spectrum disorder" },
  { c: "F90.2", t: "ICD-10", m: "ADHD, combined type" },
  { c: "F90.0", t: "ICD-10", m: "ADHD, predominantly inattentive" },
  { c: "F41.1", t: "ICD-10", m: "Generalized anxiety disorder" },
  { c: "F32.9", t: "ICD-10", m: "Major depressive disorder, unspecified" },
  { c: "F31.9", t: "ICD-10", m: "Bipolar disorder, unspecified" },
  { c: "F43.10", t: "ICD-10", m: "PTSD, unspecified" },
  { c: "E10.9", t: "ICD-10", m: "Type 1 diabetes without complications" },
  { c: "E11.9", t: "ICD-10", m: "Type 2 diabetes without complications" },
  { c: "E03.9", t: "ICD-10", m: "Hypothyroidism, unspecified" },
  { c: "E06.3", t: "ICD-10", m: "Hashimoto's (autoimmune) thyroiditis" },
  { c: "E05.00", t: "ICD-10", m: "Graves' disease without thyrotoxic crisis" },
  { c: "J45.909", t: "ICD-10", m: "Asthma, unspecified, uncomplicated" },
  { c: "U09.9", t: "ICD-10", m: "Long COVID (post COVID-19 condition)" },
  { c: "N18.9", t: "ICD-10", m: "Chronic kidney disease, unspecified" },
  { c: "N30.10", t: "ICD-10", m: "Interstitial cystitis without hematuria" },
  { c: "L73.2", t: "ICD-10", m: "Hidradenitis suppurativa" },
  { c: "D86.9", t: "ICD-10", m: "Sarcoidosis, unspecified" },
  { c: "G70.00", t: "ICD-10", m: "Myasthenia gravis without exacerbation" },
  { c: "D50.9", t: "ICD-10", m: "Iron deficiency anemia, unspecified" },
  { c: "D64.9", t: "ICD-10", m: "Anemia, unspecified" },
  // Visits & procedures (CPT)
  { c: "99203", t: "CPT", m: "New patient office visit, about 30-44 minutes" },
  { c: "99204", t: "CPT", m: "New patient office visit, about 45-59 minutes" },
  { c: "99213", t: "CPT", m: "Established patient office visit, about 20-29 minutes" },
  { c: "99214", t: "CPT", m: "Established patient office visit, about 30-39 minutes" },
  { c: "99215", t: "CPT", m: "Established patient office visit, about 40-54 minutes" },
  { c: "99284", t: "CPT", m: "Emergency department visit, moderate-high severity" },
  { c: "99285", t: "CPT", m: "Emergency department visit, high severity" },
  { c: "36415", t: "CPT", m: "Blood draw (venipuncture)" },
  { c: "85025", t: "CPT", m: "CBC (complete blood count) with differential" },
  { c: "80053", t: "CPT", m: "CMP (comprehensive metabolic panel)" },
  { c: "80048", t: "CPT", m: "BMP (basic metabolic panel)" },
  { c: "84443", t: "CPT", m: "TSH (thyroid stimulating hormone)" },
  { c: "84439", t: "CPT", m: "Free T4 (thyroid hormone)" },
  { c: "86038", t: "CPT", m: "ANA (antinuclear antibody), the autoimmune screen" },
  { c: "85652", t: "CPT", m: "Sed rate (ESR), inflammation marker" },
  { c: "86140", t: "CPT", m: "CRP (C-reactive protein), inflammation marker" },
  { c: "82728", t: "CPT", m: "Ferritin (iron stores)" },
  { c: "83540", t: "CPT", m: "Iron level" },
  { c: "82306", t: "CPT", m: "Vitamin D (25-hydroxy)" },
  { c: "82607", t: "CPT", m: "Vitamin B12" },
  { c: "83036", t: "CPT", m: "Hemoglobin A1c (3-month blood sugar)" },
  { c: "81001", t: "CPT", m: "Urinalysis with microscopy" },
  { c: "71046", t: "CPT", m: "Chest X-ray, 2 views" },
  { c: "70450", t: "CPT", m: "CT scan of the head, without contrast" },
  { c: "72148", t: "CPT", m: "MRI of the lumbar (lower) spine, without contrast" },
  { c: "73721", t: "CPT", m: "MRI of a lower-body joint, without contrast" },
  { c: "76700", t: "CPT", m: "Abdominal ultrasound, complete" },
  { c: "76830", t: "CPT", m: "Transvaginal ultrasound" },
  { c: "20610", t: "CPT", m: "Joint injection or fluid draw, major joint" },
  { c: "96365", t: "CPT", m: "IV infusion, first hour" },
  { c: "97110", t: "CPT", m: "Physical therapy, therapeutic exercise" },
  { c: "97140", t: "CPT", m: "Manual therapy (hands-on PT)" },
  { c: "90834", t: "CPT", m: "Psychotherapy, 45 minutes" },
  { c: "90837", t: "CPT", m: "Psychotherapy, 60 minutes" },
  // Supplies & injections (HCPCS)
  { c: "J1885", t: "HCPCS", m: "Ketorolac (Toradol) injection" },
  { c: "J3420", t: "HCPCS", m: "Vitamin B12 injection" },
  { c: "E0730", t: "HCPCS", m: "TENS unit (nerve stimulation device)" },
  { c: "E1399", t: "HCPCS", m: "Miscellaneous durable medical equipment" },
  // Modifiers
  { c: "25", t: "Modifier", m: "Separate service same day: why you were billed a visit plus a procedure" },
  { c: "95", t: "Modifier", m: "Telehealth service" },
  { c: "59", t: "Modifier", m: "Distinct procedure, billed separately" },
];

const PREP_PHRASES = [
  '"What else could this be?"',
  '"Can you document in my chart that you\'re declining this test?"',
  '"What should I watch for that would mean I need to come back or go to the ER?"',
  '"I\'ve been tracking my symptoms. Here\'s my summary."',
];

// Scripts for the specific dismissal patterns most reported by Black women and other
// people whose pain is routinely minimized: named directly, not just "advocate for yourself."
const BIAS_PHRASES = [
  '"I understand anxiety is on the table, but I\'d like the physical causes ruled out first, in writing."',
  '"My weight isn\'t the only explanation here. What would you check if I weren\'t overweight?"',
  '"I\'m in pain now. What can we do today, and what\'s the plan if this medication isn\'t enough?"',
  '"My labs being normal doesn\'t match how I feel day to day. Can we look at what test would actually explain my symptoms?"',
  '"I want to slow down for a moment; I don\'t feel heard yet. Can you say back what you understood me to say?"',
  '"For the record, I am reporting [symptom] as new/worsening today, so it\'s documented regardless of what we decide to do about it."',
];

const CHEERS = [
  "You showed up for yourself today.",
  "Your body's story is on the record.",
  "Small entry, strong evidence.",
  "The garden felt that one.",
  "Gold star, gentle warrior.",
];
const RCHEERS = [
  "You kept a receipt.",
  "You advocated for yourself today.",
  "Every record strengthens your story.",
  "Filed, beautifully.",
  "Little receipt, big power.",
];

const PROMPTS = [
  "What made you smile today?",
  "Did someone believe you today?",
  "What do you wish your doctor understood?",
  "What are you proud of today?",
  "What did your body teach you today?",
];

const todayStr = () => new Date().toISOString().slice(0, 10);

const fmtDate = (iso) => {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const fmtDateLong = (iso) => {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
};

const inputCls = "w-full rounded-xl px-3.5 py-3 text-sm focus:outline-none focus-visible:ring-2";
const inputStyle = { border: `1px solid ${COLORS.line}`, background: COLORS.bg, color: COLORS.ink };
const labelCls = "block text-[13px] font-semibold mb-1.5";
const cardCls = "rounded-3xl p-6";
const cardStyle = { background: COLORS.card, border: `1px solid ${COLORS.line}`, boxShadow: "0 2px 14px rgba(87,31,51,0.06)" };
let GRAD = "linear-gradient(135deg, #D64F84, #A93267)";

const store = {
  get(key) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Storage failed", e);
      return false;
    }
  },
};

// Shrinks a photo client-side before it ever touches localStorage. Nothing
// leaves the device: this just resizes + re-encodes in the browser so a
// receipt with a photo doesn't blow through the storage quota. Caps the
// longest edge at 1000px and re-encodes as JPEG at moderate quality, which
// keeps a typical phone photo of a lab result or letter well under 300KB.
const MAX_PHOTO_DIM = 1000;
const PHOTO_QUALITY = 0.72;
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_DIM / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", PHOTO_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Whimsy() {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("today");
  const [splash, setSplash] = useState(true);
  const [introStep, setIntroStep] = useState(0);
  const [introOpen, setIntroOpen] = useState(true);
  const [range, setRange] = useState("1m");
  const [tkQ, setTkQ] = useState("");
  const [copied, setCopied] = useState(false);
  const [backupState, setBackupState] = useState("");
  const [sumOpen, setSumOpen] = useState(false);
  const [openRes, setOpenRes] = useState(null);
  const [codeQ, setCodeQ] = useState("");
  const [nQ, setNQ] = useState("");
  const [gQ, setGQ] = useState("");
  const [rQ, setRQ] = useState("");
  const [openTool, setOpenTool] = useState(null);
  const [vpCopied, setVpCopied] = useState(false);
  const [prepNotes, setPrepNotes] = useState("");
  const [prepSpecialty, setPrepSpecialty] = useState("");
  const [rSeen, setRSeen] = useState(true);
  const [saveState, setSaveState] = useState("idle");

  // check-in form
  const [date, setDate] = useState(todayStr());
  const [energy, setEnergy] = useState(null);
  const [pain, setPain] = useState(3);
  const [painAreas, setPainAreas] = useState([]);
  const [painQuality, setPainQuality] = useState([]);
  const [spoonStart, setSpoonStart] = useState(null);
  const [spoonLeft, setSpoonLeft] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [meds, setMeds] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [notes, setNotes] = useState("");
  const [customTerms, setCustomTerms] = useState({ symptoms: [], meds: [], triggers: [], insurance: [], specialties: [], conditions: [], declined: [] });

  // care record (trail)
  const [dismissals, setDismissals] = useState([]);
  const [dCopied, setDCopied] = useState(false);
  const [appealCopiedId, setAppealCopiedId] = useState(null);
  const [dSaveState, setDSaveState] = useState("idle");
  const [dMore, setDMore] = useState(false);
  const [dType, setDType] = useState("dismissed");
  const [dDate, setDDate] = useState(todayStr());
  const [dSetting, setDSetting] = useState("Primary care");
  const [dSpecialty, setDSpecialty] = useState("");
  const [dInsurance, setDInsurance] = useState("");
  const [dProvider, setDProvider] = useState("");
  const [dFacility, setDFacility] = useState("");
  const [dReported, setDReported] = useState("");
  const [dSaid, setDSaid] = useState("");
  const [dDeclined, setDDeclined] = useState([]);
  const [dRight, setDRight] = useState("");
  const [dAccess, setDAccess] = useState("");
  const [dWait, setDWait] = useState("");
  const [dOutcome, setDOutcome] = useState("");
  const [dPhotos, setDPhotos] = useState([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // toolkit + research consent
  const [tPlan, setTPlan] = useState("");
  const [tType, setTType] = useState("");
  const [pbOpen, setPbOpen] = useState(null);
  const [myConditions, setMyConditions] = useState([]);
  const [myName, setMyName] = useState("");
  const [setupDone, setSetupDone] = useState(true);
  const [tChecked, setTChecked] = useState([]);
  const [rConsent, setRConsent] = useState(false);
  const [medHx, setMedHx] = useState([]);
  const [hxMed, setHxMed] = useState("");
  const [hxReaction, setHxReaction] = useState("");
  const [hxKind, setHxKind] = useState("allergy");
  const [rCopied, setRCopied] = useState(false);

  // appearance preferences
  const [theme, setTheme] = useState("blush");
  const [skinTone, setSkinTone] = useState("blush");
  const [bodyShape, setBodyShape] = useState("b2");
  const [hairStyle, setHairStyle] = useState("afro");
  const [hairColor, setHairColor] = useState("black");
  const [wrapColor, setWrapColor] = useState("plum");
  const [textScale, setTextScale] = useState("default");
  const [motionOff, setMotionOff] = useState(false);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderTime, setReminderTime] = useState("19:00");
  // Appearance now opens as a popup from the palette button on the body map, instead of
  // only living buried in a Toolkit accordion — same content, just reachable in one tap
  // from where you're actually looking at the body map.
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  // current medication dosing schedule + refill dates — separate from medHx (which tracks
  // allergies/things that didn't work), this is "what I'm actively taking and when".
  const [medSchedule, setMedSchedule] = useState([]);
  const [msMed, setMsMed] = useState("");
  const [msDose, setMsDose] = useState("");
  const [msTimes, setMsTimes] = useState("");
  const [msRefillDate, setMsRefillDate] = useState("");

  // apply the chosen theme by mutating the shared COLORS/GRAD references before
  // this render's JSX (and every sibling component's JSX) reads them.
  const activeTheme = THEMES.find((t) => t.key === theme) || THEMES[0];
  COLORS.plum = activeTheme.plum;
  COLORS.plumDark = activeTheme.plumDark;
  COLORS.pill = activeTheme.pill;
  COLORS.line = activeTheme.line;
  GRAD = `linear-gradient(135deg, ${activeTheme.plum}, ${activeTheme.plumDark})`;
  const activeSkin = SKIN_TONES.find((s) => s.key === skinTone) || SKIN_TONES[0];
  const activeBodyShape = BODY_SHAPES.find((s) => s.key === bodyShape) || BODY_SHAPES[1];
  const activeHairColor = HAIR_COLORS.find((h) => h.key === hairColor) || HAIR_COLORS[0];
  const activeWrapColor = WRAP_COLORS.find((w) => w.key === wrapColor) || WRAP_COLORS[0];
  const activeScale = TEXT_SCALES.find((s) => s.key === textScale) || TEXT_SCALES[0];

  useEffect(() => {
    document.documentElement.style.fontSize = `${activeScale.pct}%`;
  }, [activeScale.pct]);

  const markIntroSeen = () => store.set("dlyw-intro-seen", true);

  useEffect(() => {
    if (store.get("dlyw-intro-seen") === true) setIntroOpen(false);
    const e = store.get(STORAGE_KEY);
    if (Array.isArray(e)) setEntries(e);
    const d = store.get(DISMISSAL_KEY);
    if (Array.isArray(d)) setDismissals(d);
    const c = store.get(CUSTOM_KEY);
    if (c && typeof c === "object") setCustomTerms((prev) => ({ ...prev, ...c }));
    const tk = store.get(TOOLKIT_KEY);
    if (tk && typeof tk === "object") {
      if (tk.plan) setTPlan(tk.plan);
      if (tk.planType) setTType(tk.planType);
      if (Array.isArray(tk.checked)) setTChecked(tk.checked);
      if (typeof tk.consent === "boolean") setRConsent(tk.consent);
      if (Array.isArray(tk.conditions)) setMyConditions(tk.conditions);
      if (typeof tk.name === "string") setMyName(tk.name);
      if (Array.isArray(tk.medHx)) setMedHx(tk.medHx);
      if (typeof tk.prepNotes === "string") setPrepNotes(tk.prepNotes);
      if (typeof tk.prepSpecialty === "string") setPrepSpecialty(tk.prepSpecialty);
      setSetupDone(tk.setupDone !== false);
      setRSeen(tk.rSeen === true);
      if (typeof tk.theme === "string") setTheme(tk.theme);
      if (typeof tk.skinTone === "string") setSkinTone(tk.skinTone);
      if (typeof tk.bodyShape === "string") setBodyShape(tk.bodyShape);
      if (typeof tk.hairStyle === "string") setHairStyle(tk.hairStyle);
      if (typeof tk.hairColor === "string") setHairColor(tk.hairColor);
      if (typeof tk.wrapColor === "string") setWrapColor(tk.wrapColor);
      if (typeof tk.textScale === "string") setTextScale(tk.textScale);
      if (typeof tk.motionOff === "boolean") setMotionOff(tk.motionOff);
      if (typeof tk.reminderOn === "boolean") setReminderOn(tk.reminderOn);
      if (typeof tk.reminderTime === "string") setReminderTime(tk.reminderTime);
      if (Array.isArray(tk.medSchedule)) setMedSchedule(tk.medSchedule);
    } else {
      setSetupDone(false);
      setRSeen(false);
    }
    setLoaded(true);
  }, []);

  // persist toolkit state (debounced)
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      store.set(TOOLKIT_KEY, {
        plan: tPlan, planType: tType, checked: tChecked, consent: rConsent,
        conditions: myConditions, name: myName, medHx, prepNotes, prepSpecialty,
        setupDone, rSeen, theme, skinTone, bodyShape, hairStyle, hairColor, wrapColor, textScale, motionOff,
        reminderOn, reminderTime, medSchedule,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [tPlan, tType, tChecked, rConsent, myConditions, myName, medHx, prepNotes, prepSpecialty, setupDone, rSeen, theme, skinTone, bodyShape, hairStyle, hairColor, wrapColor, textScale, motionOff, reminderOn, reminderTime, medSchedule, loaded]);



  useEffect(() => {
    const s = setTimeout(() => setSplash(false), 2400);
    return () => clearTimeout(s);
  }, []);

  // Daily check-in reminder. True background push (a notification while the app/tab is fully
  // closed) needs a server with VAPID keys, which is out of scope for this static app — so this
  // is the honest version: while the app is open, once the chosen time has passed and today's
  // page hasn't been saved yet, show an in-app banner, and also fire a real browser Notification
  // if permission was granted (works even if Whimsy is just in a background tab).
  const [reminderDue, setReminderDue] = useState(false);
  useEffect(() => {
    if (!loaded) return;
    const check = () => {
      if (!reminderOn) { setReminderDue(false); return; }
      const now = new Date();
      const [h, m] = reminderTime.split(":").map(Number);
      const timeHasPassed = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
      const hasToday = entries.some((e) => e.date === todayStr());
      setReminderDue(timeHasPassed && !hasToday);
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [reminderOn, reminderTime, entries, loaded]);

  useEffect(() => {
    if (!reminderDue) return;
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try { new Notification("Whimsy", { body: "Time for today's check-in — how's your body today?", tag: "whimsy-daily" }); } catch (e) { /* ignore */ }
    }
  }, [reminderDue]);

  const toggleReminder = async () => {
    if (!reminderOn && typeof Notification !== "undefined" && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch (e) { /* ignore */ }
    }
    setReminderOn(!reminderOn);
  };

  const persist = async (next) => {
    setEntries(next);
    store.set(STORAGE_KEY, next);
    return true;
  };

  const persistDismissals = async (next) => {
    setDismissals(next);
    store.set(DISMISSAL_KEY, next);
    return true;
  };

  const addCustomTerm = async (kind, term) => {
    const next = { ...customTerms, [kind]: [...new Set([...(customTerms[kind] || []), term])] };
    setCustomTerms(next);
    store.set(CUSTOM_KEY, next);
  };

  const saveEntry = async () => {
    if (!energy) return;
    setSaveState("saving");
    const entry = {
      id: Date.now().toString(36),
      date, energy, pain,
      painAreas: [...painAreas],
      painQuality: [...painQuality],
      spoonStart, spoonLeft,
      symptoms: symptoms.join(", "),
      meds: meds.join(", "),
      triggers: triggers.join(", "),
      notes: notes.trim(),
    };
    const next = [...entries.filter((e) => e.date !== date), entry].sort((a, b) => a.date.localeCompare(b.date));
    const ok = await persist(next);
    setSaveState(ok ? "saved" : "error");
    if (ok) {
      setEnergy(null); setPain(3); setPainAreas([]); setPainQuality([]); setSpoonStart(null); setSpoonLeft(null); setSymptoms([]); setMeds([]); setTriggers([]); setNotes("");
      setDate(todayStr());
      setTimeout(() => setSaveState("idle"), 2200);
    }
  };

  // Backdating support: switching the check-in date loads that day's existing entry into
  // the form (so it can be corrected, not just deleted-and-redone), or clears the form for
  // a fresh entry if that day hasn't been logged yet.
  const loadOrResetForDate = (d) => {
    const existing = entries.find((e) => e.date === d);
    if (existing) {
      setEnergy(existing.energy);
      setPain(existing.pain);
      setPainAreas(existing.painAreas || []);
      setPainQuality(existing.painQuality || []);
      setSpoonStart(existing.spoonStart != null ? existing.spoonStart : null);
      setSpoonLeft(existing.spoonLeft != null ? existing.spoonLeft : null);
      setSymptoms(existing.symptoms ? existing.symptoms.split(", ").filter(Boolean) : []);
      setMeds(existing.meds ? existing.meds.split(", ").filter(Boolean) : []);
      setTriggers(existing.triggers ? existing.triggers.split(", ").filter(Boolean) : []);
      setNotes(existing.notes || "");
    } else {
      setEnergy(null); setPain(3); setPainAreas([]); setPainQuality([]); setSpoonStart(null); setSpoonLeft(null); setSymptoms([]); setMeds([]); setTriggers([]); setNotes("");
    }
  };
  const handleDateChange = (d) => { setDate(d); loadOrResetForDate(d); };

  const deleteEntry = async (id) => {
    await persist(entries.filter((e) => e.id !== id));
  };

  const MAX_PHOTOS = 3;
  const handlePhotoSelect = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    const room = MAX_PHOTOS - dPhotos.length;
    if (room <= 0) { setPhotoError(`Up to ${MAX_PHOTOS} photos per receipt.`); return; }
    setPhotoError("");
    setPhotoBusy(true);
    try {
      const picked = files.slice(0, room);
      const compressed = await Promise.all(picked.map((f) => compressImage(f)));
      setDPhotos((prev) => [...prev, ...compressed.map((dataUrl, i) => ({ id: Date.now().toString(36) + i, dataUrl }))]);
    } catch (e) {
      console.error("Photo processing failed", e);
      setPhotoError("Couldn't process that photo. Try a different image.");
    } finally {
      setPhotoBusy(false);
    }
  };
  const removePhoto = (id) => setDPhotos((prev) => prev.filter((p) => p.id !== id));

  const saveDismissal = async () => {
    const required = dType === "believed" ? dRight.trim() : dSaid.trim();
    if (!required) return;
    setDSaveState("saving");
    const rec = {
      id: Date.now().toString(36),
      type: dType,
      date: dDate,
      setting: dSetting,
      specialty: dSpecialty.trim(),
      insurance: dInsurance,
      provider: dProvider.trim(),
      facility: dFacility.trim(),
      access: dAccess,
      wait: dWait,
      reported: dReported.trim(),
      said: dSaid.trim(),
      declined: dDeclined.join(", "),
      right: dRight.trim(),
      outcome: dOutcome.trim(),
      photos: dPhotos.map((p) => p.dataUrl),
    };
    const next = [...dismissals, rec].sort((a, b) => a.date.localeCompare(b.date));
    const ok = await persistDismissals(next);
    setDSaveState(ok ? "saved" : "error");
    if (ok) {
      setDDate(todayStr()); setDSetting("Primary care"); setDSpecialty(""); setDInsurance("");
      setDProvider(""); setDFacility(""); setDAccess(""); setDWait("");
      setDReported(""); setDSaid(""); setDDeclined([]); setDRight(""); setDOutcome("");
      setDPhotos([]); setPhotoError("");
      setDMore(false);
      setTimeout(() => setDSaveState("idle"), 2200);
    } else if (dPhotos.length > 0) {
      setPhotoError("Save failed — this receipt's photos may be too large for storage. Try removing one and saving again.");
    }
  };

  const deleteDismissal = async (id) => {
    await persistDismissals(dismissals.filter((d) => d.id !== id));
  };

  const streakDays = (() => {
    if (entries.length === 0) return 0;
    let s = 1;
    for (let i = entries.length - 1; i > 0; i--) {
      const a = new Date(entries[i].date + "T12:00:00").getTime();
      const b = new Date(entries[i - 1].date + "T12:00:00").getTime();
      if (Math.round((a - b) / 86400000) === 1) s++; else break;
    }
    return s;
  })();

  const codeMatches = codeQ.trim()
    ? CODES.filter((c) => {
        const q = codeQ.trim().toLowerCase();
        return c.c.toLowerCase().startsWith(q) || c.m.toLowerCase().includes(q) || c.t.toLowerCase() === q;
      }).slice(0, 10)
    : [];

  const effType = tType || PLAN_TO_TYPE[tPlan] || "";

  const flareWatch = (() => {
    if (entries.length < 5) return null;
    const last3 = entries.slice(-3);
    if (last3.length < 3) return null;
    const signals = [];
    if (last3[2].pain > last3[0].pain && last3[2].pain - last3[0].pain >= 2 && last3[1].pain >= last3[0].pain) signals.push("pain climbing");
    if (last3.every((e) => e.spoonStart != null) && last3[2].spoonStart <= last3[0].spoonStart - 3) signals.push("spoons dropping");
    if (last3[2].energy !== "green" && last3.filter((e) => e.energy !== "green").length >= 2) signals.push("low-energy days stacking");
    return signals.length > 0 ? signals : null;
  })();

  const triggerEchoes = (() => {
    const reds = entries.filter((e) => e.energy === "red");
    if (entries.length < 10 || reds.length < 3) return [];
    const dayMs = 86400000;
    const toMs = (e) => new Date(e.date + "T12:00:00").getTime();
    const counts = {};
    reds.forEach((r) => {
      const rt = toMs(r);
      const seen = new Set();
      entries.forEach((e) => {
        const dt = (rt - toMs(e)) / dayMs;
        if (dt >= 0 && dt <= 2) (e.triggers || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).forEach((x) => seen.add(x));
      });
      seen.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
    });
    return Object.entries(counts)
      .filter(([, c]) => c >= Math.max(2, Math.ceil(reds.length / 2)))
      .sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([k, c]) => ({ tg: k, c, total: reds.length }));
  })();

  const nourishMatches = nQ.trim()
    ? NOURISH.filter((x) => (x.n + " " + x.why).toLowerCase().includes(nQ.trim().toLowerCase())).slice(0, 8)
    : [];
  const guideMatches = gQ.trim()
    ? RESOURCES.flatMap((r) => r.points.map((p) => ({ g: r.title, p })))
        .filter(({ g, p }) => (g + " " + p).toLowerCase().includes(gQ.trim().toLowerCase()))
        .slice(0, 10)
    : [];
  const reliefMatches = rQ.trim()
    ? RELIEF.filter((x) => (x.n + " " + x.bestFor).toLowerCase().includes(rQ.trim().toLowerCase())).slice(0, 8)
    : [];

  const rangeDays = { "7d": 7, "1m": 30, "3m": 90, all: Infinity }[range];
  const ranged = entries.filter((e) => (Date.now() - new Date(e.date + "T12:00:00").getTime()) / 86400000 <= rangeDays);
  const recent = ranged.slice(-30);
  const chartData = recent.map((e) => ({ name: fmtDate(e.date), pain: e.pain, energy: e.energy }));

  const tkMatches = tkQ.trim()
    ? [
        ...CODES.map((c) => ({ src: "Codes", title: c.c, body: c.m })),
        ...NOURISH.map((x) => ({ src: "Nourish", title: x.n, body: x.why })),
        ...RELIEF.map((x) => ({ src: "Relief", title: x.n, body: "best for: " + x.bestFor })),
        ...BENEFITS.map((b) => ({ src: "Benefits", title: b.name, body: b.desc })),
        ...RESOURCES.flatMap((r) => r.points.map((p) => ({ src: r.title, title: "", body: p }))),
      ].filter((m) => (m.src + " " + m.title + " " + m.body).toLowerCase().includes(tkQ.trim().toLowerCase())).slice(0, 12)
    : [];

  const buildSummary = () => {
    if (entries.length === 0) return "";
    const first = entries[0].date, last = entries[entries.length - 1].date;
    const avgPain = (entries.reduce((s, e) => s + e.pain, 0) / entries.length).toFixed(1);
    const redDays = entries.filter((e) => e.energy === "red").length;
    const yellowDays = entries.filter((e) => e.energy === "yellow").length;
    const tally = (field) => {
      const counts = {};
      entries.forEach((e) => (e[field] || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
        .forEach((s) => { counts[s] = (counts[s] || 0) + 1; }));
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([k, v]) => `${k} (${v}x)`).join(", ") || "none logged";
    };
    const spoonEntries = entries.filter((e) => e.spoonStart != null);
    const lines = [
      "NOTES FOR MY NEXT VISIT (prepared by patient)",
      `Period: ${fmtDateLong(first)} to ${fmtDateLong(last)} (${entries.length} logged days)`,
      ...(myConditions.length > 0 ? [`Known conditions: ${myConditions.join(", ")}`] : []),
      ...(medHx.filter((m) => m.kind === "allergy").length > 0 ? [`ALLERGIES / REACTIONS: ${medHx.filter((m) => m.kind === "allergy").map((m) => m.reaction ? `${m.med} (${m.reaction})` : m.med).join("; ")}`] : []),
      ...(medHx.filter((m) => m.kind === "failed").length > 0 ? [`Medications tried without success: ${medHx.filter((m) => m.kind === "failed").map((m) => m.reaction ? `${m.med} (${m.reaction})` : m.med).join("; ")}`] : []),
      ...(medSchedule.length > 0 ? [`Current medications: ${medSchedule.map((m) => `${m.med}${m.dose ? " " + m.dose : ""}${m.times ? " (" + m.times + ")" : ""}`).join("; ")}`] : []),
      "",
      `Average pain level: ${avgPain} / 10`,
      `Flare (red) days: ${redDays} · Low-energy (yellow) days: ${yellowDays}`,
      ...(spoonEntries.length > 0 ? [`Average energy at start of day: ${(spoonEntries.reduce((s, e) => s + e.spoonStart, 0) / spoonEntries.length).toFixed(1)} / 12 spoons`] : []),
      ...(entries.some((e) => e.painAreas && e.painAreas.length) ? [`Most frequent pain locations: ${(() => {
        const c = {};
        entries.forEach((e) => (e.painAreas || []).forEach((k) => { const l = BODY_MAP.find((b) => b.k === k)?.label; if (l) c[l] = (c[l] || 0) + 1; }));
        return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} (${v}x)`).join(", ");
      })()}`] : []),
      `Most frequent symptoms: ${tally("symptoms")}`,
      `Suspected triggers: ${tally("triggers")}`,
      "",
      "DAILY LOG",
      ...entries.map((e) => {
        const parts = [`${e.date} · ${e.energy.toUpperCase()} · pain ${e.pain}/10`];
        if (e.painAreas && e.painAreas.length) parts.push(`pain areas: ${e.painAreas.map((k) => BODY_MAP.find((b) => b.k === k)?.label).filter(Boolean).join(", ")}`);
        if (e.painQuality && e.painQuality.length) parts.push(`pain quality: ${e.painQuality.join(", ")}`);
        if (e.spoonStart != null || e.spoonLeft != null) parts.push(`spoons: ${e.spoonStart != null ? e.spoonStart + " start" : ""}${e.spoonStart != null && e.spoonLeft != null ? ", " : ""}${e.spoonLeft != null ? e.spoonLeft + " left" : ""}`);
        if (e.symptoms) parts.push(`symptoms: ${e.symptoms}`);
        if (e.meds) parts.push(`meds: ${e.meds}`);
        if (e.triggers) parts.push(`triggers: ${e.triggers}`);
        if (e.notes) parts.push(`notes: ${e.notes}`);
        return "• " + parts.join(" | ");
      }),
      "",
      "Logged with Whimsy, the Don't Lose Your Whimsy app.",
    ];
    return lines.join("\n");
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const buildVisitPlan = () => {
    const last14 = entries.slice(-14);
    const avgPain = last14.length ? (last14.reduce((s, e) => s + e.pain, 0) / last14.length).toFixed(1) : null;
    const redDays = last14.filter((e) => e.energy === "red").length;
    const spoonE = last14.filter((e) => e.spoonStart != null);
    const medCounts = {};
    entries.forEach((e) => (e.meds || "").split(",").map((s) => s.trim()).filter(Boolean).forEach((m) => { medCounts[m] = (medCounts[m] || 0) + 1; }));
    const topMeds = Object.entries(medCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k).join(", ");
    const allergies = medHx.filter((m) => m.kind === "allergy");
    const failed = medHx.filter((m) => m.kind === "failed");
    const lines = ["MY VISIT PLAN" + (prepSpecialty ? " · " + prepSpecialty : "")];
    if (prepNotes.trim()) lines.push("", "Top concerns:", ...prepNotes.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 5).map((l) => "• " + l));
    if (myConditions.length > 0) lines.push("", "Conditions: " + myConditions.join(", "));
    if (allergies.length > 0) lines.push("ALLERGIES / REACTIONS: " + allergies.map((m) => m.reaction ? `${m.med} (${m.reaction})` : m.med).join("; "));
    if (failed.length > 0) lines.push("Tried without success: " + failed.map((m) => m.reaction ? `${m.med} (${m.reaction})` : m.med).join("; "));
    if (topMeds) lines.push("Current meds and supplements: " + topMeds);
    if (avgPain != null) lines.push("", `Last ${last14.length} check-ins: average pain ${avgPain}/10, ${redDays} flare day(s)` + (spoonE.length > 0 ? `, average ${(spoonE.reduce((s, e) => s + e.spoonStart, 0) / spoonE.length).toFixed(1)}/12 spoons at day start` : ""));
    lines.push(
      "",
      "Before I leave I will ask:",
      "• What is my diagnosis code today?",
      "• What are we ruling out, and how?",
      "• When do I follow up, and what would make it urgent sooner?",
      "• Will the referral or prior auth be sent today, and who follows up on it?",
      "",
      "If anything is declined, I will ask for it to be documented in my chart."
    );
    return lines.join("\n");
  };

  const buildTrail = () => {
    if (dismissals.length === 0) return "";
    const believed = dismissals.filter((d) => d.type === "believed");
    const dismissed = dismissals.filter((d) => d.type !== "believed");
    const lines = ["CARE RECORD (documented by patient)", ""];
    if (believed.length > 0) {
      lines.push(`PROVIDERS WHO BELIEVED ME (${believed.length})`);
      believed.forEach((d) => {
        lines.push(`${d.date} · ${d.provider || "Provider"}${d.facility ? " · " + d.facility : ""} · ${d.setting}${d.specialty ? " (" + d.specialty + ")" : ""}${d.insurance ? " · " + d.insurance : ""}`);
        if (d.right) lines.push(`  What they did right: ${d.right}`);
        if (d.access) lines.push(`  Finding them with my insurance: ${d.access}`);
        if (d.wait) lines.push(`  Wait for appointment: ${d.wait}`);
        lines.push("");
      });
    }
    if (dismissed.length > 0) {
      lines.push(`DISMISSAL RECORD (${dismissed.length})`);
      dismissed.forEach((d) => {
        lines.push(`${d.date} · ${d.setting}${d.specialty ? " (" + d.specialty + ")" : ""}${d.provider ? " · " + d.provider : ""}${d.facility ? " · " + d.facility : ""}${d.insurance ? " · " + d.insurance : ""}`);
        if (d.reported) lines.push(`  Reported: ${d.reported}`);
        if (d.said) lines.push(`  Was told: "${d.said}"`);
        if (d.declined) lines.push(`  Declined/refused: ${d.declined}`);
        if (d.access) lines.push(`  Finding care with my insurance: ${d.access}`);
        if (d.wait) lines.push(`  Wait for appointment: ${d.wait}`);
        if (d.outcome) lines.push(`  Since then: ${d.outcome}`);
        if (d.photos && d.photos.length > 0) lines.push(`  Photo evidence attached in-app (${d.photos.length}) — not included in this text export.`);
        lines.push("");
      });
    }
    lines.push("Logged with Whimsy, the Don't Lose Your Whimsy app.");
    return lines.join("\n");
  };

  // Assembles an appeal draft from a single dismissal receipt, plus the plan-appropriate
  // appeal rights already sitting in the Toolkit playbooks, so documenting the dismissal
  // and acting on it are one motion instead of two.
  const buildAppealText = (d) => {
    const lines = [];
    lines.push(`Re: Appeal of care denial / dismissal — ${d.date}`);
    lines.push("");
    lines.push(`I am writing to appeal the outcome of my ${d.setting ? d.setting.toLowerCase() : "visit"}${d.specialty ? " (" + d.specialty + ")" : ""} on ${fmtDateLong(d.date)}${d.facility ? " at " + d.facility : ""}${d.provider ? " with " + d.provider : ""}.`);
    lines.push("");
    if (d.reported) lines.push(`What I reported: ${d.reported}`);
    if (d.said) lines.push(`What I was told: "${d.said}"`);
    if (d.declined) lines.push(`What was declined or refused: ${d.declined}`);
    if (myConditions.length) lines.push(`Relevant conditions on record: ${myConditions.join(", ")}`);
    if (medHx.length) lines.push(`Documented allergies/failed treatments: ${medHx.map((m) => m.med).join(", ")}`);
    if (d.photos && d.photos.length > 0) lines.push(`Supporting photo evidence (${d.photos.length}) is attached to this receipt in the Whimsy app and available on request.`);
    lines.push("");
    const section = effType && PLAYBOOKS[effType] && PLAYBOOKS[effType].find((s) => /when they say no/i.test(s.h));
    if (section) {
      lines.push(`Under my plan (${tPlan || TYPE_LABELS[effType] || effType}), my appeal rights include:`);
      section.pts.forEach((p) => lines.push(`- ${p}`));
      lines.push("");
    }
    lines.push("I am requesting a full review of this decision and ask that my medical record, including the documentation above, be considered as part of that review.");
    lines.push("");
    lines.push("Sincerely,");
    lines.push(myName || "[your name]");
    return lines.join("\n");
  };

  const copyAppeal = async (d) => {
    try {
      await navigator.clipboard.writeText(buildAppealText(d));
      setAppealCopiedId(d.id);
      setTimeout(() => setAppealCopiedId(null), 2200);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const copyTrail = async () => {
    try {
      await navigator.clipboard.writeText(buildTrail());
      setDCopied(true);
      setTimeout(() => setDCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const buildResearchExport = () => {
    const allDates = [...entries.map((e) => e.date), ...dismissals.map((d) => d.date)].filter(Boolean).sort();
    if (allDates.length === 0) return "";
    const base = new Date(allDates[0] + "T12:00:00").getTime();
    const relDay = (iso) => Math.round((new Date(iso + "T12:00:00").getTime() - base) / 86400000) + 1;
    const anon = {
      schema: "dlyw-research-v1",
      consentVersion: "2026-07-consent-v1",
      contributedAt: new Date().toISOString().slice(0, 10),
      purpose: "Community research on medical dismissal, access barriers, and what helps. Academic and policy use. Pending formal ethics review before publication.",
      note: "Anonymized: no names, facilities, notes, or calendar dates. Time is relative (day 1 = first record).",
      conditions: myConditions,
      medHistory: medHx.map((m) => ({ med: m.med, kind: m.kind })),
      checkins: entries.map((e) => ({
        day: relDay(e.date),
        energy: e.energy,
        pain: e.pain,
        painAreas: e.painAreas || [],
        painQuality: e.painQuality || [],
        spoonStart: e.spoonStart != null ? e.spoonStart : null,
        spoonLeft: e.spoonLeft != null ? e.spoonLeft : null,
        symptoms: e.symptoms || "",
        meds: e.meds || "",
        triggers: e.triggers || "",
      })),
      careVisits: dismissals.map((d) => ({
        day: relDay(d.date),
        type: d.type === "believed" ? "believed" : "dismissed",
        setting: d.setting || "",
        specialty: d.specialty || "",
        insurance: d.insurance || "",
        access: d.access || "",
        wait: d.wait || "",
        ...(d.type !== "believed" && d.said ? { dismissalLanguage: d.said } : {}),
      })),
    };
    return JSON.stringify(anon, null, 2);
  };

  const copyResearchExport = async () => {
    try {
      await navigator.clipboard.writeText(buildResearchExport());
      setRCopied(true);
      setTimeout(() => setRCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const buildBackup = () => JSON.stringify({
    app: "dont-lose-your-whimsy-flare-journal",
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
    careRecords: dismissals,
    customTerms,
  }, null, 2);

  const downloadBackup = async () => {
    const text = buildBackup();
    try {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whimsy-backup-${todayStr()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setBackupState("saved");
      setTimeout(() => setBackupState(""), 2600);
    } catch (e) {
      try {
        await navigator.clipboard.writeText(text);
        setBackupState("copied");
        setTimeout(() => setBackupState(""), 2600);
      } catch (e2) {
        console.error("Backup failed", e2);
      }
    }
  };

  const restoreBackup = (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.app !== "dont-lose-your-whimsy-flare-journal") throw new Error("Not a Whimsy backup file");
        if (Array.isArray(data.entries)) await persist(data.entries);
        if (Array.isArray(data.careRecords)) await persistDismissals(data.careRecords);
        if (data.customTerms && typeof data.customTerms === "object") {
          const merged = { symptoms: [], meds: [], triggers: [], insurance: [], specialties: [], conditions: [], declined: [], ...data.customTerms };
          setCustomTerms(merged);
          store.set(CUSTOM_KEY, merged);
        }
      } catch (e) {
        console.error("Restore failed", e);
      }
    };
    reader.readAsText(file);
  };

  const NAV = [
    { id: "today", icon: NotebookPen, label: "Today" },
    { id: "patterns", icon: TrendingUp, label: "Patterns" },
    { id: "trail", icon: Scale, label: "Receipts" },
    { id: "toolkit", icon: BookOpen, label: "Toolkit" },
  ];

  // Shared between the Toolkit "Appearance" accordion and the popup opened from the palette
  // button on the body map, so the two entry points never drift out of sync.
  const appearanceContent = (
    <>
      <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>
        Why be normal when you can be you? Make Whimsy look and feel like yours.
      </p>

      <p className={labelCls} style={{ color: COLORS.inkSoft }}>Accent color</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {THEMES.map((t) => (
          <button key={t.key} onClick={() => setTheme(t.key)} aria-label={t.label}
            className="rounded-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2 focus:outline-none focus-visible:ring-2"
            style={{ border: `2px solid ${theme === t.key ? t.plumDark : COLORS.line}`, background: theme === t.key ? t.pill : COLORS.card, color: COLORS.ink }}>
            <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, ${t.plum}, ${t.plumDark})` }} />
            {t.label}
          </button>
        ))}
      </div>

      <p className={labelCls} style={{ color: COLORS.inkSoft }}>Body map skin tone</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {SKIN_TONES.map((s) => (
          <button key={s.key} onClick={() => setSkinTone(s.key)} aria-label={s.label}
            className="w-9 h-9 rounded-full focus:outline-none focus-visible:ring-2 flex items-center justify-center"
            style={{ background: s.fill, border: skinTone === s.key ? `3px solid ${COLORS.plumDark}` : `1px solid ${COLORS.line}` }}>
            {skinTone === s.key && <Check size={14} color="#fff" style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.5))" }} />}
          </button>
        ))}
      </div>

      <p className={labelCls} style={{ color: COLORS.inkSoft }}>Body type</p>
      <p className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>The body map isn't one default shape. Pick whichever feels like you.</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {BODY_SHAPES.map((s) => (
          <button key={s.key} onClick={() => setBodyShape(s.key)} aria-label={s.label} aria-pressed={bodyShape === s.key}
            className="rounded-full px-3.5 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2"
            style={{ border: `2px solid ${bodyShape === s.key ? COLORS.plumDark : COLORS.line}`, background: bodyShape === s.key ? COLORS.pill : COLORS.card, color: COLORS.ink }}>
            {s.label.replace(" (default)", "")}
          </button>
        ))}
      </div>

      <p className={labelCls} style={{ color: COLORS.inkSoft }}>Hairstyle</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {HAIRSTYLES.map((h) => (
          <button key={h.key} onClick={() => setHairStyle(h.key)} aria-label={h.label} aria-pressed={hairStyle === h.key}
            className="rounded-full px-3.5 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2"
            style={{ border: `2px solid ${hairStyle === h.key ? COLORS.plumDark : COLORS.line}`, background: hairStyle === h.key ? COLORS.pill : COLORS.card, color: COLORS.ink }}>
            {h.label}
          </button>
        ))}
      </div>

      <p className={labelCls} style={{ color: COLORS.inkSoft }}>Hair color</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {HAIR_COLORS.map((h) => (
          <button key={h.key} onClick={() => setHairColor(h.key)} aria-label={h.label}
            className="w-9 h-9 rounded-full focus:outline-none focus-visible:ring-2 flex items-center justify-center"
            style={{ background: h.hex, border: hairColor === h.key ? `3px solid ${COLORS.plumDark}` : `1px solid ${COLORS.line}` }}>
            {hairColor === h.key && <Check size={14} color="#fff" style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.6))" }} />}
          </button>
        ))}
      </div>

      {hairStyle === "headwrap" && (
        <>
          <p className={labelCls} style={{ color: COLORS.inkSoft }}>Wrap color</p>
          <p className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>A headwrap is fabric, not hair — its own color, separate from hair color.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {WRAP_COLORS.map((w) => (
              <button key={w.key} onClick={() => setWrapColor(w.key)} aria-label={w.label}
                className="w-9 h-9 rounded-full focus:outline-none focus-visible:ring-2 flex items-center justify-center"
                style={{ background: w.hex, border: wrapColor === w.key ? `3px solid ${COLORS.plumDark}` : `1px solid ${COLORS.line}` }}>
                {wrapColor === w.key && <Check size={14} color="#fff" style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.6))" }} />}
              </button>
            ))}
          </div>
        </>
      )}

      <p className={labelCls} style={{ color: COLORS.inkSoft }}>Text size</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {TEXT_SCALES.map((s) => (
          <button key={s.key} onClick={() => setTextScale(s.key)}
            className="rounded-2xl py-2.5 text-xs font-bold focus:outline-none focus-visible:ring-2"
            style={{ border: `2px solid ${textScale === s.key ? COLORS.plumDark : COLORS.line}`, background: textScale === s.key ? COLORS.pill : COLORS.card, color: COLORS.ink }}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-3.5 flex items-center justify-between" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
        <div className="pr-3">
          <p className="text-sm font-bold">Reduce motion</p>
          <p className="text-xs" style={{ color: COLORS.inkSoft }}>Turns off floating, swaying, and growing animations in-app, on top of your device's own motion setting.</p>
        </div>
        <button onClick={() => setMotionOff(!motionOff)} aria-label="Toggle reduce motion" aria-pressed={motionOff}
          className="shrink-0 rounded-full p-1 focus:outline-none focus-visible:ring-2"
          style={{ width: 46, height: 26, background: motionOff ? GRAD : COLORS.line }}>
          <span className="block rounded-full bg-white" style={{ width: 18, height: 18, transform: motionOff ? "translateX(20px)" : "translateX(0)", transition: "transform .15s ease" }} />
        </button>
      </div>

      <div className="rounded-2xl p-3.5 mt-3" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center justify-between">
          <div className="pr-3">
            <p className="text-sm font-bold">Daily check-in reminder</p>
            <p className="text-xs" style={{ color: COLORS.inkSoft }}>
              A nudge while Whimsy's open (or a browser notification, if allowed) if today's page is still blank past this time. No server involved — this only works while the app is open somewhere, not fully closed.
            </p>
          </div>
          <button onClick={toggleReminder} aria-label="Toggle daily reminder" aria-pressed={reminderOn}
            className="shrink-0 rounded-full p-1 focus:outline-none focus-visible:ring-2"
            style={{ width: 46, height: 26, background: reminderOn ? GRAD : COLORS.line }}>
            <span className="block rounded-full bg-white" style={{ width: 18, height: 18, transform: reminderOn ? "translateX(20px)" : "translateX(0)", transition: "transform .15s ease" }} />
          </button>
        </div>
        {reminderOn && (
          <div className="mt-3 flex items-center gap-2">
            <Bell size={14} style={{ color: COLORS.plumDark }} />
            <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2"
              style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, color: COLORS.ink }} />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className={motionOff ? "whimsy-root reduce-motion" : "whimsy-root"} style={{ background: "radial-gradient(900px 420px at -10% -5%, #F8DCE4 0%, rgba(248,220,228,0) 60%), radial-gradient(700px 360px at 110% -2%, #F4E4CE 0%, rgba(244,228,206,0) 55%), #FBF1EC", minHeight: "100vh", color: COLORS.ink, fontFamily: BODY }}>
      <style>{`
        input[type="date"]{-webkit-appearance:none;appearance:none;min-height:44px;}
        input[type="date"]::-webkit-date-and-time-value{text-align:left;}
        .whimsy-range{-webkit-appearance:none;appearance:none;width:100%;height:26px;background:transparent;cursor:pointer;}
        .whimsy-range::-webkit-slider-runnable-track{height:8px;border-radius:999px;background:linear-gradient(90deg,#6BA483 0%,#D4A63F 55%,#C8354F 100%);}
        .whimsy-range::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:transparent;border:none;box-shadow:none;margin-top:-11px;}
        .whimsy-range::-moz-range-track{height:8px;border-radius:999px;background:linear-gradient(90deg,#6BA483,#D4A63F,#C8354F);}
        .whimsy-range::-moz-range-thumb{width:30px;height:30px;border-radius:50%;background:transparent;border:none;box-shadow:none;}
        .whimsy-float{animation:wfloat 3.2s ease-in-out infinite;display:inline-flex;}
        @keyframes wfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        .whimsy-pop{animation:wpop .5s cubic-bezier(.2,1.4,.4,1);}
        .tab-in{animation:fadeup .32s ease;}
        @keyframes fadeup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .plant{transform-box:fill-box;transform-origin:50% 100%;animation:grow .55s ease-out backwards;}
        @keyframes grow{from{transform:scaleY(0)}}
        .whimsy-sway{display:inline-block;animation:sway 4.5s ease-in-out infinite;transform-origin:bottom center;}
        @keyframes sway{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
        @media (prefers-reduced-motion: reduce){.whimsy-float,.whimsy-pop,.wspark,.spoon-btn,.tab-in,.plant,.whimsy-sway,.whimsy-drift,.splash-title,.splash-sub,.splash-sprig,.splash-ring,.pixie,.wingL,.wingR,.splash-fly,.ache{animation:none !important;transition:none !important;}}
        .reduce-motion .whimsy-float,.reduce-motion .whimsy-pop,.reduce-motion .wspark,.reduce-motion .spoon-btn,.reduce-motion .tab-in,.reduce-motion .plant,.reduce-motion .whimsy-sway,.reduce-motion .whimsy-drift,.reduce-motion .splash-title,.reduce-motion .splash-sub,.reduce-motion .splash-sprig,.reduce-motion .splash-ring,.reduce-motion .pixie,.reduce-motion .wingL,.reduce-motion .wingR,.reduce-motion .splash-fly,.reduce-motion .ache{animation:none !important;transition:none !important;}
        .whimsy-drift{animation:drift 9s ease-in-out infinite alternate;}
        @keyframes drift{from{transform:translateX(0)}to{transform:translateX(-16px)}}
        .splash{animation:splashFade 2.4s ease forwards;}
        @keyframes splashFade{0%,80%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.035)}}
        .splash-title{animation:titleIn .95s cubic-bezier(.16,1,.3,1) .3s both;}
        @keyframes titleIn{from{opacity:0;transform:scale(.82) translateY(6px)}}
        .splash-sub{animation:fadeup .6s ease .55s both;}
        .splash-sprig{display:inline-block;transform-origin:bottom center;animation:grow .8s ease .25s both;}
        .splash-ring{stroke-dasharray:100;stroke-dashoffset:100;animation:ringDraw 1.25s cubic-bezier(.4,0,.2,1) .15s forwards;}
        @keyframes ringDraw{to{stroke-dashoffset:16}}
        .pixie{opacity:0;transform-box:fill-box;transform-origin:center;animation:twinkle 1.6s ease-in-out infinite;}
        @keyframes twinkle{0%,100%{opacity:0;transform:scale(.35)}50%{opacity:1;transform:scale(1.15)}}
        .wingL,.wingR{transform-box:fill-box;}
        .wingL{transform-origin:right center;animation:flap .75s ease-in-out infinite alternate;}
        .wingR{transform-origin:left center;animation:flap .75s ease-in-out infinite alternate;}
        @keyframes flap{to{transform:scaleX(.72)}}
        .shine{position:relative;overflow:hidden;display:inline-block;}
        .shine::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 32%,rgba(255,238,205,.9) 50%,transparent 68%);transform:translateX(-130%);animation:shineSweep 1s ease 1.1s forwards;}
        @keyframes shineSweep{to{transform:translateX(130%)}}
        .splash-fly{display:inline-block;animation:flyIn 1.3s cubic-bezier(.2,.8,.3,1) .55s both;}
        @keyframes flyIn{from{opacity:0;transform:translateX(-70px) translateY(12px) rotate(-8deg)}to{opacity:1;transform:none}}
        .bodypart{cursor:pointer;transition:fill .2s ease,stroke .2s ease;}
        .bodypart:active{opacity:.75;}
        .bodypart-photo{cursor:pointer;transition:fill .2s ease,stroke .2s ease;}
        .bodypart-photo:hover{fill:rgba(214,79,132,0.16);}
        .bodypart-photo:focus-visible{outline:2px solid #571F33;outline-offset:1px;}
        .bodypart-photo:active{opacity:.75;}
        .ache{animation:ache 2.2s ease-in-out infinite;}
        @keyframes ache{0%,100%{opacity:.14}50%{opacity:.4}}
        .spoon-btn{transition:transform .12s ease;}
        .spoon-btn:active{transform:scale(1.3) rotate(-10deg);}
        .wspark{position:absolute;top:0;color:#C9A24B;font-size:12px;opacity:0;animation:wspark 1s ease-out forwards;}
        @keyframes wspark{0%{opacity:0;transform:translateY(10px) scale(.5)}35%{opacity:1}100%{opacity:0;transform:translateY(-16px) scale(1.1)}}
        @keyframes wpop{0%{transform:scale(.7);opacity:0}100%{transform:scale(1);opacity:1}}
        button:active{transform:scale(.98);}
      `}</style>
      {splash && (
        <div className="splash fixed inset-0 z-50 overflow-hidden" style={{ background: "radial-gradient(620px 440px at 50% 32%, #FBE3E9 0%, rgba(251,227,233,0) 70%), #FDF0F2" }}>
          <svg className="absolute" width="300" height="300" viewBox="0 0 300 300" fill="none" aria-hidden="true"
            style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
            <circle className="splash-ring" cx="150" cy="150" r="132" stroke="#E06A93" strokeWidth="2.5" strokeLinecap="round" pathLength="100" transform="rotate(-65 150 150)" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = ((-65 + i * 30) * Math.PI) / 180;
              return (
                <circle key={i} className="pixie" cx={150 + 132 * Math.cos(a)} cy={150 + 132 * Math.sin(a)} r={i % 3 === 0 ? 2.4 : 1.5}
                  fill={i % 2 === 0 ? "#C9A24B" : "#E689AC"} style={{ animationDelay: `${0.2 + i * 0.09}s` }} />
              );
            })}
          </svg>
          <span className="absolute" style={{ left: 20, bottom: 96, transform: "rotate(-18deg)", opacity: 0.5 }}>
            <span className="splash-sprig"><Sprig size={84} /></span>
          </span>
          <span className="absolute" style={{ top: "24%", left: "56%" }}>
            <span className="splash-fly">
              <span className="whimsy-float">
                <svg width="44" height="36" viewBox="-22 -15 44 30" fill="none" aria-hidden="true"><Butterfly /></svg>
              </span>
            </span>
          </span>
          <div className="relative h-full flex flex-col items-center justify-center">
            <div className="relative">
              <span className="absolute whimsy-float" style={{ top: -22, right: -4, zIndex: 2 }}><Sparkles size={22} style={{ color: COLORS.gold }} /></span>
              <span className="splash-sub absolute" style={{ top: -6, right: -24, color: COLORS.plum, fontSize: 16, zIndex: 2 }}>♡</span>
              <span className="shine rounded-xl">
                <h1 className="splash-title" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "3rem", fontWeight: 700, color: COLORS.ink, lineHeight: 1.05, padding: "2px 12px" }}>Whimsy</h1>
              </span>
            </div>
            <p className="splash-sub text-sm mt-2" style={{ color: COLORS.inkSoft, fontFamily: SERIF, fontStyle: "italic" }}>by Don't Lose Your Whimsy</p>
            <div className="splash-sub h-0.5 w-24 rounded-full mt-1.5" style={{ background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)` }} />
          </div>
        </div>
      )}
      {loaded && !splash && introOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 tab-in"
          onClick={() => { setIntroOpen(false); markIntroSeen(); }}
          style={{ background: "rgba(87,31,51,0.28)", backdropFilter: "blur(3px)" }}>
          <div className="w-full max-w-md rounded-3xl p-6 pt-12 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, boxShadow: "0 20px 60px rgba(87,31,51,0.25)" }}>
            <button onClick={() => { setIntroOpen(false); markIntroSeen(); }} aria-label="Close"
              className="absolute rounded-full p-2 focus:outline-none focus-visible:ring-2"
              style={{ top: 12, right: 12, background: COLORS.pill, color: COLORS.plumDark, zIndex: 3 }}>
              <X size={16} />
            </button>
            <span className="whimsy-float absolute" style={{ right: 52, top: 18 }}><Sparkles size={16} style={{ color: COLORS.gold }} /></span>
            <span className="whimsy-sway absolute" style={{ left: 10, bottom: 8, opacity: 0.28 }}><Sprig size={26} /></span>
<div className={cardCls + " mb-4 tab-in"} style={{ ...cardStyle, border: "2px solid #EFC7D4" }}>
                {introStep === 0 && (
                  <>
                    <SectionTitle>What is Whimsy?</SectionTitle>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: COLORS.ink }}>
                      Most health apps ask what hurts. <strong>Whimsy asks whether you were believed.</strong>
                    </p>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: COLORS.inkSoft }}>
                      It's built for people with chronic illnesses and invisible disabilities: the ones told it's just anxiety, that their labs look fine, that they don't look sick. Whimsy turns your daily life into evidence, so the next appointment runs on your record instead of your memory on a bad day.
                    </p>
                  </>
                )}
                {introStep === 1 && (
                  <>
                    <SectionTitle>How it works</SectionTitle>
                    <div className="space-y-3 mb-4">
                      {[
                        [NotebookPen, "Check in", "Log your energy, pain, spoons, symptoms, and where it hurts. Thirty seconds is enough."],
                        [Scale, "Keep receipts", "Document every visit: did they believe you, or dismiss you? What was said, what was refused."],
                        [TrendingUp, "See your patterns", "Your check-ins grow a garden. Whimsy shows you what came before your flares."],
                        [BookOpen, "Walk in armed", "One tap builds a doctor-ready summary. The Toolkit decodes your insurance, your codes, and your appeal rights."],
                      ].map(([Icon, title, desc]) => (
                        <div key={title} className="flex gap-3 items-start">
                          <span className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0" style={{ background: COLORS.pill }}>
                            <Icon size={16} style={{ color: COLORS.plumDark }} />
                          </span>
                          <div>
                            <p className="text-sm font-bold" style={{ color: COLORS.ink }}>{title}</p>
                            <p className="text-xs leading-relaxed" style={{ color: COLORS.inkSoft }}>{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {introStep === 2 && (
                  <>
                    <SectionTitle>Yours, and only yours</SectionTitle>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: COLORS.inkSoft }}>
                      Everything you log stays on your device. No account, no tracking, nothing sold, ever. You can download your whole story anytime and take it with you.
                    </p>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: COLORS.inkSoft }}>
                      Whimsy never diagnoses anything and never replaces medical care. It just makes sure you are never the only one keeping the record.
                    </p>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 flex-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 rounded-full" style={{ width: i === introStep ? 22 : 8, background: i === introStep ? COLORS.plum : COLORS.line, transition: "width .2s ease" }} />
                    ))}
                  </div>
                  <button onClick={() => { if (introStep === 2) { setIntroOpen(false); markIntroSeen(); } else { setIntroStep(introStep + 1); } }}
                    className="rounded-full px-6 py-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-2"
                    style={{ background: GRAD, boxShadow: "0 4px 14px rgba(169,50,103,0.3)" }}>
                    {introStep === 2 ? "Let's begin" : "Next"}
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}
      {appearanceOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 tab-in"
          onClick={() => setAppearanceOpen(false)}
          role="dialog" aria-modal="true" aria-label="Appearance settings"
          style={{ background: "rgba(87,31,51,0.28)", backdropFilter: "blur(3px)" }}>
          <div className="w-full max-w-md rounded-3xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
            style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, boxShadow: "0 20px 60px rgba(87,31,51,0.25)", maxHeight: "88vh", overflowY: "auto" }}>
            <div className="flex items-center justify-between mb-1">
              <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1.2rem", color: COLORS.ink }}>Appearance</h2>
              <button onClick={() => setAppearanceOpen(false)} aria-label="Close"
                className="rounded-full p-2 focus:outline-none focus-visible:ring-2"
                style={{ background: COLORS.pill, color: COLORS.plumDark }}>
                <X size={16} />
              </button>
            </div>
            {appearanceContent}
          </div>
        </div>
      )}
      <div className="max-w-md mx-auto px-5 pb-44 pt-8">

        {/* App bar */}
        <header className="flex items-end justify-between mb-6">
          <div>
            <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "1.75rem", fontWeight: 700, letterSpacing: "0.01em", lineHeight: 1.1 }}>
              Whimsy
            </h1>
            <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft, fontFamily: SERIF, fontStyle: "italic" }}>
              by Don't Lose Your Whimsy ♡
            </p>
          </div>
          <span className="flex items-end gap-1 mb-1">
            <span className="whimsy-float"><Sparkles size={20} style={{ color: COLORS.gold }} /></span>
            <span className="whimsy-float text-sm" style={{ color: COLORS.plum, animationDelay: ".9s" }}>♡</span>
          </span>
        </header>



        
        <nav className="fixed bottom-0 left-0 right-0 z-10" style={{ background: "rgba(255,252,253,0.97)", borderTop: `1px solid ${COLORS.line}`, backdropFilter: "blur(10px)", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <div className="max-w-md mx-auto grid grid-cols-4">
            {NAV.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}
                className="flex flex-col items-center gap-1 pt-2.5 pb-2 focus:outline-none focus-visible:ring-2"
                style={{ color: tab === id ? COLORS.plumDark : "#BE9CAB" }}>
                <span key={tab === id ? "a" : "b"} className={"rounded-full px-3 py-1 " + (tab === id ? "whimsy-pop" : "")} style={{ background: tab === id ? COLORS.pill : "transparent" }}>
                  <Icon size={22} strokeWidth={tab === id ? 2.3 : 1.9} />
                </span>
                <span className="text-[10px] font-bold">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {lightboxUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
            role="dialog" aria-modal="true" aria-label="Photo, full size"
            style={{ background: "rgba(30,10,18,0.85)" }}
            onClick={() => setLightboxUrl(null)}
            onKeyDown={(e) => { if (e.key === "Escape") setLightboxUrl(null); }}>
            <button aria-label="Close photo" onClick={() => setLightboxUrl(null)}
              className="absolute top-5 right-5 rounded-full p-2 focus:outline-none focus-visible:ring-2"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
              <X size={22} />
            </button>
            <img src={lightboxUrl} alt="Attached evidence, full size" onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full rounded-2xl" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }} />
          </div>
        )}

        {/* ------- CHECK IN ------- */}
        {tab === "today" && (
          <section className="tab-in">
            {loaded && setupDone && !rConsent && !rSeen && (
              <div className="rounded-2xl px-4 py-3 mb-4 flex items-start gap-2" style={{ background: COLORS.pill, border: `1px solid ${COLORS.line}` }}>
                <p className="text-xs leading-relaxed flex-1" style={{ color: COLORS.ink }}>
                  Our stories change the system. Whimsy has optional, fully anonymous community research. Learn more in the Toolkit.
                </p>
                <button onClick={() => setRSeen(true)} aria-label="Dismiss" className="text-base font-bold leading-none focus:outline-none" style={{ color: COLORS.inkSoft }}>×</button>
              </div>
            )}
            {loaded && !setupDone && !introOpen && (
              <div className={cardCls + " mb-4 tab-in"} style={{ ...cardStyle, border: "2px solid #EFC7D4" }}>
                <SectionTitle>Welcome, friend</SectionTitle>
                <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>
                  Whimsy keeps your body's story on the record. One question to start: what chronic illnesses or invisible disabilities are you living with? Your own words count, and so does "undiagnosed / still searching." You can edit this anytime in the Toolkit.
                </p>
                <Field label="What should Whimsy call you? (optional)" value={myName} setValue={setMyName} placeholder="first name or nickname" />
                <TagInput
                  label="My conditions"
                  placeholder="start typing: lupus, fibromyalgia, ADHD..."
                  selected={myConditions} setSelected={setMyConditions}
                  options={[...SEED_CONDITIONS, ...(customTerms.conditions || [])]}
                  onAddCustom={(c) => addCustomTerm("conditions", c)}
                />
                <div className="rounded-2xl p-3.5 mb-4" style={{ background: COLORS.pill }}>
                  <p className="text-xs leading-relaxed" style={{ color: COLORS.ink }}>
                    <strong>Optional:</strong> members can contribute anonymized entries to our research on medical dismissal and access barriers, used in academic work and policy advocacy. Nothing is tied to you, nothing sends automatically, and you can withdraw anytime. Full details in the Toolkit.
                  </p>
                  <button onClick={() => { setRConsent(!rConsent); setRSeen(true); }}
                    className="mt-2 text-xs font-bold focus:outline-none focus-visible:ring-2"
                    style={{ color: rConsent ? COLORS.green : COLORS.plumDark }}>
                    {rConsent ? "✓ You're in. Tap to withdraw" : "Count me in"}
                  </button>
                </div>
                <button onClick={() => { setSetupDone(true); setRSeen(true); }}
                  className="w-full rounded-full py-4 text-base font-bold text-white focus:outline-none focus-visible:ring-2"
                  style={{ background: GRAD, boxShadow: "0 4px 14px rgba(169,50,103,0.3)" }}>
                  {myConditions.length > 0 ? "Save & start journaling" : "Skip for now"}
                </button>
              </div>
            )}
            {reminderDue && (
              <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-2.5" style={{ background: COLORS.pill, border: `1px solid ${COLORS.line}` }}>
                <Bell size={16} style={{ color: COLORS.plumDark }} className="shrink-0" />
                <p className="text-xs leading-relaxed flex-1" style={{ color: COLORS.ink }}>
                  Your daily reminder: today's page is still blank.
                </p>
                <button onClick={() => setReminderDue(false)} aria-label="Dismiss" className="text-base font-bold leading-none focus:outline-none" style={{ color: COLORS.inkSoft }}>×</button>
              </div>
            )}
            {flareWatch && (
              <div className="rounded-3xl p-4 mb-4" style={{ background: "#FDF4F0", border: "1.5px dashed #E8B7C6" }}>
                <p className="text-sm font-bold mb-1" style={{ fontFamily: SERIF, color: COLORS.ink }}>A gentle pattern notice</p>
                <p className="text-xs leading-relaxed mb-2" style={{ color: COLORS.inkSoft }}>
                  Your recent check-ins show {flareWatch.join(" and ")}. Whimsy can't predict flares, and only you know your body. But stretches like this are a kind moment to prepare: guard your spoons, check your med refills, ready the heat pack, lighten what can be lightened, and let someone know how you're running.
                </p>
                <p className="text-[11px]" style={{ color: COLORS.inkSoft, fontStyle: "italic" }}>A pattern is information, not a prophecy.</p>
              </div>
            )}
            <div className={cardCls + " relative overflow-hidden"} style={cardStyle}>
            <span className="whimsy-sway" style={{ position: "absolute", top: 10, right: 14, opacity: 0.45 }}><Sprig size={30} /></span>
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1.3rem" }}>
                  {(() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; })()}{myName ? `, ${myName}` : ""}
                </h2>
                <p className="text-sm mt-0.5" style={{ color: COLORS.inkSoft }}>How's your body today?</p>
              </div>
              {streakDays > 1 && (
                <span className="rounded-full px-3 py-1.5 text-xs font-bold shrink-0" style={{ background: "#F7EFDC", color: "#8A6A1F" }}>
                  {streakDays}-day streak ✦
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-5">
              <input type="date" value={date} max={todayStr()} onChange={(e) => e.target.value && handleDateChange(e.target.value)}
                aria-label="Logging for date"
                className="rounded-full px-3.5 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2"
                style={{ border: `1px solid ${COLORS.line}`, background: COLORS.bg, color: COLORS.ink }} />
              {date !== todayStr() && (
                <button onClick={() => handleDateChange(todayStr())} className="text-xs font-bold focus:outline-none focus-visible:ring-2" style={{ color: COLORS.plumDark }}>
                  Back to today
                </button>
              )}
              {entries.some((e) => e.date === date) && (
                <span className="rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: COLORS.pill, color: COLORS.plumDark }}>
                  Editing your saved entry — changes replace it
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {ENERGY.map((lvl) => {
                const on = energy === lvl.key;
                return (
                  <button
                    key={lvl.key}
                    onClick={() => setEnergy(lvl.key)}
                    className="rounded-2xl px-2 py-4 text-center transition-all focus:outline-none focus-visible:ring-2"
                    style={{
                      border: `2px solid ${on ? lvl.color : lvl.color + "45"}`,
                      background: on ? lvl.color : lvl.color + "12",
                      boxShadow: on ? `0 6px 16px ${lvl.color}55` : "none",
                      transform: on ? "translateY(-2px)" : "none",
                    }}
                  >
                    <span key={on ? "on" : "off"} className={"block " + (on ? "whimsy-pop" : "")}>
                      {lvl.key === "green" ? <Sprout color={on ? "#fff" : lvl.color} /> : lvl.key === "yellow" ? <LittleSun color={on ? "#fff" : lvl.color} /> : <CrescentMoon color={on ? "#fff" : lvl.color} />}
                    </span>
                    <span className="block text-xs font-bold" style={{ color: on ? "#fff" : COLORS.ink }}>{lvl.label}</span>
                    <span className="block text-[10px] mt-1" style={{ color: on ? "rgba(255,255,255,0.92)" : COLORS.inkSoft }}>{lvl.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls} style={{ color: COLORS.inkSoft, marginBottom: 0 }}>Where's the pain today?</label>
              <span className="text-base font-bold rounded-full px-3.5 py-1" style={{ background: COLORS.pill, color: COLORS.plumDark, fontFamily: SERIF }}>{pain} / 10</span>
            </div>
            <div className="relative mb-6" style={{ height: 36 }}>
              <input
                type="range" min={0} max={10} step={0.5} value={pain}
                onChange={(e) => setPain(Number(e.target.value))}
                aria-label={`Pain level, ${pain} out of 10`}
                className="w-full whimsy-range absolute focus:outline-none focus-visible:ring-2" style={{ top: "50%", transform: "translateY(-50%)" }}
              />
              <span className="absolute pointer-events-none" style={{ left: `calc(${(pain / 10) * 100}% + ${(0.5 - pain / 10) * 26}px)`, top: "50%", transform: "translate(-50%, -50%)", transition: "left .08s linear" }}>
                <MoodFace mood={1 - pain / 10} size={31} color={pain <= 3 ? COLORS.green : pain <= 6.5 ? COLORS.yellow : COLORS.red} />
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline justify-between mb-2">
                <label className={labelCls} style={{ color: COLORS.inkSoft, marginBottom: 0 }}>Where does it hurt?</label>
                <span className="text-[11px]" style={{ color: COLORS.inkSoft }}>tap where it aches</span>
              </div>
              <BodyMap selected={painAreas} setSelected={setPainAreas} skin={activeSkin} shape={activeBodyShape} hairStyle={hairStyle} hairColorHex={activeHairColor.hex}
                onOpenAppearance={() => setAppearanceOpen(true)} />
              {painAreas.length > 0 && (
                <p className="text-xs mt-2 text-center" style={{ color: COLORS.plumDark, fontFamily: SERIF, fontStyle: "italic" }}>
                  {painAreas.map((k) => BODY_MAP.find((b) => b.k === k)?.label).filter(Boolean).join(", ")}
                </p>
              )}
              <div className="flex items-baseline justify-between mt-4 mb-1">
                <label className={labelCls} style={{ color: COLORS.inkSoft, marginBottom: 0 }}>What kind of pain?</label>
                <span className="text-[11px]" style={{ color: COLORS.inkSoft }}>pick any that fit</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PAIN_QUALITIES.map((q) => (
                  <button key={q} onClick={() => setPainQuality(painQuality.includes(q) ? painQuality.filter((x) => x !== q) : [...painQuality, q])}
                    className="rounded-full px-3.5 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2"
                    style={{ background: painQuality.includes(q) ? GRAD : COLORS.pill, color: painQuality.includes(q) ? "#fff" : COLORS.ink }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline justify-between mb-1">
                <label className={labelCls} style={{ color: COLORS.inkSoft, marginBottom: 0 }}>Spoons</label>
                <span className="text-[11px]" style={{ color: COLORS.inkSoft }}>tap a spoon twice for a half</span>
              </div>
              <p className="text-[11px] mb-2.5" style={{ color: COLORS.inkSoft, fontStyle: "italic" }}>
                Your energy budget for the day. Why 12? In the original spoon theory story, Christine Miserandino handed her friend exactly twelve spoons to explain a day with lupus. We kept her number.
              </p>
              <SpoonMeter label="Started the day with" value={spoonStart} setValue={setSpoonStart} />
              <SpoonMeter label="Left right now" value={spoonLeft} setValue={setSpoonLeft} />

            </div>

            <TagInput
              label="Symptoms"
              placeholder="start typing: joint pain, brain fog..."
              selected={symptoms} setSelected={setSymptoms}
              options={[...SEED_SYMPTOMS, ...(customTerms.symptoms || [])]}
              onAddCustom={(t) => addCustomTerm("symptoms", t)}
            />
            <TagInput
              label="Meds & supplements taken"
              placeholder="start typing: Plaquenil, vitamin D..."
              selected={meds} setSelected={setMeds}
              options={[...SEED_MEDS, ...(customTerms.meds || [])]}
              onAddCustom={(t) => addCustomTerm("meds", t)}
            />
            <TagInput
              label="Possible triggers"
              placeholder="start typing: stress, weather, poor sleep..."
              selected={triggers} setSelected={setTriggers}
              options={[...SEED_TRIGGERS, ...(customTerms.triggers || [])]}
              onAddCustom={(t) => addCustomTerm("triggers", t)}
            />

            <div className="mb-4">
              <label className={labelCls} style={{ color: COLORS.inkSoft }}>A little reflection (optional)</label>
              <textarea
                value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                placeholder={PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length]}
                className={inputCls} style={inputStyle}
              />
            </div>

            <div className="mb-5">
              <label className={labelCls} style={{ color: COLORS.inkSoft }}>Date</label>
              <input
                type="date" value={date} max={todayStr()}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls} style={inputStyle}
              />
            </div>

            <button
              onClick={saveEntry}
              disabled={!energy || saveState === "saving"}
              className="w-full rounded-full py-4 text-base font-bold text-white transition-opacity focus:outline-none focus-visible:ring-2"
              style={{ background: energy ? GRAD : COLORS.inkSoft, opacity: !energy ? 0.5 : 1, boxShadow: energy ? "0 4px 14px rgba(169,50,103,0.3)" : "none" }}
            >
              {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved ✓" : saveState === "error" ? "Save failed, try again" : "Keep today's page"}
            </button>
            {!energy && <p className="text-xs text-center mt-2" style={{ color: COLORS.inkSoft }}>Pick a green, yellow, or red day to save.</p>}
            {saveState === "saved" && (
              <div className="relative">
                <span className="wspark" style={{ left: "18%" }}>✦</span>
                <span className="wspark" style={{ left: "50%", animationDelay: ".15s" }}>✦</span>
                <span className="wspark" style={{ left: "78%", animationDelay: ".3s" }}>✦</span>
              </div>
            )}
            {saveState === "saved" && (
              <p className="text-sm text-center mt-3 font-semibold whimsy-pop" style={{ fontFamily: SERIF, fontStyle: "italic", color: COLORS.plumDark }}>
                ✨ {CHEERS[entries.length % CHEERS.length]}
              </p>
            )}

            <p className="text-xs mt-5 leading-relaxed" style={{ color: COLORS.inkSoft }}>
              Whimsy doesn't detect emergencies and never replaces medical care. If something feels seriously wrong, trust yourself: call your doctor or 911.
            </p>
            </div>

            {entries.length > 0 && (
              <div className={cardCls + " mt-4"} style={cardStyle}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold flex items-center gap-1.5"><FileText size={15} style={{ color: COLORS.plumDark }} /> Notes for your next visit</p>
                    <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{entries.length} days logged, ready to hand over</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={copySummary}
                      className="rounded-full px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus-visible:ring-2"
                      style={{ background: copied ? COLORS.green : GRAD }}>
                      {copied ? "Copied ✓" : "Copy"}
                    </button>
                    <button onClick={() => window.print()} aria-label="Print summary for your doctor"
                      className="rounded-full px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 focus:outline-none focus-visible:ring-2"
                      style={{ background: COLORS.pill, color: COLORS.plumDark }}>
                      <Printer size={13} /> Print
                    </button>
                  </div>
                </div>
                <button onClick={() => setSumOpen(!sumOpen)}
                  className="mt-2 text-xs font-bold focus:outline-none focus-visible:ring-2" style={{ color: COLORS.plumDark }}>
                  {sumOpen ? "Hide preview" : "Preview what the doctor sees"}
                </button>
                {sumOpen && (
                  <pre className="text-xs leading-relaxed whitespace-pre-wrap rounded-2xl p-3.5 mt-2 max-h-72 overflow-y-auto"
                    style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, color: COLORS.ink }}>
                    {buildSummary()}
                  </pre>
                )}
                {/* Print-only view: hidden on screen, shown full-page when "Print" triggers window.print().
                    Everything else on the page is hidden via the @media print rule below, so the doctor
                    gets one clean printed page instead of the whole app chrome. */}
                <style>{`
                  @media print {
                    body * { visibility: hidden; }
                    .whimsy-print-summary, .whimsy-print-summary * { visibility: visible; }
                    .whimsy-print-summary { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
                  }
                `}</style>
                <div className="whimsy-print-summary" style={{ display: "none" }}>
                  <h1 style={{ fontFamily: SERIF, fontSize: "1.4rem", marginBottom: 4, color: "#000" }}>Whimsy — Notes for my next visit</h1>
                  <p style={{ fontSize: "0.8rem", color: "#555", marginBottom: 16 }}>Prepared by patient · printed {fmtDateLong(todayStr())}</p>
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.85rem", lineHeight: 1.5, color: "#000" }}>{buildSummary()}</pre>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ------- PATTERNS ------- */}
        {tab === "patterns" && (
          <section className="tab-in">
            {entries.length === 0 ? (
              <EmptyState text="Every story starts with one page. Check in once, and your garden begins growing here." />
            ) : (
              <>
                <div className="flex gap-1.5 mb-4">
                  {[["7d", "7D"], ["1m", "1M"], ["3m", "3M"], ["all", "All"]].map(([k, lbl]) => (
                    <button key={k} onClick={() => setRange(k)}
                      className="flex-1 rounded-full py-2 text-xs font-bold focus:outline-none focus-visible:ring-2"
                      style={{ background: range === k ? GRAD : COLORS.card, color: range === k ? "#fff" : COLORS.inkSoft, border: `1px solid ${range === k ? "transparent" : COLORS.line}` }}>
                      {lbl}
                    </button>
                  ))}
                </div>

                <div className={cardCls + " mb-4"} style={{ ...cardStyle, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 16px, #FBEDF1 16px, #FBEDF1 17px)" }}>
                  <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1.05rem" }} className="mb-1">Your garden</h2>
                  <p className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>
                    Green days grow leaves, yellow days grow buds, and red days grow the hardiest wildflowers. Each day you show up, your story grows.
                  </p>
                  <WhimsyGarden entries={ranged} />
                </div>

                {triggerEchoes.length > 0 && (
                  <div className={cardCls + " mb-4"} style={cardStyle}>
                    <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1.05rem" }} className="mb-1">Echoes before your red days</h2>
                    <p className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>
                      Not causes, and not predictions. Just what your own log shows appeared in the two days before a flare, often enough to notice.
                    </p>
                    {triggerEchoes.map(({ tg, c, total }) => (
                      <p key={tg} className="text-sm py-1" style={{ color: COLORS.ink }}>
                        <span className="font-bold" style={{ fontFamily: SERIF }}>"{tg}"</span>
                        <span className="text-xs" style={{ color: COLORS.inkSoft }}> appeared before {c} of your {total} red days</span>
                      </p>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <StatChip i={0} label="Avg pain" value={ranged.length ? (ranged.reduce((s, e) => s + e.pain, 0) / ranged.length).toFixed(1) : "–"} color={COLORS.plum} />
                  <StatChip i={1} label="Red days" value={ranged.filter((e) => e.energy === "red").length} color={COLORS.red} />
                  <StatChip i={2} label="Days in view" value={ranged.length} color={COLORS.green} />
                </div>
                <div className={cardCls + " mb-4"} style={cardStyle}>
                  <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1.05rem" }} className="mb-3">
                    Your pain, across the last {recent.length} pages
                  </h2>
                  <div style={{ width: "100%", height: 180 }}>
                    <ResponsiveContainer>
                      <LineChart data={chartData} margin={{ top: 6, right: 8, left: -28, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: COLORS.inkSoft }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: COLORS.inkSoft }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.line}`, fontSize: 12 }} />
                        <Line type="monotone" dataKey="pain" stroke={COLORS.plum} strokeWidth={2}
                          dot={(p) => {
                            const c = ENERGY.find((l) => l.key === p.payload.energy)?.color || COLORS.plum;
                            return <circle key={p.index} cx={p.cx} cy={p.cy} r={4} fill={c} stroke="#fff" strokeWidth={1.2} />;
                          }}
                          activeDot={{ r: 6 }} isAnimationActive={true} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs mt-2" style={{ color: COLORS.inkSoft }}>Each point is colored by its energy day: green, yellow, red.</p>
                </div>

                <div className="space-y-2">
                  {[...entries].reverse().map((e) => {
                    const lvl = ENERGY.find((l) => l.key === e.energy);
                    return (
                      <div key={e.id} className="rounded-3xl p-4 flex gap-3 items-start" style={cardStyle}>
                        <span className="w-3.5 h-3.5 rounded-full mt-1 shrink-0" style={{ background: lvl?.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold">{fmtDateLong(e.date)} <span className="font-normal" style={{ color: COLORS.inkSoft }}>· pain {e.pain}/10</span></p>
                          {(e.spoonStart != null || e.spoonLeft != null) && (
                            <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>
                              Spoons: {e.spoonStart != null ? `started with ${e.spoonStart}` : ""}{e.spoonStart != null && e.spoonLeft != null ? ", " : ""}{e.spoonLeft != null ? `${e.spoonLeft} left` : ""}
                            </p>
                          )}
                          {e.painAreas && e.painAreas.length > 0 && (
                            <p className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>
                              Pain areas: {e.painAreas.map((k) => BODY_MAP.find((b) => b.k === k)?.label).filter(Boolean).join(", ")}
                            </p>
                          )}
                          {e.painQuality && e.painQuality.length > 0 && (
                            <p className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>
                              Pain quality: {e.painQuality.join(", ")}
                            </p>
                          )}
                          {e.symptoms && <p className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>Symptoms: {e.symptoms}</p>}
                          {e.meds && <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>Meds: {e.meds}</p>}
                          {e.triggers && <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>Triggers: {e.triggers}</p>}
                          {e.notes && <p className="text-xs mt-0.5 italic" style={{ color: COLORS.inkSoft }}>"{e.notes}"</p>}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button onClick={() => { handleDateChange(e.date); setTab("today"); }} aria-label="Edit entry"
                            className="p-2 rounded-lg focus:outline-none focus-visible:ring-2" style={{ color: COLORS.plumDark }}>
                            <NotebookPen size={16} />
                          </button>
                          <button onClick={() => deleteEntry(e.id)} aria-label="Delete entry"
                            className="p-2 rounded-lg focus:outline-none focus-visible:ring-2" style={{ color: COLORS.inkSoft }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        )}

        {/* ------- RECEIPTS (care record) ------- */}
        {tab === "trail" && (
          <section className="tab-in">
            <div className="rounded-3xl p-4 mb-4" style={{ background: "#F7EFDC", border: "1px solid #EAD9B4" }}>
              <p className="text-xs leading-relaxed" style={{ color: COLORS.ink }}>
                <strong>Every visit is a receipt. Keep them all.</strong> Dismissals build a paper trail for second opinions, appeals, and complaints. Believed visits build your list of providers worth keeping. Private to you, always.
              </p>
            </div>

            <div className={cardCls + " mb-4"} style={cardStyle}>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => setDType("dismissed")}
                  className="rounded-2xl py-3.5 text-sm font-bold focus:outline-none focus-visible:ring-2"
                  style={{
                    border: `2px solid ${dType === "dismissed" ? COLORS.red : COLORS.line}`,
                    background: dType === "dismissed" ? COLORS.red + "14" : COLORS.bg,
                    color: dType === "dismissed" ? COLORS.red : COLORS.inkSoft,
                  }}>
                  They dismissed me
                </button>
                <button onClick={() => setDType("believed")}
                  className="rounded-2xl py-3.5 text-sm font-bold focus:outline-none focus-visible:ring-2"
                  style={{
                    border: `2px solid ${dType === "believed" ? COLORS.green : COLORS.line}`,
                    background: dType === "believed" ? COLORS.green + "14" : COLORS.bg,
                    color: dType === "believed" ? COLORS.green : COLORS.inkSoft,
                  }}>
                  They believed me
                </button>
              </div>

              {dType === "dismissed" ? (
                <div className="mb-4">
                  <label className={labelCls} style={{ color: COLORS.inkSoft }}>What they said</label>
                  <input
                    type="text" value={dSaid} onChange={(e) => setDSaid(e.target.value)}
                    placeholder={'"it\'s just anxiety", "your labs are fine"'}
                    className={inputCls} style={inputStyle}
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label className={labelCls} style={{ color: COLORS.inkSoft }}>What they did right</label>
                  <input
                    type="text" value={dRight} onChange={(e) => setDRight(e.target.value)}
                    placeholder="listened, ordered labs, referred me, believed my pain"
                    className={inputCls} style={inputStyle}
                  />
                </div>
              )}

              <div className="mb-4">
                <label className={labelCls} style={{ color: COLORS.inkSoft }}>Visit date</label>
                <input
                  type="date" value={dDate} max={todayStr()}
                  onChange={(e) => setDDate(e.target.value)}
                  className={inputCls} style={inputStyle}
                />
              </div>

              <button onClick={() => setDMore(!dMore)}
                className="w-full flex items-center justify-center gap-1.5 rounded-2xl py-3 mb-4 text-sm font-bold focus:outline-none focus-visible:ring-2"
                style={{ border: `1.5px dashed ${COLORS.line}`, color: COLORS.plumDark, background: "transparent" }}>
                {dMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {dMore ? "Hide details" : "Add details (provider, insurance, access)"}
              </button>

              {dMore && (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <label className={labelCls} style={{ color: COLORS.inkSoft }}>Setting</label>
                      <select value={dSetting} onChange={(e) => setDSetting(e.target.value)}
                        className={inputCls} style={inputStyle}>
                        {["Primary care", "Specialist", "Emergency room", "Urgent care", "Telehealth", "Other"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <SuggestInput
                      label="Insurance"
                      placeholder="type to search"
                      value={dInsurance} setValue={setDInsurance}
                      options={[...SEED_INSURANCE, ...(customTerms.insurance || [])]}
                      onAddCustom={(t) => addCustomTerm("insurance", t)}
                    />
                  </div>

                  <Field label="Provider name (optional, stays private)" value={dProvider} setValue={setDProvider} placeholder="Dr. ..." />
                  <Field label="Hospital or clinic (optional)" value={dFacility} setValue={setDFacility} placeholder="facility or practice name" />

                  <div className="mb-4">
                    <SuggestInput
                      label="Specialty (optional)"
                      placeholder="type to search: rheumatology, hematology..."
                      value={dSpecialty} setValue={setDSpecialty}
                      options={[...SEED_SPECIALTIES, ...(customTerms.specialties || [])]}
                      onAddCustom={(t) => addCustomTerm("specialties", t)}
                    />
                  </div>

                  {dType === "dismissed" && (
                    <>
                      <Field label="What you reported" value={dReported} setValue={setDReported} placeholder="the symptoms you described" />
                      <ChipPicker
                        label="What was declined or refused (tap all that apply)"
                        options={SEED_DECLINED}
                        customOptions={customTerms.declined || []}
                        selected={dDeclined} setSelected={setDDeclined}
                        onAddCustom={(x) => addCustomTerm("declined", x)}
                      />
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <label className={labelCls} style={{ color: COLORS.inkSoft }}>Hard to find w/ your insurance?</label>
                      <select value={dAccess} onChange={(e) => setDAccess(e.target.value)}
                        className={inputCls} style={inputStyle}>
                        <option value="">Select if relevant</option>
                        {["Not hard", "Somewhat hard", "Very hard", "Nearly impossible"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls} style={{ color: COLORS.inkSoft }}>Wait for appointment</label>
                      <select value={dWait} onChange={(e) => setDWait(e.target.value)}
                        className={inputCls} style={inputStyle}>
                        <option value="">Select if relevant</option>
                        {["Under 1 week", "1–4 weeks", "1–3 months", "3+ months"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className={labelCls} style={{ color: COLORS.inkSoft }}>What happened since (optional)</label>
                    <textarea
                      value={dOutcome} onChange={(e) => setDOutcome(e.target.value)} rows={2}
                      placeholder="second opinion, eventual diagnosis, ER visit, nothing yet"
                      className={inputCls} style={inputStyle}
                    />
                  </div>
                </>
              )}

              <div className="mb-4">
                <label className={labelCls} style={{ color: COLORS.inkSoft }}>Photo evidence (optional)</label>
                <p className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>
                  A lab result, a denial letter, a rash. Stays only on this device, resized before it's saved.
                </p>
                {dPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {dPhotos.map((p) => (
                      <div key={p.id} className="relative">
                        <button type="button" onClick={() => setLightboxUrl(p.dataUrl)} aria-label="View photo full size"
                          className="block rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2"
                          style={{ width: 64, height: 64, border: `1px solid ${COLORS.line}` }}>
                          <img src={p.dataUrl} alt="Attached evidence" className="w-full h-full object-cover" />
                        </button>
                        <button type="button" onClick={() => removePhoto(p.id)} aria-label="Remove photo"
                          className="absolute -top-1.5 -right-1.5 rounded-full p-0.5 focus:outline-none focus-visible:ring-2"
                          style={{ background: COLORS.plumDark, color: "#fff" }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {dPhotos.length < MAX_PHOTOS && (
                  <label className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold cursor-pointer focus-within:ring-2"
                    style={{ border: `1.5px dashed ${COLORS.line}`, color: COLORS.plumDark, background: "transparent" }}>
                    <Camera size={14} /> {photoBusy ? "Processing…" : "Add photo"}
                    <input type="file" accept="image/*" className="hidden" disabled={photoBusy}
                      onChange={(e) => { handlePhotoSelect(e.target.files); e.target.value = ""; }} />
                  </label>
                )}
                {photoError && <p className="text-xs mt-1.5" style={{ color: COLORS.red }}>{photoError}</p>}
              </div>

              <button
                onClick={saveDismissal}
                disabled={!(dType === "believed" ? dRight.trim() : dSaid.trim()) || dSaveState === "saving"}
                className="w-full rounded-full py-4 text-base font-bold text-white transition-opacity focus:outline-none focus-visible:ring-2"
                style={{ background: (dType === "believed" ? dRight.trim() : dSaid.trim()) ? GRAD : COLORS.inkSoft, opacity: !(dType === "believed" ? dRight.trim() : dSaid.trim()) ? 0.5 : 1 }}
              >
                {dSaveState === "saving" ? "Saving..." : dSaveState === "saved" ? "Documented ✓" : dSaveState === "error" ? "Save failed, try again" : "Save this receipt"}
              </button>
              {!(dType === "believed" ? dRight.trim() : dSaid.trim()) && (
                <p className="text-xs text-center mt-2" style={{ color: COLORS.inkSoft }}>
                  {dType === "believed" ? '"What they did right"' : '"What they said"'} is the one required field.
                </p>
              )}
              {dSaveState === "saved" && (
                <div className="relative">
                  <span className="wspark" style={{ left: "22%" }}>✦</span>
                  <span className="wspark" style={{ left: "52%", animationDelay: ".15s" }}>✦</span>
                  <span className="wspark" style={{ left: "80%", animationDelay: ".3s" }}>✦</span>
                </div>
              )}
              {dSaveState === "saved" && (
                <p className="text-sm text-center mt-3 font-semibold whimsy-pop" style={{ fontFamily: SERIF, fontStyle: "italic", color: COLORS.plumDark }}>
                  ✨ {RCHEERS[dismissals.length % RCHEERS.length]}
                </p>
              )}
            </div>

            {dismissals.length > 0 && (
              <>
                <div className="space-y-2 mb-4">
                  {[...dismissals].reverse().map((d, ri) => (
                    <div key={d.id} className="rounded-2xl p-4"
                      style={{ ...cardStyle, boxShadow: "0 2px 10px rgba(87,31,51,0.05)", background: d.type === "believed" ? "#F6FAF6" : "#FDF4F0", border: `1.5px dashed ${d.type === "believed" ? "#BCD8C3" : "#E8B7C6"}`, transform: `rotate(${ri % 2 === 0 ? -0.5 : 0.5}deg)` }}>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-center" style={{ color: COLORS.inkSoft }}>
                        · Receipt No. {dismissals.length - ri} ·
                      </p>
                      <div className="my-2" style={{ borderTop: `1px dashed ${COLORS.line}` }} />
                      <div className="flex gap-3 items-start">
                      {d.type === "believed"
                        ? <Heart size={15} className="mt-1 shrink-0" style={{ color: COLORS.green }} />
                        : <Scale size={15} className="mt-1 shrink-0" style={{ color: COLORS.plum }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{fmtDateLong(d.date)}{d.provider ? ` · ${d.provider}` : ""}</p>
                        <p className="text-xs" style={{ color: COLORS.inkSoft }}>{d.setting}{d.specialty ? ` (${d.specialty})` : ""}{d.facility ? ` · ${d.facility}` : ""}{d.insurance ? ` · ${d.insurance}` : ""}</p>
                        {d.type === "believed" && d.right && <p className="text-xs mt-1 font-semibold" style={{ color: COLORS.green }}>Did right: {d.right}</p>}
                        {d.reported && <p className="text-xs mt-1" style={{ color: COLORS.inkSoft }}>Reported: {d.reported}</p>}
                        {d.said && <p className="text-xs mt-0.5 font-semibold" style={{ color: COLORS.red }}>Was told: "{d.said}"</p>}
                        {d.declined && <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>Refused: {d.declined}</p>}
                        {(d.access || d.wait) && <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>Access: {[d.access, d.wait].filter(Boolean).join(" · ")}</p>}
                        {d.outcome && <p className="text-xs mt-0.5 italic" style={{ color: COLORS.inkSoft }}>Since then: {d.outcome}</p>}
                        {d.photos && d.photos.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {d.photos.map((url, pi) => (
                              <button key={pi} type="button" onClick={() => setLightboxUrl(url)} aria-label={`View attached photo ${pi + 1} full size`}
                                className="rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2"
                                style={{ width: 44, height: 44, border: `1px solid ${COLORS.line}` }}>
                                <img src={url} alt="Attached evidence" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => deleteDismissal(d.id)} aria-label="Delete record"
                        className="shrink-0 p-2 rounded-lg focus:outline-none focus-visible:ring-2" style={{ color: COLORS.inkSoft }}>
                        <Trash2 size={16} />
                      </button>
                      </div>
                      {d.type !== "believed" && (
                        <button onClick={() => copyAppeal(d)}
                          className="w-full mt-2 rounded-full py-2.5 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 flex items-center justify-center gap-1.5"
                          style={{ background: appealCopiedId === d.id ? COLORS.green : GRAD }}>
                          {appealCopiedId === d.id ? <><Check size={14} /> Appeal copied</> : <><Copy size={14} /> Draft an appeal</>}
                        </button>
                      )}
                      <div className="mt-2 pt-2 text-center" style={{ borderTop: `1px dashed ${COLORS.line}` }}>
                        <p className="text-[11px]" style={{ fontFamily: SERIF, fontStyle: "italic", color: d.type === "believed" ? COLORS.green : COLORS.plumDark }}>
                          {d.type === "believed" ? "a keeper ♡" : "kept. on the record."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={copyTrail}
                  className="w-full rounded-full py-4 text-base font-bold text-white flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2"
                  style={{ background: dCopied ? COLORS.green : GRAD }}>
                  {dCopied ? <><Check size={17} /> Copied</> : <><Copy size={17} /> Copy care record</>}
                </button>
              </>
            )}
          </section>
        )}

        {/* ------- TOOLKIT ------- */}
        {tab === "toolkit" && (
          <section className="tab-in">
            <div className="mb-4">
              <input value={tkQ} onChange={(e) => setTkQ(e.target.value)}
                placeholder="Search everything: codes, foods, relief, appeals..."
                className={inputCls} style={{ ...inputStyle, background: COLORS.card }} />
            </div>
            {tkQ.trim() ? (
              <div className="space-y-1.5">
                {tkMatches.map((m, i) => (
                  <div key={i} className="rounded-xl px-3 py-2" style={{ background: COLORS.card, border: `1px solid ${COLORS.line}` }}>
                    <p className="text-[10px] font-bold rounded-full inline-block px-2 py-0.5 mb-1" style={{ background: COLORS.pill, color: COLORS.plumDark }}>{m.src}</p>
                    {m.title && <p className="text-sm font-bold" style={{ fontFamily: SERIF }}>{m.title}</p>}
                    <p className="text-xs leading-relaxed" style={{ color: COLORS.ink }}>{m.body}</p>
                  </div>
                ))}
                {tkMatches.length === 0 && (
                  <p className="text-xs px-1" style={{ color: COLORS.inkSoft }}>Nothing matched. Try a simpler word, or clear the search to browse.</p>
                )}
              </div>
            ) : (
            <>
            <GroupLabel first>About Whimsy</GroupLabel>
            <ToolCard id="about" icon={Sparkles} title="What is Whimsy?" subtitle="The one-minute version" open={openTool} setOpen={setOpenTool}>
              <p className="text-sm leading-relaxed mb-3" style={{ color: COLORS.ink }}>
                Most health apps ask what hurts. <strong>Whimsy asks whether you were believed.</strong>
              </p>
              <p className="text-sm leading-relaxed mb-3" style={{ color: COLORS.inkSoft }}>
                It's built for people with chronic illnesses and invisible disabilities, and centered on Black women, whose pain is dismissed the most and documented the least.
              </p>
              <div className="space-y-2 mb-3">
                {[
                  ["Today", "Log energy, pain, spoons, symptoms, and where it hurts. Then copy a doctor-ready summary."],
                  ["Patterns", "Your check-ins grow a garden. See what shows up before your flares."],
                  ["Receipts", "Document every visit: believed or dismissed. Evidence for appeals, second opinions, and complaints."],
                  ["Toolkit", "Decode your insurance, your codes, and your appeal rights. Build a visit plan. Find what helps."],
                ].map(([tab, desc]) => (
                  <div key={tab} className="rounded-xl px-3 py-2" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
                    <p className="text-xs font-bold" style={{ color: COLORS.plumDark }}>{tab}</p>
                    <p className="text-xs" style={{ color: COLORS.inkSoft }}>{desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: COLORS.inkSoft }}>
                Your data stays on your device. No account, no tracking, never sold. Whimsy doesn't diagnose and never replaces medical care. It makes sure you're never the only one keeping the record.
              </p>
              <p className="text-sm mt-3" style={{ fontFamily: SERIF, fontStyle: "italic", color: COLORS.plumDark }}>Your body, on the record. ♡</p>
            </ToolCard>

            <GroupLabel>About you</GroupLabel>
            <ToolCard id="conditions" icon={BookOpen} title="My conditions" subtitle={myConditions.length > 0 ? `${myConditions.length} saved` : "Tell your story"} open={openTool} setOpen={setOpenTool}>
              <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>
                In your own words. These go on your visit notes and, if you opt into research, help compare people with similar conditions. "Undiagnosed" counts. Private either way.
              </p>
              <TagInput
                label="My conditions"
                placeholder="start typing: lupus, fibromyalgia, ADHD..."
                selected={myConditions} setSelected={setMyConditions}
                options={[...SEED_CONDITIONS, ...(customTerms.conditions || [])]}
                onAddCustom={(c) => addCustomTerm("conditions", c)}
              />
            </ToolCard>

            <ToolCard id="medhx" icon={Leaf} title="Allergies & med reactions" subtitle={medHx.length > 0 ? `${medHx.length} on record` : "What failed, what hurt you"} open={openTool} setOpen={setOpenTool}>
              <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>
                What failed, what hurt you, what your body rejects. Documented reactions win step-therapy fights, back up brand-name requests, and protect you in the ER. Goes on your visit notes automatically.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={() => setHxKind("allergy")}
                  className="rounded-2xl py-2.5 text-xs font-bold focus:outline-none focus-visible:ring-2"
                  style={{
                    border: `2px solid ${hxKind === "allergy" ? COLORS.red : COLORS.line}`,
                    background: hxKind === "allergy" ? COLORS.red + "14" : COLORS.bg,
                    color: hxKind === "allergy" ? COLORS.red : COLORS.inkSoft,
                  }}>
                  Allergy / reaction
                </button>
                <button onClick={() => setHxKind("failed")}
                  className="rounded-2xl py-2.5 text-xs font-bold focus:outline-none focus-visible:ring-2"
                  style={{
                    border: `2px solid ${hxKind === "failed" ? COLORS.yellow : COLORS.line}`,
                    background: hxKind === "failed" ? COLORS.yellow + "1A" : COLORS.bg,
                    color: hxKind === "failed" ? "#8A6A1F" : COLORS.inkSoft,
                  }}>
                  Didn't work
                </button>
              </div>
              <div className="mb-3">
                <SuggestInput
                  label="Medication"
                  placeholder="type to search or add"
                  value={hxMed} setValue={setHxMed}
                  options={[...SEED_MEDS, ...(customTerms.meds || [])]}
                  onAddCustom={(x) => addCustomTerm("meds", x)}
                />
              </div>
              <Field label="What happened" value={hxReaction} setValue={setHxReaction} placeholder="hives, made symptoms worse, no effect after 8 weeks" />
              <button
                onClick={() => {
                  const m = hxMed.trim();
                  if (!m) return;
                  setMedHx([...medHx, { id: Date.now().toString(36), med: m, reaction: hxReaction.trim(), kind: hxKind }]);
                  setHxMed(""); setHxReaction("");
                }}
                disabled={!hxMed.trim()}
                className="w-full rounded-full py-3.5 text-sm font-bold text-white focus:outline-none focus-visible:ring-2"
                style={{ background: hxMed.trim() ? GRAD : COLORS.inkSoft, opacity: hxMed.trim() ? 1 : 0.5 }}>
                Add to my record
              </button>
              {medHx.length > 0 && (
                <div className="space-y-2 mt-3">
                  {medHx.map((m) => (
                    <div key={m.id} className="rounded-2xl p-3 flex gap-2.5 items-start" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
                      <span className="mt-1 w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.kind === "allergy" ? COLORS.red : COLORS.yellow }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{m.med} <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 align-middle" style={{ background: COLORS.pill, color: COLORS.inkSoft }}>{m.kind === "allergy" ? "allergy / reaction" : "didn't work"}</span></p>
                        {m.reaction && <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{m.reaction}</p>}
                      </div>
                      <button onClick={() => setMedHx(medHx.filter((x) => x.id !== m.id))} aria-label={`Remove ${m.med}`}
                        className="shrink-0 p-1.5 rounded-lg focus:outline-none focus-visible:ring-2" style={{ color: COLORS.inkSoft }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </ToolCard>

            <ToolCard id="medschedule" icon={Pill} title="My medications" subtitle={medSchedule.length > 0 ? `${medSchedule.length} active` : "Dosing schedule & refills"} open={openTool} setOpen={setOpenTool}>
              <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>
                What you're actively taking, how often, and when you're due for a refill — separate from today's "meds taken" log, and separate from the allergy / didn't-work record above.
              </p>
              <div className="mb-3">
                <SuggestInput
                  label="Medication"
                  placeholder="type to search or add"
                  value={msMed} setValue={setMsMed}
                  options={[...SEED_MEDS, ...(customTerms.meds || [])]}
                  onAddCustom={(x) => addCustomTerm("meds", x)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Dose" value={msDose} setValue={setMsDose} placeholder="200mg" />
                <Field label="Schedule" value={msTimes} setValue={setMsTimes} placeholder="2x daily" />
              </div>
              <div className="mb-4">
                <label className={labelCls} style={{ color: COLORS.inkSoft }}>Refill due date</label>
                <input type="date" value={msRefillDate} onChange={(e) => setMsRefillDate(e.target.value)}
                  className={inputCls} style={inputStyle} />
              </div>
              <button
                onClick={() => {
                  const m = msMed.trim();
                  if (!m) return;
                  setMedSchedule([...medSchedule, { id: Date.now().toString(36), med: m, dose: msDose.trim(), times: msTimes.trim(), refillDate: msRefillDate }]);
                  setMsMed(""); setMsDose(""); setMsTimes(""); setMsRefillDate("");
                }}
                disabled={!msMed.trim()}
                className="w-full rounded-full py-3.5 text-sm font-bold text-white focus:outline-none focus-visible:ring-2"
                style={{ background: msMed.trim() ? GRAD : COLORS.inkSoft, opacity: msMed.trim() ? 1 : 0.5 }}>
                Add medication
              </button>
              {medSchedule.length > 0 && (
                <div className="space-y-2 mt-3">
                  {medSchedule.map((m) => {
                    const days = m.refillDate ? Math.round((new Date(m.refillDate + "T00:00:00") - new Date(todayStr() + "T00:00:00")) / 86400000) : null;
                    const dueSoon = days != null && days <= 7;
                    const overdue = days != null && days < 0;
                    return (
                      <div key={m.id} className="rounded-2xl p-3 flex gap-2.5 items-start" style={{ background: COLORS.bg, border: `1px solid ${dueSoon ? COLORS.red : COLORS.line}` }}>
                        <span className="mt-1 w-9 h-9 rounded-2xl flex items-center justify-center shrink-0" style={{ background: COLORS.pill }}>
                          <Pill size={16} style={{ color: COLORS.plumDark }} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold">{m.med}{m.dose && <span className="font-normal" style={{ color: COLORS.inkSoft }}> · {m.dose}</span>}</p>
                          {m.times && <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{m.times}</p>}
                          {m.refillDate && (
                            <p className="text-xs mt-1 font-semibold" style={{ color: dueSoon ? COLORS.red : COLORS.inkSoft }}>
                              {overdue ? `Refill overdue (was due ${fmtDateLong(m.refillDate)})` : dueSoon ? `Refill due in ${days} day${days === 1 ? "" : "s"}` : `Refill due ${fmtDateLong(m.refillDate)}`}
                            </p>
                          )}
                        </div>
                        <button onClick={() => setMedSchedule(medSchedule.filter((x) => x.id !== m.id))} aria-label={`Remove ${m.med}`}
                          className="shrink-0 p-1.5 rounded-lg focus:outline-none focus-visible:ring-2" style={{ color: COLORS.inkSoft }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ToolCard>

            <GroupLabel>Make it yours</GroupLabel>
            <ToolCard id="appearance" icon={Sparkles} title="Appearance" subtitle="Colors, skin tone, text size, motion" open={openTool} setOpen={setOpenTool}>
              {appearanceContent}
            </ToolCard>

            <GroupLabel>Navigate insurance</GroupLabel>
            <ToolCard id="benefits" icon={Shield} title="My plan playbook" subtitle={tPlan ? `${tPlan}${effType ? " · " + TYPE_LABELS[effType] : ""}` : "Pick your plan, get the playbook"} open={openTool} setOpen={setOpenTool}>
              <p className="text-sm mb-4" style={{ color: COLORS.inkSoft }}>
                Pick your plan and Whimsy serves the playbook for that kind of coverage: the money hiding in it, how to get to care, and exactly what to do when they say no.
              </p>
              <div className="mb-4">
                <SuggestInput
                  label="My plan"
                  placeholder="type to search your plan"
                  value={tPlan} setValue={setTPlan}
                  options={[...SEED_INSURANCE, ...(customTerms.insurance || [])]}
                  onAddCustom={(t) => addCustomTerm("insurance", t)}
                />
              </div>

              <div className="mb-4">
                <label className={labelCls} style={{ color: COLORS.inkSoft }}>Plan type {tType ? "" : "(detected, tap to change)"}</label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(TYPE_LABELS).map(([k, lbl]) => (
                    <button key={k} onClick={() => setTType(k)}
                      className="rounded-full px-3 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2"
                      style={{ background: effType === k ? GRAD : COLORS.pill, color: effType === k ? "#fff" : COLORS.ink }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {effType && PLAYBOOKS[effType] && (
                <div className="mb-4">
                  <p className="text-sm font-bold mb-2" style={{ color: COLORS.ink }}>Your playbook</p>
                  <div className="space-y-2">
                    {PLAYBOOKS[effType].map((s) => (
                      <div key={s.h} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${COLORS.line}`, background: COLORS.bg }}>
                        <button onClick={() => setPbOpen(pbOpen === s.h ? null : s.h)}
                          className="w-full flex items-center justify-between px-3.5 py-3 text-left focus:outline-none focus-visible:ring-2">
                          <span className="text-sm font-bold" style={{ color: COLORS.ink }}>{s.h}</span>
                          {pbOpen === s.h ? <ChevronUp size={16} style={{ color: COLORS.plumDark }} /> : <ChevronDown size={16} style={{ color: COLORS.inkSoft }} />}
                        </button>
                        {pbOpen === s.h && (
                          <div className="px-3.5 pb-3.5 space-y-2 tab-in">
                            {s.pts.map((p, i) => (
                              <p key={i} className="text-xs leading-relaxed" style={{ color: COLORS.inkSoft }}>{p}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: COLORS.inkSoft }}>
                    Playbooks describe what plans of this type typically include. Names and amounts vary by plan and year, so confirm yours below and check off what you verify.
                  </p>
                </div>
              )}

              <p className="text-sm font-bold mb-2" style={{ color: COLORS.ink }}>Confirm it for your exact plan</p>
              <div className="space-y-2">
                {BENEFITS.map((b) => (
                  <button key={b.k}
                    onClick={() => setTChecked(tChecked.includes(b.k) ? tChecked.filter((x) => x !== b.k) : [...tChecked, b.k])}
                    className="w-full text-left rounded-2xl p-3.5 flex gap-3 items-start focus:outline-none focus-visible:ring-2"
                    style={{
                      border: `1px solid ${tChecked.includes(b.k) ? COLORS.green : COLORS.line}`,
                      background: tChecked.includes(b.k) ? COLORS.green + "0D" : COLORS.bg,
                    }}>
                    <span className="mt-0.5 w-5 h-5 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: tChecked.includes(b.k) ? COLORS.green : "#E9C7D3" }}>
                      {tChecked.includes(b.k) ? "✓" : ""}
                    </span>
                    <span>
                      <span className="block text-sm font-bold" style={{ color: COLORS.ink }}>{b.name}</span>
                      <span className="block text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{b.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-3 leading-relaxed rounded-2xl p-3.5" style={{ color: COLORS.ink, background: "#F7EFDC", border: "1px solid #EAD9B4" }}>
                The script: "What over-the-counter allowance, transportation, and care coordination does my plan include, and how do I use them?" Write down the date and who you spoke with.
              </p>
            </ToolCard>

            <ToolCard id="codes" icon={Search} title="Code lookup" subtitle="The secret language, translated" open={openTool} setOpen={setOpenTool}>
              <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>
                Every treatment has a code, and codes are how insurance says yes or no. Search whatever is on your EOB, portal, or denial letter.
              </p>
              <input
                type="text" value={codeQ} onChange={(e) => setCodeQ(e.target.value)}
                placeholder="try: 99213, MRI, lupus, blood draw"
                className={inputCls} style={inputStyle}
              />
              {codeQ.trim() && (
                <div className="space-y-1.5 mt-2">
                  {codeMatches.map((c) => (
                    <div key={c.c + c.m} className="rounded-xl px-3 py-2 flex items-baseline gap-2 flex-wrap" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
                      <span className="text-sm font-bold shrink-0" style={{ fontFamily: SERIF, color: COLORS.plumDark }}>{c.c}</span>
                      <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 shrink-0" style={{ background: COLORS.pill, color: COLORS.inkSoft }}>{c.t}</span>
                      <span className="text-xs" style={{ color: COLORS.ink }}>{c.m}</span>
                    </div>
                  ))}
                  {codeMatches.length === 0 && (
                    <p className="text-xs px-1" style={{ color: COLORS.inkSoft }}>
                      Not in our set yet. Search the exact code online with "CPT" or "ICD-10" attached, or ask the office what code they billed.
                    </p>
                  )}
                </div>
              )}
              <p className="text-[11px] mt-2" style={{ color: COLORS.inkSoft }}>
                90+ common codes curated for our community: diagnoses, visits, labs, imaging, and the modifiers on your bills.
              </p>
            </ToolCard>

            <GroupLabel>Own your visits</GroupLabel>
            <ToolCard id="prep" icon={CalendarCheck} title="Appointment prep" subtitle="Walk in armed. Build your visit plan." open={openTool} setOpen={setOpenTool}>
              <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>
                Bring your visit notes (Today tab), your top three concerns, and a support person if you can. These tests are questions to bring, not demands. Your provider decides what fits.
              </p>
              <div className="space-y-2 mb-4">
                {PREP_TESTS.map((t) => (
                  <div key={t.cluster} className="rounded-2xl p-3.5" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
                    <p className="text-sm font-bold" style={{ color: COLORS.ink }}>{t.cluster}</p>
                    <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{t.tests}</p>
                  </div>
                ))}
              </div>
              <p className={labelCls} style={{ color: COLORS.inkSoft }}>Phrases that work</p>
              <div className="space-y-1.5 mb-3">
                {PREP_PHRASES.map((p) => (
                  <p key={p} className="text-sm rounded-2xl px-3.5 py-2.5" style={{ background: COLORS.pill, color: COLORS.ink }}>{p}</p>
                ))}
              </div>

              <p className={labelCls} style={{ color: COLORS.inkSoft }}>When you're being dismissed, specifically</p>
              <p className="text-xs mb-2" style={{ color: COLORS.inkSoft }}>
                For the patterns reported most: told it's anxiety, told it's your weight, pain not taken seriously, or "your labs are normal."
              </p>
              <div className="space-y-1.5 mb-3">
                {BIAS_PHRASES.map((p) => (
                  <p key={p} className="text-sm rounded-2xl px-3.5 py-2.5" style={{ background: "#FDF4F0", border: "1px solid #E8B7C6", color: COLORS.ink }}>{p}</p>
                ))}
              </div>

              <div className="rounded-2xl p-3.5 mb-3" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
                <p className="text-sm font-bold mb-2" style={{ color: COLORS.ink }}>Build my visit plan</p>
                <div className="mb-3">
                  <SuggestInput
                    label="Who are you seeing?"
                    placeholder="type to search specialty"
                    value={prepSpecialty} setValue={setPrepSpecialty}
                    options={[...SEED_SPECIALTIES, ...(customTerms.specialties || [])]}
                    onAddCustom={(x) => addCustomTerm("specialties", x)}
                  />
                </div>
                <label className={labelCls} style={{ color: COLORS.inkSoft }}>My top concerns (one per line)</label>
                <textarea
                  value={prepNotes} onChange={(e) => setPrepNotes(e.target.value)} rows={3}
                  placeholder={"pain is worse at night\nnew symptom since last visit\nrefill before I run out"}
                  className={inputCls + " mb-3"} style={inputStyle}
                />
                <button
                  onClick={async () => { try { await navigator.clipboard.writeText(buildVisitPlan()); setVpCopied(true); setTimeout(() => setVpCopied(false), 2000); } catch (e) { console.error("Copy failed", e); } }}
                  className="w-full rounded-full py-3.5 text-sm font-bold text-white focus:outline-none focus-visible:ring-2"
                  style={{ background: vpCopied ? COLORS.green : GRAD }}>
                  {vpCopied ? "Copied ✓" : "Copy my visit plan"}
                </button>
                <p className="text-[11px] mt-2" style={{ color: COLORS.inkSoft }}>
                  One pocket script: your concerns, conditions, allergies, med history, the last two weeks of check-ins, and the questions to ask before you leave.
                </p>
              </div>

              <p className="text-xs leading-relaxed mb-3" style={{ color: COLORS.inkSoft }}>
                After the visit: log it in Receipts (believed or dismissed) and request the visit notes in your portal while it's fresh.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: COLORS.inkSoft }}>
                This is education drawn from patient advocacy practice, not medical advice. What's right for you is a decision between you and your care team.
              </p>
            </ToolCard>

            <GroupLabel>Guides</GroupLabel>
            <ToolCard id="nourish" icon={Soup} title="Nourish" subtitle="Search any food, get the verdict" open={openTool} setOpen={setOpenTool}>
              <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>
                Anti-inflammatory eating, searchable. "Gentle" tends to calm; "easy does it" tends to stir. Flare-gut notes included, because fiber is not everyone's friend. Education, not a diet plan; a dietitian can tailor it to your body, and no one earns care through perfect eating.
              </p>
              <input value={nQ} onChange={(e) => setNQ(e.target.value)} placeholder="try: salmon, sugar, ginger, rice" className={inputCls} style={inputStyle} />
              {nQ.trim() && (
                <div className="space-y-1.5 mt-2">
                  {nourishMatches.map((x) => (
                    <div key={x.n} className="rounded-xl px-3 py-2" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold" style={{ fontFamily: SERIF }}>{x.n}</span>
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: x.v === "g" ? "#E4F0E7" : "#F7EFDC", color: x.v === "g" ? "#3E7A52" : "#8A6A1F" }}>
                          {x.v === "g" ? "gentle" : "easy does it"}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{x.why}{x.gi ? `. Flare-gut note: ${x.gi}` : ""}</p>
                    </div>
                  ))}
                  {nourishMatches.length === 0 && (
                    <p className="text-xs px-1" style={{ color: COLORS.inkSoft }}>Not in the pantry yet. Tell Sol and it gets added.</p>
                  )}
                </div>
              )}
            </ToolCard>

            <ToolCard id="relief" icon={Flower2} title="Relief library" subtitle="Search a symptom, find a comfort" open={openTool} setOpen={setOpenTool}>
              <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>
                Comfort measures, searchable by what hurts. These buy relief while you pursue real answers; they never replace medical care. New, worse, or different pain deserves attention, not endurance.
              </p>
              <input value={rQ} onChange={(e) => setRQ(e.target.value)} placeholder="try: cramps, migraine, nausea, stiffness" className={inputCls} style={inputStyle} />
              {rQ.trim() && (
                <div className="space-y-1.5 mt-2">
                  {reliefMatches.map((x) => (
                    <div key={x.n} className="rounded-xl px-3 py-2" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
                      <p className="text-sm font-bold" style={{ fontFamily: SERIF }}>{x.n}</p>
                      <p className="text-[11px] mt-0.5 font-semibold" style={{ color: COLORS.plumDark }}>best for: {x.bestFor}</p>
                      <p className="text-xs mt-0.5" style={{ color: COLORS.inkSoft }}>{x.how}</p>
                    </div>
                  ))}
                  {reliefMatches.length === 0 && (
                    <p className="text-xs px-1" style={{ color: COLORS.inkSoft }}>Nothing matched yet. Try the symptom's simplest word.</p>
                  )}
                </div>
              )}
            </ToolCard>

            <ToolCard id="resources" icon={Library} title="Resources" subtitle="Search any battle: appeals, records, ER" open={openTool} setOpen={setOpenTool}>
              <p className="text-sm mb-3" style={{ color: COLORS.inkSoft }}>
                The battle guides, searchable. Type what you're facing, or browse below.
              </p>
              <input value={gQ} onChange={(e) => setGQ(e.target.value)}
                placeholder="try: appeal, peer-to-peer, chart, ER, brand name"
                className={inputCls} style={inputStyle} />
              {gQ.trim() ? (
                <div className="space-y-1.5 mt-2">
                  {guideMatches.map(({ g, p }, i) => (
                    <div key={i} className="rounded-xl px-3 py-2" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
                      <p className="text-[10px] font-bold rounded-full inline-block px-2 py-0.5 mb-1" style={{ background: COLORS.pill, color: COLORS.plumDark }}>{g}</p>
                      <p className="text-xs leading-relaxed" style={{ color: COLORS.ink }}>{p}</p>
                    </div>
                  ))}
                  {guideMatches.length === 0 && (
                    <p className="text-xs px-1" style={{ color: COLORS.inkSoft }}>Nothing matched. Try a simpler word, or clear the search to browse the full guides.</p>
                  )}
                </div>
              ) : (
              <div className="space-y-2 mt-2">
                {RESOURCES.map((r) => (
                  <div key={r.k} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${COLORS.line}`, background: COLORS.bg }}>
                    <button onClick={() => setOpenRes(openRes === r.k ? null : r.k)}
                      className="w-full flex items-center justify-between px-3.5 py-3 text-left focus:outline-none focus-visible:ring-2">
                      <span className="text-sm font-bold" style={{ color: COLORS.ink }}>{r.title}</span>
                      {openRes === r.k ? <ChevronUp size={16} style={{ color: COLORS.plumDark }} /> : <ChevronDown size={16} style={{ color: COLORS.inkSoft }} />}
                    </button>
                    {openRes === r.k && (
                      <div className="px-3.5 pb-3.5 space-y-2 tab-in">
                        {r.points.map((p, i) => (
                          <p key={i} className="text-xs leading-relaxed" style={{ color: COLORS.inkSoft }}>{p}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}
            </ToolCard>

            <GroupLabel>Change the system</GroupLabel>
            <ToolCard id="research" icon={FlaskConical} title="Community research" subtitle={rConsent ? "You're contributing ✓" : "Opt in & make change"} open={openTool} setOpen={setOpenTool}>
              <p className="text-sm mb-3 leading-relaxed" style={{ color: COLORS.inkSoft }}>
                Our stories are how the system changes. Don't Lose Your Whimsy is building the evidence base on medical dismissal, access barriers, and what actually helps people like us, to inform academic research and health policy advocacy.
              </p>
              <div className="rounded-2xl p-3.5 mb-3" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
                <p className="text-xs font-bold mb-1.5" style={{ color: COLORS.ink }}>What contributing means, plainly</p>
                <ul className="text-xs leading-relaxed space-y-1" style={{ color: COLORS.inkSoft }}>
                  <li>• <strong>Completely optional.</strong> Whimsy works exactly the same either way.</li>
                  <li>• <strong>Nothing is tied to you.</strong> No name, no email, no provider or facility names, no notes, no calendar dates. Time becomes "day 1, day 34."</li>
                  <li>• <strong>Nothing is sent automatically.</strong> Right now, contributing means you copy your own anonymized export and send it to us. You see exactly what you're sharing before it leaves your device.</li>
                  <li>• <strong>Only combined patterns are ever published.</strong> Never your individual record, and never a group small enough to identify anyone.</li>
                  <li>• <strong>Never sold. Never shared with insurers or employers.</strong></li>
                  <li>• <strong>Withdraw anytime.</strong> Tap this button again, and email us to have anything you sent deleted.</li>
                </ul>
              </div>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: COLORS.inkSoft }}>
                Contributed data may be used in academic research, including our founder's doctoral work, and in policy advocacy for better care. Before any research is published, the project will go through formal ethics review (IRB), and automatic contribution will not exist until those protections are approved and in place.
              </p>
              <button
                onClick={() => setRConsent(!rConsent)}
                className="w-full rounded-full py-4 text-base font-bold focus:outline-none focus-visible:ring-2 mb-2"
                style={{
                  border: `2px solid ${rConsent ? COLORS.green : COLORS.plum}`,
                  background: rConsent ? COLORS.green + "14" : "transparent",
                  color: rConsent ? COLORS.green : COLORS.plum,
                }}>
                {rConsent ? "✓ I'm in. Tap to withdraw" : "Count me in"}
              </button>
              {rConsent && (
                <>
                  <button onClick={copyResearchExport}
                    className="w-full rounded-full py-4 text-base font-bold text-white flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2"
                    style={{ background: rCopied ? COLORS.green : GRAD }}>
                    {rCopied ? <><Check size={17} /> Copied</> : <><Copy size={17} /> Copy my anonymized export</>}
                  </button>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: COLORS.inkSoft }}>
                    Tap to copy your anonymized export, then paste it into an email to <strong>research@dontloseyourwhimsy.org</strong>. Read it first: this is exactly what you'd be sharing, and nothing else ever leaves your device. Thank you for building the evidence with us.
                  </p>
                </>
              )}
            </ToolCard>
            </>
            )}
          </section>
        )}

        <footer className="text-center mt-8">
          <div className="flex gap-2 justify-center mb-4">
            <button onClick={downloadBackup}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold focus:outline-none focus-visible:ring-2"
              style={{ border: `1.5px solid ${COLORS.plum}`, color: COLORS.plumDark, background: "transparent" }}>
              <Download size={13} /> {backupState ? (backupState === "saved" ? "Saved ✓" : "Copied ✓") : "Take your story with you"}
            </button>
            <label className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold cursor-pointer focus-within:ring-2"
              style={{ border: `1.5px solid ${COLORS.line}`, color: COLORS.inkSoft, background: "transparent" }}>
              <Upload size={13} /> Restore backup
              <input type="file" accept=".json,application/json" className="hidden"
                onChange={(e) => { if (e.target.files && e.target.files[0]) { restoreBackup(e.target.files[0]); e.target.value = ""; } }} />
            </label>
          </div>
            <p className="text-[11px] text-center mt-2 leading-relaxed" style={{ color: COLORS.inkSoft }}>
              Downloads a file you can keep, and copies to your clipboard as a backup path. Use Restore backup to bring your story home.
            </p>
          <p className="text-xs mb-3" style={{ color: COLORS.inkSoft }}>
            Your data belongs to you. Everything stays private, and you can take it with you anytime.
          </p>
          <p className="text-xs" style={{ color: COLORS.inkSoft, fontFamily: SERIF, fontStyle: "italic" }}>
            Why be normal when you can be you?
          </p>
        </footer>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="mb-2">
      <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1.2rem", color: COLORS.ink }}>{children}</h2>
      <div className="h-1 w-12 rounded-full mt-1.5" style={{ background: `linear-gradient(90deg, ${COLORS.gold}, rgba(214,79,132,0.35))` }} />
    </div>
  );
}

function ToolCard({ id, title, subtitle, icon: Icon, open, setOpen, children }) {
  const isOpen = open === id;
  return (
    <div className="rounded-3xl mb-4 overflow-hidden" style={cardStyle}>
      <button onClick={() => setOpen(isOpen ? null : id)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left focus:outline-none focus-visible:ring-2">
        {Icon && (
          <span className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: COLORS.pill }}>
            <Icon size={19} style={{ color: COLORS.plumDark }} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "1.1rem", color: COLORS.ink }}>{title}</h2>
          {subtitle && <p className="text-xs mt-0.5 truncate" style={{ color: COLORS.inkSoft }}>{subtitle}</p>}
        </div>
        {isOpen
          ? <ChevronUp size={18} className="shrink-0" style={{ color: COLORS.plumDark }} />
          : <ChevronDown size={18} className="shrink-0" style={{ color: COLORS.inkSoft }} />}
      </button>
      {isOpen && <div className="px-6 pb-6 tab-in">{children}</div>}
    </div>
  );
}

function GroupLabel({ children, first }) {
  return (
    <div className={"flex items-center gap-2 mb-3 " + (first ? "" : "mt-6")}>
      <span className="text-xs font-extrabold uppercase" style={{ letterSpacing: "0.14em", color: COLORS.ink }}>{children}</span>
      <span className="flex-1 h-px" style={{ background: COLORS.line }} />
    </div>
  );
}

// Small color-math helpers so skin and hair can get real gradient shading (a lit side and
// a shadow side, like the mannequin references) instead of one flat fill everywhere.
// Accepts either "#RRGGBB" hex or an "rgb(r, g, b)" string — needed because darken()/lighten()
// return rgb(...) strings, and those results are sometimes fed back into mixHex again (e.g.
// "soft" and "iris" both mix from "feature", which is itself a darken() output). Without this,
// re-parsing an rgb(...) string as hex silently produces NaN and renders as invisible/black.
function parseColor(c) {
  c = String(c).trim();
  if (c[0] === "#") {
    const h = c.replace("#", "");
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  const m = c.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (m) return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
  return [0, 0, 0];
}
function mixHex(hex, target, amt) {
  const [r1, g1, b1] = parseColor(hex);
  const [r2, g2, b2] = parseColor(target);
  const mix = (a, b) => Math.round(a + (b - a) * amt);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}
const lighten = (hex, amt) => mixHex(hex, "#ffffff", amt);
const darken = (hex, amt) => mixHex(hex, "#000000", amt);

// Evaluates a point on a cubic bezier at t, for sampling a strand's centerline.
function bezPt(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return [
    mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0],
    mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1],
  ];
}

// A braid/loc needs to read as one solid, neatly plaited section of hair — not a bundle of
// thin overlapping stroked lines, which end up looking wiry and messy at any real size.
// This samples a strand's two-segment bezier centerline, then builds a single SOLID, gently
// tapered ribbon shape around it (filled, not stroked), plus a handful of short diagonal
// "twist" ticks laid across the ribbon at intervals to hint at the alternating plait texture
// without cluttering the silhouette.
function braidRibbon(anchors, opts = {}) {
  const { widthStart = 2.2, widthEnd = 1.1, samples = 26, twistTicks = 6 } = opts;
  const [p0, c1, c2, p1, c3, c4, p2] = anchors;
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    pts.push(t <= 0.5 ? bezPt(p0, c1, c2, p1, t / 0.5) : bezPt(p1, c3, c4, p2, (t - 0.5) / 0.5));
  }
  const left = [];
  const right = [];
  const ticks = [];
  const tickEvery = Math.max(2, Math.round(pts.length / twistTicks));
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    const dx = next[0] - prev[0], dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const t = i / (pts.length - 1);
    const w = widthStart + (widthEnd - widthStart) * t;
    left.push([x + nx * w, y + ny * w]);
    right.push([x - nx * w, y - ny * w]);
    if (i > 0 && i < pts.length - 1 && i % tickEvery === 0) {
      ticks.push([x - nx * w * 0.75, y - ny * w * 0.75, x + nx * w * 0.75, y + ny * w * 0.75]);
    }
  }
  const fmt = (p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  const ribbon =
    "M" + left.map(fmt).join(" L") +
    " L" + right.slice().reverse().map(fmt).join(" L") + " Z";
  return { ribbon, ticks };
}

// Renders the chosen hairstyle as three layers: "behind" paints before the head silhouette
// (so it can flare out past the head's edge, like an afro halo); "scalp" paints on top of the
// skin but underneath the face, a low natural hairline covering the crown so every style (other
// than bald) reads as hair sitting on a head, not a shape floating above bare scalp; "above"
// paints last, on top of everything, for the part of a style that builds up off that scalp hair
// (a gathered puff, buns, a ponytail, braids, locs, a wrap). Same shapes serve both the front
// and back views so a style stays recognizable no matter which way the body is turned.
function getHairOverlay(styleKey, hairColor) {
  const behind = [];
  const scalp = [];
  const above = [];
  if (styleKey !== "bald") {
    scalp.push(
      <path key="scalp-base"
        d="M37.4 13.5 C37.6 7.6 43 2.3 50 2.3 C57 2.3 62.4 7.6 62.6 13.5 C62.7 16.3 61.9 18.9 60.4 20.8 C60.7 15.8 59 10.5 55 7.8 C51.9 9.5 48.1 9.5 45 7.8 C41 10.5 39.3 15.8 39.6 20.8 C38.1 18.9 37.3 16.3 37.4 13.5 Z"
        fill={hairColor} opacity="0.92" />,
      // "edges": small laid baby-hair swirls right at the hairline, at the center part and
      // both temples, the way edges get gelled down and curled rather than left loose.
      <path key="edge-center" d="M48.3 7.6 Q49.8 6 51.4 7.3 Q51.6 8.5 50.4 9 Q49 9.2 48.5 8.3 Q48.2 7.9 48.3 7.6 Z"
        fill={hairColor} opacity="0.85" />,
      <path key="edge-l" d="M39.3 12.8 Q37 14 37.7 16.6 Q39 17 39.8 15.6 Q40.3 14.3 39.9 13.2 Q39.6 12.8 39.3 12.8 Z"
        fill={hairColor} opacity="0.85" />,
      <path key="edge-r" d="M60.7 12.8 Q63 14 62.3 16.6 Q61 17 60.2 15.6 Q59.7 14.3 60.1 13.2 Q60.4 12.8 60.7 12.8 Z"
        fill={hairColor} opacity="0.85" />
    );
  }
  switch (styleKey) {
    case "afro": {
      // The old version was one flat, half-opacity circle — it read as a gray, washed-out
      // helmet instead of hair. This builds a solid base cloud plus a ring of overlapping
      // "curl" circles around the silhouette edge so the outline itself looks bumpy/textured
      // like real coiled hair, with a shadow underneath and light flecks on top for depth.
      const darkC = darken(hairColor, 0.22), lightC = lighten(hairColor, 0.22);
      behind.push(
        <circle key="afro-cloud" cx="50" cy="15" r="17" fill={hairColor} opacity="0.92" />,
        <circle key="afro-shadow" cx="50" cy="20" r="15.5" fill={darkC} opacity="0.35" />
      );
      const n = 26;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rad = 15.5 + (i % 3) * 1.4;
        const cx = 50 + Math.cos(a) * rad;
        const cy = 15 + Math.sin(a) * rad * 0.95;
        const tone = i % 5 === 0 ? lightC : i % 3 === 0 ? darkC : hairColor;
        behind.push(
          <circle key={"curl" + i} cx={cx} cy={cy} r={1.5 + (i % 2) * 0.6} fill={tone} opacity={i % 5 === 0 ? 0.55 : 0.8} />
        );
      }
      // A few tighter inner curls near the crown so the texture doesn't read as hollow.
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + 0.3;
        const cx = 50 + Math.cos(a) * 9;
        const cy = 12 + Math.sin(a) * 8;
        behind.push(<circle key={"innercurl" + i} cx={cx} cy={cy} r="1.3" fill={i % 2 === 0 ? darkC : hairColor} opacity="0.5" />);
      }
      break;
    }
    case "puff": {
      // Was a half-opacity gather plus a thin disconnected bump — bumped opacity so it reads
      // as solid gathered hair instead of a faint smudge, and added a sheen + darker tie band
      // so the puff looks voluminous and actually tied off, not floating above the head.
      const darkC = darken(hairColor, 0.2), lightC = lighten(hairColor, 0.18);
      above.push(
        <path key="puff-gather" d="M42.5 9 Q42 5 45.5 2.5 Q50 0.8 54.5 2.5 Q58 5 57.5 9 Q56 6.5 50 6.2 Q44 6.5 42.5 9 Z"
          fill={hairColor} opacity="0.6" />,
        <ellipse key="puff" cx="50" cy="0.3" rx="7.8" ry="6.6" fill={hairColor} opacity="0.9" />,
        <path key="puff-sheen" d="M45.5 -2.8 Q50 -4.2 54.5 -2.8" stroke={lightC} strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round" />,
        <path key="puff-band" d="M42.5 6.5 Q50 9.2 57.5 6.5" stroke={darkC} strokeWidth="1.5" fill="none" opacity="0.85" strokeLinecap="round" />
      );
      break;
    }
    case "spacebuns": {
      // A shadow bridging each bun down into the scalp cap so it reads as hair gathered up
      // off the head, not a ball floating a few units above it.
      const darkC = darken(hairColor, 0.22);
      above.push(
        <ellipse key="bun-l-shadow" cx="39" cy="6.5" rx="4.6" ry="2.2" fill={darkC} opacity="0.35" />,
        <ellipse key="bun-r-shadow" cx="61" cy="6.5" rx="4.6" ry="2.2" fill={darkC} opacity="0.35" />,
        <ellipse key="bun-l" cx="39" cy="2" rx="5.2" ry="4.4" fill={hairColor} opacity="0.6" />,
        <ellipse key="bun-r" cx="61" cy="2" rx="5.2" ry="4.4" fill={hairColor} opacity="0.6" />,
        <path key="bun-l-band" d="M35.5 6 Q39 7.8 42.5 6" stroke={hairColor} strokeWidth="1" fill="none" opacity="0.7" strokeLinecap="round" />,
        <path key="bun-r-band" d="M57.5 6 Q61 7.8 64.5 6" stroke={hairColor} strokeWidth="1" fill="none" opacity="0.7" strokeLinecap="round" />
      );
      break;
    }
    case "ponytail": {
      // The old tail path ran straight across the cheek/jaw (x 54-63 through y 4-32), reading
      // as a dark diagonal slash over the face in front view. Routed it up and around instead
      // — a tapered ribbon (same helper as braids/locs) that stays right of the cheekbone
      // (which reaches x~61 at eye level) the whole way down, clear of every face feature.
      const darkC = darken(hairColor, 0.18), lightC = lighten(hairColor, 0.15);
      above.push(
        <ellipse key="pony-gather" cx="50" cy="1.5" rx="6.5" ry="5" fill={hairColor} opacity="0.75" />,
        <path key="pony-band" d="M45 3.5 Q50 5.8 55 3.5" stroke={darkC} strokeWidth="1" fill="none" opacity="0.6" strokeLinecap="round" />
      );
      const anchors = [[58, 2], [63.5, 5], [67, 11], [65.5, 17.5], [63.5, 23.5], [61, 29.5], [59, 35]];
      const { ribbon, ticks } = braidRibbon(anchors, { widthStart: 3, widthEnd: 1.6, twistTicks: 4 });
      above.push(
        <path key="pony-tail" d={ribbon} fill={hairColor} stroke={darkC} strokeWidth="0.2" strokeLinejoin="round" />,
        <path key="pony-tail-sheen" d={ribbon} fill="none" stroke={lightC} strokeWidth="0.2" opacity="0.3" strokeLinejoin="round" />,
        ...ticks.map((t, ti) => (
          <line key={"ponytick" + ti} x1={t[0]} y1={t[1]} x2={t[2]} y2={t[3]} stroke={darkC} strokeWidth="0.25" opacity="0.25" strokeLinecap="round" />
        ))
      );
      break;
    }
    case "braids": {
      // Parted at the center, each strand starts already offset out at the hairline (framing
      // the face from the very top) and then hangs essentially straight down past the
      // shoulder — no diagonal sweep across the head. Each braid is one solid, gently
      // tapered ribbon (filled, not a bundle of thin stroked lines, which read as messy wire
      // at any real size) with a few short twist ticks to hint at the plait without clutter.
      const darkC = darken(hairColor, 0.22), lightC = lighten(hairColor, 0.16);
      // frameX is where each strand actually frames the face, from the hairline (y=10) down.
      // The crown attachment (hidden under the opaque scalp cap) stays clustered near center
      // so there's no bald-looking gap at the top, then each strand fans back out to its
      // frame position by the hairline — so the part reads full up top without the hair
      // itself curtaining over the face.
      const frames = [42, 40.4, 38.8, 37.2, 35.6, 34];
      frames.forEach((frameX, i) => {
        // Shoulder-length, not long: the outer strands run a bit longer and flare out a
        // bit further than the inner ones, so the whole bunch reads as a flowy triangle
        // (narrow at the part, widening toward the ends) instead of parallel straight lines.
        const endY = 24 + i * 3;
        const midY = (10 + endY) / 2;
        const flare = 0.5 + i * 0.55;
        const wave = i % 2 === 0 ? 0.2 : -0.2;
        const crownX = 47.5 - i * 0.4;
        const anchorsL = [[crownX, 2], [crownX - 0.8, 5], [frameX + 1.2, 7.5], [frameX, 10], [frameX - flare * 0.35 + wave, midY], [frameX - flare * 0.75, midY + (endY - midY) * 0.6], [frameX - flare, endY]];
        const { ribbon, ticks } = braidRibbon(anchorsL, { widthStart: 2.3, widthEnd: 1.4, twistTicks: 5 });
        above.push(
          <path key={"braidL" + i} d={ribbon} fill={hairColor} stroke={darkC} strokeWidth="0.18" strokeLinejoin="round" />,
          <path key={"braidLsheen" + i} d={ribbon} fill="none" stroke={lightC} strokeWidth="0.18" opacity="0.3" strokeLinejoin="round" />,
          ...ticks.map((t, ti) => (
            <line key={"braidLtick" + i + ti} x1={t[0]} y1={t[1]} x2={t[2]} y2={t[3]} stroke={darkC} strokeWidth="0.22" opacity="0.3" strokeLinecap="round" />
          ))
        );
        const anchorsR = anchorsL.map(([x, y]) => [100 - x, y]);
        const ribbonR = braidRibbon(anchorsR, { widthStart: 2.3, widthEnd: 1.4, twistTicks: 5 });
        above.push(
          <path key={"braidR" + i} d={ribbonR.ribbon} fill={hairColor} stroke={darkC} strokeWidth="0.18" strokeLinejoin="round" />,
          <path key={"braidRsheen" + i} d={ribbonR.ribbon} fill="none" stroke={lightC} strokeWidth="0.18" opacity="0.3" strokeLinejoin="round" />,
          ...ribbonR.ticks.map((t, ti) => (
            <line key={"braidRtick" + i + ti} x1={t[0]} y1={t[1]} x2={t[2]} y2={t[3]} stroke={darkC} strokeWidth="0.22" opacity="0.3" strokeLinecap="round" />
          ))
        );
      });
      break;
    }
    case "bantu": {
      // Half-opacity flat circles read as loose polka dots, not wrapped knots. Bumped to solid
      // fill, added a small highlight so each one reads as round/domed, and a thin wrap-thread
      // arc across each to hint at the coiled base without drawing every wind of thread.
      const darkC = darken(hairColor, 0.2), lightC = lighten(hairColor, 0.2);
      const knots = [[42, 3], [50, 0.5], [58, 3], [45.5, 7.5], [54.5, 7.5]];
      knots.forEach(([x, y], i) => {
        above.push(
          // shadow anchoring the knot to the scalp, so each one reads as wrapped-up hair
          // rather than a dot resting on top of the head
          <ellipse key={"knotshadow" + i} cx={x} cy={y + 2} rx="2.2" ry="1" fill={darkC} opacity="0.3" />,
          <circle key={"knot" + i} cx={x} cy={y} r="2.8" fill={hairColor} opacity="0.92" stroke={darkC} strokeWidth="0.15" />,
          <circle key={"knotshine" + i} cx={x - 0.8} cy={y - 0.8} r="0.7" fill={lightC} opacity="0.5" />,
          <path key={"knotwrap" + i} d={`M${x - 2.4} ${y} Q${x} ${y + 1.6} ${x + 2.4} ${y}`} stroke={darkC} strokeWidth="0.25" fill="none" opacity="0.4" />
        );
      });
      break;
    }
    case "locs": {
      // Same center part and immediate face-framing as braids, then straight down: locs are
      // just thicker, solid-filled ribbons with fewer twist ticks (they twist more slowly and
      // read as thicker rope-like sections, not a bundle of thin wiry lines).
      const darkC = darken(hairColor, 0.2), lightC = lighten(hairColor, 0.14);
      // Same crown-tight / hairline-fan-out logic as braids: the top stays clustered near
      // center (covered by the opaque scalp cap, so no bald gap), then each strand fans back
      // out to its real framing width by the hairline so the face stays clear.
      const frames = [41.5, 39.7, 38, 36.3, 34.6];
      frames.forEach((frameX, i) => {
        // Same flowy-triangle idea as braids, just a touch longer and thicker since locs read
        // heavier: shoulder-to-upper-chest length, flaring wider toward the outer locs.
        const len = 26 + i * 3.5;
        const midY = (11 + len) / 2;
        const flare = 0.6 + i * 0.7;
        const wave = i % 2 === 0 ? 0.25 : -0.25;
        const crownX = 47 - i * 0.5;
        const anchorsL = [[crownX, 2.5], [crownX - 1, 6], [frameX + 1.4, 8.5], [frameX, 11], [frameX - flare * 0.35 + wave, midY], [frameX - flare * 0.75, midY + (len - midY) * 0.6], [frameX - flare, len]];
        const { ribbon, ticks } = braidRibbon(anchorsL, { widthStart: 3, widthEnd: 2, twistTicks: 3 });
        above.push(
          <path key={"locL" + i} d={ribbon} fill={hairColor} stroke={darkC} strokeWidth="0.2" strokeLinejoin="round" />,
          <path key={"locLsheen" + i} d={ribbon} fill="none" stroke={lightC} strokeWidth="0.2" opacity="0.3" strokeLinejoin="round" />,
          ...ticks.map((t, ti) => (
            <line key={"locLtick" + i + ti} x1={t[0]} y1={t[1]} x2={t[2]} y2={t[3]} stroke={darkC} strokeWidth="0.3" opacity="0.28" strokeLinecap="round" />
          ))
        );
        const anchorsR = anchorsL.map(([x, y]) => [100 - x, y]);
        const ribbonR = braidRibbon(anchorsR, { widthStart: 3, widthEnd: 2, twistTicks: 3 });
        above.push(
          <path key={"locR" + i} d={ribbonR.ribbon} fill={hairColor} stroke={darkC} strokeWidth="0.2" strokeLinejoin="round" />,
          <path key={"locRsheen" + i} d={ribbonR.ribbon} fill="none" stroke={lightC} strokeWidth="0.2" opacity="0.3" strokeLinejoin="round" />,
          ...ribbonR.ticks.map((t, ti) => (
            <line key={"locRtick" + i + ti} x1={t[0]} y1={t[1]} x2={t[2]} y2={t[3]} stroke={darkC} strokeWidth="0.3" opacity="0.28" strokeLinecap="round" />
          ))
        );
      });
      break;
    }
    case "headwrap": {
      // The old wrap's bottom edge ran down to y=18.5 — well below the eyebrows (y~11.5) and
      // straight across the eyes (y=14), so it rendered like a blindfold. A real wrap ties
      // above the eyebrows at the hairline, so the whole shape is raised to end by y~10.6,
      // and opacity bumped up so it reads as solid fabric rather than a translucent wash.
      const darkC = darken(hairColor, 0.22);
      above.push(
        <path key="wrap" d="M35.5 9.5 C35.5 3 42 0 50 0 C58 0 64.5 3 64.5 9.5 C64.5 9.9 64 10.4 63 10.7 C56 8.8 44 8.8 37 10.7 C36 10.4 35.5 9.9 35.5 9.5 Z"
          fill={hairColor} opacity="0.9" />,
        <path key="wrap-knot-l" d="M44 1 L40 -3 L47.5 -0.5 Z" fill={hairColor} opacity="0.8" />,
        <path key="wrap-knot-r" d="M56 1 L60 -3 L52.5 -0.5 Z" fill={hairColor} opacity="0.8" />,
        <path key="wrap-line" d="M37.5 6.3 Q50 3.8 62.5 6.3" stroke={darkC} strokeWidth="0.5" fill="none" opacity="0.45" />,
        <path key="wrap-fold" d="M37 9.6 Q50 7.6 63 9.6" stroke={darkC} strokeWidth="0.4" fill="none" opacity="0.4" />
      );
      break;
    }
    case "bald":
    default:
      break;
  }
  return { behind, scalp, above };
}

function BodyMap({ selected, setSelected, skin, shape, hairStyle, hairColorHex, onOpenAppearance }) {
  const [view, setView] = useState("front");
  const toggle = (k) => setSelected(selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k]);
  const viewParts = BODY_MAP.filter((b) => b.d && (b.view === "both" || b.view === view));
  const chips = BODY_MAP.filter((b) => !b.d);
  const allOver = selected.includes("allOver");
  const jointKeys = ["shoulderL", "shoulderR", "handL", "handR", "kneeL", "kneeR", "abdomenRLQ", "abdomenLLQ", "glutesL", "glutesR"];
  const joints = selected.includes("joints");
  const isOn = (k) => selected.includes(k) || allOver || (joints && jointKeys.includes(k));
  const skinFill = skin?.fill || "#F6D9DE";
  const skinLine = skin?.glow || "#DFA6BA";
  // The outline is always the same skin tone, just darker — not a separately authored color
  // and not one fixed black for every tone. This means it naturally scales with the tone
  // picked: the light blush default gets a dark dusty-pink line, and deep skin gets a line
  // dark enough to read as black, without ever needing a special case per tone.
  const feature = darken(skinFill, 0.38);
  // A gentler, warmer line for the most delicate facial detail (brows, eyelids, nose bridge)
  // — full-strength `feature` reads as sculpted on the body outline and jaw, but was too
  // harsh/inky for the softer, rounder look of a friendly illustrated face.
  const soft = mixHex(feature, skinFill, 0.4);
  const iris = mixHex(feature, "#8B5A2B", 0.5);
  // Brows were tied to skin tone via "soft", so picking a light or gray hair color never
  // showed up on the face. Blending the actual chosen hair color with skin keeps the same
  // gentle, low-contrast look while making brows track hair color like real ones do.
  const browColor = mixHex(hairColorHex || "#3B2417", skinFill, 0.25);
  const lip = mixHex(COLORS.plum, skinFill, 0.3);
  const lipLine = mixHex(COLORS.plumDark, skinFill, 0.35);
  const scaleX = shape?.scaleX ?? 1;
  // scaleX alone only ever resized the same silhouette — the three body types looked like
  // the same shape at different zoom levels. "curve" scales the bust fullness and the
  // waist/hip contour independently of overall width, so each type reads as an actually
  // different proportion, not just a bigger/smaller version of one shape.
  const curveAmt = shape?.curve ?? 1;
  const hair = getHairOverlay(hairStyle, hairColorHex || "#3B2417");
  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-2">
        {["front", "back"].map((v) => (
          <button key={v} onClick={() => setView(v)}
            className="rounded-full px-4 py-1.5 text-xs font-bold focus:outline-none focus-visible:ring-2"
            style={{ background: view === v ? GRAD : COLORS.pill, color: view === v ? "#fff" : COLORS.ink }}>
            {v === "front" ? "Front" : "Back"}
          </button>
        ))}
        {onOpenAppearance && (
          <button onClick={onOpenAppearance} aria-label="Change colors and appearance"
            title="Change colors and appearance"
            className="rounded-full w-7 h-7 flex items-center justify-center focus:outline-none focus-visible:ring-2"
            style={{ background: COLORS.pill, color: COLORS.plumDark, border: `1px solid ${COLORS.line}` }}>
            <Palette size={13} />
          </button>
        )}
      </div>
      <div className="rounded-3xl py-3 flex justify-center relative overflow-hidden"
        style={{ background: "radial-gradient(130px 165px at 50% 48%, #FEF8FA 0%, #FBF1EC 100%)", border: `1px solid ${COLORS.line}` }}>
        <span className="whimsy-sway absolute" style={{ left: 12, bottom: 6, opacity: 0.3 }}><Sprig size={22} /></span>
        <span className="whimsy-float absolute" style={{ right: 14, top: 8, opacity: 0.5 }}><Sparkles size={13} style={{ color: COLORS.gold }} /></span>
        {view === "front" ? (
          <div className="rounded-2xl overflow-hidden relative" role="group" aria-label="Front view of a body. Tap where it aches."
            style={{ width: "46vw", maxWidth: 188, minWidth: 168, aspectRatio: "927 / 1696", boxShadow: "0 6px 18px rgba(87,31,51,0.14)" }}>
            <img src="/assets/body-map/whimsy-body-front.png" alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none", userSelect: "none" }}
              draggable={false} />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              {FRONT_PHOTO_HITZONES.map((z) => {
                const b = BODY_MAP.find((bb) => bb.k === z.k);
                const on = isOn(z.k);
                return (
                  <g key={z.k}>
                    <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="2.5"
                      onClick={() => toggle(z.k)} aria-label={b?.label || z.k}
                      role="button" tabIndex={0} aria-pressed={on}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(z.k); } }}
                      className="bodypart-photo"
                      fill={on ? "rgba(214, 79, 132, 0.38)" : "transparent"}
                      stroke={on ? "#571F33" : "transparent"}
                      strokeWidth={on ? 0.7 : 0} />
                    {on && (
                      <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="2.5" fill="none" stroke="#571F33"
                        strokeWidth="1.4" opacity="0.35" className="ache" style={{ pointerEvents: "none" }} />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
        <svg width="126" height="205" viewBox="14 -1 72 172" aria-label={`Body map, ${view} view. Tap where it aches.`}>
          <defs>
            {/* A soft lit side (upper-left) to shadow side (lower-right) gradient, so the
                body reads as a rounded, sculpted figure instead of one flat fill — the
                same directional light the mannequin references showed. */}
            <radialGradient id={`skinGrad-${skin?.key || "default"}`} cx="38%" cy="20%" r="95%">
              <stop offset="0%" stopColor={lighten(skinFill, 0.35)} />
              <stop offset="55%" stopColor={skinFill} />
              <stop offset="100%" stopColor={skinLine} />
            </radialGradient>
            {/* Feathers the crisp vector linework just slightly, like a soft-shaded illustration
                rather than flat graphic-design edges — used on facial detail and hair. */}
            <filter id="softFace" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="0.3" />
            </filter>
            <filter id="softHair" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="0.18" />
            </filter>
          </defs>
          <g transform={`translate(50,0) scale(${scaleX},1) translate(-50,0)`}>
            {hair.behind}
            <path d={BODY_OUTLINE} fill={`url(#skinGrad-${skin?.key || "default"})`} stroke="none" />
            {viewParts.map((b) => {
              const on = isOn(b.k);
              return (
                <path key={b.k} d={b.d} onClick={() => toggle(b.k)} aria-label={b.label}
                  role="button" tabIndex={0} aria-pressed={on}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(b.k); } }}
                  className="bodypart"
                  fill={on ? COLORS.plum : "transparent"}
                  stroke={on ? COLORS.plumDark : feature}
                  strokeWidth={on ? 0.9 : 0.5} strokeLinejoin="round" />
              );
            })}
            {viewParts.filter((b) => isOn(b.k)).map((b) => (
              <path key={b.k + "-glow"} d={b.d} fill="none" stroke={COLORS.plum} strokeWidth="2.6" opacity="0.3" className="ache" style={{ pointerEvents: "none" }} />
            ))}
            <path d={BODY_OUTLINE} fill="none" stroke={feature} strokeWidth="1.1" strokeLinejoin="round" style={{ pointerEvents: "none" }} />
            <g style={{ pointerEvents: "none", filter: "url(#softHair)" }}>{hair.scalp}</g>
            {view === "front" ? (
              <g style={{ pointerEvents: "none", filter: "url(#softFace)" }}>
                {/* cheekbone/jaw contour — soft and low-contrast, just a hint of sculpting rather than a hard line */}
                <g opacity="0.32">
                  <path d="M41 10.5 Q39 15 40.5 19.5 Q41.5 22.5 43.5 25" fill="none" stroke={soft} strokeWidth="0.45" strokeLinecap="round" />
                  <path d="M59 10.5 Q61 15 59.5 19.5 Q58.5 22.5 56.5 25" fill="none" stroke={soft} strokeWidth="0.45" strokeLinecap="round" />
                </g>
                {/* thin, gently arched brows — colored from the chosen hair color, not skin tone,
                    so brows actually match hair (e.g. blonde hair reads with lighter brows) */}
                <g opacity="0.65">
                  <path d="M43.3 11.7 Q45.4 10.5 47.6 11.5" fill="none" stroke={browColor} strokeWidth="0.4" strokeLinecap="round" />
                  <path d="M52.4 11.5 Q54.6 10.5 56.7 11.7" fill="none" stroke={browColor} strokeWidth="0.4" strokeLinecap="round" />
                </g>
                {/* big, round, warm brown eyes — soft lid line, a warm iris (not stark black), gentle pupil and glint */}
                <g>
                  <path d="M42.8 14 Q45.4 11.7 48 14 Q45.4 15.8 42.8 14 Z" fill="#FFFBF6" opacity="0.95" />
                  <path d="M42.8 14 Q45.4 11.7 48 14 Q45.4 15.8 42.8 14 Z" fill="none" stroke={soft} strokeWidth="0.35" opacity="0.6" />
                  <path d="M52 14 Q54.6 11.7 57.2 14 Q54.6 15.8 52 14 Z" fill="#FFFBF6" opacity="0.95" />
                  <path d="M52 14 Q54.6 11.7 57.2 14 Q54.6 15.8 52 14 Z" fill="none" stroke={soft} strokeWidth="0.35" opacity="0.6" />
                  <circle cx="45.4" cy="14.1" r="1.15" fill={iris} opacity="0.92" />
                  <circle cx="54.6" cy="14.1" r="1.15" fill={iris} opacity="0.92" />
                  <circle cx="45.4" cy="14.1" r="0.5" fill="#241708" opacity="0.9" />
                  <circle cx="54.6" cy="14.1" r="0.5" fill="#241708" opacity="0.9" />
                  <circle cx="45.75" cy="13.65" r="0.25" fill="#fff" opacity="0.95" />
                  <circle cx="54.95" cy="13.65" r="0.25" fill="#fff" opacity="0.95" />
                  <path d="M46.9 13.1 L47.7 12.3" stroke={soft} strokeWidth="0.3" strokeLinecap="round" opacity="0.4" />
                  <path d="M53.1 13.1 L52.3 12.3" stroke={soft} strokeWidth="0.3" strokeLinecap="round" opacity="0.4" />
                </g>
                {/* nose: small and soft, mostly a gentle shadow rather than a drawn line */}
                <g opacity="0.5">
                  <path d="M49.6 13.9 Q49.1 16.9 49.3 18.4" fill="none" stroke={soft} strokeWidth="0.4" strokeLinecap="round" />
                  <path d="M47.7 18.7 Q47.4 19.5 48.2 19.9 Q49 20.3 50 20 Q51 20.3 51.8 19.9 Q52.6 19.5 52.3 18.7 Q51.2 19.7 50 19.4 Q48.8 19.7 47.7 18.7 Z"
                    fill={skinFill} stroke={soft} strokeWidth="0.35" />
                </g>
                {/* full, thick, soft rounded lips — a muted rosy tone blended with the skin rather than a
                    bright saturated pink. Both the cupid's-bow peak and the lower-lip bulge are pushed
                    further from the mouth line than before (was barely 0.3/3 units, now ~1.5/4.5) and the
                    corners widened slightly, so the mouth reads as noticeably fuller. */}
                <g>
                  <path d="M45.7 21.7 Q47.6 20.2 49 21.1 Q50 20.5 51 21.1 Q52.4 20.2 54.3 21.7 Q50 22.6 45.7 21.7 Z"
                    fill={lip} opacity="0.88" stroke={lipLine} strokeWidth="0.25" />
                  <path d="M45.7 21.7 Q50 26.2 54.3 21.7 Q50 24 45.7 21.7 Z"
                    fill={lip} opacity="0.95" stroke={lipLine} strokeWidth="0.3" />
                  <path d="M45.7 21.7 L54.3 21.7" stroke={lipLine} strokeWidth="0.25" opacity="0.35" />
                </g>
                {/* jawline: a soft contour from cheek through the chin, just enough to read as a real face shape without a hard line */}
                <path d="M43.5 24.5 Q46.3 28.2 50 28.9 Q53.7 28.2 56.5 24.5" fill="none" stroke={soft} strokeWidth="0.45" strokeLinecap="round" opacity="0.4" />
                {/* collarbone hint just below the neck */}
                <path d="M40 38.5 Q50 41 60 38.5" fill="none" stroke={feature} strokeWidth="0.5" opacity="0.4" />
                {/* fuller, rounder bust with an underbust curve, set into the chest rather than floating on it.
                    Scaled by curveAmt about the sternum point so bust fullness actually differs by body type
                    instead of just scaling uniformly with the rest of the frame. */}
                <g transform={`translate(50,44) scale(${curveAmt}) translate(-50,-44)`}>
                  <path d="M39.5 42 C37 46.5 38 51 43 52.5 C46.5 51.5 48.5 48 49 44.5 C47.5 41.5 43 40.5 39.5 42 Z"
                    fill={skinFill} opacity="0.6" stroke={feature} strokeWidth="0.5" />
                  <path d="M60.5 42 C63 46.5 62 51 57 52.5 C53.5 51.5 51.5 48 51 44.5 C52.5 41.5 57 40.5 60.5 42 Z"
                    fill={skinFill} opacity="0.6" stroke={feature} strokeWidth="0.5" />
                  <path d="M50 41.5 L50 45.5" stroke={feature} strokeWidth="0.4" opacity="0.45" />
                </g>
                {/* waist/hip contour: a soft inner curve whose depth/flare scales with curveAmt, so the
                    three body types read as genuinely different proportions (straighter vs. more
                    hourglass) rather than the same silhouette just resized wider. */}
                <g opacity={0.22 + (curveAmt - 1) * 0.18}>
                  <path d={`M40 46 Q${40 - (curveAmt - 1) * 3.5} 55 41 63`} fill="none" stroke={soft} strokeWidth="0.5" strokeLinecap="round" />
                  <path d={`M60 46 Q${60 + (curveAmt - 1) * 3.5} 55 59 63`} fill="none" stroke={soft} strokeWidth="0.5" strokeLinecap="round" />
                </g>
                {/* navel */}
                <ellipse cx="50" cy="63" rx="0.5" ry="0.7" fill="none" stroke={feature} strokeWidth="0.5" opacity="0.55" />
              </g>
            ) : (
              <g style={{ pointerEvents: "none" }}>
                <path d="M50 36 L50 73" stroke={feature} strokeWidth="0.6" opacity="0.55" strokeDasharray="1.2 2" />
                <path d={`M40 40 Q${46 - (curveAmt - 1) * 3} 46 42 54`} fill="none" stroke={feature} strokeWidth="0.5" opacity="0.5" />
                <path d={`M60 40 Q${54 + (curveAmt - 1) * 3} 46 58 54`} fill="none" stroke={feature} strokeWidth="0.5" opacity="0.5" />
              </g>
            )}
            <g style={{ pointerEvents: "none", filter: "url(#softHair)" }}>{hair.above}</g>
          </g>
        </svg>
        )}
      </div>
      <p className="text-center text-[0.68rem] mt-1.5 italic" style={{ color: COLORS.inkSoft }}>
        {view === "front" ? "Facing you" : "Facing away from you"}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {chips.map((b) => (
          <button key={b.k} onClick={() => toggle(b.k)}
            className="rounded-full px-3.5 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2"
            style={{ background: selected.includes(b.k) ? GRAD : COLORS.pill, color: selected.includes(b.k) ? "#fff" : COLORS.ink }}>
            {b.label}
          </button>
        ))}
        {selected.length > 0 && (
          <button onClick={() => setSelected([])}
            className="rounded-full px-3.5 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2"
            style={{ background: "transparent", border: `1.5px dashed ${COLORS.line}`, color: COLORS.inkSoft }}>
            clear
          </button>
        )}
      </div>
    </div>
  );
}

function MoodFace({ mood, size = 30, color }) {
  const curve = (Math.max(0, Math.min(1, mood)) - 0.5) * 9;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="#FFF9F4" />
      <circle cx="16" cy="16" r="14" fill={color} opacity="0.15" />
      <circle cx="16" cy="16" r="14" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="11.5" cy="12.2" r="1.4" fill={color} />
      <circle cx="20.5" cy="12.2" r="1.4" fill={color} />
      <path d={`M11 ${20.5 - curve / 2} Q16 ${20.5 + curve} 21 ${20.5 - curve / 2}`} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SpoonIcon({ fillLevel, mood = 1, size = 23 }) {
  const path = "M12 1 C16.4 1 19.5 4 19.5 8 C19.5 11.4 17 13.9 14 14.6 L14 20.5 C14 21.9 13.1 23 12 23 C10.9 23 10 21.9 10 20.5 L10 14.6 C7 13.9 4.5 11.4 4.5 8 C4.5 4 7.6 1 12 1 Z";
  return (
    <span className="relative inline-block" style={{ width: size, height: size * 1.05 }}>
      <svg width={size} height={size * 1.05} viewBox="0 0 24 25" className="absolute inset-0" aria-hidden="true">
        <path d={path} fill="#F1D9E1" />
      </svg>
      {fillLevel > 0 && (
        <span className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: `${fillLevel * 100}%` }}>
          <svg width={size} height={size * 1.05} viewBox="0 0 24 25" aria-hidden="true">
            <path d={path} fill="#C9A24B" />
            {fillLevel >= 1 && (
              <g stroke="#571F33" strokeWidth="1.1" strokeLinecap="round" fill="none">
                <circle cx="9.4" cy="7.2" r="0.5" fill="#571F33" stroke="none" />
                <circle cx="14.6" cy="7.2" r="0.5" fill="#571F33" stroke="none" />
                <path d={`M9.6 ${9.9 - ((mood - 0.5) * 3.6) / 2} Q12 ${9.9 + (mood - 0.5) * 3.6} 14.4 ${9.9 - ((mood - 0.5) * 3.6) / 2}`} />
              </g>
            )}
          </svg>
        </span>
      )}
    </span>
  );
}

function SpoonMeter({ label, value, setValue, max = 12 }) {
  const tap = (i) => {
    if (value === i) setValue(i - 0.5);
    else setValue(i);
  };
  return (
    <div className="rounded-2xl p-3.5 mb-2.5" style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}` }}>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[12px] font-semibold" style={{ color: COLORS.inkSoft }}>{label}</p>
        <p className="text-base font-bold" style={{ fontFamily: SERIF, color: value == null ? COLORS.inkSoft : COLORS.ink }}>
          {value == null ? "tap a spoon" : `${value} / ${max}`}
        </p>
      </div>
      <div className="space-y-1.5">
        {[0, 1].map((row) => (
          <div key={row} className="flex items-center justify-center gap-2">
            {Array.from({ length: 6 }, (_, idx) => row * 6 + idx + 1).map((i) => (
              <button key={i} onClick={() => tap(i)} aria-label={`${i} spoons`} className="spoon-btn focus:outline-none focus-visible:ring-2">
                <SpoonIcon size={26} fillLevel={value == null ? 0 : Math.max(0, Math.min(1, value - (i - 1)))} mood={value == null ? 1 : Math.max(0, Math.min(1, value / max))} />
              </button>
            ))}
          </div>
        ))}
      </div>
      {value != null && (
        <button onClick={() => setValue(null)} className="text-[11px] font-semibold mt-2 mx-auto block focus:outline-none focus-visible:ring-2" style={{ color: COLORS.inkSoft }}>
          clear
        </button>
      )}
    </div>
  );
}

function Sprout({ size = 26, color = "#6BA483" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" className="mx-auto mb-2" aria-hidden="true">
      <path d="M13 23 C13 17 13 13 13 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 15 C9.5 14.5 7.2 12 6.5 8.5 C10 9 12.5 11.5 13 15 Z" stroke={color} strokeWidth="1.4" />
      <path d="M13 11 C16.5 10.5 18.8 8 19.5 4.5 C16 5 13.5 7.5 13 11 Z" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

function LittleSun({ size = 26, color = "#D4A63F" }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" className="mx-auto mb-2" aria-hidden="true">
      <circle cx="13" cy="13" r="4.5" stroke={color} strokeWidth="1.6" />
      {rays.map((a) => {
        const rad = (a * Math.PI) / 180;
        return <line key={a} x1={13 + 7 * Math.cos(rad)} y1={13 + 7 * Math.sin(rad)} x2={13 + 10 * Math.cos(rad)} y2={13 + 10 * Math.sin(rad)} stroke={color} strokeWidth="1.5" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function CrescentMoon({ size = 26, color = "#C8354F" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" className="mx-auto mb-2" aria-hidden="true">
      <path d="M16.5 3.5 A10 10 0 1 0 23 14.5 A7.5 7.5 0 0 1 16.5 3.5 Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7.5 6.5 L7.5 9.5 M6 8 L9 8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function Butterfly() {
  return (
    <g>
      <g className="wingL">
        <path d="M-1 -1 C-9 -12 -18 -8 -14 -1 C-17 5 -8 8 -1 2 Z" fill="#D64F84" opacity="0.82" />
        <path d="M-1 1 C-8 6 -13 12 -9 14 C-5 15 -2 9 -1 3 Z" fill="#E689AC" opacity="0.82" />
        <circle cx="-10" cy="-4" r="1.1" fill="#F7EFDC" opacity="0.95" />
        <circle cx="-7" cy="8" r="0.8" fill="#F7EFDC" opacity="0.9" />
      </g>
      <g className="wingR">
        <path d="M1 -1 C9 -12 18 -8 14 -1 C17 5 8 8 1 2 Z" fill="#D64F84" opacity="0.82" />
        <path d="M1 1 C8 6 13 12 9 14 C5 15 2 9 1 3 Z" fill="#E689AC" opacity="0.82" />
        <circle cx="10" cy="-4" r="1.1" fill="#F7EFDC" opacity="0.95" />
        <circle cx="7" cy="8" r="0.8" fill="#F7EFDC" opacity="0.9" />
      </g>
      <path d="M0 -3.5 L0 7" stroke="#A93267" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="0" cy="-4.5" r="1.4" fill="#A93267" />
      <path d="M-0.6 -5.5 C-2 -7.5 -3.5 -8 -4.8 -7.6 M0.6 -5.5 C2 -7.5 3.5 -8 4.8 -7.6" stroke="#A93267" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <circle cx="-4.8" cy="-7.6" r="0.6" fill="#A93267" />
      <circle cx="4.8" cy="-7.6" r="0.6" fill="#A93267" />
    </g>
  );
}

function WhimsyGarden({ entries }) {
  const shown = entries.slice(-21);
  const w = shown.length * 22 + 16;
  return (
    <div style={{ overflowX: "auto" }}>
      <svg width="100%" viewBox={`0 0 ${Math.max(w, 120)} 72`} style={{ maxHeight: 130, minWidth: Math.min(w * 2.2, 340) }} aria-hidden="true">
        <line x1="2" y1="66" x2={Math.max(w, 120) - 2} y2="66" stroke="#E9C7D3" strokeWidth="1.5" strokeLinecap="round" />
        <g transform={`translate(${Math.max(w, 120) - 26} 15) scale(0.7)`}>
          <g className="whimsy-drift">
            <g className="whimsy-float">
              <Butterfly />
            </g>
          </g>
        </g>
        {shown.map((e, i) => {
          const x = i * 22 + 14;
          const h = 24 + Math.max(0, 10 - e.pain) * 1.6;
          const topY = 66 - h;
          const c = e.energy === "green" ? "#6BA483" : e.energy === "yellow" ? "#D4A63F" : "#C8354F";
          return (
            <g key={e.id} className="plant" style={{ animationDelay: `${i * 0.06}s` }}>
              <path d={`M${x} 66 C${x - 1.5} ${66 - h * 0.4} ${x + 1.5} ${66 - h * 0.7} ${x} ${topY}`} stroke="#8AAE95" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              <path d={`M${x} ${66 - h * 0.45} C${x - 5} ${66 - h * 0.5} ${x - 7} ${66 - h * 0.62} ${x - 7.5} ${66 - h * 0.75} C${x - 4} ${66 - h * 0.68} ${x - 1.5} ${66 - h * 0.58} ${x} ${66 - h * 0.45} Z`} stroke="#8AAE95" strokeWidth="1" fill="none" />
              {e.energy === "green" && (
                <path d={`M${x} ${topY + 4} C${x + 4.5} ${topY + 3} ${x + 6.5} ${topY} ${x + 7} ${topY - 3} C${x + 3.5} ${topY - 2} ${x + 1} ${topY + 1} ${x} ${topY + 4} Z`} stroke={c} strokeWidth="1.1" fill="none" />
              )}
              {e.energy === "yellow" && <circle cx={x} cy={topY} r="3.2" fill={c} opacity="0.9" />}
              {e.energy === "red" && (
                <g>
                  {[0, 72, 144, 216, 288].map((a) => {
                    const rad = ((a - 90) * Math.PI) / 180;
                    const px = x + 4.2 * Math.cos(rad);
                    const py = topY + 4.2 * Math.sin(rad);
                    return <ellipse key={a} cx={px} cy={py} rx="2.6" ry="3.4" fill={c} opacity="0.85" transform={`rotate(${a} ${px} ${py})`} />;
                  })}
                  <circle cx={x} cy={topY} r="2" fill="#F7EFDC" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function StatChip({ label, value, color, i = 0 }) {
  return (
    <div className="rounded-2xl py-3 text-center whimsy-pop" style={{ background: "#FFFFFF", border: `1px solid ${COLORS.line}`, boxShadow: "0 2px 8px rgba(87,31,51,0.05)", animationDelay: `${i * 0.07}s` }}>
      <p className="text-2xl font-bold" style={{ color, fontFamily: SERIF }}>{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: COLORS.inkSoft }}>{label}</p>
    </div>
  );
}

function ChipPicker({ label, options, customOptions, selected, setSelected, onAddCustom }) {
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const all = [...options, ...(customOptions || []).filter((c) => !options.includes(c))];
  const toggle = (o) => setSelected(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]);
  return (
    <div className="mb-4">
      <label className={labelCls} style={{ color: COLORS.inkSoft }}>{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {all.map((o) => (
          <button key={o} onClick={() => toggle(o)}
            className="rounded-full px-3 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2"
            style={{
              background: selected.includes(o) ? GRAD : COLORS.pill,
              color: selected.includes(o) ? "#fff" : COLORS.ink,
            }}>
            {o}
          </button>
        ))}
        <button onClick={() => setAdding(!adding)}
          className="rounded-full px-3 py-2 text-xs font-semibold focus:outline-none focus-visible:ring-2"
          style={{ background: "transparent", border: `1.5px dashed ${COLORS.line}`, color: COLORS.plumDark }}>
          + other
        </button>
      </div>
      {adding && (
        <div className="flex gap-2 mt-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="something else..."
            className={inputCls} style={inputStyle} />
          <button onClick={() => { const v = q.trim(); if (!v) return; if (onAddCustom) onAddCustom(v); if (!selected.includes(v)) setSelected([...selected, v]); setQ(""); setAdding(false); }}
            className="rounded-xl px-4 text-sm font-bold text-white shrink-0 focus:outline-none focus-visible:ring-2"
            style={{ background: COLORS.plum }}>
            Add
          </button>
        </div>
      )}
    </div>
  );
}

function Sprig({ size = 36, style }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 40 60" fill="none" style={style} aria-hidden="true">
      <path d="M20 58 C19 42 20 22 21 4" stroke="#D98BA4" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 46 C14 44 9 39 8 33 C14 34 19 39 20 46 Z" stroke="#D98BA4" strokeWidth="1.2" />
      <path d="M20 36 C26 34 31 29 32 23 C26 24 21 29 20 36 Z" stroke="#D98BA4" strokeWidth="1.2" />
      <path d="M20.5 26 C15 24 11 20 10 14 C16 15 20 19 20.5 26 Z" stroke="#D98BA4" strokeWidth="1.2" />
      <path d="M21 16 C26 14 29 10 30 5 C25 6 22 10 21 16 Z" stroke="#D98BA4" strokeWidth="1.2" />
    </svg>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl p-8 text-center" style={{ background: "#FFFFFF", border: "1px dashed #EFC7D4" }}>
      <Sprig size={26} style={{ margin: "0 auto 10px", display: "block" }} />
      <p className="text-sm leading-relaxed" style={{ color: "#9A6478" }}>{text}</p>
    </div>
  );
}

function Field({ label, value, setValue, placeholder }) {
  return (
    <div className="mb-4">
      <label className={labelCls} style={{ color: COLORS.inkSoft }}>{label}</label>
      <input
        type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder}
        className={inputCls} style={inputStyle}
      />
    </div>
  );
}

function TagInput({ label, placeholder, selected, setSelected, options, onAddCustom }) {
  const [q, setQ] = useState("");
  const lower = q.trim().toLowerCase();
  const matches = lower
    ? options.filter((o) => o.toLowerCase().includes(lower) && !selected.some((s) => s.toLowerCase() === o.toLowerCase())).slice(0, 6)
    : [];
  const exact = options.some((o) => o.toLowerCase() === lower);

  const add = (term) => {
    const t = term.trim();
    if (!t) return;
    if (!selected.some((s) => s.toLowerCase() === t.toLowerCase())) {
      setSelected([...selected, t]);
    }
    setQ("");
  };

  const addCustom = () => {
    const t = q.trim();
    if (!t) return;
    if (!exact && onAddCustom) onAddCustom(t);
    add(t);
  };

  return (
    <div className="mb-4">
      <label className={labelCls} style={{ color: COLORS.inkSoft }}>{label}</label>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ background: COLORS.pill, color: COLORS.ink }}>
              {s}
              <button onClick={() => setSelected(selected.filter((x) => x !== s))} aria-label={`Remove ${s}`}
                className="focus:outline-none focus-visible:ring-2" style={{ color: COLORS.inkSoft }}>×</button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (matches.length === 1 && !exact) { add(matches[0]); } else { addCustom(); } } }}
        className={inputCls} style={inputStyle}
      />
      {lower && (
        <div className="mt-1 rounded-xl overflow-hidden relative"
          style={{ border: `1px solid ${COLORS.line}`, background: "#FFFFFF", zIndex: 20, boxShadow: "0 8px 24px rgba(87,31,51,0.12)" }}>
          {matches.map((m) => (
            <button key={m} onClick={() => add(m)}
              className="block w-full text-left px-3.5 py-2.5 text-sm focus:outline-none focus-visible:ring-2"
              style={{ color: COLORS.ink, borderBottom: `1px solid ${COLORS.line}` }}>
              {m}
            </button>
          ))}
          {!exact && (
            <button onClick={addCustom}
              className="block w-full text-left px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2"
              style={{ color: COLORS.plumDark }}>
              + Add "{q.trim()}" to your list
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestInput({ label, placeholder, value, setValue, options, onAddCustom }) {
  const [open, setOpen] = useState(false);
  const lower = value.trim().toLowerCase();
  const matches = lower
    ? options.filter((o) => o.toLowerCase().includes(lower) && o.toLowerCase() !== lower).slice(0, 6)
    : [];
  const exact = options.some((o) => o.toLowerCase() === lower);
  return (
    <div>
      <label className={labelCls} style={{ color: COLORS.inkSoft }}>{label}</label>
      <input
        type="text" value={value} placeholder={placeholder}
        onChange={(e) => { setValue(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={inputCls} style={inputStyle}
      />
      {open && lower && (matches.length > 0 || (!exact && onAddCustom)) && (
        <div className="mt-1 rounded-xl overflow-hidden relative"
          style={{ border: `1px solid ${COLORS.line}`, background: "#FFFFFF", zIndex: 20, boxShadow: "0 8px 24px rgba(87,31,51,0.12)" }}>
          {matches.map((m) => (
            <button key={m} onMouseDown={() => { setValue(m); setOpen(false); }}
              className="block w-full text-left px-3.5 py-2.5 text-sm focus:outline-none focus-visible:ring-2"
              style={{ color: COLORS.ink, borderBottom: `1px solid ${COLORS.line}` }}>
              {m}
            </button>
          ))}
          {!exact && onAddCustom && (
            <button onMouseDown={() => { onAddCustom(value.trim()); setOpen(false); }}
              className="block w-full text-left px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2"
              style={{ color: COLORS.plumDark }}>
              + Save "{value.trim()}" to the list
            </button>
          )}
        </div>
      )}
    </div>
  );
}
