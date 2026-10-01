import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

const SYSTEM_INSTRUCTION = `You are the official conversational AI assistant for "Smart Waste Segregation", an AI-powered waste intelligence platform.

PRODUCT & BRANDING IDENTITY:
- Product Name: Smart Waste Segregation
- Tagline: AI-powered waste intelligence
- Branding: Built by Team ASTELLA
- Team Name: ASTELLA (or Team ASTELLA)

DEVELOPMENT TEAM (STRICT ACCURACY):
This website was developed by Team ASTELLA.
The team members are:
• Aastha Patil
• Gargi Kharat
• Zainab Khan

CRITICAL RULES ABOUT THE TEAM:
- When asked who developed, created, built, or is behind this website/project, state clearly that it was developed by Team ASTELLA and list the three members: Aastha Patil, Gargi Kharat, and Zainab Khan.
- NEVER invent additional team members.
- NEVER invent roles, colleges, degrees, universities, companies, awards, or personal details about the members. Stick strictly to the team information provided above.

MULTILINGUAL SUPPORT (STRICT REQUIREMENT):
The application supports 4 languages:
1. English
2. Marathi (मराठी)
3. Hindi (हिन्दी)
4. Urdu (اردو)

Language rules:
- If the user writes in Marathi, or if language parameter is "mr", reply in fluent, natural Marathi using standard Devanagari script (NO Roman Marathi).
- If the user writes in Hindi, or if language parameter is "hi", reply in fluent, natural Hindi using standard Devanagari script (NO Roman Hindi).
- If the user writes in Urdu, or if language parameter is "ur", reply in fluent, natural Urdu using standard Arabic/Urdu script with RTL flow (NO Roman Urdu).
- If the user writes in English, or if language parameter is "en", reply in English.
- Always preserve team members' names (Team ASTELLA: Aastha Patil, Gargi Kharat, Zainab Khan) accurately.

WHAT THIS WEBSITE DOES:
Smart Waste Segregation is an AI-powered waste intelligence platform built to help households, communities, and waste managers:
1. Scan or upload waste images using their camera or file upload.
2. Accurately classify waste into 10 distinct material streams.
3. Perform an Image Quality Check to detect blurry, dark, distant, or obstructed photos and request a retake if needed.
4. Perform an AI Contamination Check to detect visible food residue, oils, or grease, recommending cleaning before recycling.
5. Provide "Give It a Second Life" suggestions (reuse, repair, donate, refurbish) before disposal.
6. Provide clear, certified disposal recommendations and preparation checklists for every item.
7. Help users find nearby recycling and drop-off centers using the interactive "Disposal Map" (/disposal-map).
8. Collect Classification Feedback ("Was this classification correct?") to maintain an AI evaluation dataset and track model quality.
9. Track user scan history with individual user account authentication ("My Scans" vs "All Community Scans").
10. Provide an Admin Dashboard with real-time statistics, category distribution charts, daily/monthly volume trends, stream purity, and AI feedback analytics.
11. Generate a print-ready "Smart Waste Report" PDF summarizing facility metrics, carbon offsets, and stream breakdowns.

EXPANDED 10 WASTE CATEGORIES SUPPORTED:
1. Plastic (bottles, containers, jugs, rigid packaging)
2. Paper & Cardboard (boxes, cardboard, clean office paper, newspapers)
3. Metal (aluminum cans, food tins, clean foil, metal caps)
4. Organic / Food Waste (vegetable/fruit peels, food scraps, coffee grounds, compostables)
5. Glass (bottles, jars, food containers)
6. E-Waste (smartphones, cables, chargers, small electronics, circuit boards)
7. Textile / Clothing (worn garments, clean fabrics, shoes, bedding)
8. Battery (household batteries, lithium packs, button cells - NEVER in trash!)
9. Hazardous Waste (paints, solvents, automotive fluids, chemical containers - Household Hazardous Waste)
10. Other / Unrecognized (residual non-recyclable composite items)

STRICT ANTI-HALLUCINATION RULES:
- If asked about a feature that does NOT exist in the app (e.g., real-time garbage truck GPS tracking, IoT smart bins, automatic municipal pickup, blockchain waste credits, live government database sync, smart bin QR codes), clearly state: "That feature is not currently available in this version."
- Do NOT mention "Smart Bin QR" because it has been retired.
- Do NOT make absolute claims about visual contamination; always use careful phrasing like "Possible contamination detected."
- Explain confidence scores simply: "Confidence indicates how strongly the AI model supports its predicted waste category. A higher score reflects stronger visual evidence, but does not replace careful local sorting rules."

RESPONSE STYLE:
- Warm, professional, helpful, concise, and easy to read.
- Use clear bullet points and markdown formatting.
- Always maintain context from earlier turns in the conversation.`;

