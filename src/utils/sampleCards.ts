import { ContactCard, CategoryConfig } from '../types';

/**
 * Default minimal categories focused on Technology, Finance & Banking, and Legal.
 */
export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    id: 'cat_tech',
    name: 'Technology',
    color: '#0284c7',
    description: 'Software, AI, Cloud Infrastructure & Hardware',
  },
  {
    id: 'cat_finance',
    name: 'Finance & Banking',
    color: '#0f766e',
    description: 'Venture Capital, Private Equity, Commercial Banking & Wealth Management',
  },
  {
    id: 'cat_legal',
    name: 'Legal',
    color: '#b45309',
    description: 'Corporate Law, Intellectual Property, Venture Counsel & Compliance',
  },
];

/**
 * Creates an SVG Data URL representing a high-fidelity business card.
 */
export function generateSampleCardSvg(
  name: string,
  title: string,
  company: string,
  email: string,
  phone: string,
  website: string,
  primaryColor: string = '#1e3a8a',
  secondaryColor: string = '#3b82f6',
  bgColor: string = '#ffffff'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}" stop-opacity="1" />
        <stop offset="100%" stop-color="${secondaryColor}" stop-opacity="1" />
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.15"/>
      </filter>
    </defs>
    
    <!-- Background Card -->
    <rect width="600" height="350" rx="14" fill="${bgColor}" stroke="#e2e8f0" stroke-width="2" filter="url(#shadow)"/>
    
    <!-- Decorative Brand Accent Strip -->
    <path d="M0,0 L18,0 L18,350 L0,350 Z" fill="url(#grad)"/>
    <path d="M480,0 L600,0 L600,120 Z" fill="${secondaryColor}" opacity="0.12"/>
    <circle cx="530" cy="70" r="36" fill="${primaryColor}" opacity="0.15"/>

    <!-- Company Logo Mark -->
    <rect x="52" y="44" width="44" height="44" rx="8" fill="url(#grad)"/>
    <text x="74" y="72" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="bold" text-anchor="middle">
      ${company.slice(0, 1).toUpperCase()}
    </text>

    <!-- Company Name -->
    <text x="110" y="66" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" letter-spacing="0.5">
      ${company.toUpperCase()}
    </text>
    <text x="110" y="84" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" letter-spacing="1.5">
      GLOBAL ENTERPRISE &amp; SOLUTIONS
    </text>

    <line x1="52" y1="120" x2="548" y2="120" stroke="#e2e8f0" stroke-width="1.5"/>

    <!-- Person Full Name -->
    <text x="52" y="166" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800">
      ${name}
    </text>

    <!-- Job Title -->
    <text x="52" y="196" fill="${primaryColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">
      ${title.toUpperCase()}
    </text>

    <!-- Contact Info Section -->
    <g transform="translate(52, 235)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#334155">
      <!-- Email -->
      <circle cx="8" cy="8" r="7" fill="${primaryColor}" opacity="0.2"/>
      <text x="24" y="12" font-weight="500">✉ ${email}</text>
      
      <!-- Phone -->
      <circle cx="8" cy="38" r="7" fill="${primaryColor}" opacity="0.2"/>
      <text x="24" y="42" font-weight="500">☎ ${phone}</text>

      <!-- Website -->
      <circle cx="8" cy="68" r="7" fill="${primaryColor}" opacity="0.2"/>
      <text x="24" y="72" font-weight="500">🌐 ${website}</text>
    </g>

    <!-- Bottom QR / NFC Decorative Stamp -->
    <rect x="496" y="246" width="56" height="56" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <rect x="506" y="256" width="12" height="12" fill="#0f172a"/>
    <rect x="530" y="256" width="12" height="12" fill="#0f172a"/>
    <rect x="506" y="280" width="12" height="12" fill="#0f172a"/>
    <rect x="524" y="274" width="8" height="8" fill="${primaryColor}"/>
    <text x="524" y="318" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8" text-anchor="middle" font-weight="bold">SCAN NFC</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an image representing a multi-card desk photo for batch scanner testing (up to 10 cards).
 */
