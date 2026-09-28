import { Vendor, ProductCategory, Product } from '@unified-commerce/types';

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'Aether Labs',
    slug: 'aether-labs',
    tagline: 'Neural Interfaces & Cybernetic Wearables',
    description: 'Pioneering sensory augmentation devices, cybernetic apparel, and lightweight titanium neural bands designed in Tokyo.',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    rating: 4.94,
    reviewCount: 1420,
    totalProducts: 14,
    commissionRate: 0.08,
    isVerified: true,
    kycStatus: 'VERIFIED',
    location: 'Tokyo, Japan',
    badge: 'Top Seller',
    metrics: { gmv: 842000, completionRate: 99.4, avgDeliveryDays: 2.1 }
  },
  {
    id: 'vendor-2',
    name: 'SonicForge Acoustics',
    slug: 'sonicforge',
    tagline: 'Planar Magnetic Precision & Audiophile Engineering',
    description: 'Handcrafted planar-magnetic headphones and zero-noise vacuum tube DAC amplifiers machined from aerospace-grade aluminum.',
    logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    rating: 4.97,
    reviewCount: 980,
    totalProducts: 9,
    commissionRate: 0.075,
    isVerified: true,
    kycStatus: 'VERIFIED',
    location: 'Stockholm, Sweden',
    badge: 'Top Seller',
    metrics: { gmv: 630000, completionRate: 99.8, avgDeliveryDays: 2.8 }
  },
  {
    id: 'vendor-3',
    name: 'Vortex Dynamics',
    slug: 'vortex-dynamics',
    tagline: 'Autonomous AI Drones & LiDAR Survey Systems',
    description: 'Ultra-lightweight obstacle-avoidance carbon fiber drones with cinematic gimbal stabilization and real-time mesh networking.',
    logo: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&auto=format&fit=crop&q=80',
    rating: 4.89,
    reviewCount: 760,
    totalProducts: 8,
    commissionRate: 0.08,
    isVerified: true,
    kycStatus: 'VERIFIED',
    location: 'Zurich, Switzerland',
    badge: 'Verified Maker',
    metrics: { gmv: 920000, completionRate: 98.7, avgDeliveryDays: 3.2 }
  },
  {
    id: 'vendor-4',
    name: 'Komorebi Living',
    slug: 'komorebi-living',
    tagline: 'Smart Biophilic Home & Ambient Luminaires',
    description: 'Harmonious fusion of natural sustainable bamboo, matte basalt, and circadian smart lighting control algorithms.',
    logo: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    rating: 4.91,
    reviewCount: 1140,
    totalProducts: 12,
    commissionRate: 0.07,
    isVerified: true,
    kycStatus: 'VERIFIED',
    location: 'Kyoto, Japan',
    badge: 'Eco Innovator',
    metrics: { gmv: 510000, completionRate: 99.1, avgDeliveryDays: 2.5 }
  },
  {
    id: 'vendor-5',
    name: 'Chronos Kinetic',
    slug: 'chronos-kinetic',
    tagline: 'Biomechanical Titanium Chronographs & Smart Rings',
    description: 'Surgical titanium smart rings with medical-grade photoplethysmography and mechanical open-heart balance wheels.',
    logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80',
    rating: 4.96,
    reviewCount: 650,
    totalProducts: 7,
    commissionRate: 0.085,
    isVerified: true,
    kycStatus: 'VERIFIED',
    location: 'Geneva, Switzerland',
    badge: 'Top Seller',
    metrics: { gmv: 780000, completionRate: 99.6, avgDeliveryDays: 2.0 }
  },
  {
    id: 'vendor-6',
    name: 'OmniVision Spatial',
    slug: 'omnivision-spatial',
    tagline: 'Micro-OLED Spatial Glasses & Holographic Desktops',
    description: 'Featherlight 4K dual micro-OLED augmented reality displays engineered for 8-hour continuous spatial productivity.',
    logo: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1200&auto=format&fit=crop&q=80',
    rating: 4.88,
    reviewCount: 890,
    totalProducts: 6,
    commissionRate: 0.09,
    isVerified: true,
    kycStatus: 'VERIFIED',
    location: 'San Francisco, USA',
    badge: 'Rising Star',
    metrics: { gmv: 610000, completionRate: 97.9, avgDeliveryDays: 2.3 }
  },
  {
    id: 'vendor-7',
    name: 'NeoPulse Athletics',
    slug: 'neopulse-athletics',
    tagline: 'EMS Activewear & Biometric Training Garments',
    description: 'Embedded electro-muscle stimulation dry-electrode compression wear synced with neural telemetry apps.',
    logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&auto=format&fit=crop&q=80',
    rating: 4.85,
    reviewCount: 520,
    totalProducts: 9,
    commissionRate: 0.07,
    isVerified: true,
    kycStatus: 'VERIFIED',
    location: 'Austin, USA',
    badge: 'Verified Maker',
    metrics: { gmv: 340000, completionRate: 98.4, avgDeliveryDays: 2.4 }
  },
  {
    id: 'vendor-8',
    name: 'AeroCraft Lab',
    slug: 'aerocraft-lab',
    tagline: 'Hyper-Carbon Micro-Mobility & Mag-Lev Boards',
    description: 'Monocoque unibody electric surf and skate boards powered by solid-state lithium cells and silent hub motors.',
    logo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=1200&auto=format&fit=crop&q=80',
    rating: 4.92,
    reviewCount: 410,
    totalProducts: 5,
    commissionRate: 0.08,
    isVerified: true,
    kycStatus: 'VERIFIED',
    location: 'Berlin, Germany',
    badge: 'Rising Star',
    metrics: { gmv: 420000, completionRate: 98.9, avgDeliveryDays: 3.5 }
  },
  {
    id: 'vendor-9',
    name: 'Quantum Soundworks',
    slug: 'quantum-soundworks',
    tagline: 'High-Res Vacuum Tube Amplifiers & Studio Monoliths',
    description: 'Analog purity merged with 32-bit 768kHz DSD decoding and toroidal copper power supplies.',
    logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewCount: 830,
    totalProducts: 8,
    commissionRate: 0.075,
    isVerified: true,
    kycStatus: 'VERIFIED',
    location: 'London, UK',
    badge: 'Top Seller',
    metrics: { gmv: 690000, completionRate: 99.5, avgDeliveryDays: 2.7 }
  },
  {
    id: 'vendor-10',
    name: 'Prism Hardware',
    slug: 'prism-hardware',
    tagline: 'Magnetic Desk Architecture & Kinetic Switches',
    description: 'Precision CNC-machined brass and polycarbonate input peripherals with hot-swappable hall-effect magnetic sensors.',
    logo: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    rating: 4.93,
    reviewCount: 1680,
    totalProducts: 11,
    commissionRate: 0.08,
    isVerified: true,
    kycStatus: 'VERIFIED',
    location: 'Seoul, South Korea',
    badge: 'Top Seller',
    metrics: { gmv: 910000, completionRate: 99.3, avgDeliveryDays: 2.2 }
  }
];