/**
 * Robust local fallback responder for common intent matches in all 4 supported languages:
 * English, Marathi (मराठी), Hindi (हिन्दी), Urdu (اردو)
 */
function getLocalFallbackResponse(messages: ChatMessage[], language: string = 'en'): string {
  const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';

  // Detect language if specified or by script
  let lang = ['en', 'mr', 'hi', 'ur'].includes(language) ? language : 'en';
  if (lang === 'en') {
    // Check Marathi specific words/script
    if (/[\u0900-\u097F]/.test(lastMsg)) {
      if (lastMsg.includes('कोणी') || lastMsg.includes('कसा') || lastMsg.includes('कचऱ्या') || lastMsg.includes('कचरा') || lastMsg.includes('माहिती') || lastMsg.includes('नकाशा')) {
        lang = 'mr';
      } else {
        lang = 'hi';
      }
    } else if (/[\u0600-\u06FF]/.test(lastMsg)) {
      lang = 'ur';
    }
  }

  // 1. Team & Developer Questions
  if (
    lastMsg.includes('team') ||
    lastMsg.includes('astella') ||
    lastMsg.includes('develop') ||
    lastMsg.includes('who made') ||
    lastMsg.includes('who created') ||
    lastMsg.includes('who built') ||
    lastMsg.includes('behind this') ||
    lastMsg.includes('creator') ||
    lastMsg.includes('author') ||
    lastMsg.includes('member') ||
    lastMsg.includes('कोणी') ||
    lastMsg.includes('किसने') ||
    lastMsg.includes('किसका') ||
    lastMsg.includes('کس نے') ||
    lastMsg.includes('ٹیم')
  ) {
    if (lang === 'mr') {
      return `ही वेबसाइट **Team ASTELLA** द्वारे विकसित करण्यात आली आहे.

संघातील सदस्य खालीलप्रमाणे आहेत:
• **आस्था पाटील (Aastha Patil)**
• **गार्गी खरात (Gargi Kharat)**
• **झैनब खान (Zainab Khan)**

Team ASTELLA ने **Smart Waste Segregation** ही एआय-आधारित प्रणाली नागरिकांना अचूक कचरा वर्गीकरण आणि पुनर्वापरात मदत करण्यासाठी तयार केली आहे.`;
    }
    if (lang === 'hi') {
      return `यह वेबसाइट **Team ASTELLA** द्वारा विकसित की गई है।

टीम के सदस्य हैं:
• **आस्था पाटिल (Aastha Patil)**
• **गार्गी खरात (Gargi Kharat)**
• **ज़ैनब खान (Zainab Khan)**

Team ASTELLA ने **Smart Waste Segregation** को एक एआई-संचालित प्लेटफॉर्म के रूप में बनाया है ताकि कचरे की सही पहचान और सुरक्षित निस्तारण किया जा सके।`;
    }
    if (lang === 'ur') {
      return `یہ ویب سائٹ **Team ASTELLA** نے تیار کی ہے۔

ٹیم کے اراکین کے نام درج ذیل ہیں:
• **آستھا پاٹل (Aastha Patil)**
• **گارگی کھارات (Gargi Kharat)**
• **زینب خان (Zainab Khan)**

Team ASTELLA نے **اسمارٹ ویسٹ سیگریگیشن** کو کچرے کی درست شناخت اور پائیدار انتظام کے لیے تیار کیا ہے۔`;
    }
    return `This website was developed by **Team ASTELLA**.

The team members are:
• **Aastha Patil**
• **Gargi Kharat**
• **Zainab Khan**

Team ASTELLA developed Smart Waste Segregation as an AI-powered waste intelligence platform designed to help users identify waste, inspect contamination, and make sustainable disposal decisions.`;
  }

  // 2. What is this website about
  if (
    lastMsg.includes('what is this website') ||
    lastMsg.includes("what's this website") ||
    lastMsg.includes('about this site') ||
    lastMsg.includes('what can i do here') ||
    lastMsg.includes('overview') ||
    lastMsg.includes('welcome') ||
    lastMsg.includes('काय आहे') ||
    lastMsg.includes('क्या है') ||
    lastMsg.includes('بارے میں')
  ) {
    if (lang === 'mr') {
      return `**Smart Waste Segregation** मध्ये आपले स्वागत आहे! हे एक एआय-आधारित कचरा बुद्धिमत्ता प्लॅटफॉर्म आहे:

**मुख्य वैशिष्ट्ये:**
• **कचरा स्कॅन करा**: कॅमेरा किंवा फोटो अपलोड करून संगणकीय दृष्टीने त्वरित कचरा ओळखा.
• **१० समर्थित प्रवाह**: प्लास्टिक, कागद, धातू, सेंद्रिय, काच, ई-कचरा, कापड, बॅटरी, घातक आणि इतर कचरा.
• **दूषितता तपासणी**: अन्नाचे किंवा तेलाचे अवशेष ओळखून पुनर्वापरापूर्वी स्वच्छ करण्याचा सल्ला.
• **पुनर्वापर कल्पना**: फेकून देण्यापूर्वी वस्तूचा पुनर्वापर करण्याच्या उपयुक्त युक्त्या.
• **विल्हेवाट नकाशा**: जवळची प्रमाणित पुनर्वापर केंद्रे आणि ई-कचरा किऑस्क शोधा.

हे प्लॅटफॉर्म **Team ASTELLA** (आस्था पाटील, गार्गी खरात, आणि झैनब खान) द्वारे तयार केले गेले आहे.`;
    }
    if (lang === 'hi') {
      return `**Smart Waste Segregation** में आपका स्वागत है! यह एक एआई-संचालित कचरा प्रबंधन प्लेटफॉर्म है:

**प्रमुख सुविधाएं:**
• **कचरा स्कैन करें**: कैमरे या फोटो से सामग्री की तुरंत पहचान करें।
• **१० कचरा श्रेणियां**: प्लास्टिक, कागज, धातु, जैविक, कांच, ई-कचरा, कपड़ा, बैटरी, खतरनाक और अन्य कचरा।
• **संदूषण जांच**: भोजन या तेल के अवशेष पहचान कर रीसाइक्लिंग से पहले धोने की सलाह।
• **पुनः उपयोग के विचार**: फेंकने से पहले वस्तु के पुन: उपयोग के उपयोगी सुझाव।
• **निस्तारण नक्शा**: नजदीकी प्रमाणित रीसाइक्लिंग डिपो और ड्रॉप-ऑफ केंद्र खोजें।

यह प्लेटफॉर्म **Team ASTELLA** (आस्था पाटिल, गार्गी खरात, और ज़ैनब खान) द्वारा निर्मित है।`;
    }
    if (lang === 'ur') {
      return `**اسمارٹ ویسٹ سیگریگیشن** میں خوش آمدید! یہ مصنوعی ذہانت پر مبنی کچرے کی درجہ بندی کا نظام ہے:

**اہم خصوصیات:**
• **کچرا اسکین کریں**: کیمرے یا تصویر کی مدد سے کچرے کی فوری شناخت۔
• **۱۰ اقسام کی معاونت**: پلاسٹک، کاغذ، دھات، نامیاتی، شیشہ، ای-ویسٹ، کپڑے، بیٹری اور خطرناک کچرا۔
• **آلودگی کی جانچ**: کھانے کے ذرات کی جانچ کر کے ری سائیکلنگ سے پہلے صفائی کا مشورہ۔
• **دوبارہ استعمال کی تجاویز**: کچرا پھینکنے سے قبل کارآمد بنانے کے مشورے۔
• **نقشہ**: قریبی ری سائیکلنگ اور ای-ویسٹ مراکز کی تلاش۔

یہ پلیٹ فارم **Team ASTELLA** (آستھا پاٹل، گارگی کھارات اور زینب خان) نے بنایا ہے۔`;
    }
    return `Welcome to **Smart Waste Segregation**! This is an AI-powered waste intelligence platform developed to help users identify different types of waste, understand how to dispose of them correctly, detect possible contamination, find suitable disposal points, and make better waste-management decisions.

**Key capabilities you can explore:**
• **Scan or Upload Waste**: Use your camera or upload a photo to identify waste items instantly with computer vision.
• **10 Supported Streams**: Classify Plastic, Paper & Cardboard, Metal, Organic, Glass, E-Waste, Textile, Battery, Hazardous, and Other residual waste.
• **Image Quality Check**: Evaluates clarity, lighting, and centering, recommending a retake if an image is blurry or dark.
• **Contamination Check**: Visually inspects items for food residue or oils before recycling.
• **Second-Life Suggestions**: Practical ideas to reuse, repair, donate, or repurpose items before disposal.
• **Disposal Map**: Locate nearby recycling depots, e-waste drop-offs, and hazardous waste collection centers.

The platform was built by **Team ASTELLA** (Aastha Patil, Gargi Kharat, and Zainab Khan).`;
  }

  // 3. How to scan waste
  if (
    lastMsg.includes('how do i scan') ||
    lastMsg.includes('how to scan') ||
    lastMsg.includes('scan waste') ||
    lastMsg.includes('camera') ||
    lastMsg.includes('how does waste scanning work') ||
    lastMsg.includes('how does scanning work') ||
    lastMsg.includes('स्कॅन कसे') ||
    lastMsg.includes('स्कैन कैसे') ||
    lastMsg.includes('اسکین کیسے')
  ) {
    if (lang === 'mr') {
      return `कचरा स्कॅन करण्याची प्रक्रिया अत्यंत सोपी आहे:

१. **कचरा स्कॅन पृष्ठावर जा**: वरच्या मेनूमधील "कचरा स्कॅन करा" वर क्लिक करा.
२. **पर्याय निवडा**:
   • **फोटो अपलोड करा**: तुमच्या डिव्हाइसवरून फोटो निवडा.
   • **थेट कॅमेरा**: तुमच्या फोन किंवा लॅपटॉपचा कॅमेरा सुरू करा आणि फोटो काढा.
३. **एआय विश्लेषण**: सिस्टम प्रतिमेची गुणवत्ता तपासून श्रेणी आणि विश्वासार्हता ठरवते.
४. **निकाल पहा**: शिफारस केलेली कुंडी, तयारीच्या पायऱ्या आणि जवळचे केंद्र तपासा.`;
    }
    if (lang === 'hi') {
      return `कचरा स्कैन करने की प्रक्रिया बहुत सरल है:

१. **स्कैन पेज पर जाएं**: ऊपर दिए गए "कचरा स्कैन करें" बटन पर क्लिक करें।
२. **माध्यम चुनें**:
   • **फोटो अपलोड**: अपने डिवाइस से फोटो चुनें या खींचें।
   • **लाइव कैमरा**: कैमरे को सक्षम करें और सीधे तस्वीर लें।
३. **एआई विश्लेषण**: सिस्टम गुणवत्ता और कचरा श्रेणी का वैज्ञानिक विश्लेषण करता है।
४. **परिणाम देखें**: अनुशंसित कूड़ेदान, तैयारी के चरण और निस्तारण केंद्र देखें।`;
    }
    if (lang === 'ur') {
      return `فضلہ اسکین کرنے کا طریقہ بہت آسان ہے:

۱. **اسکین پیج پر جائیں**: اوپر مینو میں "فضلہ اسکین کریں" پر کلک کریں۔
۲. **طریقہ منتخب کریں**:
   • **تصویر اپ لوڈ کریں**: اپنے موبائل یا کمپیوٹر سے تصویر منتخب کریں۔
   • **لائیو کیمرہ**: کیمرہ آن کریں اور فریم میں تصویر لیں۔
۳. **اے آئی تجزیہ**: سسٹم تصویر کے معیار اور کچرے کی قسم کا خودکار جائزہ لیتا ہے۔
۴. **نتائج دیکھیں**: مناسب کوڑے دان اور قریبی مراکز کی معلومات حاصل کریں۔`;
    }
    return `Scanning waste on Smart Waste Segregation is simple:

1. **Go to the Scan Waste page** by clicking "Scan Waste" in the top navigation or on the homepage.
2. **Choose your input method**:
   • **Upload Photo**: Drag and drop any image (JPG, PNG, WEBP) or click to browse files.
   • **Live Camera**: Activate your device camera to capture a live photo in real-time.
3. **AI Vision Analysis**: The system evaluates image clarity first, then predicts the category, material, and confidence score.
4. **Review Results**: Check the recommended destination bin, actionable prep steps, contamination assessment, second-life reuse ideas, and nearby disposal facilities.`;
  }

  // 4. Waste Categories
  if (
    lastMsg.includes('types of waste') ||
    lastMsg.includes('what categories') ||
    lastMsg.includes('what waste') ||
    lastMsg.includes('identify plastic') ||
    lastMsg.includes('can you identify') ||
    lastMsg.includes('categories') ||
    lastMsg.includes('प्रकार') ||
    lastMsg.includes('श्रेणियां') ||
    lastMsg.includes('اقسام')
  ) {
    if (lang === 'mr') {
      return `स्मार्ट कचरा वर्गीकरण खालील **१० कचरा प्रवाहांचे** समर्थन करते:

१. ♻️ **प्लास्टिक**: बाटल्या, पाऊच, डबे आणि पॅकेजिंग.
२. 📄 **कागद आणि पुठ्ठा**: खोके, पुस्तके, वर्तमानपत्रे आणि ऑफिस पेपर.
३. 🔩 **धातू**: अल्युमिनियम कॅन, अन्न डबे आणि फॉइल.
४. 🍃 **सेंद्रिय / ओला कचरा**: खरकटे अन्न, फळांची साले, चहाची पत्ती.
५. 🍾 **काच**: पाण्याच्या बाटल्या, बरण्या आणि काचेचे डबे.
६. 🔌 **ई-कचरा**: जुने फोन, चार्जर, केबल्स आणि इलेक्ट्रॉनिक्स.
७. 👕 **कापड**: कपडे, चादरी, सुती चिंध्या.
८. 🔋 **बॅटरी**: घरातील बॅटरी, लिथियम सेल (कचऱ्यात कधीही टाकू नका!).
९. ⚠️ **घातक कचरा**: रंग, रसायने, कीटकनाशके आणि सॉल्व्हेंट्स.
१०. 📦 **इतर कचरा**: पुनर्चक्रण न करता येणारा अवशिष्ट कचरा.`;
    }
    if (lang === 'hi') {
      return `स्मार्ट कचरा पृथक्करण **१० श्रेणियों** की सटीक पहचान करता है:

१. ♻️ **प्लास्टिक**: बोतलें, डिब्बे और पैकेजिंग सामग्री।
२. 📄 **कागज और गत्ता**: कार्टन, किताबें, अखबार और साफ कागज।
३. 🔩 **धातु**: कोल्डड्रिंक कैन, टिन के डिब्बे और साफ फॉयल।
४. 🍃 **जैविक / गीला कचरा**: बचा हुआ भोजन, फलों के छिलके।
५. 🍾 **कांच**: कांच की बोतलें और जार।
६. 🔌 **ई-कचरा**: मोबाइल फोन, चार्जर और इलेक्ट्रॉनिक उपकरण।
७. 👕 **कपड़ा**: पुराने कपड़े और सूती वस्त्र।
८. 🔋 **बैटरी**: सामान्य और रिचार्जेबल सेल (कूड़ेदान में कभी न डालें)।
९. ⚠️ **खतरनाक कचरा**: पेंट, कीटनाशक और औद्योगिक रसायन।
१०. 📦 **अन्य कचरा**: गैर-पुनर्चक्रण योग्य अवशिष्ट वस्तुएं।`;
    }
    if (lang === 'ur') {
      return `اسمارٹ ویسٹ سیگریگیشن **۱۰ اقسام کے کچرے** کی معاونت کرتا ہے:

۱. ♻️ **پلاسٹک**: بوتلیں، ڈبے اور ریپرز۔
۲. 📄 **کاغذ اور گتہ**: کارٹن، ڈبے اور پرانے اخبارات۔
۳. 🔩 **دھات**: کین، دھاتی ڈبے اور صاف ورق۔
۴. 🍃 **نامیاتی فضلہ**: کھانے کی باقیات، پھلوں کے چھلکے۔
۵. 🍾 **شیشہ**: بوتلیں اور شیشے کے برتن۔
۶. 🔌 **ای-ویسٹ**: پرانے فون، کیبلز اور برقی پرزے۔
۷. 👕 **ٹیکسٹائل / کپڑے**: پرانے اور استعمال شدہ کپڑے۔
۸. 🔋 **بیٹری**: سیل اور بیٹریاں (کوڑے میں ہرگز نہ ڈالیں!)۔
۹. ⚠️ **خطرناک فضلہ**: رنگ، روغن اور کیمیکلز۔
۱۰. 📦 **دیگر**: عام بقایا کچرا۔`;
    }
    return `Smart Waste Segregation supports **10 comprehensive waste streams**:

1. ♻️ **Plastic**: PET bottles, HDPE jugs, rigid containers, clean plastic packaging.
2. 📄 **Paper & Cardboard**: Corrugated cardboard delivery boxes, office paper, clean newspapers.
3. 🔩 **Metal**: Aluminum beverage cans, tin food cans, clean aluminum foil, metal jar lids.
4. 🍃 **Organic / Food Waste**: Fruit and vegetable peels, food scraps, coffee grounds, garden trimmings.
5. 🍾 **Glass**: Beverage bottles, food jars, condiment containers.
6. 🔌 **E-Waste**: Old mobile phones, computer peripherals, chargers, cables, circuit boards.
7. 👕 **Textile / Clothing**: Worn garments, clean cloth rags, bedsheets, footwear.
8. 🔋 **Battery**: Alkaline batteries, lithium-ion rechargeable packs, button cells (never dispose of in household bins!).
9. ⚠️ **Hazardous Waste**: Household chemicals, paint cans, motor oil containers, pesticides.
10. 📦 **Other / Unrecognized**: Composite residual items that cannot be segregated into standard recycling.`;
  }

  // 5. Disposal Map
  if (
    lastMsg.includes('disposal map') ||
    lastMsg.includes('disposal point') ||
    lastMsg.includes('disposal center') ||
    lastMsg.includes('find a facility') ||
    lastMsg.includes('where can i dispose') ||
    lastMsg.includes('where to dispose') ||
    lastMsg.includes('facility') ||
    lastMsg.includes('नकाशा') ||
    lastMsg.includes('नक्शा') ||
    lastMsg.includes('مرکز') ||
    lastMsg.includes('نقشہ')
  ) {
    if (lang === 'mr') {
      return `**विल्हेवाट नकाशा** (/disposal-map) तुम्हाला अधिकृत पुनर्वापर केंद्रांशी जोडतो:

• **स्थान शोधा**: जीपीएस वापरून जवळची केंद्रे शोधा.
• **प्रकारानुसार फिल्टर करा**: ई-कचरा, काच, बॅटरी किंवा धोकादायक कचरा केंद्रे निवडा.
• **संपर्क आणि तास**: कामाचे तास, पत्ता आणि स्वीकारलेली सामग्री तपासा.`;
    }
    if (lang === 'hi') {
      return `**निस्तारण नक्शा** (/disposal-map) आपके निकटतम रीसाइक्लिंग डिपो को दर्शाता है:

• **स्थान से खोजें**: जीपीएस से निकटतम केंद्र तुरंत खोजें।
• **श्रेणी फिल्टर**: ई-कचरा, बैटरी, कांच या खतरनाक अपशिष्ट केंद्रों को अलग से देखें।
• **समय और संपर्क**: खुलने का समय और स्वीकृत सामग्री की पूरी जानकारी प्राप्त करें।`;
    }
    if (lang === 'ur') {
      return `**ٹھکانے لگانے کا نقشہ** (/disposal-map) آپ کو قریبی تصدیق شدہ مراکز سے جوڑتا ہے:

• **مقام کی مدد سے تلاش**: قریبی ری سائیکلنگ پوائنٹس تلاش کریں۔
• **فلٹر کریں**: ای-ویسٹ، شیشہ، بیٹری یا خطرناک کچرے کے مراکز الگ سے دیکھیں۔
• **اوقات اور رابطہ**: ہر مرکز کے اوقاتِ کار اور پتے کی مکمل تفصیل حاصل کریں۔`;
    }
    return `The **Disposal Map** (/disposal-map) connects you directly to verified recycling and disposal facilities in your area:

• **Use My Location**: Click the location button to find depots closest to your GPS coordinates.
• **Search by City or Area**: Look up locations by city name, neighbourhood, or postal code.
• **Filter by Stream**: Easily filter by General Recycling, E-Waste, Battery Drop-Off, Glass Depot, Textile Donation, or Municipal Hazardous Waste (HHW).
• **Facility Details**: View complete street addresses, operating hours, phone contacts, and list of accepted materials.`;
  }

  // Default helpful response
  if (lang === 'mr') {
    return `मी **Smart Waste Segregation** सहाय्यक आहे!

तुम्ही मला विचारू शकता:
• कचरा स्कॅनिंग कसे कार्य करते
• १० कचरा प्रकार (प्लास्टिक, कागद, धातू, सेंद्रिय, काच, ई-कचरा, इत्यादी)
• दूषितता तपासणी म्हणजे काय
• विल्हेवाट नकाशाचा वापर कसा करावा
• टीम ASTELLA बद्दल माहिती

तुम्हाला काय जाणून घ्यायचे आहे?`;
  }
  if (lang === 'hi') {
    return `मैं **Smart Waste Segregation** सहायक हूँ!

आप मुझसे पूछ सकते हैं:
• कचरा स्कैनिंग कैसे काम करती है
• १० समर्थित कचरा श्रेणियां
• संदूषण जांच और विश्वास स्कोर का अर्थ
• निस्तारण नक्शे का उपयोग कैसे करें
• टीम ASTELLA के बारे में जानकारी

आप क्या जानना चाहते हैं?`;
  }
  if (lang === 'ur') {
    return `میں **اسمارٹ ویسٹ سیگریگیشن** کا اے آئی اسسٹنٹ ہوں!

آپ مجھ سے پوچھ سکتے ہیں:
• فضلہ اسکین کرنے کا طریقہ
• ۱۰ کچرے کی اقسام کی معلومات
• آلودگی کی جانچ کی تفصیلات
• ری سائیکلنگ نقشے کا استعمال
• ٹیم ASTELLA کے بارے میں معلومات

میں آپ کی کیا مدد کر سکتا ہوں؟`;
  }

  return `I'm here to help you navigate **Smart Waste Segregation**!

You can ask me about:
• How waste scanning and classification works
• Supported categories (Plastic, Paper, Metal, Organic, Glass, E-Waste, Batteries, etc.)
• What contamination check and confidence scores mean
• How to use the Disposal Map to locate nearby facilities
• Second-life reuse and repair ideas
• Information about the development team (Team ASTELLA)

What would you like to know?`;
}

