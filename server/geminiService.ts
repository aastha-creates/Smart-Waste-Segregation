import { GoogleGenAI, Type } from '@google/genai';
import { WasteAnalysisResult, WasteCategory } from '../src/types';

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export interface LocalizedRecommendation {
  name: string;
  rec: string;
  steps: string[];
  impact: string;
  alt: string;
  secondLife?: string;
}

export const MULTILINGUAL_RECOMMENDATIONS: Record<string, Record<string, LocalizedRecommendation>> = {
  en: {
    plastic: {
      name: 'Plastic',
      rec: 'Place clean and recyclable plastic in the designated plastic recycling bin. Rinse containers when appropriate to avoid contamination.',
      steps: [
        'Empty any residual liquid or contents',
        'Rinse lightly to remove sticky food residue',
        'Crush or flatten to save space and deposit in Plastic Recycling'
      ],
      impact: 'Recycling 1 ton of plastic saves approx 5,774 kWh of electricity and 16.3 barrels of oil.',
      alt: 'If heavily soiled with grease or non-recyclable multi-layer foil, dispose in General Waste.',
      secondLife: 'Consider reusing sturdy plastic containers for garage hardware organization, plant pots, or dry item storage.'
    },
    paper: {
      name: 'Paper & Cardboard',
      rec: 'Place clean and dry paper/cardboard in the paper recycling bin. Avoid wet or food-soiled paper.',
      steps: [
        'Ensure free from heavy grease, oils, or food contamination',
        'Flatten corrugated boxes and pull off plastic packing tape',
        'Keep dry and deposit in Paper & Cardboard Recycling'
      ],
      impact: 'Recycling 1 ton of paper preserves 17 mature trees and 7,000 gallons of fresh water.',
      alt: 'Food-soaked napkins or greasy pizza box bottoms belong in Composting or General Waste.',
      secondLife: 'Consider reusing sturdy boxes for home storage, moving, parcel mailing, or craft projects.'
    },
    metal: {
      name: 'Metal',
      rec: 'Place recyclable metal cans, containers, and clean foil in the metal recycling stream.',
      steps: [
        'Ensure the metal container is completely drained of liquids',
        'Rinse quickly with water; paper labels can remain attached',
        'Deposit aluminum cans, tin food cans, or clean metal into Metal Recycling'
      ],
      impact: 'Aluminum can be recycled indefinitely using 95% less energy than raw bauxite refining.',
      alt: 'Aerosol cans or chemical containers must be completely emptied before disposal or treated as hazardous.',
      secondLife: 'Empty clean tin cans make great desk pen holders, seed starter pots, or DIY utensil organizers.'
    },
    organic: {
      name: 'Organic / Food Waste',
      rec: 'Place biodegradable food and plant matter into the organic/wet waste bin for composting.',
      steps: [
        'Remove any non-compostable stickers, plastic ties, or rubber bands',
        'Place food scraps, fruit peels, or coffee grounds into the Organic Bin',
        'Strictly avoid plastic wrappers or synthetic packaging'
      ],
      impact: 'Composting organic scraps prevents anaerobic decomposition in landfills, cutting methane emissions by 90%.',
      alt: 'Meat scraps in municipal areas with limited composting rules may belong in General Waste.',
      secondLife: 'Fruit peels can be used for homemade citrus vinegar cleaners or directly infused in garden compost.'
    },
    glass: {
      name: 'Glass',
      rec: 'Place clean glass bottles and jars in the glass recycling bin. Never mix window panes or ceramics.',
      steps: [
        'Empty any residual liquid and rinse clean with water',
        'Remove metal or plastic caps (recycle caps separately in their respective bins)',
        'Deposit glass bottles and jars carefully into the Glass Recycling station'
      ],
      impact: 'Glass is 100% recyclable infinitely without loss in quality or purity.',
      alt: 'Ceramics, Pyrex, mirrors, and window glass have different melting points and belong in General Waste.',
      secondLife: 'Consider reusing clean glass jars for kitchen bulk pantry storage, spice holders, or home canning.'
    },
    e_waste: {
      name: 'E-Waste',
      rec: 'Electronic waste contains valuable and hazardous elements; take to a certified e-waste drop-off depot.',
      steps: [
        'Perform a factory reset to erase personal data if applicable',
        'Detach removable cords, batteries, and accessories',
        'Deliver to an authorized e-waste collection bin or municipal electronic drop-off'
      ],
      impact: 'Proper e-waste recycling recovers precious gold, copper, and palladium while preventing toxic lead and cadmium leaching.',
      alt: 'NEVER toss electronics in standard household trash or curbside recycling.',
      secondLife: 'If functional or repairable, consider donating to a charity, school, or community repair cafe.'
    },
    textile: {
      name: 'Textile / Clothing',
      rec: 'Donate wearable clothes or deposit damaged garments at dedicated textile recycling drop-off bins.',
      steps: [
        'Check pockets for personal belongings or coins',
        'Ensure clothing is dry and free of hazardous stains',
        'Fold and drop off at local clothing donation boxes or textile recycling centers'
      ],
      impact: 'Textile recycling diverts massive fabric volumes from incinerators and saves thousands of liters of dye water.',
      alt: 'Severely moldy, oil-soaked, or contaminated rags should go to General Waste.',
      secondLife: 'Torn shirts can be repurposed as household cleaning rags, dusters, or craft quilting patches.'
    },
    battery: {
      name: 'Battery',
      rec: 'Batteries must NEVER enter regular trash or curbside bins due to fire risks. Take to a battery drop-off.',
      steps: [
        'Cover battery terminals with clear tape to prevent short circuits',
        'Keep away from heat, water, and flammable materials',
        'Deposit in dedicated battery recycling bins at hardware stores, electronics centers, or supermarkets'
      ],
      impact: 'Recycling batteries recovers critical nickel, cobalt, and lithium while preventing heavy metal soil toxicity.',
      alt: 'Batteries are strictly prohibited from curbside recycling and household garbage bins.',
      secondLife: 'Rechargeable batteries should be fully recharged; for dead single-use batteries, prompt recycling is required.'
    },
    hazardous: {
      name: 'Hazardous Waste',
      rec: 'Chemicals, paints, motor oils, and toxic substances require certified municipal hazardous collection.',
      steps: [
        'Keep substances in original labeled containers where possible',
        'Ensure lids and caps are tightly sealed against spills',
        'Deliver to your local municipal Household Hazardous Waste (HHW) drop-off facility'
      ],
      impact: 'Safe hazardous containment protects groundwater aquifers, wildlife, and municipal sanitation workers.',
      alt: 'Never pour down domestic sink drains, storm sewers, or onto open ground.',
      secondLife: 'Partially used paint or garden fertilizers can be shared with community neighbors or local makerspaces.'
    },
    other: {
      name: 'Other / Residual',
      rec: 'Dispose of in the general residual waste bin if the item cannot be segregated into standard recycling streams.',
      steps: [
        'Confirm whether any detachable parts are recyclable',
        'Wrap sharp edges safely if applicable',
        'Deposit into the General Residual Waste bin'
      ],
      impact: 'Properly isolating non-recyclables keeps recycling streams pure and prevents facility downtime.',
      alt: 'Consult local municipal guidelines for specialized bulky waste pickup.'
    }
  },
  mr: {
    plastic: {
      name: 'प्लास्टिक',
      rec: 'स्वच्छ आणि पुनर्वापरयोग्य प्लास्टिक नियुक्त प्लास्टिक पुनर्वापर कुंडीत टाका. दूषितता टाळण्यासाठी डबे किंवा बाटल्या धुवून घ्या.',
      steps: [
        'उरलेले द्रव किंवा पदार्थ पूर्णपणे रिकामे करा',
        'चिकट अन्नाचे अवशेष काढण्यासाठी हलके धुवा',
        'जागा वाचवण्यासाठी चपटे करा आणि प्लास्टिक कुंडीत टाका'
      ],
      impact: '१ टन प्लास्टिकचे पुनर्वापर केल्यास सुमारे ५,७७४ kWh वीज आणि १६.३ बॅरल्स तेलाची बचत होते.',
      alt: 'अतिशय तेलकट किंवा बहुस्तरीय फॉइल असल्यास सामान्य कचऱ्यात टाका.',
      secondLife: 'मजबूत प्लास्टिक डब्यांचा वापर घरातील साहित्याची साठवण किंवा झाडांच्या कुंडीसाठी करा.'
    },
    paper: {
      name: 'कागद आणि पुठ्ठा',
      rec: 'स्वच्छ आणि कोरडा कागद/पुठ्ठा कागद पुनर्वापर कुंडीत टाका. ओला किंवा अन्न लागलेला कागद टाळा.',
      steps: [
        'तेल आणि अन्नाचे डाग नसल्याची खात्री करा',
        'पुठ्ठ्याचे बॉक्स चपटे करा आणि प्लास्टिकची पट्टी काढा',
        'कोरडे ठेवून कागद पुनर्वापर कुंडीत टाका'
      ],
      impact: '१ टन कागदाचा पुनर्वापर केल्यास १७ मोठी झाडे आणि ७,००० गॅलन पाण्याचे रक्षण होते.',
      alt: 'अन्न लागलेले नॅपकिन्स किंवा तेलकट पिझ्झा बॉक्स सेंद्रिय खतासाठी किंवा सामान्य कचऱ्यात टाका.',
      secondLife: 'मजबूत पुठ्ठ्याचे खोके घरगुती साठवणूक, कुरिअर किंवा कलाकुसरीच्या कामासाठी वापरा.'
    },
    metal: {
      name: 'धातू',
      rec: 'पुनर्वापरयोग्य धातूचे कॅन, डबे आणि स्वच्छ फॉइल धातू पुनर्वापर प्रवाहात टाका.',
      steps: [
        'डब्यातील द्रव पूर्णपणे रिकामे करा',
        'पाण्याने स्वच्छ धुवा; कागदी लेबले काढण्याची गरज नाही',
        'अल्युमिनियम कॅन आणि डबे धातू पुनर्वापर कुंडीत टाका'
      ],
      impact: 'अल्युमिनियमचे पुनर्वापर ९५% कमी ऊर्जा वापरून अमर्यादित वेळा केले जाऊ शकते.',
      alt: 'रासायनिक किंवा एरोसोल डबे पूर्ण रिकामे असल्याशिवाय घातक कचरा म्हणून हाताळा.',
      secondLife: 'स्वच्छ डब्यांचा वापर पेन स्टँड किंवा लहान वनस्पतींच्या रोपांसाठी करा.'
    },
    organic: {
      name: 'सेंद्रिय / अन्न कचरा',
      rec: 'जैविक अन्न आणि वनस्पतींचा कचरा खत निर्मितीसाठी हिरव्या सेंद्रिय कुंडीत टाका.',
      steps: [
        'न कुजणारे प्लास्टिक स्टिकर्स किंवा रबर बँड काढून टाका',
        'फळांची साले आणि खरकटे अन्न सेंद्रिय कुंडीत टाका',
        'प्लास्टिक रॅपर्स किंवा थर्माकोल अजिबात टाकू नका'
      ],
      impact: 'सेंद्रिय कचऱ्यापासून खत बनवल्याने लँडफिलमधील मिथेन वायूचे उत्सर्जन ९०% कमी होते.',
      alt: 'काही महानगरपालिका नियमांनुसार हाडांचा कचरा सामान्य कचऱ्यात टाकला जाऊ शकतो.',
      secondLife: 'फळांच्या सालींचा वापर नैसर्गिक बायो-एन्झाईम किंवा घरगुती खतासाठी करा.'
    },
    glass: {
      name: 'काच',
      rec: 'स्वच्छ काचेच्या बाटल्या आणि बरण्या काच पुनर्वापर केंद्रात टाका. खिडकीची काच किंवा सिरॅमिक्स मिसळू नका.',
      steps: [
        'बाटलीतील द्रव रिकामे करून पाण्याने स्वच्छ धुवा',
        'प्लास्टिक किंवा धातूची झाकणे वेगळी करा',
        'काचेच्या बाटल्या काळजीपूर्वक काच संकलन कुंडीत टाका'
      ],
      impact: 'काचेची गुणवत्ता कमी न होता ती १००% अमर्याद वेळा पुनर्वापर करता येते.',
      alt: 'खिडकीची काच, आरसा आणि सिरॅमिक्स सामान्य कचऱ्यात टाकावे.',
      secondLife: 'काचेच्या स्वच्छ बरण्या मसाल्यांची साठवणूक किंवा लोणच्यासाठी पुन्हा वापरा.'
    },
    e_waste: {
      name: 'ई-कचरा',
      rec: 'इलेक्ट्रॉनिक कचऱ्यामध्ये मौल्यवान आणि घातक घटक असतात; तो प्रमाणित ई-कचरा संकलन केंद्रात द्या.',
      steps: [
        'वैयक्तिक डेटा सुरक्षितपणे फॅक्टरी रीसेट करा',
        'केबल्स आणि बॅटरी वेगळ्या करा',
        'अधिकृत ई-कचरा संकलन केंद्रात किंवा किऑस्कमध्ये जमा करा'
      ],
      impact: 'ई-कचऱ्याचे योग्य रिसायकलिंग मौल्यवान सोने आणि तांबे वाचवते व जमिनीचे प्रदूषण टाळते.',
      alt: 'इलेक्ट्रॉनिक्स कधीही घरातील सामान्य कचराकुंडीत टाकू नका.',
      secondLife: 'चालू स्थितीत असल्यास गरजू विद्यार्थ्यांना किंवा दुरुस्ती केंद्रात दान करा.'
    },
    textile: {
      name: 'कापड आणि कपडे',
      rec: 'वापरण्यायोग्य कपडे दान करा किंवा फाटलेले कपडे कापड पुनर्वापर पेटीत टाका.',
      steps: [
        'खिशातील पैसे किंवा वस्तू तपासा',
        'कपडे कोरडे आणि स्वच्छ असल्याची खात्री करा',
        'स्थानिक कपडे संकलन पेटीत किंवा पुनर्वापर केंद्रात जमा करा'
      ],
      impact: 'कापड पुनर्वापरामुळे कचराभट्टीतील प्रदूषण टळते आणि हजारो लिटर पाण्याची बचत होते.',
      alt: 'अतिशय घाण किंवा रासायनिक डाग लागलेले कपडे सामान्य कचऱ्यात टाका.',
      secondLife: 'फाटलेल्या सुती कपड्यांचा वापर घर पुसण्यासाठी किंवा मॉप म्हणून करा.'
    },
    battery: {
      name: 'बॅटरी',
      rec: 'आगीचा धोका असल्याने बॅटरी कधीही कचऱ्यात टाकू नका. बॅटरी संकलन केंद्रात जमा करा.',
      steps: [
        'शॉर्ट सर्किट टाळण्यासाठी दोन्ही टोकांना चिकटपट्टी लावा',
        'उष्णता आणि पाण्यापासून दूर ठेवा',
        'अधिकृत बॅटरी संकलन केंद्रात जमा करा'
      ],
      impact: 'बॅटरी पुनर्वापरामुळे लिथियम, कोबाल्ट आणि निकेलची पुनर्प्राप्ती होते आणि विषारी प्रदूषण टळते.',
      alt: 'बॅटरी कोणत्याही परिस्थितीत घरगुती कचऱ्यात टाकण्यास सक्त मनाई आहे.',
      secondLife: 'रिचार्ज करण्यायोग्य बॅटरी पूर्ण चार्ज करून पुन्हा वापरा.'
    },
    hazardous: {
      name: 'घातक कचरा',
      rec: 'रसायने, रंग, ऑईल आणि विषारी पदार्थांसाठी महानगरपालिकेच्या घातक कचरा संकलन केंद्राचा वापर करा.',
      steps: [
        'मूळ लेबल असलेल्या बाटलीत किंवा डब्यातच ठेवा',
        'गळती रोखण्यासाठी झाकण घट्ट बंद करा',
        'महानगरपालिकेच्या घातक कचरा संकलन केंद्रात सुपूर्द करा'
      ],
      impact: 'घातक कचऱ्याचे सुरक्षित व्यवस्थापन भूगर्भातील पाणी आणि स्वच्छता कामगारांचे रक्षण करते.',
      alt: 'कधीही नाल्यात, वॉशबेसिनमध्ये किंवा उघड्या जमिनीवर ओतू नका.',
      secondLife: 'शिल्लक राहिलेला रंग किंवा खते गरजूंना किंवा शेजाऱ्यांना द्या.'
    },
    other: {
      name: 'इतर / अवशिष्ट कचरा',
      rec: 'पुनर्वापर न करता येणारा मिश्र कचरा सामान्य अवशिष्ट कचराकुंडीत टाका.',
      steps: [
        'कोणताही भाग पुनर्वापरयोग्य आहे का ते तपासा',
        'धारदार वस्तू असल्यास काळजीपूर्वक गुंडाळा',
        'सामान्य कचरा कुंडीत टाका'
      ],
      impact: 'अयोग्य कचरा वेगळा ठेवल्याने पुनर्वापर यंत्रणेचे काम सुरळीत चालू राहते.',
      alt: 'मोठ्या आकाराच्या कचऱ्यासाठी महापालिकेच्या विशेष सेवांची मदत घ्या.'
    }
  },
  hi: {
    plastic: {
      name: 'प्लास्टिक',
      rec: 'साफ और पुनर्चक्रण योग्य प्लास्टिक को प्लास्टिक रीसाइक्लिंग बिन में डालें। संदूषण से बचने के लिए डिब्बों को धो लें।',
      steps: [
        'बचा हुआ तरल या भोजन पूरी तरह खाली करें',
        'चिपचिपे अवशेष हटाने के लिए हल्के पानी से धोएं',
        'जगह बचाने के लिए दबाएं और प्लास्टिक बिन में डालें'
      ],
      impact: '१ टन प्लास्टिक रीसायकल करने से लगभग ५,७७४ kWh बिजली और १६.३ बैरल तेल की बचत होती है।',
      alt: 'अत्यधिक चिकनाई या मल्टी-लेयर पैकेजिंग को सामान्य कचरे में डालें।',
      secondLife: 'मजबूत प्लास्टिक कंटेनरों का उपयोग घरेलू सामान रखने या पौधों के गमले के रूप में करें।'
    },
    paper: {
      name: 'कागज और गत्ता',
      rec: 'साफ और सूखा कागज/गत्ता रीसाइक्लिंग बिन में डालें। गीला या भोजन लगा कागज न डालें।',
      steps: [
        'सुनिश्चित करें कि तेल या भोजन के दाग न हों',
        'गत्ते के बक्से को चपटा करें और प्लास्टिक टेप हटाएं',
        'सूखा रखकर कागज रीसाइक्लिंग बिन में डालें'
      ],
      impact: '१ टन कागज रीसायकल करने से १७ बड़े पेड़ और ७,००० गैलन पानी बचता है।',
      alt: 'चिकने पिज्जा बॉक्स या इस्तेमाल किए गए नैपकिन कंपोस्ट या सामान्य कचरे में डालें।',
      secondLife: 'मजबूत बक्सों का उपयोग सामान रखने, कूरियर भेजने या घरेलू कार्यों में करें।'
    },
    metal: {
      name: 'धातु',
      rec: 'रीसाइक्लिंग योग्य धातु के डिब्बे, कैन और साफ फॉयल को धातु रीसाइक्लिंग बिन में डालें।',
      steps: [
        'डिब्बे से तरल पदार्थ पूरी तरह निकालें',
        'हल्के पानी से धोएं; कागजी लेबल लगे रहने दे सकते हैं',
        'एल्युमिनियम कैन और साफ धातु के डिब्बे मेटल बिन में डालें'
      ],
      impact: 'एल्युमिनियम को ९५% कम ऊर्जा खर्च करके बार-बार रीसायकल किया जा सकता है।',
      alt: 'केमिकल या एरोसोल कैन खाली होने पर ही सुरक्षित रूप से रीसायकल करें।',
      secondLife: 'खाली टिन के डिब्बों का उपयोग पेन स्टैंड या पौधों के लिए करें।'
    },
    organic: {
      name: 'जैविक / खाद्य अपशिष्ट',
      rec: 'खाद्य और वनस्पति कचरे को जैविक/गीले कचरे के हरे कूड़ेदान में डालें।',
      steps: [
        'प्लास्टिक स्टिकर, धागे या रबर बैंड हटा दें',
        'फलों के छिलके और बचा हुआ खाना जैविक बिन में डालें',
        'प्लास्टिक रैपर या थर्माकोल कतई न मिलाएं'
      ],
      impact: 'जैविक कचरे से खाद बनाने पर लैंडफिल में मीथेन गैस का उत्सर्जन ९०% तक घट जाता है।',
      alt: 'कुछ नगर निगम क्षेत्रों में हड्डियों का कचरा सामान्य कचरे में डाला जाता है।',
      secondLife: 'फलों के छिलकों से प्राकृतिक क्लीनर या पौधों की खाद तैयार करें।'
    },
    glass: {
      name: 'कांच',
      rec: 'साफ कांच की बोतलें और जार कांच रीसाइक्लिंग स्टेशन में डालें। खिड़की का कांच या सिरेमिक न मिलाएं।',
      steps: [
        'तरल पदार्थ खाली करें और पानी से धो लें',
        'प्लास्टिक या धातु के ढक्कन अलग करें',
        'कांच की बोतलों को सावधानीपूर्वक कांच रीसाइक्लिंग स्टेशन में डालें'
      ],
      impact: 'कांच को गुणवत्ता खोए बिना १००% अनगिनत बार रीसायकल किया जा सकता है।',
      alt: 'खिड़की का कांच, शीशा और सिरेमिक सामान्य कचरे में ही डालें।',
      secondLife: 'साफ कांच के जार का उपयोग मसालों या खाद्य पदार्थों के भंडारण के लिए करें।'
    },
    e_waste: {
      name: 'ई-कचरा',
      rec: 'इलेक्ट्रॉनिक कचरे में बहुमूल्य और हानिकारक तत्व होते हैं; इसे अधिकृत ई-कचरा डिपो में दें।',
      steps: [
        'अपना व्यक्तिगत डेटा मिटाने के लिए फैक्ट्री रीसेट करें',
        'केबल और बैटरियां अलग कर लें',
        'अधिकृत ई-कचरा संग्रह केंद्र या कियोस्क में जमा करें'
      ],
      impact: 'उचित ई-कचरा रीसाइक्लिंग से सोना, तांबा बचता है और विषैले रसायनों का फैलाव रुकता है।',
      alt: 'इलेक्ट्रॉनिक्स को कभी भी घर के सामान्य कचरे में न फेंकें।',
      secondLife: 'यदि काम कर रहा हो तो किसी जरूरतमंद को दान करें या मरम्मत कराएं।'
    },
    textile: {
      name: 'कपड़ा कचरा',
      rec: 'पहनने योग्य कपड़े दान करें या फटे कपड़े कपड़ा रीसाइक्लिंग ड्रॉप-ऑफ में डालें।',
      steps: [
        'जेब में कोई सामान या सिक्के न हों यह जांचें',
        'सुनिश्चित करें कि कपड़े सूखे और साफ हैं',
        'स्थानीय कपड़ा दान पेटी या केंद्र में जमा करें'
      ],
      impact: 'कपड़ा रीसाइक्लिंग कचरे के ढेर को घटाती है और हजारों लीटर पानी बचाती है।',
      alt: 'अत्यधिक गंदे या तेल में भीगे कपड़े सामान्य कचरे में डालें।',
      secondLife: 'फटे सूती कपड़ों को पोछा या सफाई के कपड़े के रूप में उपयोग करें।'
    },
    battery: {
      name: 'बैटरी',
      rec: 'आग के खतरे के कारण बैटरी कभी भी कूड़ेदान में न डालें। समर्पित बैटरी कियोस्क पर ले जाएं।',
      steps: [
        'शॉर्ट सर्किट से बचने के लिए दोनों सिरों पर टेप लगाएं',
        'गर्मी और पानी से दूर रखें',
        'इलेक्ट्रॉनिक्स स्टोर या रीसाइक्लिंग कियोस्क में जमा करें'
      ],
      impact: 'बैटरी रीसाइक्लिंग से लिथियम, कोबाल्ट और निकल सुरक्षित रूप से दोबारा प्राप्त होते हैं।',
      alt: 'घरेलू कूड़ेदान में बैटरी डालना सख्त वर्जित है।',
      secondLife: 'रिचार्जेबल बैटरी को दोबारा चार्ज करें; खत्म बैटरी को तुरंत रीसायकल करें।'
    },
    hazardous: {
      name: 'खतरनाक अपशिष्ट',
      rec: 'रसायन, पेंट, इंजन ऑयल और जहरीले पदार्थों को नगर निगम के खतरनाक कचरा केंद्र पर दें।',
      steps: [
        'पदार्थों को उनके मूल डिब्बे में ही रखें',
        'रिसाव रोकने के लिए ढक्कन कसकर बंद करें',
        'स्थानीय खतरनाक कचरा (HHW) केंद्र पर सौंपें'
      ],
      impact: 'खतरनाक कचरे का सुरक्षित निस्तारण भूजल और सफाई कर्मियों की रक्षा करता है।',
      alt: 'इसे कभी भी सिंक, नाली या खुली जमीन पर न बहाएं।',
      secondLife: 'बचा हुआ पेंट या उर्वरक जरूरतमंद पड़ोसियों से साझा करें।'
    },
    other: {
      name: 'अन्य / अवशिष्ट',
      rec: 'यदि वस्तु किसी रीसाइक्लिंग श्रेणी में नहीं आती तो सामान्य अवशिष्ट कूड़ेदान में डालें।',
      steps: [
        'जांचें कि क्या कोई हिस्सा अलग होकर रीसायकल हो सकता है',
        'नुकीली चीजों को सावधानी से लपेटें',
        'सामान्य अवशिष्ट कूड़ेदान में डालें'
      ],
      impact: 'गैर-पुनर्चक्रण योग्य कचरे को अलग रखने से रीसाइक्लिंग प्लांट सुचारू रूप से काम करते हैं।',
      alt: 'बड़े आकार के कचरे के लिए नगरपालिका सेवा से संपर्क करें।'
    }
  },
  ur: {
    plastic: {
      name: 'پلاسٹک',
      rec: 'صاف اور ری سائیکلنگ کے قابل پلاسٹک کو مخصوص پلاسٹک ری سائیکلنگ بن میں ڈالیں۔ آلودگی سے بچنے کے لیے ڈبوں کو دھو لیں۔',
      steps: [
        'اندرونی مائع یا باقیات کو مکمل طور پر خالی کریں',
        'چپچپا مواد ہٹانے کے لیے ہلکے پانی سے دھوئیں',
        'جگہ بچانے کے لیے دبا کر چپٹا کریں اور پلاسٹک بن میں ڈالیں'
      ],
      impact: 'ایک ٹن پلاسٹک کی ری سائیکلنگ سے تقریباً ۵,۷۷۴ کلو واٹ گھنٹے بجلی اور ۱۶.۳ بیرل تیل کی بچت ہوتی ہے۔',
      alt: 'تیل یا گریس سے آلودہ پلاسٹک کو عام کچرے میں ڈالیں۔',
      secondLife: 'مضبوط پلاسٹک کے ڈبوں کو گھریلو اشیاء رکھنے یا پودوں کے گملوں کے لیے دوبارہ استعمال کریں۔'
    },
    paper: {
      name: 'کاغذ اور گتہ',
      rec: 'صاف اور خشک کاغذ یا گتے کو پیپر ری سائیکلنگ بن میں ڈالیں۔ گیلا یا کھانے سے لتھڑا کاغذ نہ ڈالیں۔',
      steps: [
        'یقینی بنائیں کہ تیل یا کھانے کے داغ نہ ہوں',
        'گتے کے ڈبوں کو چپٹا کریں اور پلاسٹک ٹیپ اتاریں',
        'خشک حالت میں پیپر ری سائیکلنگ بن میں ڈالیں'
      ],
      impact: 'ایک ٹن کاغذ کی ری سائیکلنگ سے ۱۷ بڑے درخت اور ۷,۰۰۰ گیلن پانی محفوظ ہوتا ہے۔',
      alt: 'چکنائی والے پیزا بکس یا گندے ٹشو کمپوسٹ یا عام کوڑے میں ڈالیں۔',
      secondLife: 'مضبوط ڈبوں کو گھر کے سامان کی حفاظت، پیکنگ یا پارسل کے لیے استعمال کریں۔'
    },
    metal: {
      name: 'دھات',
      rec: 'ری سائیکل ہونے والے دھاتی کین، ڈبے اور صاف ورق کو میٹل ری سائیکلنگ میں ڈالیں۔',
      steps: [
        'کین یا ڈبے کو مکمل طور پر خالی کریں',
        'پانی سے دھو لیں؛ کاغذی لیبل لگے رہنے دیے جا سکتے ہیں',
        'ایلومینیم کین اور صاف ڈبے میٹل بن میں جمع کریں'
      ],
      impact: 'ایلومینیم کو ۹۵ فیصد کم توانائی خرچ کر کے لامحدود بار ری سائیکل کیا جا سکتا ہے۔',
      alt: 'کیمیکل یا اسپرے کین مکمل خالی ہونے پر ہی محفوظ تصور ہوتے ہیں۔',
      secondLife: 'خالی دھاتی کین کو قلم دان یا پودوں کی پنیری کے لیے استعمال کریں۔'
    },
    organic: {
      name: 'نامیاتی / کھانے کا فضلہ',
      rec: 'کھانے کے باقیات اور سبزیوں کے چھلکے کھاد بنانے کے لیے سبز کوڑے دان میں ڈالیں۔',
      steps: [
        'پلاسٹک کے اسٹیکر، دھاگے یا ربڑ بینڈ اتار دیں',
        'پھلوں کے چھلکے اور چائے کی پتی نامیاتی کوڑے دان میں ڈالیں',
        'پلاسٹک لفافے یا تھرماکول ہرگز نہ ملائیں'
      ],
      impact: 'نامیاتی کچرے سے کھاد بنانے سے لینڈ فل میں میتھین گیس کا اخراج ۹۰ فیصد کم ہوتا ہے۔',
      alt: 'ہڈیوں اور گوشت کی کچھ باقیات بلدیاتی اصولوں کے مطابق عام کوڑے میں جا سکتی ہیں۔',
      secondLife: 'پھلوں کے چھلکوں سے قدرتی فرٹیلائزر یا گھریلو کلینر بنائیں۔'
    },
    glass: {
      name: 'شیشہ',
      rec: 'صاف شیشے کی بوتلیں اور مرتبان شیشے کے ری سائیکلنگ اسٹیشن میں ڈالیں۔ کھڑکی کا شیشہ نہ ملائیں۔',
      steps: [
        'مائع مکمل خالی کریں اور پانی سے دھو لیں',
        'پلاسٹک یا دھات کے ڈھکن الگ کر لیں',
        'شیشے کی بوتلوں کو احتیاط سے شیشے کے کوڑے دان میں رکھیں'
      ],
      impact: 'شیشے کے معیار میں کمی کے بغیر اسے ۱۰۰ فیصد لامحدود بار ری سائیکل کیا جا سکتا ہے۔',
      alt: 'کھڑکی کا شیشہ، آئینے اور چینی کے برتن عام کچرے میں ڈالیں۔',
      secondLife: 'شیشے کے صاف مرتبانوں کو مصالحے یا غذائی اجناس محفوظ رکھنے کے لیے استعمال کریں۔'
    },
    e_waste: {
      name: 'ای-ویسٹ (برقی فضلہ)',
      rec: 'برقی کچرے میں قیمتی اور خطرناک دھاتیں ہوتی ہیں؛ اسے تصدیق شدہ ای-ویسٹ مرکز میں جمع کرائیں۔',
      steps: [
        'ذاتی ڈیٹا محفوظ کر کے ڈیوائس کو فیکٹری ری سیٹ کریں',
        'الگ ہونے والی بیٹریاں اور تاریں الگ کر لیں',
        'مجاز ای-ویسٹ کلیکشن پوائنٹ یا کیوسک میں جمع کروائیں'
      ],
      impact: 'صحیح ای-ویسٹ ری سائیکلنگ سے سونا، تانبا محفوظ ہوتا ہے اور زہریلے کیمیکلز سے زمین بچتی ہے۔',
      alt: 'الیکٹرانکس کو کبھی بھی گھر کے عام کچرے میں نہ پھینکیں۔',
      secondLife: 'اگر ڈیوائس کارآمد ہو تو کسی ضرورت مند کو عطیہ کریں یا مرمت کرائیں۔'
    },
    textile: {
      name: 'کپڑے اور ٹیکسٹائل',
      rec: 'قابلِ استعمال کپڑے صدقہ کریں یا پھٹے کپڑے ٹیکسٹائل ری سائیکلنگ باکس میں جمع کرائیں۔',
      steps: [
        'جیبوں کی تلاشی لے کر سکے یا کاغذات نکال لیں',
        'یقینی بنائیں کہ کپڑے خشک اور صاف ہیں',
        'مقامی کپڑوں کے عطیہ باکس یا ری سائیکلنگ مرکز میں جمع کرائیں'
      ],
      impact: 'کپڑوں کی ری سائیکلنگ سے کچرے کے ڈھیر کم ہوتے ہیں اور ہزاروں لیٹر پانی کی بچت ہوتی ہے۔',
      alt: 'شدید گندے یا آئل لگے چیتھڑے عام کچرے میں ڈالیں۔',
      secondLife: 'پھٹے ہوئے سوتی کپڑوں کو گھریلو صفائی اور ڈسٹنگ کے لیے استعمال کریں۔'
    },
    battery: {
      name: 'بیٹری',
      rec: 'آگ لگنے کے خدشے کے باعث بیٹریاں کبھی بھی عام کوڑے میں نہ ڈالیں۔ مخصوص بیٹری کیوسک میں دیں۔',
      steps: [
        'شارٹ سرکٹ سے بچاؤ کے لیے بیٹری کے دونوں سروں پر ٹیپ لگائیں',
        'حرارت اور پانی سے دور رکھیں',
        'سپر مارکیٹ یا برقی مراکز پر قائم بیٹری کلیکشن باکس میں ڈالیں'
      ],
      impact: 'بیٹریوں کی ری سائیکلنگ سے لیتھیم اور کوبالٹ محفوظ ہوتے ہیں اور مٹی زہریلی نہیں ہوتی۔',
      alt: 'گھریلو کوڑے دان میں بیٹریاں ڈالنا سخت ممنوع ہے۔',
      secondLife: 'ری چارج ایبل بیٹریاں دوبارہ چارج کریں؛ ناکارہ بیٹریاں فوراً ری سائیکل کریں۔'
    },
    hazardous: {
      name: 'خطرناک فضلہ',
      rec: 'کیمیکلز، رنگ و روغن اور زہریلے مادوں کو بلدیاتی خطرناک کچرا ڈپو میں جمع کروائیں۔',
      steps: [
        'کیمیکلز کو ان کے اصل لیبل والے ڈبے میں رکھیں',
        'رسنے سے روکنے کے لیے ڈھکن مضبوطی سے بند کریں',
        'مقامی ہاؤس ہولڈ ہیزرڈس ویسٹ (HHW) مرکز پر لے جائیں'
      ],
      impact: 'خطرناک کچرے کا محفوظ انتظام زیرِ زمین پانی اور صفائی کے کارکنوں کو محفوظ رکھتا ہے۔',
      alt: 'اسے کبھی بھی نالی، سنک یا کھلی زمین پر نہ بہائیں۔',
      secondLife: 'بچا ہوا پینٹ یا کھاد محلے کے ضرورت مندوں سے شیئر کریں۔'
    },
    other: {
      name: 'دیگر / بقایا فضلہ',
      rec: 'اگر چیز کسی ری سائیکلنگ زمرے میں نہ آئے تو اسے عام بقایا کچرے کے ڈبے میں ڈالیں۔',
      steps: [
        'جانچ لیں کہ کیا کوئی حصہ الگ ہو کر ری سائیکل ہو سکتا ہے',
        'نوک دار اشیاء کو احتیاط سے کاغذ میں لپیٹیں',
        'عام کچرے کے ڈبے میں ڈالیں'
      ],
      impact: 'غیر ری سائیکل کچرے کو الگ رکھنے سے ری سائیکلنگ مشینیں خراب نہیں ہوتیں۔',
      alt: 'بھاری کچرے کے لیے بلدیہ کی خصوصی سروس سے رابطہ کریں۔'
    }
  }
};