export const MOCK_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-cyberpunk',
    name: 'Cyberpunk Wearables',
    slug: 'cyberpunk-wearables',
    description: 'Neural augmentation, HUD visors, and bio-telemetry apparel engineered for urban cybernetics.',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    accentColor: '#00F2FE',
    subcategories: ['Neural Bands', 'HUD Visors', 'Smart Rings', 'Tactical Techwear']
  },
  {
    id: 'cat-audio',
    name: 'Spatial Audio & Sound',
    slug: 'spatial-audio',
    description: 'Planar magnetic transducers, binaural monitors, and vacuum-tube analog converters.',
    icon: 'Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    accentColor: '#9B51E0',
    subcategories: ['Planar Headphones', 'Tube DACs', 'Studio Monitors', 'Spatial Earbuds']
  },
  {
    id: 'cat-drones',
    name: 'Autonomous Drones',
    slug: 'autonomous-drones',
    description: 'AI obstacle-navigating quadcopters, long-range survey sensors, and gimbal stabilizers.',
    icon: 'Navigation',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
    accentColor: '#FF007A',
    subcategories: ['Cinematic Quadcopters', 'LiDAR Scanners', 'FPV Racing', 'Autonomous Rovers']
  },
  {
    id: 'cat-living',
    name: 'Minimalist Smart Living',
    slug: 'minimalist-living',
    description: 'Circadian ambient lights, magnetic modular desks, and sculptured tactile workstations.',
    icon: 'Lamp',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    accentColor: '#FFB800',
    subcategories: ['Circadian Lamps', 'Ergonomic Seating', 'Desk Architecture', 'Basalt Diffusers']
  },
  {
    id: 'cat-biometrics',
    name: 'Kinetic & Biometric Tech',
    slug: 'biometric-tech',
    description: 'EMS athletic recovery rigs, titanium sleep trackers, and kinetic energy chronographs.',
    icon: 'Activity',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    accentColor: '#00E5FF',
    subcategories: ['Smart Rings', 'EMS Suits', 'Kinetic Watches', 'Recovery Pods']
  }
];