export function generateMultiCardPhotoDesk(cardCount: number = 4): string {
  const count = Math.min(Math.max(cardCount, 1), 10);
  
  // High-contrast, beautifully styled business card data for desk simulation
  const cardsData = [
    {
      company: 'Apex AI Systems',
      name: 'Elena Rostova',
      title: 'VP of Product Engineering',
      email: 'elena.rostova@apexai.io',
      phone: '+1 (415) 890-2341',
      web: 'https://apexai.io',
      color: '#0284c7',
    },
    {
      company: 'Vance Sterling Capital',
      name: 'Marcus Vance',
      title: 'Managing Director & Partner',
      email: 'm.vance@vancesterling.com',
      phone: '+1 (212) 555-0198',
      web: 'https://vancesterling.com',
      color: '#0f766e',
    },
    {
      company: 'Sterling Reed & Vance',
      name: 'Amira Hassan',
      title: 'Senior Partner, IP Litigation',
      email: 'a.hassan@srvlaw.com',
      phone: '+44 20 7946 0881',
      web: 'https://srvlaw.com',
      color: '#b45309',
    },
    {
      company: 'QuantumLeap Robotics',
      name: 'Hiroshi Tanaka',
      title: 'Chief Technology Officer',
      email: 'h.tanaka@quantumleap.tech',
      phone: '+81 3 5555 0143',
      web: 'https://quantumleap.tech',
      color: '#0369a1',
    },
    {
      company: 'CloudScale Architectures',
      name: 'Sarah Jenkins',
      title: 'Chief Information Officer',
      email: 's.jenkins@cloudscale.net',
      phone: '+1 (206) 555-0149',
      web: 'https://cloudscale.net',
      color: '#4f46e5',
    },
    {
      company: 'Synapse Genomics',
      name: 'Dr. Aris Thorne',
      title: 'Chief Scientific Officer',
      email: 'a.thorne@synapsegen.com',
      phone: '+1 (617) 555-0192',
      web: 'https://synapsegen.com',
      color: '#0d9488',
    },
    {
      company: 'Aethelgard Clean Energy',
      name: 'Clara Oswald',
      title: 'Director of Grid Operations',
      email: 'c.oswald@aethelgard.energy',
      phone: '+44 1632 960812',
      web: 'https://aethelgard.energy',
      color: '#16a34a',
    },
    {
      company: 'Hyperion Space Systems',
      name: 'David Kim',
      title: 'Senior Avionics Engineer',
      email: 'd.kim@hyperionspace.com',
      phone: '+1 (310) 555-0164',
      web: 'https://hyperionspace.com',
      color: '#7c3aed',
    },
    {
      company: 'Emerald Isle FinTech',
      name: 'Liam O\'Connor',
      title: 'Head of Algorithmic Trading',
      email: 'l.oconnor@emeraldfintech.ie',
      phone: '+353 1 496 0199',
      web: 'https://emeraldfintech.ie',
      color: '#059669',
    },
    {
      company: 'Veritas Legal Counsel',
      name: 'Maya Lin',
      title: 'Managing Partner, IP',
      email: 'm.lin@veritasip.com',
      phone: '+1 (202) 555-0187',
      web: 'https://veritasip.com',
      color: '#d97706',
    },
  ];

  // 10 distinct coordinates across an executive desk surface (width 1600, height 1200)
  const cardLayouts = [
    { x: 80, y: 70, rot: -3 },
    { x: 580, y: 80, rot: 2.5 },
    { x: 1080, y: 70, rot: -2 },
    { x: 90, y: 440, rot: 3 },
    { x: 590, y: 450, rot: -1.5 },
    { x: 1090, y: 440, rot: 2 },
    { x: 80, y: 810, rot: -2 },
    { x: 580, y: 820, rot: 3.5 },
    { x: 1080, y: 810, rot: -3 },
    { x: 340, y: 440, rot: 1 },
  ];

  const deskWidth = count > 6 ? 1600 : 1200;
  const deskHeight = count > 6 ? 1200 : 900;

  // Custom positioning tailored for 4, 6, 8, or 10 cards
  let activeLayouts = cardLayouts.slice(0, count);
  if (count === 4) {
    activeLayouts = [
      { x: 90, y: 90, rot: -3 },
      { x: 640, y: 110, rot: 3.5 },
      { x: 110, y: 490, rot: 2 },
      { x: 650, y: 480, rot: -3.5 },
    ];
  } else if (count === 6) {
    activeLayouts = [
      { x: 70, y: 80, rot: -3 },
      { x: 580, y: 90, rot: 2 },
      { x: 1080, y: 80, rot: -2 },
      { x: 80, y: 480, rot: 2.5 },
      { x: 590, y: 470, rot: -3 },
      { x: 1070, y: 485, rot: 3 },
    ];
  }

  const cardSvgElements = activeLayouts.map((pos, idx) => {
    const c = cardsData[idx % cardsData.length];
    return `
    <!-- Card ${idx + 1}: ${c.name} (${c.company}) -->
    <g transform="translate(${pos.x}, ${pos.y}) rotate(${pos.rot})" filter="url(#deskCardShadow)">
      <rect width="450" height="260" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="0" y="0" width="12" height="260" fill="${c.color}"/>
      <circle cx="410" cy="40" r="14" fill="${c.color}" opacity="0.15"/>
      <circle cx="410" cy="40" r="6" fill="${c.color}"/>
      <text x="32" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="bold" fill="#0f172a">${c.company}</text>
      <text x="32" y="104" font-family="system-ui, -apple-system, sans-serif" font-size="21" font-weight="bold" fill="${c.color}">${c.name}</text>
      <text x="32" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#64748b">${c.title}</text>
      <line x1="32" y1="150" x2="415" y2="150" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="32" y="180" font-family="monospace, sans-serif" font-size="12" fill="#334155">✉ ${c.email}</text>
      <text x="32" y="208" font-family="monospace, sans-serif" font-size="12" fill="#334155">☎ ${c.phone}</text>
      <text x="32" y="236" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#0284c7">🌐 ${c.web}</text>
    </g>`;
  }).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${deskWidth}" height="${deskHeight}" viewBox="0 0 ${deskWidth} ${deskHeight}">
    <!-- Desk Wood / Slate Surface Background -->
    <rect width="${deskWidth}" height="${deskHeight}" fill="#1e293b"/>
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1"/>
      </pattern>
      <filter id="deskCardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="6" dy="10" stdDeviation="8" flood-opacity="0.5"/>
      </filter>
    </defs>
    <rect width="${deskWidth}" height="${deskHeight}" fill="url(#grid)" opacity="0.35"/>
    ${cardSvgElements}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Converts an SVG data URL to a genuine JPEG data URL with authentic magic numbers (FF D8 FF)
 * via an off-screen HTML5 Canvas. Falls back to SVG data URL if canvas is not available.
 */
export async function svgToJpegDataUrl(svgDataUrl: string, width = 1400, height = 1000): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return svgDataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timer = setTimeout(() => {
      resolve(svgDataUrl);
    }, 4000);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(svgDataUrl);
          return;
        }

        // Dark executive desk slate background
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height);

        // Draw the SVG onto the canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as authentic JPEG with high fidelity
        const jpegUrl = canvas.toDataURL('image/jpeg', 0.94);
        resolve(jpegUrl);
      } catch (err) {
        console.warn('Canvas rasterization fallback to SVG:', err);
        resolve(svgDataUrl);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(svgDataUrl);
    };

    img.src = svgDataUrl;
  });
}

