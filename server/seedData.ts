import { WasteScanRecord, WasteCategory } from '../src/types';

const CATEGORY_ITEMS: Record<string, {
  name: string;
  material: string;
  reason: string;
  rec: string;
  steps: string[];
  impact: string;
  secondLife?: string;
  contaminatedChance: number;
  contaminationNote: string;
}[]> = {
  plastic: [
    { 
      name: 'PET Water Bottle',
      material: 'PET Polymer #1',
      reason: 'Clear polyethylene terephthalate polymer bottle structure detected with standard threaded neck.',
      rec: 'Place clean and recyclable plastic in the designated plastic recycling bin. Rinse containers when appropriate.',
      steps: ['Empty remaining liquid', 'Crush bottle to save bin space', 'Replace cap and deposit in Plastic bin'],
      impact: 'Saves 66% energy compared to producing virgin plastic.',
      secondLife: 'Consider reusing for DIY garden drip irrigation or workshop storage.',
      contaminatedChance: 0.15,
      contaminationNote: 'Possible sugary soda residue detected. Rinse with water before recycling.'
    },
    { 
      name: 'HDPE Milk Jug',
      material: 'HDPE Plastic #2',
      reason: 'High-density opaque plastic jug with molded handle characteristic of recyclable HDPE.',
      rec: 'Rinse thoroughly and place in plastic recycling bin. Keep cap attached if your facility accepts caps.',
      steps: ['Rinse with warm water', 'Do not crush excessively', 'Drop in plastic recycling stream'],
      impact: 'Can be remanufactured into durable park benches and pipes.',
      secondLife: 'Cut top off to create a durable garden scoop or plant pot.',
      contaminatedChance: 0.20,
      contaminationNote: 'Milk residue detected. Wash thoroughly to prevent odor and mold at sorting facilities.'
    },
    { 
      name: 'Polypropylene Food Container',
      material: 'Polypropylene #5',
      reason: 'Rigid polypropylene container with food-safe resin code #5 markings.',
      rec: 'Wash away grease and food residues before tossing into the plastic bin.',
      steps: ['Scrape food scraps', 'Quick rinse with dish soap', 'Dry and bin in Plastics'],
      impact: 'Reduces landfill methane production significantly.',
      secondLife: 'Excellent for reuse as lunch leftovers container or hardware organizing box.',
      contaminatedChance: 0.35,
      contaminationNote: 'Food grease detected. Thorough washing required before recycling.'
    }
  ],
  paper: [
    { 
      name: 'Corrugated Shipping Box',
      material: 'Unbleached Kraft Cellulose Fiber',
      reason: 'Multi-layer corrugated kraft cardboard with visible fluting.',
      rec: 'Place clean and dry paper in the paper recycling bin. Avoid recycling paper contaminated with food or liquids.',
      steps: ['Remove plastic packing tape', 'Flatten box completely', 'Place inside paper & cardboard cart'],
      impact: 'Cardboard can be recycled 5 to 7 times into new boxes.',
      secondLife: 'Reuse for home moving, storage, parcel shipping, or weed barrier in gardens.',
      contaminatedChance: 0.12,
      contaminationNote: 'Plastic packing tape attached. Strip off tape before recycling.'
    },
    { 
      name: 'Office Document Sheets',
      material: 'Bleached Chemical Wood Pulp',
      reason: 'High-brightness uncoated cellulose fiber paper sheets.',
      rec: 'Place in designated dry paper recycling container. Staples are generally acceptable.',
      steps: ['Remove large metal binder clips', 'Keep dry from moisture', 'Stack neatly in paper bin'],
      impact: 'Recycling 1 ton of office paper saves 17 trees.',
      secondLife: 'Use blank reverse sides for scratch notes or draft printing.',
      contaminatedChance: 0.05,
      contaminationNote: 'Clean and dry paper sheets.'
    }
  ],
  metal: [
    { 
      name: 'Aluminum Beverage Can',
      material: 'Aluminum 3004 Alloy',
      reason: 'Drawn aluminum body with standard pull-tab lid and metallic reflection.',
      rec: 'Place recyclable metal containers and objects in the metal recycling stream. Empty and clean containers where possible.',
      steps: ['Empty remaining liquid', 'Rinse briefly', 'Drop into metal recycling bin'],
      impact: 'Aluminum is infinitely recyclable; recycling saves 95% of energy needed for new bauxite refining.',
      secondLife: 'Repurpose as DIY desk organizers, paint brush holders, or camping gear.',
      contaminatedChance: 0.10,
      contaminationNote: 'Liquid remnants detected. Invert to drain completely.'
    },
    { 
      name: 'Tin-Plated Food Can',
      material: 'Tinplate Steel',
      reason: 'Cylindrical corrugated steel food can with protective tin lining.',
      rec: 'Rinse food remnants cleanly and place into metal recycling stream.',
      steps: ['Rinse out sauce/food remnants', 'Push detached lid inside can', 'Toss in metal bin'],
      impact: 'Steel is the most recycled material on Earth.',
      secondLife: 'Wash thoroughly and use as durable outdoor seed planters or pencil cups.',
      contaminatedChance: 0.25,
      contaminationNote: 'Food sauce residue present. Rinse cleanly before recycling.'
    }
  ],
  organic: [
    { 
      name: 'Banana Peel',
      material: 'Biodegradable Organic Pericarp',
      reason: 'Fibrous organic pericarp with characteristic lignocellulosic decomposition markers.',
      rec: 'Place biodegradable food and plant waste in the organic/wet waste bin for composting or appropriate biological processing.',
      steps: ['Remove any plastic adhesive produce stickers', 'Place in organic green bin or compost pile', 'Keep separate from synthetic waste'],
      impact: 'Composting converts waste into nutrient-rich humus and eliminates landfill methane.',
      secondLife: 'Steep in water for 48 hours to make natural potassium-rich fertilizer for houseplants.',
      contaminatedChance: 0.08,
      contaminationNote: 'Fruit produce sticker detected. Peel off non-biodegradable sticker before composting.'
    },
    { 
      name: 'Apple Core & Seeds',
      material: 'Organic Fruit Residue',
      reason: 'Fruit residue with moisture and biodegradable organic flesh.',
      rec: 'Place in composting or municipal organic waste bin.',
      steps: ['Do not wrap in plastic', 'Add to food scrap container', 'Cover with dry leaves/paper if home composting'],
      impact: 'Returns essential nitrogen and potassium to soil.',
      secondLife: 'Great direct addition to backyard vermicompost worm bins.',
      contaminatedChance: 0.02,
      contaminationNote: 'Pure organic food waste.'
    }
  ],
  glass: [
    { 
      name: 'Flint Glass Condiment Jar',
      material: 'Soda-Lime Flint Glass',
      reason: 'Transparent vitreous silicate container with threaded lid mouth.',
      rec: 'Rinse clean and place in glass recycling station. Remove lids to recycle separately.',
      steps: ['Rinse clean of food residue', 'Separate metal/plastic lid', 'Deposit in glass recycling'],
      impact: 'Glass is 100% recyclable with zero degradation across infinite cycles.',
      secondLife: 'Wash and sanitize for pantry bulk food, dry herbs, or homemade jam storage.',
      contaminatedChance: 0.30,
      contaminationNote: 'Food residue inside jar. Soak and rinse clean with water.'
    },
    { 
      name: 'Amber Glass Beverage Bottle',
      material: 'Amber Soda-Lime Glass',
      reason: 'Brown amber glass container designed for UV-sensitive beverages.',
      rec: 'Deposit in designated glass recycling stream or bottle deposit refund depot.',
      steps: ['Pour out remaining liquid', 'Rinse quickly with water', 'Return for deposit or recycle in glass cart'],
      impact: 'Using cullet glass reduces kiln energy consumption and carbon emissions by 30%.',
      secondLife: 'Can be repurposed into rustic flower bud vases or decorative table centerpieces.',
      contaminatedChance: 0.12,
      contaminationNote: 'Beer/beverage dregs present. Quick rinse recommended.'
    }
  ],
  e_waste: [
    { 
      name: 'Old Smartphone',
      material: 'Electronic Assembly (Copper, Silicon, Lithium, Gold)',
      reason: 'Handheld touchscreen device with circuit board, camera optics, and microelectronics.',
      rec: 'Electronic waste contains valuable and hazardous metals; take to a certified e-waste drop-off depot.',
      steps: ['Factory reset to wipe personal data', 'Remove SIM and microSD cards', 'Bring to certified e-waste drop-off point'],
      impact: 'Recovers precious gold and silver while preventing toxic lead and cadmium soil contamination.',
      secondLife: 'If still operational, consider trade-in, donation to charity, or use as a dedicated smart home controller.',
      contaminatedChance: 0.05,
      contaminationNote: 'No chemical leakage observed. Battery must not be punctured.'
    },
    { 
      name: 'Computer Keyboard & Cables',
      material: 'ABS Plastic & Copper Wiring',
      reason: 'Polymer casing with membrane circuitry and PVC-insulated copper USB wiring.',
      rec: 'Do not throw in household bins. Bring to electronics recycling drop-off.',
      steps: ['Bundle cables securely', 'Ensure no loose batteries', 'Drop off at electronics retail collection bin'],
      impact: 'Reclaims high-purity copper and engineering thermoplastics.',
      secondLife: 'Test functionality; working peripherals can be donated to community tech centers.',
      contaminatedChance: 0.03,
      contaminationNote: 'Clean electronic hardware.'
    }
  ],
  textile: [
    { 
      name: 'Cotton T-Shirt',
      material: '100% Cotton Weave',
      reason: 'Woven cellulose cotton fabric with collar ribbing and sewn hems.',
      rec: 'Donate wearable clothing or drop off clean unwearable items at textile recycling kiosks.',
      steps: ['Wash and dry thoroughly', 'Fold neatly', 'Place into textile donation or recycling drop box'],
      impact: 'Diverts bulky fabric from incinerators and saves 2,700 liters of water per garment.',
      secondLife: 'Cut worn-out shirts into durable lint-free household cleaning rags or shop towels.',
      contaminatedChance: 0.15,
      contaminationNote: 'Possible surface dirt. Wash before donating or recycling.'
    }
  ],
  battery: [
    { 
      name: 'Alkaline AA Battery Pack',
      material: 'Zinc-Manganese Dioxide',
      reason: 'Cylindrical steel canister battery cells with distinct positive nub terminals.',
      rec: 'Never throw batteries in household trash or recycling bins. Use dedicated battery collection kiosks.',
      steps: ['Cover positive and negative terminals with clear tape', 'Store in a cool dry plastic container', 'Drop off at hardware store or battery collection station'],
      impact: 'Prevents landfill battery fires and recaptures zinc, manganese, and steel.',
      secondLife: 'Check voltage with a multimeter; often low-drain devices like clocks can still use them.',
      contaminatedChance: 0.08,
      contaminationNote: 'Inspect for corrosive white potassium hydroxide leakage before handling.'
    }
  ],
  hazardous: [
    { 
      name: 'Aerosol Paint Spray Can',
      material: 'Pressurized Steel Canister with Solvent',
      reason: 'Aerosol canister containing volatile organic paint solvent chemicals.',
      rec: 'Deliver to your local municipal Household Hazardous Waste (HHW) drop-off facility.',
      steps: ['Do not puncture or incinerate', 'Keep in original labeled container', 'Bring to hazardous waste collection depot'],
      impact: 'Prevents volatile chemical release and groundwater contamination.',
      secondLife: 'Share remaining usable paint with neighbors, schools, or community maker groups.',
      contaminatedChance: 0.85,
      contaminationNote: 'Hazardous chemical vapors and paint residues present. Handle with care.'
    }
  ]
};