export const MOCK_PRODUCTS: Product[] = [
  // 1-10: Cyberpunk Wearables
  {
    id: 'prod-001',
    name: 'Aether Apex Neural Band X1',
    slug: 'aether-apex-neural-band-x1',
    headline: 'Real-time EEG telemetry with synaptic haptic pulse feedback',
    description: 'Machined from Grade 5 aerospace titanium with an ultra-pliant graphene inner lining. Tracks 8-channel EEG brainwave states, alpha focus rhythms, and automatically triggers binaural synchronization.',
    price: 489,
    originalPrice: 599,
    currency: 'USD',
    category: 'cyberpunk-wearables',
    subcategory: 'Neural Bands',
    tags: ['EEG', 'Titanium', 'Bionic', 'Cyberpunk', 'Haptics'],
    vendorId: 'vendor-1',
    vendorName: 'Aether Labs',
    vendorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    rating: 4.96,
    reviewCount: 384,
    stock: 42,
    isFeatured: true,
    isTrending: true,
    badge: 'AI Pick',
    images: [
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
    ],
    threedConfig: {
      geometry: 'torus',
      wireframeColor: '#00F2FE',
      glowColor: '#7928CA',
      metalness: 0.9,
      roughness: 0.15
    },
    specs: {
      'Weight': '48g',
      'Battery Life': '36 Hours Continuous',
      'Sensors': '8x Medical EEG + PPG',
      'Connectivity': 'Bluetooth 5.4 + Low Latency 2.4GHz RF',
      'Material': 'Grade 5 Titanium & Bio-Graphene'
    },
    aiInsights: {
      demandScore: 98,
      sentimentSummary: 'Exceptional focus tracking accuracy; users praise lightweight comfort during 10-hour sprint sessions.',
      frequentlyBoughtWith: ['prod-011', 'prod-041']
    }
  },
  {
    id: 'prod-002',
    name: 'OmniVision Prism AR HUD Visor',
    slug: 'omnivision-prism-ar-hud-visor',
    headline: 'Dual 4K Micro-OLED spatial display with 120° field of view',
    description: 'Immerse your field of view into an unlimited spatial workspace. Features 5000 nits peak brightness, laser eye-tracking, and zero light leakage for outdoor daylight operation.',
    price: 899,
    originalPrice: 1099,
    currency: 'USD',
    category: 'cyberpunk-wearables',
    subcategory: 'HUD Visors',
    tags: ['AR', 'Spatial Display', 'Micro-OLED', 'HUD'],
    vendorId: 'vendor-6',
    vendorName: 'OmniVision Spatial',
    vendorAvatar: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=120&auto=format&fit=crop&q=80',
    rating: 4.88,
    reviewCount: 219,
    stock: 18,
    isFeatured: true,
    isTrending: true,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&auto=format&fit=crop&q=80'
    ],
    threedConfig: {
      geometry: 'polyhedron',
      wireframeColor: '#FF0080',
      glowColor: '#00F2FE',
      metalness: 0.85,
      roughness: 0.2
    },
    specs: {
      'Resolution': '3840 x 2160 Per Eye',
      'Refresh Rate': '120Hz',
      'FOV': '120 Degrees',
      'Weight': '92g',
      'Compatibility': 'macOS, Windows, iOS, Android'
    },
    aiInsights: {
      demandScore: 94,
      sentimentSummary: 'Replaces multi-monitor setups effortlessly; unmatched edge clarity with no chromatic aberration.'
    }
  },
  {
    id: 'prod-003',
    name: 'Chronos Oura-Ring Titan Stealth',
    slug: 'chronos-oura-ring-titan-stealth',
    headline: 'Continuous HRV, core temp, and circadian telemetry ring',
    description: 'Finished in diamond-like carbon (DLC) matte black. Waterproof to 100 meters, this smart ring tracks blood oxygen saturation, sleep stage transitions, and cardiovascular strain with zero subscription fees.',
    price: 349,
    originalPrice: 399,
    currency: 'USD',
    category: 'cyberpunk-wearables',
    subcategory: 'Smart Rings',
    tags: ['Smart Ring', 'DLC Titanium', 'Sleep Tracker', 'Biometrics'],
    vendorId: 'vendor-5',
    vendorName: 'Chronos Kinetic',
    vendorAvatar: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewCount: 612,
    stock: 65,
    isFeatured: false,
    isTrending: true,
    badge: 'Staff Favorite',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80'
    ],
    threedConfig: {
      geometry: 'torus',
      wireframeColor: '#FFB800',
      glowColor: '#FF0080',
      metalness: 0.95,
      roughness: 0.1
    },
    specs: {
      'Water Resistance': '10 ATM (100m)',
      'Weight': '4.5g',
      'Battery': '7 Days per Charge',
      'Charge Time': '25 Minutes Fast Wireless'
    },
    aiInsights: {
      demandScore: 91,
      sentimentSummary: 'Astonishing 7-day battery life; the DLC coating shows zero scratches even after extreme rock climbing.'
    }
  },
  {
    id: 'prod-004',
    name: 'Kurogane Tactical Exo-Gauntlet',
    slug: 'kurogane-tactical-exo-gauntlet',
    headline: 'Micro-pneumatic grip assist with kinetic gesture recognition',
    description: 'Empowers hand grip with up to 25kg additional compression strength while reading subtle tendon twitch commands for touch-free device control.',
    price: 649,
    currency: 'USD',
    category: 'cyberpunk-wearables',
    subcategory: 'Tactical Techwear',
    tags: ['Exoskeleton', 'Pneumatic', 'Gesture Control'],
    vendorId: 'vendor-1',
    vendorName: 'Aether Labs',
    vendorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    rating: 4.87,
    reviewCount: 94,
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'
    ],
    threedConfig: {
      geometry: 'cylinder',
      wireframeColor: '#00E5FF',
      glowColor: '#4FACFE',
      metalness: 0.8,
      roughness: 0.3
    },
    specs: {
      'Grip Augmentation': '+25kg Force',
      'Actuator Type': 'Piezo-Micro Pneumatic',
      'Weight': '210g'
    }
  },
  {
    id: 'prod-005',
    name: 'Valkyrie Thermal Stealth Parka',
    slug: 'valkyrie-thermal-stealth-parka',
    headline: 'Self-regulating graphene heating elements with IR radar diffusion',
    description: 'Engineered with hydrophobic magnetic storm cuffs, integrated Qi smartphone warming pouch, and dynamic warmth mapped to your core temperature.',
    price: 520,
    originalPrice: 620,
    currency: 'USD',
    category: 'cyberpunk-wearables',
    subcategory: 'Tactical Techwear',
    tags: ['Graphene', 'Waterproof', 'Stealth Parka', 'Smart Fabric'],
    vendorId: 'vendor-7',
    vendorName: 'NeoPulse Athletics',
    vendorAvatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=120&auto=format&fit=crop&q=80',
    rating: 4.91,
    reviewCount: 153,
    stock: 29,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Fabric': '3-Layer Tri-Vent Graphene Weave',
      'Heat Zones': 'Chest, Lumbar, Collar',
      'Rating': 'Sub-zero down to -30°C'
    }
  },
  {
    id: 'prod-006',
    name: 'Aether NeuroLens Retinal Projector',
    slug: 'aether-neurolens-retinal-projector',
    headline: 'Direct retinal photonic projection contacts for ambient UI',
    description: 'The pinnacle of invisible computing. Projects crisp vector graphics directly into focal plane with zero bulk.',
    price: 1450,
    currency: 'USD',
    category: 'cyberpunk-wearables',
    subcategory: 'HUD Visors',
    tags: ['Retinal', 'Photonic', 'Cyberpunk', 'Ultra-High-Tech'],
    vendorId: 'vendor-1',
    vendorName: 'Aether Labs',
    vendorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    rating: 4.97,
    reviewCount: 48,
    stock: 8,
    badge: 'Limited Edition',
    images: [
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80'
    ],
    threedConfig: {
      geometry: 'sphere',
      wireframeColor: '#00F2FE',
      glowColor: '#7928CA',
      metalness: 0.95,
      roughness: 0.05
    },
    specs: {
      'Display Tech': 'Quantum Dot Micro-VCSEL',
      'Battery Life': '16 Hours on Smart Case Induction',
      'Comfort Matrix': 'Hydrophilic Oxygen-Permeable Hydrogel'
    }
  },
  {
    id: 'prod-007',
    name: 'NeoPulse Haptic Compression Vest',
    slug: 'neopulse-haptic-compression-vest',
    headline: '64 independent vibrotactile actuators for deep spatial immersion',
    description: 'Feel game impacts, sonic bass vibrations, and workout biomechanics mapped directly onto your torso.',
    price: 380,
    currency: 'USD',
    category: 'cyberpunk-wearables',
    subcategory: 'Tactical Techwear',
    tags: ['Haptics', 'VR Vest', 'Spatial Immersion'],
    vendorId: 'vendor-7',
    vendorName: 'NeoPulse Athletics',
    vendorAvatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=120&auto=format&fit=crop&q=80',
    rating: 4.82,
    reviewCount: 112,
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Actuator Points': '64 Linear Resonant Actuators',
      'Response Latency': '3ms ultra-low lag',
      'Battery': '14 Hours Gaming'
    }
  },
  {
    id: 'prod-008',
    name: 'Prism Keypad Biometric CyberDeck',
    slug: 'prism-keypad-biometric-cyberdeck',
    headline: 'Ultra-portable mechanical workstation with built-in folding OLED',
    description: 'Designed for field penetration testers and creative coders. Integrated hardware key encryption modules.',
    price: 980,
    currency: 'USD',
    category: 'cyberpunk-wearables',
    subcategory: 'Tactical Techwear',
    tags: ['Cyberdeck', 'Mechanical', 'OLED', 'Security'],
    vendorId: 'vendor-10',
    vendorName: 'Prism Hardware',
    vendorAvatar: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&auto=format&fit=crop&q=80',
    rating: 4.93,
    reviewCount: 78,
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Processor': 'Octa-Core RISC-V Neural Co-processor',
      'Keyswitches': 'Hall-Effect Magnetic Analog Switches',
      'Enclosure': 'CNC Milled Brass & Gunmetal Aluminum'
    }
  },
  {
    id: 'prod-009',
    name: 'Chronos Kinetic Smart Carabiner',
    slug: 'chronos-kinetic-smart-carabiner',
    headline: 'Load-sensing titanium carabiner with digital tension gauge',
    description: 'Rated for 28kN tensile force. Features an embedded micro-e-ink display showing active weight loading.',
    price: 189,
    currency: 'USD',
    category: 'cyberpunk-wearables',
    subcategory: 'Smart Rings',
    tags: ['Titanium', 'Load Sensor', 'Tactical', 'E-Ink'],
    vendorId: 'vendor-5',
    vendorName: 'Chronos Kinetic',
    vendorAvatar: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
    rating: 4.89,
    reviewCount: 95,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Max Breaking Strength': '28kN',
      'Display': '1.1-inch Sunlight-Readable E-Paper',
      'Weight': '68g'
    }
  },
  {
    id: 'prod-010',
    name: 'Aether NeuroSync Sleep Cocoon Mask',
    slug: 'aether-neurosync-sleep-cocoon-mask',
    headline: 'Bimodal theta stimulation with memory foam acoustic seal',
    description: 'Soothes insomnia through gentle magnetic stimulation and sound therapy, tripling deep delta wave duration.',
    price: 260,
    originalPrice: 320,
    currency: 'USD',
    category: 'cyberpunk-wearables',
    subcategory: 'Neural Bands',
    tags: ['Sleep', 'Delta Waves', 'Theta', 'Relaxation'],
    vendorId: 'vendor-1',
    vendorName: 'Aether Labs',
    vendorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    rating: 4.92,
    reviewCount: 310,
    stock: 44,
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Fabric': '100% Mulberry Silk & Bio-Gel',
      'Audio': 'Bone Conduction Transducers',
      'Weight': '88g'
    }
  },

  // 11-20: Spatial Audio & Sound
  {
    id: 'prod-011',
    name: 'SonicForge Elysium Planar Magnetic Headphones',
    slug: 'sonicforge-elysium-planar-magnetic',
    headline: '106mm ultra-thin nanometer diaphragm with acoustic open-back grating',
    description: 'Every musical nuance revealed in pristine three-dimensional acoustic space. Handcrafted walnut cups and magnesium alloy suspension yoke deliver zero harmonic distortion across 5Hz to 55kHz.',
    price: 1199,
    originalPrice: 1399,
    currency: 'USD',
    category: 'spatial-audio',
    subcategory: 'Planar Headphones',
    tags: ['Planar Magnetic', 'Audiophile', 'Open Back', 'Hi-Res'],
    vendorId: 'vendor-2',
    vendorName: 'SonicForge Acoustics',
    vendorAvatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    rating: 4.99,
    reviewCount: 420,
    stock: 22,
    isFeatured: true,
    isTrending: true,
    badge: 'Masterclass',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    threedConfig: {
      geometry: 'torus',
      wireframeColor: '#4FACFE',
      glowColor: '#00F2FE',
      metalness: 0.9,
      roughness: 0.18
    },
    specs: {
      'Transducer Size': '106mm Nanoscale Planar',
      'Frequency Response': '5Hz – 55,000Hz',
      'Impedance': '32 Ohms',
      'THD': '< 0.05% @ 1kHz, 100dB SPL',
      'Cable': 'Silver-plated Monocrystalline Copper 4.4mm Balanced'
    },
    aiInsights: {
      demandScore: 99,
      sentimentSummary: 'Unrivaled soundstage width. Reviewers call it the most transparent planar headphone ever produced under $2000.',
      frequentlyBoughtWith: ['prod-012', 'prod-001']
    }
  },
  {
    id: 'prod-012',
    name: 'Quantum Solaris Vacuum Tube DAC Amplifier',
    slug: 'quantum-solaris-vacuum-tube-dac',
    headline: 'Dual Genalex Gold Lion ECC88 triodes with 32-bit ESS Sabre PRO DAC',
    description: 'Warm, velvety analog richness combined with microscopic digital detail. Encased in a solid billet of aerospace aluminum with amber-lit vacuum tube windows.',
    price: 849,
    originalPrice: 999,
    currency: 'USD',
    category: 'spatial-audio',
    subcategory: 'Tube DACs',
    tags: ['Tube Amp', 'DAC', 'DSD512', 'Audiophile'],
    vendorId: 'vendor-9',
    vendorName: 'Quantum Soundworks',
    vendorAvatar: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=120&auto=format&fit=crop&q=80',
    rating: 4.96,
    reviewCount: 310,
    stock: 15,
    isFeatured: true,
    isTrending: false,
    badge: 'Pure Analog',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    threedConfig: {
      geometry: 'cylinder',
      wireframeColor: '#FFB800',
      glowColor: '#FF007A',
      metalness: 0.92,
      roughness: 0.15
    },
    specs: {
      'DAC Chipset': 'Dual ESS ES9038PRO',
      'Tubes': 'Matched Pair Genalex Gold Lion ECC88',
      'Decoding': 'PCM up to 768kHz, Native DSD512',
      'Output Power': '3200mW @ 32 Ohms Balanced'
    }
  },
  {
    id: 'prod-013',
    name: 'SonicForge Nebula Spatial Earbuds',
    slug: 'sonicforge-nebula-spatial-earbuds',
    headline: 'Beryllium-coated dynamic driver with dynamic head-tracking spatial audio',
    description: 'Equipped with custom MEMS microphones for 48dB adaptive active noise cancellation and personalized ear canal acoustic calibration.',
    price: 279,
    currency: 'USD',
    category: 'spatial-audio',
    subcategory: 'Spatial Earbuds',
    tags: ['Wireless', 'ANC', 'Spatial Audio', 'LDAC'],
    vendorId: 'vendor-2',
    vendorName: 'SonicForge Acoustics',
    vendorAvatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    rating: 4.88,
    reviewCount: 520,
    stock: 80,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Codecs': 'LDAC, aptX Lossless, AAC, LC3',
      'Battery': '10h Buds / 38h Case',
      'ANC Depth': 'Up to 48dB'
    }
  },
  {
    id: 'prod-014',
    name: 'Quantum Monolith Nearfield Active Monitors',
    slug: 'quantum-monolith-nearfield-monitors',
    headline: 'Coaxial ribbon tweeter array with DSP phase correction',
    description: 'Studio-grade nearfield speakers with ultra-dense resonance-free acoustic resin enclosures and integrated room measurement mic.',
    price: 1450,
    currency: 'USD',
    category: 'spatial-audio',
    subcategory: 'Studio Monitors',
    tags: ['Studio Monitor', 'Ribbon Tweeter', 'DSP', 'Pro Audio'],
    vendorId: 'vendor-9',
    vendorName: 'Quantum Soundworks',
    vendorAvatar: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=120&auto=format&fit=crop&q=80',
    rating: 4.94,
    reviewCount: 180,
    stock: 9,
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Amplification': 'Class D 250W Bi-Amplified',
      'Frequency': '35Hz - 42kHz',
      'Input': 'XLR Balanced, Optical, USB-C'
    }
  },
  {
    id: 'prod-015',
    name: 'SonicForge Carbon IEM Matrix',
    slug: 'sonicforge-carbon-iem-matrix',
    headline: '12-Balanced Armature + 1 Electrostatic in-ear monitors',
    description: 'Custom acoustic crossover separating sub-bass, midrange, and crystalline ultra-high frequencies up to 70kHz.',
    price: 890,
    currency: 'USD',
    category: 'spatial-audio',
    subcategory: 'Planar Headphones',
    tags: ['IEM', 'Electrostatic', 'Balanced Armature', 'Hi-End'],
    vendorId: 'vendor-2',
    vendorName: 'SonicForge Acoustics',
    vendorAvatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    rating: 4.93,
    reviewCount: 160,
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Driver Setup': '12 BA + 1 Electrostatic',
      'Shell': 'Medical Resin 3D Printed',
      'Impedance': '16 Ohms'
    }
  },
  {
    id: 'prod-016',
    name: 'Quantum Pulsar Magnetic Levitation Turntable',
    slug: 'quantum-pulsar-maglev-turntable',
    headline: 'Zero-friction magnetically levitating acrylic platter',
    description: 'Eliminates motor rumble completely. Includes carbon fiber tone arm and precision optical tracking speed regulator.',
    price: 2100,
    currency: 'USD',
    category: 'spatial-audio',
    subcategory: 'Tube DACs',
    tags: ['Turntable', 'Maglev', 'Vinyl', 'Luxury'],
    vendorId: 'vendor-9',
    vendorName: 'Quantum Soundworks',
    vendorAvatar: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=120&auto=format&fit=crop&q=80',
    rating: 4.98,
    reviewCount: 92,
    stock: 6,
    badge: 'Ultra Luxury',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Platter Suspension': 'Neodymium Magnetic Field',
      'Wow & Flutter': '< 0.02%',
      'Tone Arm': 'Unibody Carbon Fiber'
    }
  },
  {
    id: 'prod-017',
    name: 'SonicForge Resonator Bass Pod',
    slug: 'sonicforge-resonator-bass-pod',
    headline: 'Compact dual-opposed subwoofer with 1000W DSP amplification',
    description: 'Dual 8-inch drivers cancel mechanical vibration while firing visceral, earthquake-grade low frequencies down to 18Hz.',
    price: 680,
    currency: 'USD',
    category: 'spatial-audio',
    subcategory: 'Studio Monitors',
    tags: ['Subwoofer', 'DSP', 'Bass Pod'],
    vendorId: 'vendor-2',
    vendorName: 'SonicForge Acoustics',
    vendorAvatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    rating: 4.87,
    reviewCount: 140,
    stock: 19,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Drivers': 'Dual 8-Inch Force-Canceling',
      'Power': '1000 Watts RMS Class D',
      'Bass Extension': 'Down to 18Hz (-3dB)'
    }
  },
  {
    id: 'prod-018',
    name: 'Quantum Atmosphere Acoustic Cloud Panels (Set of 6)',
    slug: 'quantum-atmosphere-acoustic-cloud-panels',
    headline: 'Hexagonal basalt-fiber acoustic diffusion baffles with backlighting',
    description: 'Sculpt your listening space acoustics with lab-certified NRC 0.95 sound absorption and ambient edge-glow lighting.',
    price: 340,
    currency: 'USD',
    category: 'spatial-audio',
    subcategory: 'Studio Monitors',
    tags: ['Acoustic Panels', 'Studio Treatment', 'Diffusion'],
    vendorId: 'vendor-9',
    vendorName: 'Quantum Soundworks',
    vendorAvatar: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=120&auto=format&fit=crop&q=80',
    rating: 4.90,
    reviewCount: 88,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'NRC Rating': '0.95',
      'Core': 'Eco-Basalt Acoustic Wool',
      'Lighting': 'Tunable 2700K - 6500K LED'
    }
  },
  {
    id: 'prod-019',
    name: 'SonicForge Ether Wireless Bridge',
    slug: 'sonicforge-ether-wireless-bridge',
    headline: 'Uncompressed 24-bit 192kHz Wi-Fi 6E audio streamer',
    description: 'Bridges Roon, Tidal Connect, and AirPlay 2 directly into any legacy analog system with femtosecond master clocking.',
    price: 420,
    currency: 'USD',
    category: 'spatial-audio',
    subcategory: 'Tube DACs',
    tags: ['Streamer', 'Roon Ready', 'Hi-Res Audio', 'Wi-Fi 6E'],
    vendorId: 'vendor-2',
    vendorName: 'SonicForge Acoustics',
    vendorAvatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    rating: 4.89,
    reviewCount: 115,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Jitter': '< 50 Femtoseconds',
      'Networking': 'Wi-Fi 6E & Gigabit Ethernet',
      'Outputs': 'I2S, USB, Optical, Coaxial'
    }
  },
  {
    id: 'prod-020',
    name: 'SonicForge Velour Isolation Earpads',
    slug: 'sonicforge-velour-isolation-earpads',
    headline: 'High-density memory foam earpads with cooling hydrogel layer',
    description: 'Upgrade headphone breathability and bass isolation. Fits all standard 100mm circular planar cans.',
    price: 65,
    currency: 'USD',
    category: 'spatial-audio',
    subcategory: 'Planar Headphones',
    tags: ['Accessories', 'Earpads', 'Audiophile'],
    vendorId: 'vendor-2',
    vendorName: 'SonicForge Acoustics',
    vendorAvatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    rating: 4.86,
    reviewCount: 240,
    stock: 120,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Inner Foam': 'Slow-Rebound Memory Gel',
      'Covering': 'Breathable Micro-Velour'
    }
  },

  // 21-30: Autonomous Drones & Robotics
  {
    id: 'prod-021',
    name: 'Vortex Phantom LiDAR Drone X4',
    slug: 'vortex-phantom-lidar-drone-x4',
    headline: '360° omnidirectional obstacle evasion with centimeter-grade 3D mesh mapping',
    description: 'Equipped with a solid-state LiDAR scanner and triple Sony 1-inch sensor array for cinema-grade 8K ProRes aerial filming and instant surveyor point cloud generation.',
    price: 2499,
    originalPrice: 2899,
    currency: 'USD',
    category: 'autonomous-drones',
    subcategory: 'Cinematic Quadcopters',
    tags: ['Drone', 'LiDAR', '8K ProRes', 'Autonomous', 'Carbon Fiber'],
    vendorId: 'vendor-3',
    vendorName: 'Vortex Dynamics',
    vendorAvatar: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=120&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewCount: 290,
    stock: 16,
    isFeatured: true,
    isTrending: true,
    badge: 'Pro Flagship',
    images: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80'
    ],
    threedConfig: {
      geometry: 'polyhedron',
      wireframeColor: '#FF007A',
      glowColor: '#00F2FE',
      metalness: 0.9,
      roughness: 0.1
    },
    specs: {
      'Flight Time': '52 Minutes Maximum',
      'Max Speed': '95 km/h in Sport Mode',
      'Sensor Range': '15km O3+ Transmission',
      'LiDAR Scan Rate': '300,000 Points/Sec',
      'Frame': 'High-Modulus Toray T800 Carbon Fiber'
    },
    aiInsights: {
      demandScore: 97,
      sentimentSummary: 'Exceptional wind resistance and millimeter-level hover stability even in dense forest canopies.'
    }
  },
  {
    id: 'prod-022',
    name: 'Vortex Micro-Falcon FPV Racing Drone',
    slug: 'vortex-micro-falcon-fpv-racing',
    headline: 'Sub-250g ultra-light high-G acrobatics quadcopter',
    description: 'Capable of 0 to 100 km/h acceleration in 1.2 seconds. Features HD digital low-latency video feed directly to goggles.',
    price: 499,
    currency: 'USD',
    category: 'autonomous-drones',
    subcategory: 'FPV Racing',
    tags: ['FPV', 'Racing', 'Acrobatics', 'Sub-250g'],
    vendorId: 'vendor-3',
    vendorName: 'Vortex Dynamics',
    vendorAvatar: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=120&auto=format&fit=crop&q=80',
    rating: 4.88,
    reviewCount: 340,
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Weight': '242g (with battery)',
      'Motors': 'Brushless 2207 1950KV',
      'Transmission': '1080p 120fps @ 14ms latency'
    }
  },
  {
    id: 'prod-023',
    name: 'AeroCraft TerraRover Autonomous Scout',
    slug: 'aerocraft-terrarover-autonomous-scout',
    headline: 'All-terrain crawler with dual stereoscopic depth cameras',
    description: 'Navigates stairs, rocky inclines, and pipes autonomously. Includes environmental gas, radiation, and thermal sensing payloads.',
    price: 1850,
    currency: 'USD',
    category: 'autonomous-drones',
    subcategory: 'Autonomous Rovers',
    tags: ['Rover', 'Robotics', 'Thermal Sensor', 'All-Terrain'],
    vendorId: 'vendor-8',
    vendorName: 'AeroCraft Lab',
    vendorAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
    rating: 4.91,
    reviewCount: 82,
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Traction': 'Independent 6-Wheel Rocker-Bogie',
      'Payload Capacity': '12kg',
      'Battery Life': '6 Hours Operation'
    }
  },
  {
    id: 'prod-024',
    name: 'Vortex CineGimbal 3-Axis Stabilizer',
    slug: 'vortex-cinegimbal-3-axis-stabilizer',
    headline: 'Carbon fiber motorized stabilizer with LiDAR autofocus tracking',
    description: 'Supports full-frame cinema cameras up to 4.5kg payload. Automated AI subject tracking maintains pin-sharp focus in motion.',
    price: 799,
    currency: 'USD',
    category: 'autonomous-drones',
    subcategory: 'Cinematic Quadcopters',
    tags: ['Gimbal', 'Stabilizer', 'Camera Gear', 'LiDAR Focus'],
    vendorId: 'vendor-3',
    vendorName: 'Vortex Dynamics',
    vendorAvatar: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=120&auto=format&fit=crop&q=80',
    rating: 4.90,
    reviewCount: 175,
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Max Payload': '4.5kg',
      'Battery Runtime': '12 Hours',
      'Tracking Range': 'Up to 20 Meters'
    }
  },
  {
    id: 'prod-025',
    name: 'Vortex SolarGlider Long-Endurance UAV',
    slug: 'vortex-solarglider-long-endurance-uav',
    headline: 'Continuous solar-recharging fixed-wing drone with 8-hour flight time',
    description: 'Designed for wildlife conservation, border monitoring, and climate research with high-efficiency sun-tracking wing panels.',
    price: 3200,
    currency: 'USD',
    category: 'autonomous-drones',
    subcategory: 'Cinematic Quadcopters',
    tags: ['Fixed Wing', 'Solar', 'Long Endurance', 'Survey'],
    vendorId: 'vendor-3',
    vendorName: 'Vortex Dynamics',
    vendorAvatar: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=120&auto=format&fit=crop&q=80',
    rating: 4.94,
    reviewCount: 45,
    stock: 5,
    badge: 'Solar Powered',
    images: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Wingspan': '2.4 Meters',
      'Max Flight Duration': '8+ Hours Daylight',
      'Telemetry': 'Satellite + 4G LTE Backup'
    }
  },
  {
    id: 'prod-026',
    name: 'AeroCraft HoverBoard Mag-One',
    slug: 'aerocraft-hoverboard-mag-one',
    headline: 'Magnetic repulsion ground-effect levitation board for paved surfaces',
    description: 'Experience frictionless glides on magnetic conductive pathways with dual vector thrusters.',
    price: 3800,
    currency: 'USD',
    category: 'autonomous-drones',
    subcategory: 'Autonomous Rovers',
    tags: ['Maglev', 'Hoverboard', 'Micro-Mobility'],
    vendorId: 'vendor-8',
    vendorName: 'AeroCraft Lab',
    vendorAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
    rating: 4.86,
    reviewCount: 52,
    stock: 4,
    badge: 'Innovative',
    images: [
      'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Hover Clearance': '45mm',
      'Max Rider Weight': '110kg',
      'Range': '22km per charge'
    }
  },
  {
    id: 'prod-027',
    name: 'Vortex SkyDock Autonomous Drone Hub',
    slug: 'vortex-skydock-autonomous-drone-hub',
    headline: 'Weatherproof roof landing pad with 15-minute rapid battery swapping',
    description: 'Enables continuous automated recurring aerial patrols with zero human intervention required.',
    price: 4900,
    currency: 'USD',
    category: 'autonomous-drones',
    subcategory: 'Cinematic Quadcopters',
    tags: ['Docking Station', 'Automated', 'Weatherproof'],
    vendorId: 'vendor-3',
    vendorName: 'Vortex Dynamics',
    vendorAvatar: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=120&auto=format&fit=crop&q=80',
    rating: 4.96,
    reviewCount: 38,
    stock: 7,
    images: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Swapping Time': '90 Seconds Mechanical Cycle',
      'Enclosure Rating': 'IP67 Submersible / Stormproof',
      'Power Source': '240V Grid + Solar Bank'
    }
  },
  {
    id: 'prod-028',
    name: 'AeroCraft Carbon Urban E-Scooter Alpha',
    slug: 'aerocraft-carbon-urban-e-scooter-alpha',
    headline: '9.2kg full carbon monocoque electric scooter with dual suspension',
    description: 'Folds in 2 seconds into a sleek walking baton. Reaches 32 km/h top speed with regenerative regenerative braking.',
    price: 899,
    currency: 'USD',
    category: 'autonomous-drones',
    subcategory: 'Autonomous Rovers',
    tags: ['E-Scooter', 'Carbon Fiber', 'Lightweight', 'Commuter'],
    vendorId: 'vendor-8',
    vendorName: 'AeroCraft Lab',
    vendorAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
    rating: 4.91,
    reviewCount: 220,
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Weight': '9.2kg',
      'Range': '35km',
      'Top Speed': '32 km/h'
    }
  },
  {
    id: 'prod-029',
    name: 'Vortex Multi-Spectral Sensor Pod',
    slug: 'vortex-multi-spectral-sensor-pod',
    headline: '5-band agriculture and thermal imaging drone payload',
    description: 'Calculates NDVI crop vigor metrics, irrigation leaks, and canopy temperature with georeferenced calibration.',
    price: 1650,
    currency: 'USD',
    category: 'autonomous-drones',
    subcategory: 'LiDAR Scanners',
    tags: ['Agriculture', 'Multispectral', 'NDVI', 'Survey'],
    vendorId: 'vendor-3',
    vendorName: 'Vortex Dynamics',
    vendorAvatar: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=120&auto=format&fit=crop&q=80',
    rating: 4.87,
    reviewCount: 65,
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Spectral Bands': 'Blue, Green, Red, RedEdge, NIR',
      'Sensor Format': 'Global Shutter 3.2MP each',
      'Weight': '380g'
    }
  },
  {
    id: 'prod-030',
    name: 'Vortex Low-Noise Stealth Propellers (Set of 4)',
    slug: 'vortex-low-noise-stealth-propellers',
    headline: 'Toroidal blade design reducing drone decibels by 65%',
    description: 'Eliminates annoying high-frequency propeller buzz through aerodynamic toroidal edge vortices.',
    price: 49,
    currency: 'USD',
    category: 'autonomous-drones',
    subcategory: 'Cinematic Quadcopters',
    tags: ['Accessories', 'Propellers', 'Stealth', 'Toroidal'],
    vendorId: 'vendor-3',
    vendorName: 'Vortex Dynamics',
    vendorAvatar: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=120&auto=format&fit=crop&q=80',
    rating: 4.93,
    reviewCount: 410,
    stock: 150,
    images: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Noise Reduction': '-6.5 dB(A)',
      'Material': 'Carbon-reinforced Polycarbonate',
      'Efficiency': '+4% flight time'
    }
  },

  // 31-40: Minimalist Smart Living
  {
    id: 'prod-031',
    name: 'Komorebi Horizon Circadian Smart Luminaire',
    slug: 'komorebi-horizon-circadian-luminaire',
    headline: 'Full-spectrum sunlight emulation matching geographic sunrise and twilight',
    description: 'Crafted from solid Japanese cypress and sculpted matte white porcelain. Dynamically transitions color temperature from 1800K candle warm amber to 6500K crisp midday daylight to boost alertness and melatonin.',
    price: 420,
    originalPrice: 499,
    currency: 'USD',
    category: 'minimalist-living',
    subcategory: 'Circadian Lamps',
    tags: ['Circadian', 'Lighting', 'Biophilic', 'Smart Home', 'Minimalist'],
    vendorId: 'vendor-4',
    vendorName: 'Komorebi Living',
    vendorAvatar: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&auto=format&fit=crop&q=80',
    rating: 4.96,
    reviewCount: 380,
    stock: 31,
    isFeatured: true,
    isTrending: false,
    badge: 'Design Award',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
    ],
    threedConfig: {
      geometry: 'cylinder',
      wireframeColor: '#FFB800',
      glowColor: '#FF9900',
      metalness: 0.3,
      roughness: 0.8
    },
    specs: {
      'Color Temperature Range': '1800K to 6500K Continuous',
      'Color Rendering Index (CRI)': '98.5 Ra',
      'Luminous Flux': '2400 Lumens',
      'Smart Connectivity': 'Apple HomeKit, Matter, Thread, Zigbee'
    },
    aiInsights: {
      demandScore: 93,
      sentimentSummary: 'Users report noticeably improved sleep quality and calmer evening winding down rituals.'
    }
  },
  {
    id: 'prod-032',
    name: 'Prism Horizon Magnetic Modular Desk Pad',
    slug: 'prism-horizon-magnetic-desk-pad',
    headline: 'Italian top-grain vegan leather with hidden magnetic charging grid',
    description: 'Keep cables invisible. Snap charging pucks, wrist rests, and tablet stands anywhere along the surface.',
    price: 160,
    currency: 'USD',
    category: 'minimalist-living',
    subcategory: 'Desk Architecture',
    tags: ['Desk Setup', 'Magnetic', 'Leather', 'Minimalist'],
    vendorId: 'vendor-10',
    vendorName: 'Prism Hardware',
    vendorAvatar: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&auto=format&fit=crop&q=80',
    rating: 4.92,
    reviewCount: 512,
    stock: 75,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Dimensions': '900mm x 450mm',
      'Charging Qi': 'Dual 15W Fast Charge Modules',
      'Base': 'Non-slip Natural Cork'
    }
  },
  {
    id: 'prod-033',
    name: 'Komorebi Basalt Ultrasonic Aroma Diffuser',
    slug: 'komorebi-basalt-ultrasonic-diffuser',
    headline: 'Hand-carved volcanic rock cold-vapor diffusion sphere',
    description: 'Emits a fine negative-ion mist without heat degradation. Silent piezo-ceramic vibration preserves essential oil compounds.',
    price: 135,
    currency: 'USD',
    category: 'minimalist-living',
    subcategory: 'Basalt Diffusers',
    tags: ['Aromatherapy', 'Basalt', 'Zen', 'Diffuser'],
    vendorId: 'vendor-4',
    vendorName: 'Komorebi Living',
    vendorAvatar: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&auto=format&fit=crop&q=80',
    rating: 4.89,
    reviewCount: 230,
    stock: 48,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Water Reservoir': '300ml (10 Hours Continuous)',
      'Noise Level': '< 18dB Whisper Quiet',
      'Material': 'Natural Basalt Lava Stone'
    }
  },
  {
    id: 'prod-034',
    name: 'Prism Gravity Zero Ergonomic Chair',
    slug: 'prism-gravity-zero-ergonomic-chair',
    headline: 'Synchronous lumbar dynamic pivot with responsive mesh suspension',
    description: 'Self-adjusting counter-balance recline mechanism supports natural spine alignment through 12-hour work sessions.',
    price: 890,
    originalPrice: 1050,
    currency: 'USD',
    category: 'minimalist-living',
    subcategory: 'Ergonomic Seating',
    tags: ['Ergonomics', 'Office Chair', 'Posture', 'Mesh'],
    vendorId: 'vendor-10',
    vendorName: 'Prism Hardware',
    vendorAvatar: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&auto=format&fit=crop&q=80',
    rating: 4.95,
    reviewCount: 390,
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1580481077195-c3a9927b7988?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Weight Capacity': '160kg',
      'Adjustability': '4D Armrests, Lumbar Depth, Headrest 3D',
      'Base': 'Cast Aluminum Polished Star'
    }
  },
  {
    id: 'prod-035',
    name: 'Komorebi Bonsai Magnetic Levitation Orb',
    slug: 'komorebi-bonsai-maglev-orb',
    headline: 'Floating porcelain planter rotating silently in mid-air',
    description: 'Combines botanical tranquility with magnetic physics. Cultivate miniature moss or dwarf bonsai while enjoying a continuous 360-degree rotation.',
    price: 195,
    currency: 'USD',
    category: 'minimalist-living',
    subcategory: 'Circadian Lamps',
    tags: ['Bonsai', 'Maglev', 'Floating Planter', 'Home Decor'],
    vendorId: 'vendor-4',
    vendorName: 'Komorebi Living',
    vendorAvatar: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&auto=format&fit=crop&q=80',
    rating: 4.88,
    reviewCount: 165,
    stock: 33,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Levitation Gap': '18mm',
      'Max Plant Weight': '300g',
      'Base Finish': 'Natural Walnut Wood'
    }
  },
  {
    id: 'prod-036',
    name: 'Prism Vertex CNC Aluminum Monitor Arm',
    slug: 'prism-vertex-cnc-aluminum-monitor-arm',
    headline: 'Integrated spring-assist arm supporting ultrawide displays up to 49-inch',
    description: 'Zero wobble, hidden internal cable raceways, and effortless gas-spring elevation adjustment.',
    price: 180,
    currency: 'USD',
    category: 'minimalist-living',
    subcategory: 'Desk Architecture',
    tags: ['Monitor Arm', 'Desk Setup', 'Ultrawide'],
    vendorId: 'vendor-10',
    vendorName: 'Prism Hardware',
    vendorAvatar: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&auto=format&fit=crop&q=80',
    rating: 4.93,
    reviewCount: 280,
    stock: 58,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Load Capacity': 'Up to 20kg (Supports 49" Samsung Odyssey G9)',
      'VESA Standard': '75x75, 100x100',
      'Tilt / Swivel': '+90°/-15°, 360° Rotation'
    }
  },
  {
    id: 'prod-037',
    name: 'Komorebi Kyoto Hinoki Smart Mirror',
    slug: 'komorebi-kyoto-hinoki-smart-mirror',
    headline: 'Anti-fog ambient LED smart mirror with invisible weather & calendar HUD',
    description: 'Framed in aromatic Japanese Hinoki cypress wood. Displays calendar reminders and local air quality metrics with gentle gesture wave.',
    price: 540,
    currency: 'USD',
    category: 'minimalist-living',
    subcategory: 'Circadian Lamps',
    tags: ['Smart Mirror', 'Hinoki', 'Bathroom', 'IoT'],
    vendorId: 'vendor-4',
    vendorName: 'Komorebi Living',
    vendorAvatar: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&auto=format&fit=crop&q=80',
    rating: 4.87,
    reviewCount: 94,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Glass Type': '5mm Silver Float Glass Anti-Oxidation',
      'Sensors': 'Radar Proximity + Gesture Detection',
      'Connectivity': 'Matter & Wi-Fi'
    }
  },
  {
    id: 'prod-038',
    name: 'Prism Core Hall-Effect 65% Keyboard',
    slug: 'prism-core-hall-effect-65-keyboard',
    headline: 'Rapid trigger 0.1mm sensitivity with magnetic rapid switches',
    description: 'Unmatched gaming and typing precision. Customize actuation points per key from 0.1mm to 4.0mm in 0.05mm increments.',
    price: 240,
    originalPrice: 280,
    currency: 'USD',
    category: 'minimalist-living',
    subcategory: 'Desk Architecture',
    tags: ['Mechanical Keyboard', 'Hall Effect', 'Rapid Trigger', 'Gaming'],
    vendorId: 'vendor-10',
    vendorName: 'Prism Hardware',
    vendorAvatar: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&auto=format&fit=crop&q=80',
    rating: 4.97,
    reviewCount: 740,
    stock: 45,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Switches': 'Gateron Magnetic Jade Hall Effect',
      'Polling Rate': '8000Hz (0.125ms latency)',
      'Case': 'Solid CNC 6063 Anodized Aluminum'
    }
  },
  {
    id: 'prod-039',
    name: 'Komorebi Sand Zen Kinetic Clock',
    slug: 'komorebi-sand-zen-kinetic-clock',
    headline: 'Magnetic metal sphere carving endless meditative patterns in fine sand',
    description: 'A mesmerizing visual meditation. Over 500 algorithmically generated mandala patterns carved silently into colored sand beds.',
    price: 360,
    currency: 'USD',
    category: 'minimalist-living',
    subcategory: 'Circadian Lamps',
    tags: ['Zen', 'Kinetic Clock', 'Sand Art', 'Relaxation'],
    vendorId: 'vendor-4',
    vendorName: 'Komorebi Living',
    vendorAvatar: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&auto=format&fit=crop&q=80',
    rating: 4.94,
    reviewCount: 205,
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Diameter': '400mm',
      'Glass Cover': 'Tempered Anti-Reflective Glass',
      'Control': 'iOS/Android App Pattern Designer'
    }
  },
  {
    id: 'prod-040',
    name: 'Prism Under-Desk Cable Spine & Power Rack',
    slug: 'prism-under-desk-cable-spine-rack',
    headline: 'Articulating magnetic cable vertebrae with 8-socket surge protection',
    description: 'Clean your workstation clutter forever. Flexible spine follows standing desk elevation changes without pinching.',
    price: 89,
    currency: 'USD',
    category: 'minimalist-living',
    subcategory: 'Desk Architecture',
    tags: ['Cable Management', 'Standing Desk', 'Organizer'],
    vendorId: 'vendor-10',
    vendorName: 'Prism Hardware',
    vendorAvatar: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&auto=format&fit=crop&q=80',
    rating: 4.88,
    reviewCount: 310,
    stock: 90,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Length': '1280mm Extended',
      'Outlets': '8x Surge Protected + 2x USB-C PD 65W'
    }
  },

  // 41-50: Kinetic & Biometric Tech
  {
    id: 'prod-041',
    name: 'Chronos Tourbillon Kinetic Hydro-Watch',
    slug: 'chronos-tourbillon-kinetic-hydro-watch',
    headline: 'Fluidic micro-capillary hour indicator with mechanical tourbillon cage',
    description: 'A masterpiece of avant-garde haute horlogerie. Green fluorescent fluid propelled through borosilicate capillaries by miniature bellows, synchronized with a 60-second flying tourbillon escapement.',
    price: 3600,
    originalPrice: 4200,
    currency: 'USD',
    category: 'biometric-tech',
    subcategory: 'Kinetic Watches',
    tags: ['Horology', 'Tourbillon', 'Hydro-Mechanical', 'Luxury Watch'],
    vendorId: 'vendor-5',
    vendorName: 'Chronos Kinetic',
    vendorAvatar: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
    rating: 4.98,
    reviewCount: 88,
    stock: 5,
    isFeatured: true,
    isTrending: true,
    badge: 'Museum Piece',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80'
    ],
    threedConfig: {
      geometry: 'torus',
      wireframeColor: '#00E5FF',
      glowColor: '#FFB800',
      metalness: 0.95,
      roughness: 0.08
    },
    specs: {
      'Movement': 'Manufacture Calibre CK-900 Manual Wind',
      'Power Reserve': '72 Hours with Indicator Gauge',
      'Case Material': 'Grade 5 Satin-Brushed Titanium with Sapphire Box',
      'Fluidic System': 'Dual Thermal-Compensated Bellows'
    },
    aiInsights: {
      demandScore: 96,
      sentimentSummary: 'Breathtaking mechanical spectacle; revered by collectors as a true intersection of micro-fluidics and fine horology.'
    }
  },
  {
    id: 'prod-042',
    name: 'NeoPulse Full-Body EMS Recovery Suit',
    slug: 'neopulse-full-body-ems-recovery-suit',
    headline: '32-channel dry electrode muscle stimulation bodysuit with bio-impedance scanning',
    description: 'Stimulates fast-twitch muscle fibers, flushes lactic acid, and accelerates post-marathon rehabilitation in just 20 minutes.',
    price: 1290,
    originalPrice: 1490,
    currency: 'USD',
    category: 'biometric-tech',
    subcategory: 'EMS Suits',
    tags: ['EMS', 'Athletic Recovery', 'Electro-Stimulation', 'Biometrics'],
    vendorId: 'vendor-7',
    vendorName: 'NeoPulse Athletics',
    vendorAvatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=120&auto=format&fit=crop&q=80',
    rating: 4.91,
    reviewCount: 194,
    stock: 18,
    isFeatured: false,
    isTrending: true,
    badge: 'Athletes Pick',
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
    ],
    threedConfig: {
      geometry: 'polyhedron',
      wireframeColor: '#00F2FE',
      glowColor: '#7928CA',
      metalness: 0.7,
      roughness: 0.3
    },
    specs: {
      'Electrodes': '32 Medical-Grade Silver-Mesh Dry Contacts',
      'Control Hub': 'Bluetooth 5.3 Pocket Controller',
      'Battery': '12 Sessions Per Charge'
    }
  },
  {
    id: 'prod-043',
    name: 'Chronos CryoPod Targeted Cold Therapy Wand',
    slug: 'chronos-cryopod-cold-therapy-wand',
    headline: 'Sub-zero Peltier thermoelectric wand for immediate tendon inflammation relief',
    description: 'Reaches -5°C within 15 seconds without messy ice melting. Safe contact sensor maintains optimal analgesic tissue temperature.',
    price: 320,
    currency: 'USD',
    category: 'biometric-tech',
    subcategory: 'Recovery Pods',
    tags: ['Cryotherapy', 'Recovery', 'Pain Relief', 'Cold Wand'],
    vendorId: 'vendor-5',
    vendorName: 'Chronos Kinetic',
    vendorAvatar: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
    rating: 4.88,
    reviewCount: 160,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Cooling Temp': 'Down to -5°C (23°F)',
      'Contact Head': 'Medical Grade 316L Stainless Steel',
      'Runtime': '90 Minutes Active Cooling'
    }
  },
  {
    id: 'prod-044',
    name: 'NeoPulse Lactate Threshold Biosensor Patch (10-Pack)',
    slug: 'neopulse-lactate-threshold-biosensor-patch',
    headline: 'Continuous interstitial fluid lactate measurement during peak cycling intervals',
    description: 'Apply like a painless continuous glucose monitor. Live telemetry graphs pinpoint your exact VO2 max inflection point.',
    price: 199,
    currency: 'USD',
    category: 'biometric-tech',
    subcategory: 'Smart Rings',
    tags: ['Lactate', 'VO2 Max', 'Cycling', 'Endurance'],
    vendorId: 'vendor-7',
    vendorName: 'NeoPulse Athletics',
    vendorAvatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=120&auto=format&fit=crop&q=80',
    rating: 4.89,
    reviewCount: 120,
    stock: 65,
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Wear Duration': '14 Days per Biosensor',
      'Measurement': 'Lactate & Glucose interstitial fluid',
      'Sync': 'Garmin, Wahoo, Apple Watch'
    }
  },
  {
    id: 'prod-045',
    name: 'Chronos Hyperbaric Oxygen Home Capsule',
    slug: 'chronos-hyperbaric-oxygen-home-capsule',
    headline: '1.5 ATA mild hyperbaric therapy pod with HEPA climate filtration',
    description: 'Enhances cellular oxygen absorption up to 400%. Spacious ergonomic mattress inside with transparent acrylic window.',
    price: 6800,
    currency: 'USD',
    category: 'biometric-tech',
    subcategory: 'Recovery Pods',
    tags: ['HBOT', 'Hyperbaric', 'Longevity', 'Biohacking'],
    vendorId: 'vendor-5',
    vendorName: 'Chronos Kinetic',
    vendorAvatar: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
    rating: 4.97,
    reviewCount: 32,
    stock: 3,
    badge: 'Longevity Tech',
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Operating Pressure': '1.5 ATA (7.35 PSI)',
      'Oxygen Concentrator': '10L/min 95% Pure Oxygen',
      'Safety Features': 'Dual Emergency Pressure Release Valves'
    }
  },
  {
    id: 'prod-046',
    name: 'NeoPulse Percussive Massage Gun Carbon Pro',
    slug: 'neopulse-percussive-massage-gun-carbon-pro',
    headline: 'Brushless 70W motor with 16mm deep amplitude percussion',
    description: 'Delivers 3200 percussions per minute with stall-proof magnetic torque and WhisperQuiet acoustic dampening.',
    price: 249,
    currency: 'USD',
    category: 'biometric-tech',
    subcategory: 'Recovery Pods',
    tags: ['Massage Gun', 'Percussion', 'Muscle Recovery'],
    vendorId: 'vendor-7',
    vendorName: 'NeoPulse Athletics',
    vendorAvatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=120&auto=format&fit=crop&q=80',
    rating: 4.90,
    reviewCount: 410,
    stock: 55,
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Stroke Amplitude': '16mm',
      'Stall Force': '28kg (62 lbs)',
      'Battery': '5 Hours Continuous'
    }
  },
  {
    id: 'prod-047',
    name: 'Chronos Quantum Magnetometer Ring',
    slug: 'chronos-quantum-magnetometer-ring',
    headline: 'Senses Earth geomagnetic field vector for intuitive directional haptics',
    description: 'Gently vibrates whenever you face true magnetic north. A profound sensory augmentation tool for navigators and urban explorers.',
    price: 280,
    currency: 'USD',
    category: 'biometric-tech',
    subcategory: 'Smart Rings',
    tags: ['Sensory Augmentation', 'Compass', 'Haptics', 'Titanium'],
    vendorId: 'vendor-5',
    vendorName: 'Chronos Kinetic',
    vendorAvatar: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
    rating: 4.86,
    reviewCount: 75,
    stock: 38,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Compass Sensor': '3-Axis Micro-Fluxgate Magnetometer',
      'Haptic Engine': 'Sub-gram resonant pulse',
      'Material': 'Polished Zirconium'
    }
  },
  {
    id: 'prod-048',
    name: 'NeoPulse Bio-Conductive Compression Leggings',
    slug: 'neopulse-bio-conductive-leggings',
    headline: 'Graduated 25-30 mmHg medical compression with carbon thermoregulation',
    description: 'Improves venous blood return while active silver micro-threads eliminate bacteria and odor during multi-day endurance treks.',
    price: 145,
    currency: 'USD',
    category: 'biometric-tech',
    subcategory: 'EMS Suits',
    tags: ['Compression', 'Leggings', 'Silver Fiber', 'Endurance'],
    vendorId: 'vendor-7',
    vendorName: 'NeoPulse Athletics',
    vendorAvatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=120&auto=format&fit=crop&q=80',
    rating: 4.92,
    reviewCount: 260,
    stock: 70,
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Compression Class': 'Class II (25-30 mmHg)',
      'Yarn': '78% Recycled Ocean Polyamide + 22% Elastane'
    }
  },
  {
    id: 'prod-049',
    name: 'Chronos Red & Near-Infrared Full-Body Light Mat',
    slug: 'chronos-red-near-infrared-light-mat',
    headline: '660nm deep red and 850nm near-infrared LED array for mitochondrial ATP boosting',
    description: 'Flexible roll-up medical-grade silicone light mat delivering 120mW/cm² irradiance for collagen synthesis and joint recovery.',
    price: 490,
    originalPrice: 580,
    currency: 'USD',
    category: 'biometric-tech',
    subcategory: 'Recovery Pods',
    tags: ['Red Light Therapy', 'Mitochondria', 'Collagen', 'NIR'],
    vendorId: 'vendor-5',
    vendorName: 'Chronos Kinetic',
    vendorAvatar: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
    rating: 4.94,
    reviewCount: 180,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Wavelengths': '660nm (Red) & 850nm (NIR) Dual Chips',
      'Total LEDs': '720 High-Output Medical Diodes',
      'Irradiance': '120 mW/cm² @ surface'
    }
  },
  {
    id: 'prod-050',
    name: 'NeoPulse Smart Hydration Straw with Salinity Sensor',
    slug: 'neopulse-smart-hydration-straw',
    headline: 'Inline electrolyte conductivity probe tracking mineral depletion',
    description: 'Inserts into any standard water bottle. Measures instantaneous sodium and potassium density consumed during sweat loss.',
    price: 79,
    currency: 'USD',
    category: 'biometric-tech',
    subcategory: 'Recovery Pods',
    tags: ['Hydration', 'Electrolytes', 'Sensor', 'Endurance'],
    vendorId: 'vendor-7',
    vendorName: 'NeoPulse Athletics',
    vendorAvatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=120&auto=format&fit=crop&q=80',
    rating: 4.87,
    reviewCount: 145,
    stock: 95,
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Sensor': 'Gold-Plated Electrical Conductivity Probe',
      'Battery': '1 Year Replaceable Coin Cell CR2032'
    }
  }
];