/**
 * Generates an authentic rasterized JPEG desk photo containing up to 10 distinct business cards.
 */
export async function renderMultiCardDeskToJpeg(cardCount: number = 4): Promise<string> {
  const svg = generateMultiCardPhotoDesk(cardCount);
  const width = cardCount > 6 ? 1600 : 1200;
  const height = cardCount > 6 ? 1200 : 900;
  return svgToJpegDataUrl(svg, width, height);
}

/**
 * 20 Initial Sample Cards:
 * - 10 from Technology
 * - 5 from Finance & Banking
 * - 5 from Legal
 */
export const INITIAL_SAMPLE_CARDS: ContactCard[] = [
  // ==========================================
  // 10 BUSINESS CARDS FROM TECHNOLOGY
  // ==========================================
  {
    id: 'card_tech_1',
    fullName: 'Elena Rostova',
    jobTitle: 'VP of Product Engineering',
    company: 'Apex AI Systems',
    department: 'Autonomous Intelligence',
    email: 'elena.rostova@apexai.io',
    phone: '+1 (415) 890-2341',
    mobilePhone: '+1 (415) 762-9012',
    website: 'https://apexai.io',
    address: {
      street: '450 Mission St, Suite 1800',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'United States',
    },
    social: {
      linkedin: 'https://linkedin.com/in/elena-rostova-apex',
      twitter: 'https://x.com/elena_apexai',
    },
    category: 'Technology',
    tags: ['AI / ML', 'Executive', 'Keynote Speaker', 'TechSummit 2026'],
    notes: 'Met at SF AI Tech Summit 2026. Interested in our enterprise OCR integration API for their field engineering team.',
    cardImage: generateSampleCardSvg(
      'Elena Rostova',
      'VP of Product Engineering',
      'Apex AI Systems',
      'elena.rostova@apexai.io',
      '+1 (415) 890-2341',
      'https://apexai.io',
      '#0284c7',
      '#38bdf8'
    ),
    confidenceScore: 98,
    scannedAt: '2026-08-20T14:22:00.000Z',
    updatedAt: '2026-08-20T14:22:00.000Z',
    isFavorite: true,
    primaryColorHex: '#0284c7',
    crmSyncStatus: {
      HubSpot: {
        synced: true,
        syncedAt: '2026-08-20T14:25:00.000Z',
        remoteId: 'hs_apex_9120',
        provider: 'HubSpot',
      },
      Salesforce: {
        synced: true,
        syncedAt: '2026-08-20T14:25:00.000Z',
        remoteId: 'sf_apex_4412',
        provider: 'Salesforce',
      },
    },
  },
  {
    id: 'card_tech_2',
    fullName: 'Hiroshi Tanaka',
    jobTitle: 'Chief Technology Officer',
    company: 'QuantumLeap Robotics',
    department: 'Autonomous Navigation',
    email: 'h.tanaka@quantumleap.tech',
    phone: '+81 3 5555 0143',
    website: 'https://quantumleap.tech',
    address: {
      street: 'Roppongi Hills Mori Tower 28F',
      city: 'Minato City',
      state: 'Tokyo',
      zip: '106-6108',
      country: 'Japan',
    },
    social: {
      linkedin: 'https://linkedin.com/in/hiroshi-tanaka-quantum',
    },
    category: 'Technology',
    tags: ['Robotics', 'CTO', 'Hardware', 'Tokyo'],
    notes: 'Pioneering LiDAR navigation sensors for warehouse AMR fleets. Scheduled a virtual demo for September.',
    cardImage: generateSampleCardSvg(
      'Hiroshi Tanaka',
      'Chief Technology Officer',
      'QuantumLeap Robotics',
      'h.tanaka@quantumleap.tech',
      '+81 3 5555 0143',
      'https://quantumleap.tech',
      '#0369a1',
      '#0ea5e9'
    ),
    confidenceScore: 97,
    scannedAt: '2026-08-19T11:05:00.000Z',
    updatedAt: '2026-08-19T11:05:00.000Z',
    isFavorite: false,
    primaryColorHex: '#0369a1',
    crmSyncStatus: {
      HubSpot: {
        synced: true,
        syncedAt: '2026-08-19T11:10:00.000Z',
        remoteId: 'hs_quantum_102',
        provider: 'HubSpot',
      },
    },
  },
  {
    id: 'card_tech_3',
    fullName: 'Chloe Dupont',
    jobTitle: 'Principal Cloud Architect',
    company: 'Nexus Scale Cloud',
    department: 'Distributed Systems',
    email: 'chloe.dupont@nexuscloud.io',
    phone: '+33 1 42 68 55 00',
    website: 'https://nexuscloud.io',
    address: {
      street: '14 Rue de la Paix',
      city: 'Paris',
      state: 'Île-de-France',
      zip: '75002',
      country: 'France',
    },
    social: {
      linkedin: 'https://linkedin.com/in/chloedupont-cloud',
      twitter: 'https://x.com/chloe_cloudarch',
    },
    category: 'Technology',
    tags: ['Cloud', 'Kubernetes', 'Multi-Region', 'Paris'],
    notes: 'Expert in Kubernetes multi-cluster failover and low-latency edge caching.',
    cardImage: generateSampleCardSvg(
      'Chloe Dupont',
      'Principal Cloud Architect',
      'Nexus Scale Cloud',
      'chloe.dupont@nexuscloud.io',
      '+33 1 42 68 55 00',
      'https://nexuscloud.io',
      '#0284c7',
      '#38bdf8'
    ),
    confidenceScore: 99,
    scannedAt: '2026-08-18T16:40:00.000Z',
    updatedAt: '2026-08-18T16:40:00.000Z',
    isFavorite: false,
    primaryColorHex: '#0284c7',
    crmSyncStatus: {
      Salesforce: {
        synced: true,
        syncedAt: '2026-08-18T16:42:00.000Z',
        remoteId: 'sf_nexus_998',
        provider: 'Salesforce',
      },
    },
  },
  {
    id: 'card_tech_4',
    fullName: 'Liam O\'Connor',
    jobTitle: 'Head of Security Research',
    company: 'CipherGate Cyber',
    department: 'Zero-Trust Architecture',
    email: 'liam.oconnor@ciphergate.com',
    phone: '+353 1 496 0122',
    website: 'https://ciphergate.com',
    address: {
      street: 'Grand Canal Dock, Silicon Docks',
      city: 'Dublin',
      state: 'Leinster',
      zip: 'D02 X260',
      country: 'Ireland',
    },
    social: {
      linkedin: 'https://linkedin.com/in/liam-oconnor-sec',
    },
    category: 'Technology',
    tags: ['Cybersecurity', 'Zero-Trust', 'Enterprise', 'Dublin'],
    notes: 'Collaborating on automated vulnerability triage and token authentication compliance.',
    cardImage: generateSampleCardSvg(
      'Liam O\'Connor',
      'Head of Security Research',
      'CipherGate Cyber',
      'liam.oconnor@ciphergate.com',
      '+353 1 496 0122',
      'https://ciphergate.com',
      '#0f766e',
      '#06b6d4'
    ),
    confidenceScore: 96,
    scannedAt: '2026-08-17T13:20:00.000Z',
    updatedAt: '2026-08-17T13:20:00.000Z',
    isFavorite: true,
    primaryColorHex: '#0f766e',
    crmSyncStatus: {},
  },
  {
    id: 'card_tech_5',
    fullName: 'Aarav Mehta',
    jobTitle: 'VP of Artificial Intelligence',
    company: 'NeuralSphere Labs',
    department: 'Foundation Models',
    email: 'aarav.mehta@neuralsphere.ai',
    phone: '+1 (512) 670-8841',
    website: 'https://neuralsphere.ai',
    address: {
      street: '100 Congress Ave, Suite 2100',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'United States',
    },
    social: {
      linkedin: 'https://linkedin.com/in/aarav-mehta-ai',
      twitter: 'https://x.com/aarav_neural',
    },
    category: 'Technology',
    tags: ['GenAI', 'LLM', 'Austin', 'Research'],
    notes: 'Key author of multimodal distillation paper at NeurIPS. Interested in lightweight on-device OCR models.',
    cardImage: generateSampleCardSvg(
      'Aarav Mehta',
      'VP of Artificial Intelligence',
      'NeuralSphere Labs',
      'aarav.mehta@neuralsphere.ai',
      '+1 (512) 670-8841',
      'https://neuralsphere.ai',
      '#2563eb',
      '#60a5fa'
    ),
    confidenceScore: 98,
    scannedAt: '2026-08-16T15:10:00.000Z',
    updatedAt: '2026-08-16T15:10:00.000Z',
    isFavorite: false,
    primaryColorHex: '#2563eb',
    crmSyncStatus: {},
  },
  {
    id: 'card_tech_6',
    fullName: 'Sarah Jenkins',
    jobTitle: 'Director of Developer Relations',
    company: 'DevStream Engine',
    department: 'Platform Ecosystem',
    email: 'sarah.jenkins@devstream.dev',
    phone: '+1 (303) 555-8910',
    website: 'https://devstream.dev',
    address: {
      street: '1600 Wynkoop St',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      country: 'United States',
    },
    social: {
      linkedin: 'https://linkedin.com/in/sarahjenkins-devrel',
      twitter: 'https://x.com/sarahcodes',
    },
    category: 'Technology',
    tags: ['DevRel', 'API', 'Developer Experience', 'Denver'],
    notes: 'Invited our engineering team to present a virtual workshop on client-side OCR parsing.',
    cardImage: generateSampleCardSvg(
      'Sarah Jenkins',
      'Director of Developer Relations',
      'DevStream Engine',
      'sarah.jenkins@devstream.dev',
      '+1 (303) 555-8910',
      'https://devstream.dev',
      '#0284c7',
      '#38bdf8'
    ),
    confidenceScore: 95,
    scannedAt: '2026-08-15T10:45:00.000Z',
    updatedAt: '2026-08-15T10:45:00.000Z',
    isFavorite: false,
    primaryColorHex: '#0284c7',
    crmSyncStatus: {},
  },
  {
    id: 'card_tech_7',
    fullName: 'Viktor Lindqvist',
    jobTitle: 'Chief Software Architect',
    company: 'PolarGrid Networks',
    department: 'Infrastructure Systems',
    email: 'viktor.l@polargrid.se',
    phone: '+46 8 123 4567',
    website: 'https://polargrid.se',
    address: {
      street: 'Kungsgatan 44',
      city: 'Stockholm',
      state: 'Stockholm County',
      zip: '111 35',
      country: 'Sweden',
    },
    social: {
      linkedin: 'https://linkedin.com/in/viktor-lindqvist-polargrid',
    },
    category: 'Technology',
    tags: ['Nordics', 'High-Throughput', 'Telecom', 'Architecture'],
    notes: 'Designing 100Gbps telemetry ingestion pipelines for Scandinavian telecommunications grids.',
    cardImage: generateSampleCardSvg(
      'Viktor Lindqvist',
      'Chief Software Architect',
      'PolarGrid Networks',
      'viktor.l@polargrid.se',
      '+46 8 123 4567',
      'https://polargrid.se',
      '#0369a1',
      '#38bdf8'
    ),
    confidenceScore: 99,
    scannedAt: '2026-08-14T09:30:00.000Z',
    updatedAt: '2026-08-14T09:30:00.000Z',
    isFavorite: true,
    primaryColorHex: '#0369a1',
    crmSyncStatus: {},
  },
  {
    id: 'card_tech_8',
    fullName: 'Maya Lin',
    jobTitle: 'Senior Staff Engineer & Tech Lead',
    company: 'DataMesh Analytics',
    department: 'Real-Time Pipelines',
    email: 'maya.lin@datamesh.com',
    phone: '+1 (212) 555-4321',
    website: 'https://datamesh.com',
    address: {
      street: '111 8th Avenue, 14th Floor',
      city: 'New York',
      state: 'NY',
      zip: '10011',
      country: 'United States',
    },
    social: {
      linkedin: 'https://linkedin.com/in/mayalin-datamesh',
      twitter: 'https://x.com/mayalintech',
    },
    category: 'Technology',
    tags: ['BigData', 'Kafka', 'New York', 'Streaming'],
    notes: 'Discussed Apache Flink streaming integrations and CRM event bus webhooks.',
    cardImage: generateSampleCardSvg(
      'Maya Lin',
      'Senior Staff Engineer & Tech Lead',
      'DataMesh Analytics',
      'maya.lin@datamesh.com',
      '+1 (212) 555-4321',
      'https://datamesh.com',
      '#0284c7',
      '#60a5fa'
    ),
    confidenceScore: 97,
    scannedAt: '2026-08-13T14:15:00.000Z',
    updatedAt: '2026-08-13T14:15:00.000Z',
    isFavorite: false,
    primaryColorHex: '#0284c7',
    crmSyncStatus: {},
  },
  {
    id: 'card_tech_9',
    fullName: 'Dr. Dmitri Volkov',
    jobTitle: 'Founder & CEO',
    company: 'Hyperion Quantum Computing',
    department: 'Executive Office',
    email: 'dmitri.volkov@hyperionquantum.ch',
    phone: '+41 44 632 11 00',
    website: 'https://hyperionquantum.ch',
    address: {
      street: 'Technoparkstrasse 1',
      city: 'Zurich',
      state: 'Zurich',
      zip: '8005',
      country: 'Switzerland',
    },
    social: {
      linkedin: 'https://linkedin.com/in/dmitri-volkov-quantum',
    },
    category: 'Technology',
    tags: ['Quantum', 'Founder', 'DeepTech', 'Zurich'],
    notes: 'Developing topological qubit error-mitigation processors. Raised $45M Series A.',
    cardImage: generateSampleCardSvg(
      'Dr. Dmitri Volkov',
      'Founder & CEO',
      'Hyperion Quantum Computing',
      'dmitri.volkov@hyperionquantum.ch',
      '+41 44 632 11 00',
      'https://hyperionquantum.ch',
      '#1e40af',
      '#3b82f6'
    ),
    confidenceScore: 98,
    scannedAt: '2026-08-12T17:00:00.000Z',
    updatedAt: '2026-08-12T17:00:00.000Z',
    isFavorite: true,
    primaryColorHex: '#1e40af',
    crmSyncStatus: {},
  },
  {
    id: 'card_tech_10',
    fullName: 'Tariq Al-Mansoor',
    jobTitle: 'Head of Platform Infrastructure',
    company: 'OrbitCloud Global',
    department: 'Edge Operations',
    email: 't.almansoor@orbitcloud.ae',
    phone: '+971 4 362 7700',
    website: 'https://orbitcloud.ae',
    address: {
      street: 'Dubai Internet City, Building 3',
      city: 'Dubai',
      state: 'Dubai',
      zip: 'PO Box 500001',
      country: 'United Arab Emirates',
    },
    social: {
      linkedin: 'https://linkedin.com/in/tariq-almansoor',
    },
    category: 'Technology',
    tags: ['Cloud', 'MENA', 'Edge Computing', 'Infrastructure'],
    notes: 'Overseeing sovereign cloud datacenters in GCC region. Inquired about enterprise licensing.',
    cardImage: generateSampleCardSvg(
      'Tariq Al-Mansoor',
      'Head of Platform Infrastructure',
      'OrbitCloud Global',
      't.almansoor@orbitcloud.ae',
      '+971 4 362 7700',
      'https://orbitcloud.ae',
      '#0284c7',
      '#0284c7'
    ),
    confidenceScore: 96,
    scannedAt: '2026-08-11T12:30:00.000Z',
    updatedAt: '2026-08-11T12:30:00.000Z',
    isFavorite: false,
    primaryColorHex: '#0284c7',
    crmSyncStatus: {},
  },

  // ==========================================
  // 5 PEOPLE FROM FINANCE & BANKING
  // ==========================================
  {
    id: 'card_fin_1',
    fullName: 'Marcus Vance',
    jobTitle: 'Managing Director & Partner',
    company: 'Vance Sterling Capital',
    department: 'Growth Venture Fund',
    email: 'm.vance@vancesterling.com',
    phone: '+1 (212) 555-0198',
    website: 'https://vancesterling.com',
    address: {
      street: '767 Fifth Avenue, 34th Floor',
      city: 'New York',
      state: 'NY',
      zip: '10153',
      country: 'United States',
    },
    social: {
      linkedin: 'https://linkedin.com/in/marcus-vance-capital',
      twitter: 'https://x.com/marcusvance',
    },
    category: 'Finance & Banking',
    tags: ['Investor', 'Series B', 'VIP', 'New York'],
    notes: 'Requested our 2026 Q3 revenue projection deck and enterprise customer retention metrics.',
    cardImage: generateSampleCardSvg(
      'Marcus Vance',
      'Managing Director & Partner',
      'Vance Sterling Capital',
      'm.vance@vancesterling.com',
      '+1 (212) 555-0198',
      'https://vancesterling.com',
      '#0f766e',
      '#14b8a6'
    ),
    confidenceScore: 96,
    scannedAt: '2026-08-21T09:15:00.000Z',
    updatedAt: '2026-08-21T09:15:00.000Z',
    isFavorite: true,
    primaryColorHex: '#0f766e',
    crmSyncStatus: {
      HubSpot: {
        synced: true,
        syncedAt: '2026-08-21T09:20:00.000Z',
        remoteId: 'hs_vance_8801',
        provider: 'HubSpot',
      },
    },
  },
  {
    id: 'card_fin_2',
    fullName: 'Kavita Krishnan',
    jobTitle: 'Senior Vice President, M&A',
    company: 'Horizon Global Bank',
    department: 'Cross-Border Investment Banking',
    email: 'k.krishnan@horizonglobal.com',
    phone: '+65 6789 0123',
    website: 'https://horizonglobal.com',
    address: {
      street: '10 Marina Boulevard, Marina Bay Financial Centre',
      city: 'Singapore',
      state: 'Singapore',
      zip: '018983',
      country: 'Singapore',
    },
    social: {
      linkedin: 'https://linkedin.com/in/kavitakrishnan-m-and-a',
    },
    category: 'Finance & Banking',
    tags: ['Investment Banking', 'APAC', 'M&A', 'Singapore'],
    notes: 'Specializes in Southeast Asia cross-border technology acquisitions and joint ventures.',
    cardImage: generateSampleCardSvg(
      'Kavita Krishnan',
      'Senior Vice President, M&A',
      'Horizon Global Bank',
      'k.krishnan@horizonglobal.com',
      '+65 6789 0123',
      'https://horizonglobal.com',
      '#0f766e',
      '#2dd4bf'
    ),
    confidenceScore: 98,
    scannedAt: '2026-08-20T08:45:00.000Z',
    updatedAt: '2026-08-20T08:45:00.000Z',
    isFavorite: false,
    primaryColorHex: '#0f766e',
    crmSyncStatus: {
      Salesforce: {
        synced: true,
        syncedAt: '2026-08-20T08:50:00.000Z',
        remoteId: 'sf_horizon_552',
        provider: 'Salesforce',
      },
    },
  },
  {
    id: 'card_fin_3',
    fullName: 'Julian Thorne',
    jobTitle: 'Chief Investment Officer',
    company: 'Thorne & Blackwell Wealth',
    department: 'Private Family Office',
    email: 'julian.thorne@thorneblackwell.ch',
    phone: '+41 22 819 0000',
    website: 'https://thorneblackwell.ch',
    address: {
      street: 'Rue du Rhône 42',
      city: 'Geneva',
      state: 'Geneva',
      zip: '1204',
      country: 'Switzerland',
    },
    social: {
      linkedin: 'https://linkedin.com/in/julian-thorne-wealth',
    },
    category: 'Finance & Banking',
    tags: ['Private Wealth', 'Family Office', 'Geneva', 'ESG'],
    notes: 'Managing $1.8B AUM in diversified global sustainable equities and private debt.',
    cardImage: generateSampleCardSvg(
      'Julian Thorne',
      'Chief Investment Officer',
      'Thorne & Blackwell Wealth',
      'julian.thorne@thorneblackwell.ch',
      '+41 22 819 0000',
      'https://thorneblackwell.ch',
      '#0f766e',
      '#14b8a6'
    ),
    confidenceScore: 99,
    scannedAt: '2026-08-19T14:10:00.000Z',
    updatedAt: '2026-08-19T14:10:00.000Z',
    isFavorite: true,
    primaryColorHex: '#0f766e',
    crmSyncStatus: {},
  },
  {
    id: 'card_fin_4',
    fullName: 'Camilla Rossi',
    jobTitle: 'Head of FinTech Ventures',
    company: 'Aurelia Private Equity',
    department: 'Direct Investments',
    email: 'c.rossi@aureliape.com',
    phone: '+39 02 8899 4433',
    website: 'https://aureliape.com',
    address: {
      street: 'Via Montenapoleone 8',
      city: 'Milan',
      state: 'Lombardy',
      zip: '20121',
      country: 'Italy',
    },
    social: {
      linkedin: 'https://linkedin.com/in/camillarossi-fintech',
      twitter: 'https://x.com/camillarossi_pe',
    },
    category: 'Finance & Banking',
    tags: ['Fintech', 'Private Equity', 'Milan', 'B2B SaaS'],
    notes: 'Lead investor in European payment orchestration and open banking APIs.',
    cardImage: generateSampleCardSvg(
      'Camilla Rossi',
      'Head of FinTech Ventures',
      'Aurelia Private Equity',
      'c.rossi@aureliape.com',
      '+39 02 8899 4433',
      'https://aureliape.com',
      '#0d9488',
      '#5eead4'
    ),
    confidenceScore: 97,
    scannedAt: '2026-08-18T11:25:00.000Z',
    updatedAt: '2026-08-18T11:25:00.000Z',
    isFavorite: false,
    primaryColorHex: '#0d9488',
    crmSyncStatus: {},
  },
  {
    id: 'card_fin_5',
    fullName: 'Robert Chen',
    jobTitle: 'Managing Director, Quantitative Trading',
    company: 'Pacific Crest Securities',
    department: 'Algorithmic Execution',
    email: 'robert.chen@pacificcrestsec.com',
    phone: '+852 2840 9900',
    website: 'https://pacificcrestsec.com',
    address: {
      street: 'Two International Finance Centre, 88 Queensway',
      city: 'Hong Kong',
      state: 'Hong Kong SAR',
      zip: '999077',
      country: 'Hong Kong',
    },
    social: {
      linkedin: 'https://linkedin.com/in/robert-chen-quant',
    },
    category: 'Finance & Banking',
    tags: ['Quant', 'High-Frequency', 'Hong Kong', 'Equities'],
    notes: 'Looking for fast OCR data parsing for physical trading tickets and investor counterparty cards.',
    cardImage: generateSampleCardSvg(
      'Robert Chen',
      'Managing Director, Quantitative Trading',
      'Pacific Crest Securities',
      'robert.chen@pacificcrestsec.com',
      '+852 2840 9900',
      'https://pacificcrestsec.com',
      '#0f766e',
      '#0d9488'
    ),
    confidenceScore: 96,
    scannedAt: '2026-08-17T09:50:00.000Z',
    updatedAt: '2026-08-17T09:50:00.000Z',
    isFavorite: true,
    primaryColorHex: '#0f766e',
    crmSyncStatus: {},
  },

  // ==========================================
  // 5 PEOPLE FROM LEGAL
  // ==========================================
  {
    id: 'card_legal_1',
    fullName: 'Amira Hassan',
    jobTitle: 'Senior Partner, Intellectual Property',
    company: 'Sterling, Reed & Vance LLP',
    department: 'Global Patent Litigation',
    email: 'a.hassan@srvlaw.com',
    phone: '+44 20 7946 0881',
    website: 'https://srvlaw.com',
    address: {
      street: '1 Chancery Lane',
      city: 'London',
      state: 'Greater London',
      zip: 'WC2A 1LF',
      country: 'United Kingdom',
    },
    social: {
      linkedin: 'https://linkedin.com/in/amirahassan-iplaw',
    },
    category: 'Legal',
    tags: ['Patent Litigation', 'IP Law', 'London', 'Partner'],
    notes: 'Advising on cross-border patent protection and trade secret protection for computer vision pipelines.',
    cardImage: generateSampleCardSvg(
      'Amira Hassan',
      'Senior Partner, Intellectual Property',
      'Sterling, Reed & Vance LLP',
      'a.hassan@srvlaw.com',
      '+44 20 7946 0881',
      'https://srvlaw.com',
      '#b45309',
      '#d97706'
    ),
    confidenceScore: 98,
    scannedAt: '2026-08-21T16:00:00.000Z',
    updatedAt: '2026-08-21T16:00:00.000Z',
    isFavorite: true,
    primaryColorHex: '#b45309',
    crmSyncStatus: {
      HubSpot: {
        synced: true,
        syncedAt: '2026-08-21T16:05:00.000Z',
        remoteId: 'hs_legal_771',
        provider: 'HubSpot',
      },
    },
  },
  {
    id: 'card_legal_2',
    fullName: 'Benjamin Ross',
    jobTitle: 'General Counsel & Compliance Officer',
    company: 'Apex Global Advisory',
    department: 'Legal & Regulatory Affairs',
    email: 'b.ross@apexregulatory.com',
    phone: '+1 (312) 555-7820',
    website: 'https://apexregulatory.com',
    address: {
      street: '233 S Wacker Dr, Suite 5200',
      city: 'Chicago',
      state: 'IL',
      zip: '60606',
      country: 'United States',
    },
    social: {
      linkedin: 'https://linkedin.com/in/benjamin-ross-gc',
    },
    category: 'Legal',
    tags: ['General Counsel', 'Compliance', 'SEC', 'Chicago'],
    notes: 'Reviewed our client privacy mode and on-device data vault architecture.',
    cardImage: generateSampleCardSvg(
      'Benjamin Ross',
      'General Counsel & Compliance Officer',
      'Apex Global Advisory',
      'b.ross@apexregulatory.com',
      '+1 (312) 555-7820',
      'https://apexregulatory.com',
      '#b45309',
      '#f59e0b'
    ),
    confidenceScore: 97,
    scannedAt: '2026-08-20T10:15:00.000Z',
    updatedAt: '2026-08-20T10:15:00.000Z',
    isFavorite: false,
    primaryColorHex: '#b45309',
    crmSyncStatus: {},
  },
  {
    id: 'card_legal_3',
    fullName: 'Victoria Sterling',
    jobTitle: 'Managing Partner, Tech M&A',
    company: 'Sterling Law Partners',
    department: 'Emerging Companies & Venture Capital',
    email: 'v.sterling@sterlinglaw.com',
    phone: '+1 (650) 494-3320',
    website: 'https://sterlinglaw.com',
    address: {
      street: '2 Palo Alto Square, Suite 400',
      city: 'Palo Alto',
      state: 'CA',
      zip: '94306',
      country: 'United States',
    },
    social: {
      linkedin: 'https://linkedin.com/in/victoriasterling-law',
      twitter: 'https://x.com/vsterlinglaw',
    },
    category: 'Legal',
    tags: ['Venture Counsel', 'Series B', 'Silicon Valley', 'M&A'],
    notes: 'Represented 35+ tech startups in Series A/B rounds and term sheet negotiations.',
    cardImage: generateSampleCardSvg(
      'Victoria Sterling',
      'Managing Partner, Tech M&A',
      'Sterling Law Partners',
      'v.sterling@sterlinglaw.com',
      '+1 (650) 494-3320',
      'https://sterlinglaw.com',
      '#92400e',
      '#d97706'
    ),
    confidenceScore: 99,
    scannedAt: '2026-08-19T13:45:00.000Z',
    updatedAt: '2026-08-19T13:45:00.000Z',
    isFavorite: true,
    primaryColorHex: '#92400e',
    crmSyncStatus: {
      Salesforce: {
        synced: true,
        syncedAt: '2026-08-19T13:50:00.000Z',
        remoteId: 'sf_legal_4021',
        provider: 'Salesforce',
      },
    },
  },
  {
    id: 'card_legal_4',
    fullName: 'Carlos Mendoza',
    jobTitle: 'Principal Attorney, Corporate Governance',
    company: 'Mendoza Legal Group',
    department: 'Corporate & Cross-Border Deals',
    email: 'carlos@mendozalegal.com',
    phone: '+1 (512) 472-8800',
    website: 'https://mendozalegal.com',
    address: {
      street: '500 W 2nd St, 19th Floor',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'United States',
    },
    social: {
      linkedin: 'https://linkedin.com/in/carlosmendoza-legal',
    },
    category: 'Legal',
    tags: ['Corporate Law', 'Governance', 'Contracts', 'Austin'],
    notes: 'Drafting standard Master Service Agreements and vendor data processing annexes.',
    cardImage: generateSampleCardSvg(
      'Carlos Mendoza',
      'Principal Attorney, Corporate Governance',
      'Mendoza Legal Group',
      'carlos@mendozalegal.com',
      '+1 (512) 472-8800',
      'https://mendozalegal.com',
      '#b45309',
      '#b45309'
    ),
    confidenceScore: 95,
    scannedAt: '2026-08-18T15:30:00.000Z',
    updatedAt: '2026-08-18T15:30:00.000Z',
    isFavorite: false,
    primaryColorHex: '#b45309',
    crmSyncStatus: {},
  },
  {
    id: 'card_legal_5',
    fullName: 'Rachel Kim',
    jobTitle: 'Chief Privacy Officer & Regulatory Counsel',
    company: 'Global Lex Counsel',
    department: 'Data Privacy & AI Governance',
    email: 'rachel.kim@globallex.org',
    phone: '+1 (202) 555-0164',
    website: 'https://globallex.org',
    address: {
      street: '1201 Pennsylvania Ave NW, Suite 600',
      city: 'Washington',
      state: 'DC',
      zip: '20004',
      country: 'United States',
    },
    social: {
      linkedin: 'https://linkedin.com/in/rachelkim-privacy',
      twitter: 'https://x.com/rachelk_privacy',
    },
    category: 'Legal',
    tags: ['GDPR', 'AI Act', 'Privacy Officer', 'Washington DC'],
    notes: 'Subject matter expert on EU AI Act compliance and biometric data extraction exemptions.',
    cardImage: generateSampleCardSvg(
      'Rachel Kim',
      'Chief Privacy Officer & Regulatory Counsel',
      'Global Lex Counsel',
      'rachel.kim@globallex.org',
      '+1 (202) 555-0164',
      'https://globallex.org',
      '#b45309',
      '#d97706'
    ),
    confidenceScore: 97,
    scannedAt: '2026-08-17T11:15:00.000Z',
    updatedAt: '2026-08-17T11:15:00.000Z',
    isFavorite: true,
    primaryColorHex: '#b45309',
    crmSyncStatus: {},
  },
];