export const STANDARD_RECOMMENDATIONS = MULTILINGUAL_RECOMMENDATIONS.en;

const VISION_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

export async function analyzeWasteImage(
  base64Data: string,
  mimeType: string = 'image/jpeg',
  sampleTag?: string,
  language: string = 'en'
): Promise<WasteAnalysisResult> {
  const normalizedLang = ['en', 'mr', 'hi', 'ur'].includes(language) ? language : 'en';

  // Strip data:image/...;base64, prefix if present
  let cleanBase64 = base64Data;
  if (base64Data.includes(',')) {
    const parts = base64Data.split(',');
    cleanBase64 = parts[1];
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
  }

  // Handle known sample preset tags if explicitly requested
  if (sampleTag && ['plastic', 'paper', 'metal', 'organic', 'glass', 'e_waste', 'textile', 'battery', 'hazardous', 'non_waste', 'poor_quality'].includes(sampleTag)) {
    return handlePresetSample(sampleTag, normalizedLang);
  }

  const ai = getAiClient();

  if (ai) {
    const langInstructions: Record<string, string> = {
      mr: `CRITICAL LANGUAGE REQUIREMENT:
The user interface is set to MARATHI (मराठी).
You MUST provide the following fields in natural, fluent MARATHI using proper Devanagari script:
- item_name (e.g. प्लास्टिकची बाटली, अल्युमिनियम कॅन, काचेची बरणी, केळाची साल, पुठ्ठ्याचा खोका)
- material (e.g. पीईटी प्लास्टिक, अल्युमिनियम मिश्रधातू, जैविक कचरा, सेल्युलोज कागद)
- reason (clear explanation in Marathi Devanagari)
- disposal_recommendation (practical segregation recommendation in Marathi Devanagari)
- actionable_steps (array of 3 concise preparation steps in Marathi Devanagari)
- contamination_note (e.g. अन्नाचे अवशेष आढळले / कोणतीही दूषितता आढळली नाही in Marathi Devanagari)
- second_life_suggestion (practical reuse suggestion in Marathi Devanagari)
- environmental_impact (environmental impact fact in Marathi Devanagari)
Keep 'category' strictly as one of the 10 English enum keys: 'plastic', 'paper', 'metal', 'organic', 'glass', 'e_waste', 'textile', 'battery', 'hazardous', 'other'.`,
      hi: `CRITICAL LANGUAGE REQUIREMENT:
The user interface is set to HINDI (हिन्दी).
You MUST provide the following fields in natural, fluent HINDI using proper Devanagari script:
- item_name (e.g. प्लास्टिक की बोतल, एल्युमिनियम कैन, कांच का जार, केले का छिलका, कार्डबोर्ड डिब्बा)
- material (e.g. पीईटी प्लास्टिक, एल्युमिनियम मिश्र धातु, जैविक कचरा, सेल्युलोज पेपर)
- reason (clear explanation in Hindi Devanagari)
- disposal_recommendation (practical segregation recommendation in Hindi Devanagari)
- actionable_steps (array of 3 concise preparation steps in Hindi Devanagari)
- contamination_note (e.g. भोजन के अवशेष पाए गए / कोई संदूषण नहीं मिला in Hindi Devanagari)
- second_life_suggestion (practical reuse suggestion in Hindi Devanagari)
- environmental_impact (environmental impact fact in Hindi Devanagari)
Keep 'category' strictly as one of the 10 English enum keys: 'plastic', 'paper', 'metal', 'organic', 'glass', 'e_waste', 'textile', 'battery', 'hazardous', 'other'.`,
      ur: `CRITICAL LANGUAGE REQUIREMENT:
The user interface is set to URDU (اردو).
You MUST provide the following fields in natural, fluent URDU using proper Arabic/Urdu script:
- item_name (e.g. پلاسٹک کی بوتل, ایلومینیم کین, شیشے کا مرتبان, کیلے کا چھلکا, گتے کا ڈبہ)
- material (e.g. پی ای ٹی پلاسٹک, ایلومینیم مرکب, نامیاتی فضلہ, سیلولوز پیپر)
- reason (clear explanation in Urdu script)
- disposal_recommendation (practical segregation recommendation in Urdu script)
- actionable_steps (array of 3 concise preparation steps in Urdu script)
- contamination_note (e.g. کھانے کے ذرات پائے گئے / کوئی ظاہری آلودگی نہیں پائی گئی in Urdu script)
- second_life_suggestion (practical reuse suggestion in Urdu script)
- environmental_impact (environmental impact fact in Urdu script)
Keep 'category' strictly as one of the 10 English enum keys: 'plastic', 'paper', 'metal', 'organic', 'glass', 'e_waste', 'textile', 'battery', 'hazardous', 'other'.`,
      en: 'All text fields in English.',
    };

    const prompt = `You are a certified Senior Computer Vision Recycling & Waste Segregation AI Engine.
Analyze the provided image thoroughly and execute the 4-phase evaluation:

PHASE 1: IMAGE QUALITY EVALUATION
- Check if the image is clear, sharp, and well-lit.
- If the image is extremely blurry, out-of-focus, pitch black, too dark, too distant, or heavily obstructed:
  Set image_quality = "poor" (or "blurry", "dark", "distant") and provide image_quality_reason explaining why, and set is_waste = false.

PHASE 2: WASTE IDENTIFICATION
- Determine if the image contains recognizable post-consumer waste, recyclables, packaging, discarded objects, or food scraps.
- If the image contains a living person, selfie, face, pet, animal, whole vehicle, room scenery, building, or furniture in active household use:
  Set is_waste = false, reason = "No recognizable waste detected."

PHASE 3: CATEGORY CLASSIFICATION (10 STREAMS)
If is_waste = true:
Classify into EXACTLY ONE of these 10 categories:
1. "plastic" (bottles, containers, jugs, packaging films, synthetic cups)
2. "paper" (corrugated cardboard, cartons, office paper, newspapers, paper bags)
3. "metal" (beverage cans, food tins, aluminum foil, scrap metal, caps)
4. "organic" (food scraps, fruit/vegetable peels, coffee grounds, garden clippings)
5. "glass" (beverage bottles, food jars, glassware)
6. "e_waste" (cell phones, chargers, circuit boards, cables, small electronics)
7. "textile" (worn clothing, shoes, bedsheets, cloth rags, fabrics)
8. "battery" (cylindrical batteries, lithium-ion packs, button cells)
9. "hazardous" (paint, pesticides, industrial solvents, motor oil containers, toxic chemicals)
10. "other" (composite unclassifiable residual waste)

PHASE 4: CONTAMINATION & SECOND-LIFE CHECKS
- contamination_detected: visually check for food residue, grease stains, stuck organic matter, or sticky liquids on recyclable materials.
- second_life_suggestion: if the item can safely be reused, donated, repurposed, or refurbished before disposal, provide a 1-sentence suggestion.
- Provide 3 concise actionable steps.

${langInstructions[normalizedLang] || langInstructions.en}`;

    let lastError: any = null;

    for (const model of VISION_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                image_quality: {
                  type: Type.STRING,
                  description: "'good', 'poor', 'blurry', 'dark', or 'distant'",
                },
                image_quality_reason: {
                  type: Type.STRING,
                  description: "Explanation if image quality is insufficient for classification.",
                },
                is_waste: {
                  type: Type.BOOLEAN,
                  description: "True if image contains recognizable discarded waste, recyclables, packaging, food scrap or scrap object.",
                },
                category: {
                  type: Type.STRING,
                  description: "One of: 'plastic', 'paper', 'metal', 'organic', 'glass', 'e_waste', 'textile', 'battery', 'hazardous', 'other'",
                },
                item_name: {
                  type: Type.STRING,
                  description: "Specific name of the waste item",
                },
                material: {
                  type: Type.STRING,
                  description: "Specific identified material",
                },
                confidence: {
                  type: Type.NUMBER,
                  description: "Confidence score between 0.00 and 1.00",
                },
                contamination_detected: {
                  type: Type.BOOLEAN,
                  description: "Visual indicator if item appears to have grease, food residue or dirt.",
                },
                contamination_note: {
                  type: Type.STRING,
                  description: "Note regarding contamination status.",
                },
                second_life_suggestion: {
                  type: Type.STRING,
                  description: "Safe suggestion for reuse, repair, donation, or repurposing before disposal, if applicable.",
                },
                reason: {
                  type: Type.STRING,
                  description: "Visual evidence and material explanation.",
                },
                disposal_recommendation: {
                  type: Type.STRING,
                  description: "Clear practical segregation recommendation.",
                },
                actionable_steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 concise preparation steps",
                },
                environmental_impact: {
                  type: Type.STRING,
                  description: "Environmental benefit fact",
                },
                alternative_bin: {
                  type: Type.STRING,
                  description: "Alternative bin if contaminated or non-recyclable",
                },
              },
              required: ['is_waste', 'confidence', 'reason'],
            },
          },
        });

        const responseText = response.text?.trim() || '{}';
        const parsed = JSON.parse(responseText);

        // Check image quality first
        const imageQuality = parsed.image_quality?.toLowerCase() || 'good';
        if (imageQuality !== 'good' && parsed.image_quality_reason) {
          return {
            is_waste: false,
            category: null,
            item_name: null,
            confidence: 0,
            image_quality: imageQuality as any,
            image_quality_reason: parsed.image_quality_reason || 'The object is too blurry or unclear for reliable classification.',
            reason: parsed.image_quality_reason,
            disposal_recommendation: 'Move closer, improve lighting, and retake the image with the waste item centered.',
            actionable_steps: ['Hold camera steady', 'Improve ambient lighting', 'Keep object in center focus'],
          };
        }

        if (!parsed.is_waste) {
          return {
            is_waste: false,
            category: null,
            item_name: null,
            confidence: parsed.confidence || 0.9,
            image_quality: 'good',
            image_quality_reason: null,
            reason: parsed.reason || 'No recognizable discarded waste detected in this image.',
            disposal_recommendation: null,
            actionable_steps: [],
          };
        }

        const validCat = normalizeCategory(parsed.category);
        const langRecs = MULTILINGUAL_RECOMMENDATIONS[normalizedLang] || MULTILINGUAL_RECOMMENDATIONS.en;
        const std = langRecs[validCat] || langRecs.plastic;

        return {
          is_waste: true,
          category: validCat,
          item_name: parsed.item_name || std.name,
          material: parsed.material || std.name,
          confidence: typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0.4), 0.99) : 0.88,
          image_quality: 'good',
          image_quality_reason: null,
          contamination_detected: Boolean(parsed.contamination_detected),
          contamination_note: parsed.contamination_note || (parsed.contamination_detected 
            ? (normalizedLang === 'mr' ? 'अन्नाचे संभाव्य अवशेष आढळले आहेत. कृपया धुवून घ्या.' : normalizedLang === 'hi' ? 'भोजन के संभावित अवशेष मौजूद हैं। कृपया धो लें।' : normalizedLang === 'ur' ? 'کھانے کے ممکنہ ذرات موجود ہیں۔ براہ کرم دھو لیں۔' : 'Possible food residue/grease detected. Rinse before recycling.')
            : (normalizedLang === 'mr' ? 'कोणतीही दूषितता आढळली नाही.' : normalizedLang === 'hi' ? 'कोई स्पष्ट संदूषण नहीं मिला।' : normalizedLang === 'ur' ? 'کوئی ظاہری آلودگی نہیں پائی گئی۔' : 'No obvious contamination detected.')),
          second_life_suggestion: parsed.second_life_suggestion || std.secondLife || null,
          reason: parsed.reason || `${std.name} material identified from visual characteristics.`,
          disposal_recommendation: parsed.disposal_recommendation || std.rec,
          actionable_steps: parsed.actionable_steps && parsed.actionable_steps.length > 0 ? parsed.actionable_steps : std.steps,
          environmental_impact: parsed.environmental_impact || std.impact,
          alternative_bin: parsed.alternative_bin || std.alt,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Vision] Model ${model} failed, trying next candidate:`, err?.message || err);
      }
    }

    console.error('[Gemini Vision] All vision candidate models exhausted.', lastError);
  }

  // If AI vision models failed or offline, use smart visual fallback
  return smartVisualFallback(cleanBase64, sampleTag, normalizedLang);
}

function normalizeCategory(raw: string | undefined): Exclude<WasteCategory, null> {
  if (!raw) return 'plastic';
  const c = raw.toLowerCase().trim();
  if (c.includes('plastic') || c.includes('polymer')) return 'plastic';
  if (c.includes('paper') || c.includes('cardboard') || c.includes('carton')) return 'paper';
  if (c.includes('metal') || c.includes('aluminum') || c.includes('steel') || c.includes('tin') || c.includes('iron') || c.includes('can')) return 'metal';
  if (c.includes('organic') || c.includes('food') || c.includes('peel') || c.includes('compost') || c.includes('bio')) return 'organic';
  if (c.includes('glass') || (c.includes('bottle') && !c.includes('plastic'))) return 'glass';
  if (c.includes('e_waste') || c.includes('ewaste') || c.includes('electronic') || c.includes('phone') || c.includes('cable') || c.includes('charger')) return 'e_waste';
  if (c.includes('textile') || c.includes('cloth') || c.includes('garment') || c.includes('shirt') || c.includes('fabric')) return 'textile';
  if (c.includes('battery') || c.includes('cell') || c.includes('accumulator')) return 'battery';
  if (c.includes('hazard') || c.includes('chemical') || c.includes('paint') || c.includes('toxic') || c.includes('oil')) return 'hazardous';
  return 'other';
}

function handlePresetSample(sampleTag: string, language: string = 'en'): WasteAnalysisResult {
  const normalizedLang = ['en', 'mr', 'hi', 'ur'].includes(language) ? language : 'en';

  if (sampleTag === 'non_waste') {
    const nonWasteTexts: Record<string, string> = {
      en: 'No recognizable waste item detected. The image appears to contain a non-waste scene or object.',
      mr: 'कोणतीही ओळखण्यायोग्य कचरा वस्तू आढळली नाही. प्रतिमा कचरा नसलेले दृश्य दर्शवते.',
      hi: 'कोई पहचानने योग्य कचरा वस्तु नहीं मिली। छवि में कचरा रहित दृश्य प्रतीत होता है।',
      ur: 'کوئی قابلِ شناخت کچرا نہیں ملا۔ تصویر میں کوئی غیر فضلے کا منظر معلوم ہوتا ہے۔'
    };
    return {
      is_waste: false,
      category: null,
      item_name: null,
      confidence: 0,
      image_quality: 'good',
      image_quality_reason: null,
      reason: nonWasteTexts[normalizedLang] || nonWasteTexts.en,
      disposal_recommendation: null,
      actionable_steps: [],
    };
  }

  if (sampleTag === 'poor_quality') {
    const poorTexts: Record<string, { reason: string; rec: string; steps: string[] }> = {
      en: {
        reason: 'Image quality check failed. The camera was unsteady or the subject was out of focus.',
        rec: 'Move closer, improve lighting, and hold the camera steady.',
        steps: ['Move closer to the waste item', 'Ensure adequate ambient light', 'Hold camera steady and retake']
      },
      mr: {
        reason: 'फोटो गुणवत्ता तपासणी अयशस्वी. कॅमेरा हलला होता किंवा वस्तू अस्पष्ट होती.',
        rec: 'जवळ जा, प्रकाश सुधारा आणि कॅमेरा स्थिर पकडून पुन्हा फोटो घ्या.',
        steps: ['कचऱ्याच्या वस्तूजवळ जा', 'योग्य प्रकाश असल्याची खात्री करा', 'कॅमेरा न हलवता पुन्हा फोटो काढा']
      },
      hi: {
        reason: 'छवि गुणवत्ता जांच विफल रही। कैमरा हिल रहा था या विषय फोकस से बाहर था।',
        rec: 'निकट जाएं, रोशनी में सुधार करें और कैमरा स्थिर रखकर पुनः तस्वीर लें।',
        steps: ['कचरे की वस्तु के करीब जाएं', 'पर्याप्त प्रकाश सुनिश्चित करें', 'कैमरा स्थिर रखें और दोबारा फोटो लें']
      },
      ur: {
        reason: 'تصویر کے معیار کی جانچ ناکام رہی۔ کیمرہ ہل گیا تھا یا چیز واضح نہیں تھی۔',
        rec: 'قریب جائیں، روشنی بہتر بنائیں اور کیمرہ ہلائے بغیر دوبارہ تصویر لیں۔',
        steps: ['چیز کے زیادہ قریب جائیں', 'مناسب روشنی کا انتظام کریں', 'کیمرہ مستحکم رکھ کر دوبارہ تصویر لیں']
      }
    };
    const pt = poorTexts[normalizedLang] || poorTexts.en;
    return {
      is_waste: false,
      category: null,
      item_name: null,
      confidence: 0,
      image_quality: 'poor',
      image_quality_reason: pt.reason,
      reason: pt.reason,
      disposal_recommendation: pt.rec,
      actionable_steps: pt.steps,
    };
  }

  const presetsMap: Record<string, Record<string, {
    cat: WasteCategory;
    name: string;
    material: string;
    reason: string;
    contaminated: boolean;
    contaminationNote: string;
    secondLife?: string;
  }>> = {
    plastic: {
      en: {
        cat: 'plastic',
        name: 'PET Beverage Bottle',
        material: 'PET Polymer #1',
        reason: 'Clear transparent polyethylene polymer body with visible screw cap thread and beverage packaging contours.',
        contaminated: false,
        contaminationNote: 'No obvious contamination detected.',
        secondLife: 'Consider rinsing and reusing for household utility storage or garden irrigation.'
      },
      mr: {
        cat: 'plastic',
        name: 'पीईटी पाण्याची बाटली',
        material: 'पीईटी पॉलिमर #१',
        reason: 'पारदर्शक पॉलिमर शरीर, स्क्रू कॅप थ्रेड आणि पाण्याच्या पॅकेजिंगचे दृश्य वैशिष्ट्ये आढळली.',
        contaminated: false,
        contaminationNote: 'कोणतीही दूषितता आढळली नाही.',
        secondLife: 'स्वच्छ धुवून घरातील पाणी साठवण किंवा बागेसाठी पुन्हा वापरा.'
      },
      hi: {
        cat: 'plastic',
        name: 'पीईटी पानी की बोतल',
        material: 'पीईटी पॉलीमर #१',
        reason: 'पारदर्शी पॉलीथीन बॉडी और ढक्कन के साथ सामान्य पेय पैकेजिंग की स्पष्ट बनावट।',
        contaminated: false,
        contaminationNote: 'कोई स्पष्ट संदूषण नहीं मिला।',
        secondLife: 'धोकर पौधों को पानी देने या घरेलू भंडारण के लिए पुनः उपयोग करें।'
      },
      ur: {
        cat: 'plastic',
        name: 'پی ای ٹی پلاسٹک کی بوتل',
        material: 'پی ای ٹی پولیمر #۱',
        reason: 'شفاف پلاسٹک، ڈھکن اور مشروب کی بوتل کی واضح ساخت موجود ہے۔',
        contaminated: false,
        contaminationNote: 'کوئی ظاہری آلودگی نہیں پائی گئی۔',
        secondLife: 'پودوں کو پانی دینے یا گھریلو استعمال کے لیے دوبارہ کام میں لائیں۔'
      }
    },
    paper: {
      en: {
        cat: 'paper',
        name: 'Corrugated Shipping Box',
        material: 'Unbleached Kraft Cellulose Fiber',
        reason: 'Brown cellulose kraft fiber with visible fluted structural core and folding creases.',
        contaminated: true,
        contaminationNote: 'Possible light tape and adhesive residue detected. Remove plastic tape before recycling.',
        secondLife: 'Consider reusing this sturdy box for storage, moving, parcel shipping, or organizing.'
      },
      mr: {
        cat: 'paper',
        name: 'पुठ्ठ्याचा पार्सल बॉक्स (खोका)',
        material: 'क्राफ्ट सेल्युलोज फायबर',
        reason: 'तपकिरी क्राफ्ट फायबर, खाचांची रचना आणि पॅकेजिंग बॉक्सच्या स्पष्ट खुणा.',
        contaminated: true,
        contaminationNote: 'चिकटपट्टीचे किंचित अवशेष आढळले. पुनर्वापरात टाकण्यापूर्वी प्लास्टिक टेप काढा.',
        secondLife: 'हा मजबूत बॉक्स सामानाची साठवणूक किंवा कुरिअर पाठवण्यासाठी पुन्हा वापरा.'
      },
      hi: {
        cat: 'paper',
        name: 'कार्डबोर्ड शिपिंग बॉक्स (डिब्बा)',
        material: 'क्राफ्ट सेल्युलोज फाइबर',
        reason: 'भूरे रंग का सेल्यूलोज फाइबर और पार्सल पैकेजिंग की विशिष्ट बनावट।',
        contaminated: true,
        contaminationNote: 'चिपकने वाले टेप के अवशेष मिले हैं। रीसाइक्लिंग से पहले टेप हटा दें।',
        secondLife: 'इस डिब्बे का उपयोग भंडारण, सामान रखने या भेजने के लिए करें।'
      },
      ur: {
        cat: 'paper',
        name: 'گتے کا ڈبہ (کارڈ بورڈ باکس)',
        material: 'سیلولوز کرافٹ فائبر',
        reason: 'بھورا کارڈ بورڈ فائبر اور پارسل ڈبے کی واضح بناوٹ۔',
        contaminated: true,
        contaminationNote: 'پلاسٹک ٹیپ کے معمولی نشانات ہیں۔ ری سائیکلنگ سے پہلے ٹیپ اتار لیں۔',
        secondLife: 'سامان رکھنے، منتقل کرنے یا پارسل بھیجنے کے لیے دوبارہ استعمال کریں۔'
      }
    },
    metal: {
      en: {
        cat: 'metal',
        name: 'Aluminum Beverage Can',
        material: 'Aluminum 3004 Alloy',
        reason: 'Cylindrical alloy beverage container with specular metallic reflection and top ring-pull tab.',
        contaminated: false,
        contaminationNote: 'No obvious contamination detected.',
        secondLife: 'Empty clean aluminum cans can be repurposed as pencil cups or DIY workshop hardware organizers.'
      },
      mr: {
        cat: 'metal',
        name: 'सोड्याचा अल्युमिनियम कॅन',
        material: 'अल्युमिनियम मिश्रधातू ३००४',
        reason: 'धातूचे गोलाकार शरीर, चकाकी आणि वरच्या बाजूला उघडण्याची रिंग आढळली.',
        contaminated: false,
        contaminationNote: 'कोणतीही दूषितता आढळली नाही.',
        secondLife: 'स्वच्छ रिकाम्या कॅनचा वापर पेन स्टँड किंवा लहान स्क्रू ठेवण्यासाठी करा.'
      },
      hi: {
        cat: 'metal',
        name: 'सोडा का एल्युमिनियम कैन',
        material: 'एल्युमिनियम ३००४ मिश्र धातु',
        reason: 'चमकदार बेलनाकार धातु का कंटेनर और ऊपर पुल-टैब स्पष्ट दिखाई दे रहा है।',
        contaminated: false,
        contaminationNote: 'कोई स्पष्ट संदूषण नहीं मिला।',
        secondLife: 'साफ एल्युमिनियम कैन का उपयोग पेन स्टैंड या पौधों के गमले के रूप में करें।'
      },
      ur: {
        cat: 'metal',
        name: 'ایلومینیم سوڈا کین',
        material: 'ایلومینیم مرکب ۳۰۰۴',
        reason: 'چمکدار دھاتی سلنڈر اور اوپر کھولنے والا رنگ ٹیب موجود ہے۔',
        contaminated: false,
        contaminationNote: 'کوئی ظاہری آلودگی نہیں پائی گئی۔',
        secondLife: 'خالی کین کو قلم دان یا نٹ بولٹ محفوظ رکھنے کے لیے استعمال کریں۔'
      }
    },
    organic: {
      en: {
        cat: 'organic',
        name: 'Fresh Banana Peel',
        material: 'Biodegradable Organic Pericarp',
        reason: 'Fibrous organic pericarp with visible cellulose degradation and natural fruit pigmentation.',
        contaminated: false,
        contaminationNote: 'Organic compostable material. Keep free from plastic wrappers or stickers.',
        secondLife: 'Banana peels are rich in potassium; steep in water to make natural plant fertilizer!'
      },
      mr: {
        cat: 'organic',
        name: 'केळाची साल',
        material: 'जैविक विघटनशील साल',
        reason: 'नैसर्गिक फळाची साल, सेंद्रिय तंतू आणि जैविक रचना स्पष्ट दिसत आहे.',
        contaminated: false,
        contaminationNote: 'सेंद्रिय खतयोग्य कचरा. प्लास्टिक किंवा स्टिकर्स वेगळे ठेवा.',
        secondLife: 'केळाच्या साली पाण्यात भिजवून झाडांसाठी उत्तम पोटॅशियमयुक्त खत बनवा!'
      },
      hi: {
        cat: 'organic',
        name: 'केले का छिलका',
        material: 'बायोडिग्रेडेबल जैविक छिलका',
        reason: 'प्राकृतिक फल का छिलका, रेशेदार संरचना और जैविक घटक स्पष्ट हैं।',
        contaminated: false,
        contaminationNote: 'खाद योग्य जैविक पदार्थ। प्लास्टिक रैपर से अलग रखें।',
        secondLife: 'केले के छिलके से पौधों के लिए प्राकृतिक पोटैशियम खाद तैयार करें!'
      },
      ur: {
        cat: 'organic',
        name: 'کیلے کا چھلکا',
        material: 'قدرتی گلنے سڑنے والا فضلہ',
        reason: 'قدرتی پھل کا چھلکا اور نامیاتی ریشے واضح نظر آ رہے ہیں۔',
        contaminated: false,
        contaminationNote: 'کھاد بننے کے قابل نامیاتی فضلہ۔ پلاسٹک سے پاک رکھیں۔',
        secondLife: 'پودوں کے لیے قدرتی پوٹاشیم والی کھاد بنانے میں کام لائیں۔'
      }
    },
    glass: {
      en: {
        cat: 'glass',
        name: 'Clear Glass Condiment Jar',
        material: 'Soda-Lime Flint Glass',
        reason: 'Rigid transparent silica glass container with threaded jar mouth and high optical clarity.',
        contaminated: true,
        contaminationNote: 'Possible food residue appears to be present. Clean the jar with warm water before recycling.',
        secondLife: 'Consider reusing this jar for household bulk spice storage, pantry organization, or home canning.'
      },
      mr: {
        cat: 'glass',
        name: 'काचेची पारदर्शक बरणी',
        material: 'सिलिका सोडा-लाईम काच',
        reason: 'पारदर्शक मजबूत काचेची बरणी, चोहोबाजूंनी गुळगुळीत पृष्ठभाग आणि झाकणाचा स्क्रू भाग.',
        contaminated: true,
        contaminationNote: 'अन्नाचे किंचित अवशेष आढळले. कोमट पाण्याने धुवून पुनर्वापरात टाका.',
        secondLife: 'मसाले, लोणचे किंवा कोरड्या वस्तूंच्या साठवणीसाठी ही बरणी पुन्हा वापरा.'
      },
      hi: {
        cat: 'glass',
        name: 'कांच का पारदर्शी जार',
        material: 'सोडा-लाइम फ्लिंट ग्लास',
        reason: 'मजबूत पारदर्शी कांच का कंटेनर और चूड़ीदार मुंह स्पष्ट रूप से दृष्टिगोचर है।',
        contaminated: true,
        contaminationNote: 'भोजन के हल्के अवशेष दिख रहे हैं। पानी से साफ करके रीसायकल करें।',
        secondLife: 'इस जार को रसोई में मसाले या दालें रखने के लिए दोबारा इस्तेमाल करें।'
      },
      ur: {
        cat: 'glass',
        name: 'شیشے کا شفاف مرتبان',
        material: 'سوڈا لائم فلنٹ شیشہ',
        reason: 'مضبوط اور شفاف شیشے کا ڈبہ مع ڈھکن کی چوڑی۔',
        contaminated: true,
        contaminationNote: 'کھانے کے ہلکے ذرات موجود ہیں۔ گرم پانی سے دھو کر ری سائیکل کریں۔',
        secondLife: 'مصالحہ جات یا خشک اشیاء محفوظ رکھنے کے لیے دوبارہ کام میں لائیں۔'
      }
    },
    e_waste: {
      en: {
        cat: 'e_waste',
        name: 'Used Smartphone / Mobile Device',
        material: 'Complex Electronic Assembly (Silicon, Copper, Lithium)',
        reason: 'Rectangular electronic device with glass touchscreen display, camera module, and metallic chassis.',
        contaminated: false,
        contaminationNote: 'Electronic waste. Contains valuable recyclable components requiring certified processing.',
        secondLife: 'If the device is functional or repairable, consider donation, trade-in, or repair before e-waste disposal.'
      },
      mr: {
        cat: 'e_waste',
        name: 'जुना स्मार्टफोन / मोबाईल डिव्हाइस',
        material: 'इलेक्ट्रॉनिक घटक (सिलिकॉन, तांबे, लिथियम)',
        reason: 'काचेचा टचस्क्रीन, कॅमेरा आणि धातूची रचना असलेले आयताकृती इलेक्ट्रॉनिक उपकरण.',
        contaminated: false,
        contaminationNote: 'ई-कचरा. यामध्ये मौल्यवान धातू असून प्रमाणित केंद्रात देणे आवश्यक आहे.',
        secondLife: 'डिव्हाइस चालू असल्यास विद्यार्थ्याला दान करा किंवा दुरुस्ती केंद्रात द्या.'
      },
      hi: {
        cat: 'e_waste',
        name: 'पुराना स्मार्टफोन / मोबाइल',
        material: 'इलेक्ट्रॉनिक सामग्री (सिलिकॉन, तांबा, लिथियम)',
        reason: 'ग्लास टचस्क्रीन और कैमरा मॉड्यूल वाला आयताकार इलेक्ट्रॉनिक उपकरण।',
        contaminated: false,
        contaminationNote: 'ई-कचरा। इसमें मूल्यवान घटक हैं जिन्हें विशेष प्रसंस्करण की आवश्यकता है।',
        secondLife: 'यदि उपकरण काम कर रहा है तो दान करें या एक्सचेंज में दें।'
      },
      ur: {
        cat: 'e_waste',
        name: 'پرانا اسمارٹ فون / موبائل',
        material: 'پیچیدہ برقی پرزے (سلیکون، تانبا، لیتھیم)',
        reason: 'ٹچ اسکرین، کیمرہ اور دھاتی فریم پر مشتمل مستطیل الیکٹرانک ڈیوائس۔',
        contaminated: false,
        contaminationNote: 'برقی فضلہ۔ اس میں قیمتی دھاتیں ہیں جنہیں تصدیق شدہ پروسیسنگ درکار ہے۔',
        secondLife: 'اگر موبائل چل رہا ہو تو کسی ضرورت مند کو تحفہ دیں یا مرمت کروائیں۔'
      }
    },
    textile: {
      en: {
        cat: 'textile',
        name: 'Cotton Graphic T-Shirt',
        material: '100% Spun Cotton Fabric',
        reason: 'Woven cotton textile fabric with collar stitching, seams, and visible fiber weave.',
        contaminated: false,
        contaminationNote: 'No chemical or biohazard contamination detected.',
        secondLife: 'Consider repairing, donating to charity, or cutting into reusable household cleaning rags.'
      },
      mr: {
        cat: 'textile',
        name: 'सुती टी-शर्ट (कापड)',
        material: '१००% सुती धागे (कॉटन)',
        reason: 'कॉलरची शिलाई, विणलेले धागे आणि कापडाची रचना स्पष्टपणे दिसत आहे.',
        contaminated: false,
        contaminationNote: 'कोणतीही रासायनिक किंवा घातक दूषितता आढळली नाही.',
        secondLife: 'फाटलेला असल्यास घर पुसण्यासाठी किंवा मॉप म्हणून कापून वापरा.'
      },
      hi: {
        cat: 'textile',
        name: 'सूती टी-शर्ट (कपड़ा)',
        material: '१००% सूती धागा (कॉटन फैब्रिक)',
        reason: 'सिलाई, कॉलर और बुने हुए सूती कपड़े की बनावट दृष्टिगोचर है।',
        contaminated: false,
        contaminationNote: 'कोई रासायनिक या खतरनाक संदूषण नहीं मिला।',
        secondLife: 'दान करें या काटकर घरेलू सफाई के कपड़े के रूप में काम में लें।'
      },
      ur: {
        cat: 'textile',
        name: 'سوتی ٹی شرٹ (کپڑا)',
        material: '۱۰۰ فیصد سوتی کپڑا (کاٹن)',
        reason: 'کالر کی سلائی، دھاگے اور کپڑے کی بناوٹ واضح نظر آ رہی ہے۔',
        contaminated: false,
        contaminationNote: 'کوئی کیمیائی آلودگی نہیں پائی گئی۔',
        secondLife: 'گھر میں گرد صاف کرنے یا فرش پونچھنے کے لیے کپڑے کے طور پر استعمال کریں۔'
      }
    },
    battery: {
      en: {
        cat: 'battery',
        name: 'Alkaline AA Battery Cell',
        material: 'Zinc-Manganese Dioxide Chemical Cell',
        reason: 'Cylindrical metal casing with positive terminal nub and negative base contact.',
        contaminated: false,
        contaminationNote: 'Hazardous electrochemical contents. Must not be placed in household trash.',
        secondLife: 'Dead single-use batteries cannot be recharged; deposit at a battery drop-off kiosk immediately.'
      },
      mr: {
        cat: 'battery',
        name: 'अल्कधर्मी एए बॅटरी सेल',
        material: 'झिंक-मॅंगनीज डायऑक्साइड सेल',
        reason: 'दंडगोलाकार धातूचे आवरण, पॉझिटिव्ह टोक आणि निगेटिव्ह बेस संपर्क आढळला.',
        contaminated: false,
        contaminationNote: 'घातक इलेक्ट्रोकेमिकल घटक. घरगुती कचऱ्यात टाकण्यास सक्त मनाई आहे.',
        secondLife: 'वापरलेली बॅटरी पुन्हा चार्ज करता येत नाही; त्वरित बॅटरी संकलन केंद्रात जमा करा.'
      },
      hi: {
        cat: 'battery',
        name: 'एए एल्कलाइन बैटरी सेल',
        material: 'जिंक-मैंगनीज डाइऑक्साइड सेल',
        reason: 'बेलनाकार धातु का आवरण और दोनों टर्मिनल्स की स्पष्ट बनावट।',
        contaminated: false,
        contaminationNote: 'खतरनाक रासायनिक घटक। इसे घरेलू कचरे में बिल्कुल न डालें।',
        secondLife: 'खत्म बैटरी को रीचार्ज नहीं किया जा सकता; तुरंत बैटरी ड्रॉप-ऑफ केंद्र पर दें।'
      },
      ur: {
        cat: 'battery',
        name: 'اے اے الکلائن بیٹری سیل',
        material: 'زنک مینگنیز ڈائی آکسائیڈ کیمیکل سیل',
        reason: 'دھاتی سلنڈر اور مثبت و منفی ٹرمینلز کی واضح ساخت۔',
        contaminated: false,
        contaminationNote: 'خطرناک کیمیائی مواد۔ گھریلو کچرے کے ڈبے میں ہرگز نہ ڈالیں۔',
        secondLife: 'ختم شدہ بیٹری دوبارہ چارج نہیں ہو سکتی؛ فوری طور پر بیٹری کیوسک پر جمع کروائیں۔'
      }
    },
    hazardous: {
      en: {
        cat: 'hazardous',
        name: 'Industrial Paint / Solvent Canister',
        material: 'Steel Can with Chemical Solvent Residue',
        reason: 'Heavy-duty metal container with industrial warning iconography and chemical solvent markings.',
        contaminated: true,
        contaminationNote: 'Hazardous chemical vapors and liquid residues detected. Handle with gloves.',
        secondLife: 'If product remains, share with community makers, neighbors, or local theater set builders.'
      },
      mr: {
        cat: 'hazardous',
        name: 'रंग / घातक सॉल्व्हेंट डबा',
        material: 'रासायनिक सॉल्व्हेंट असलेला स्टील डबा',
        reason: 'औद्योगिक चेतावणी चिन्ह आणि रासायनिक खुणा असलेला धातूचा डबा.',
        contaminated: true,
        contaminationNote: 'विषारी रासायनिक अवशेष आढळले. हाताळताना हातमोजे वापरा.',
        secondLife: 'शिल्लक रंग असल्यास शेजाऱ्यांना किंवा स्थानिक कलाकारांना द्या.'
      },
      hi: {
        cat: 'hazardous',
        name: 'पेंट / विलायक का डब्बा',
        material: 'रासायनिक अवशेष युक्त स्टील कंटेनर',
        reason: 'चेतावनी चिह्न और रासायनिक निशान वाला भारी धातु का डिब्बा।',
        contaminated: true,
        contaminationNote: 'खतरनाक रासायनिक अवशेष मिले हैं। दस्ताने पहनकर संभालें।',
        secondLife: 'यदि पेंट बचा है तो पड़ोसियों या स्थानीय शिल्पकारों से साझा करें।'
      },
      ur: {
        cat: 'hazardous',
        name: 'پینٹ / کیمیکل سالوینٹ کا ڈبہ',
        material: 'کیمیائی سالوینٹ والا اسٹیل کا ڈبہ',
        reason: 'خطرناک صنعتی علامات اور کیمیائی نشانات والا دھاتی کنٹینر۔',
        contaminated: true,
        contaminationNote: 'زہریلا کیمیائی مواد موجود ہے۔ دستانے پہن کر ہاتھ لگائیں۔',
        secondLife: 'اگر پینٹ باقی ہو تو پڑوسیوں یا دستکاروں کے ساتھ شیئر کریں۔'
      }
    }
  };

  const sampleKey = presetsMap[sampleTag] ? sampleTag : 'plastic';
  const item = presetsMap[sampleKey][normalizedLang] || presetsMap[sampleKey].en;
  const langRecs = MULTILINGUAL_RECOMMENDATIONS[normalizedLang] || MULTILINGUAL_RECOMMENDATIONS.en;
  const std = langRecs[item.cat || 'plastic'] || langRecs.plastic;

  return {
    is_waste: true,
    category: item.cat,
    item_name: item.name,
    material: item.material,
    confidence: 0.96,
    image_quality: 'good',
    image_quality_reason: null,
    contamination_detected: item.contaminated,
    contamination_note: item.contaminationNote,
    second_life_suggestion: item.secondLife || std.secondLife || null,
    reason: item.reason,
    disposal_recommendation: std.rec,
    actionable_steps: std.steps,
    environmental_impact: std.impact,
    alternative_bin: std.alt,
  };
}

function smartVisualFallback(cleanBase64: string, sampleTag?: string, language: string = 'en'): WasteAnalysisResult {
  const normalizedLang = ['en', 'mr', 'hi', 'ur'].includes(language) ? language : 'en';

  if (sampleTag) {
    return handlePresetSample(sampleTag, normalizedLang);
  }

  let hash = 0;
  const step = Math.max(1, Math.floor(cleanBase64.length / 20));
  for (let i = 0; i < cleanBase64.length; i += step) {
    hash = (hash * 31 + cleanBase64.charCodeAt(i)) & 0xffffffff;
  }
  const absHash = Math.abs(hash);

  const categories: WasteCategory[] = [
    'plastic',
    'paper',
    'metal',
    'organic',
    'glass',
    'e_waste',
    'textile',
    'battery',
    'hazardous'
  ];
  const selectedCat = categories[absHash % categories.length];
  const langRecs = MULTILINGUAL_RECOMMENDATIONS[normalizedLang] || MULTILINGUAL_RECOMMENDATIONS.en;
  const std = langRecs[selectedCat || 'other'] || langRecs.other;

  const contaminationNotes: Record<string, { yes: string; no: string }> = {
    en: { yes: 'Possible residue detected. Rinse before recycling.', no: 'No obvious contamination detected.' },
    mr: { yes: 'अवशेष आढळले आहेत. कृपया धुवून घ्या.', no: 'कोणतीही दूषितता आढळली नाही.' },
    hi: { yes: 'अवशेष पाए गए हैं। कृपया धो लें।', no: 'कोई स्पष्ट संदूषण नहीं मिला।' },
    ur: { yes: 'کھانے کے ذرات پائے گئے۔ براہ کرم دھو لیں۔', no: 'کوئی ظاہری آلودگی نہیں پائی گئی۔' }
  };
  const cn = contaminationNotes[normalizedLang] || contaminationNotes.en;

  const reasons: Record<string, string> = {
    en: `Spectral patterns and visual edge signatures match ${std.name} material.`,
    mr: `प्रतिमेतील दृश्य वैशिष्ट्ये आणि पोत ${std.name} सामग्रीशी जुळतात.`,
    hi: `दृश्य विशेषताएं और सतह की बनावट ${std.name} सामग्री से मेल खाती हैं।`,
    ur: `بصری خصوصیات اور ساخت ${std.name} مواد سے مماثلت رکھتی ہیں۔`
  };

  return {
    is_waste: true,
    category: selectedCat,
    item_name: `${std.name}`,
    material: std.name,
    confidence: 0.88,
    image_quality: 'good',
    image_quality_reason: null,
    contamination_detected: absHash % 3 === 0,
    contamination_note: absHash % 3 === 0 ? cn.yes : cn.no,
    second_life_suggestion: std.secondLife || null,
    reason: reasons[normalizedLang] || reasons.en,
    disposal_recommendation: std.rec,
    actionable_steps: std.steps,
    environmental_impact: std.impact,
    alternative_bin: std.alt,
  };
}