// Generates ~780 realistic demo records spanning the last 90 days across 9 categories
export function generateDemoScans(): WasteScanRecord[] {
  const scans: WasteScanRecord[] = [];
  
  // Realistic stream distribution in modern facilities
  const distributionWeights: { cat: WasteCategory; weight: number }[] = [
    { cat: 'plastic', weight: 32 },
    { cat: 'paper', weight: 24 },
    { cat: 'organic', weight: 16 },
    { cat: 'metal', weight: 12 },
    { cat: 'glass', weight: 7 },
    { cat: 'e_waste', weight: 4 },
    { cat: 'textile', weight: 2 },
    { cat: 'battery', weight: 2 },
    { cat: 'hazardous', weight: 1 }
  ];

  let idCounter = 1000;
  const now = new Date();

  // Create scans over the past 90 days
  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const dayDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const dayOfWeek = dayDate.getUTCDay();
    
    // Higher volume on weekends
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCount = isWeekend ? 11 : 8;
    const count = baseCount + Math.floor(Math.sin(dayOffset * 0.4) * 3);

    for (let j = 0; j < count; j++) {
      // Pick category according to distribution weights
      const totalWeight = distributionWeights.reduce((acc, curr) => acc + curr.weight, 0);
      let rand = Math.random() * totalWeight;
      let selectedCat: WasteCategory = 'plastic';
      for (const w of distributionWeights) {
        if (rand < w.weight) {
          selectedCat = w.cat;
          break;
        }
        rand -= w.weight;
      }

      const categoryItems = CATEGORY_ITEMS[selectedCat || 'plastic'] || CATEGORY_ITEMS.plastic;
      const itemTemplate = categoryItems[Math.floor(Math.random() * categoryItems.length)];

      // Confidence: 75% to 99%
      const confidence = Number((0.78 + Math.random() * 0.21).toFixed(2));

      // Random time during the day
      const hour = 7 + Math.floor(Math.random() * 14);
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      const scanDate = new Date(dayDate);
      scanDate.setUTCHours(hour, minute, second);

      // Thumbnail placeholder representation
      const imageUrl = `https://images.unsplash.com/photo-placeholder-${selectedCat}-${(idCounter % 5) + 1}`;

      // Assign some scans to demo user Alex Green
      const isDemoUser = (idCounter % 14 === 0) || (dayOffset < 10 && idCounter % 6 === 0);

      // Contamination check simulation
      const isContaminated = Math.random() < itemTemplate.contaminatedChance;
      const contaminationNote = isContaminated ? itemTemplate.contaminationNote : 'No obvious contamination detected.';

      // AI Feedback simulation: ~88% confirmed, ~9% corrected, ~3% unrated
      const feedbackRand = Math.random();
      let user_confirmed: boolean | null = null;
      let user_correction: string | null = null;
      let ai_prediction: string | null = selectedCat;

      if (feedbackRand < 0.86) {
        user_confirmed = true;
      } else if (feedbackRand < 0.96) {
        user_confirmed = false;
        // User corrected to a nearby category (e.g. plastic vs paper, or metal vs e_waste)
        const alternateCategories: Record<string, string> = {
          plastic: 'paper',
          paper: 'plastic',
          metal: 'e_waste',
          organic: 'other',
          glass: 'plastic',
          e_waste: 'metal',
          textile: 'other',
          battery: 'hazardous',
          hazardous: 'battery'
        };
        user_correction = alternateCategories[selectedCat || 'plastic'] || 'other';
      }

      scans.push({
        id: `scan-${idCounter++}`,
        category: selectedCat,
        item_name: itemTemplate.name,
        material: itemTemplate.material,
        confidence,
        recommendation: itemTemplate.rec,
        reason: itemTemplate.reason,
        actionable_steps: itemTemplate.steps,
        environmental_impact: itemTemplate.impact,
        second_life_suggestion: itemTemplate.secondLife || null,
        image_quality: 'good',
        image_quality_reason: null,
        contamination_detected: isContaminated,
        contamination_note: contaminationNote,
        ai_prediction,
        user_confirmed,
        user_correction,
        image_url: imageUrl,
        is_waste: true,
        created_at: scanDate.toISOString(),
        user_id: isDemoUser ? 'user-demo-1' : (idCounter % 5 === 0 ? 'user-community-2' : null),
        user_name: isDemoUser ? 'Alex Green' : (idCounter % 5 === 0 ? 'Community Member' : null),
        user_email: isDemoUser ? 'user@smartwaste.eco' : null
      });
    }
  }

  return scans;
}