/**
 * Handle conversation turn with multi-turn memory and multilingual capability
 */
export async function handleWasteChat(messages: ChatMessage[], language: string = 'en'): Promise<string> {
  if (!messages || messages.length === 0) {
    if (language === 'mr') return 'नमस्कार! मी स्मार्ट कचरा वर्गीकरणात तुम्हाला कशी मदत करू शकतो?';
    if (language === 'hi') return 'नमस्ते! मैं स्मार्ट कचरा पृथक्करण में आपकी क्या सहायता कर सकता हूँ?';
    if (language === 'ur') return 'ہیلو! میں اسمارٹ ویسٹ سیگریگیشن میں آپ کی کیا مدد کر سکتا ہوں؟';
    return 'Hi! How can I help you with Smart Waste Segregation today?';
  }

  const ai = getAiClient();
  if (!ai) {
    return getLocalFallbackResponse(messages, language);
  }

  try {
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\nACTIVE APP LANGUAGE: ${language}`,
        temperature: 0.2,
        maxOutputTokens: 600,
      },
    });

    const reply = response.text?.trim();
    if (reply) {
      return reply;
    }

    return getLocalFallbackResponse(messages, language);
  } catch (error: any) {
    console.warn('[ChatService] Gemini API call returned error, using fallback:', error?.message || error);
    return getLocalFallbackResponse(messages, language);
  }
}
