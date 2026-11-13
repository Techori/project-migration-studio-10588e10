// Browser-safe English/Hindi copy for the RILOYD Foundation page. Keep both languages in step.
export type FoundationLang = "en" | "hi";
export const foundationLangs: FoundationLang[] = ["en", "hi"];

type ProgramCopy = { title: string; description: string; items: string[]; cta: string };

export const foundationCopy = {
  en: {
    nav: { about: "About", programmes: "Programmes", students: "Students", help: "How We Help", impact: "Impact", involved: "Get Involved", contact: "Contact" },
    langToggle: "हिंदी",
    langLabel: "Switch to Hindi",
    donate: "Donate",
    hero: {
      kicker: "RILOYD Foundation",
      title: "A brighter, stronger and kinder India",
      text: "We support children’s education, animal welfare, healthcare, food relief and greener communities — with care, honesty and verified help for every person who reaches out.",
      apply: "Apply for Assistance",
      volunteer: "Become a Volunteer",
    },
    about: {
      kicker: "About the Foundation",
      title: "Business with a purpose",
      text: "RILOYD Foundation is the social initiative of RILOYD. It turns business growth into real help for students, families, animals and the environment, working closely with local communities.",
      commitmentTitle: "of profits committed",
      commitmentText: "RILOYD commits 20% of its profits to Foundation programmes, so every step of growth also supports someone who needs it.",
      values: [["Transparency", "Clear processes and honest communication with every applicant and supporter."], ["Dignity", "Every request is handled with respect and kept confidential."], ["Verified help", "Support is given after fair review and verification of need."]] as [string, string][],
    },
    programmes: { kicker: "Our Programmes", title: "Five areas where we help", apply: "Apply / Get help", join: "Join this work" },
    students: {
      kicker: "For Students",
      title: "No child should leave school because of fees",
      text: "Students and families can apply for scholarships or school fee assistance. Every application is reviewed and verified by our team.",
      scholarship: "Apply for Scholarship",
      schoolFee: "Request School Fee Help",
    },
    help: { kicker: "How We Help", title: "A simple, fair process" },
    impact: { kicker: "Our Impact", title: "Growing together", note: "Verified figures will be published here as our work grows. We never show estimated or invented numbers." },
    involved: {
      kicker: "Get Involved",
      title: "Be part of the change",
      cards: [
        { kind: "volunteer", title: "Volunteer", text: "Give your time and skills to education, animal care, health camps or tree plantation.", cta: "Register as Volunteer" },
        { kind: "partner", title: "Partner with us", text: "Schools, companies and organisations can work with us on programmes in their area.", cta: "Send Partnership Enquiry" },
        { kind: "donation_pledge", title: "Donate", text: "Pledge your support. Our team will contact you with the official donation details — no money is taken on this website.", cta: "Make a Donation Pledge" },
      ] as { kind: "volunteer" | "partner" | "donation_pledge"; title: string; text: string; cta: string }[],
    },
    faq: {
      kicker: "Questions",
      title: "Frequently asked questions",
      items: [
        ["Who can apply for assistance?", "Students, families and individuals facing genuine need can apply. Every application is reviewed and verified before any decision."],
        ["Does applying guarantee support?", "No. Applying starts the review. Our team contacts you if more information is needed and informs you of the decision."],
        ["Is any money collected on this website?", "No. Donation forms only record your pledge. Our team shares the official donation details with you directly."],
        ["What is an employee / coordinator code?", "If a RILOYD employee or coordinator helped you, enter their code so your form reaches them directly. It is optional."],
      ] as [string, string][],
    },
    contact: { kicker: "Contact", title: "Talk to the Foundation team", text: "Have a question, an idea or want to help? Send us a message and our team will reply.", email: "Email", message: "Your message", send: "Send Message", sending: "Sending…", sent: "Your message has reached the RILOYD Foundation team. We will reply soon." },
    programs: {
      education: { title: "Education & Scholarships", description: "Helping deserving students stay in school and continue to higher education.", items: ["School Fee Assistance", "Student Scholarships", "Higher Education Support", "Books & Stationery", "Uniform Assistance", "Digital Education"], cta: "Apply" },
      "animal-welfare": { title: "Animal Welfare & Protection", description: "Care, food and treatment for animals in need, with respect for every life.", items: ["Animal Rescue", "Animal Food Support", "Medical Treatment", "Shelter Assistance", "Animal Protection"], cta: "Volunteer" },
      healthcare: { title: "Healthcare & Medical Assistance", description: "Support for families facing medical costs and access to basic health care.", items: ["Medical Financial Assistance", "Medicine Support", "Emergency Medical Assistance", "Medical Camps", "Health Awareness"], cta: "Request help" },
      humanitarian: { title: "Humanitarian Charity & Relief", description: "Food, clothing and practical help for people and families during hard times.", items: ["Food Distribution", "Clothing Assistance", "Financial Assistance", "Elderly Support", "Emergency Relief"], cta: "Request help" },
      environment: { title: "Environment & Community Development", description: "Greener, cleaner neighbourhoods built together with local communities.", items: ["Tree Plantation", "Environmental Protection", "Cleanliness Campaigns", "Water Conservation", "Community Development"], cta: "Volunteer" },
    } as Record<string, ProgramCopy>,
    steps: [
      ["Apply for Assistance", "Submit a short application with your details and the support you need."],
      ["Application Review", "Our team reads every application and contacts you if anything is missing."],
      ["Verification & Assessment", "We verify the information and assess the need fairly and confidentially."],
      ["Assistance Decision", "You are informed of the decision and the next steps for any support."],
    ] as [string, string][],
    impactLabels: ["Students Supported", "Animals Helped", "People Assisted", "Families Supported"],
    footer: "RILOYD Foundation — the social initiative of RILOYD.",
  },
  hi: {
    nav: { about: "परिचय", programmes: "कार्यक्रम", students: "विद्यार्थी", help: "हम कैसे मदद करते हैं", impact: "प्रभाव", involved: "जुड़ें", contact: "संपर्क" },
    langToggle: "English",
    langLabel: "Switch to English",
    donate: "दान करें",
    hero: {
      kicker: "RILOYD फ़ाउंडेशन",
      title: "एक उज्ज्वल, सशक्त और दयालु भारत",
      text: "हम बच्चों की शिक्षा, पशु कल्याण, स्वास्थ्य, भोजन सहायता और हरित समुदायों के लिए काम करते हैं — हर ज़रूरतमंद को सम्मान, ईमानदारी और सत्यापित सहायता के साथ।",
      apply: "सहायता के लिए आवेदन करें",
      volunteer: "स्वयंसेवक बनें",
    },
    about: {
      kicker: "फ़ाउंडेशन के बारे में",
      title: "उद्देश्य के साथ व्यवसाय",
      text: "RILOYD फ़ाउंडेशन, RILOYD की सामाजिक पहल है। यह व्यवसाय की प्रगति को विद्यार्थियों, परिवारों, पशुओं और पर्यावरण के लिए वास्तविक सहायता में बदलता है और स्थानीय समुदायों के साथ मिलकर काम करता है।",
      commitmentTitle: "मुनाफ़ा समर्पित",
      commitmentText: "RILOYD अपने मुनाफ़े का 20% फ़ाउंडेशन के कार्यक्रमों के लिए समर्पित करता है, ताकि हर प्रगति किसी ज़रूरतमंद की मदद भी करे।",
      values: [["पारदर्शिता", "हर आवेदक और सहयोगी के साथ स्पष्ट प्रक्रिया और ईमानदार संवाद।"], ["सम्मान", "हर अनुरोध को सम्मान के साथ और गोपनीय रखा जाता है।"], ["सत्यापित सहायता", "ज़रूरत की निष्पक्ष समीक्षा और सत्यापन के बाद ही सहायता दी जाती है।"]] as [string, string][],
    },
    programmes: { kicker: "हमारे कार्यक्रम", title: "पाँच क्षेत्र जहाँ हम मदद करते हैं", apply: "आवेदन / सहायता", join: "इस काम से जुड़ें" },
    students: {
      kicker: "विद्यार्थियों के लिए",
      title: "फ़ीस के कारण किसी बच्चे की पढ़ाई न छूटे",
      text: "विद्यार्थी और परिवार छात्रवृत्ति या स्कूल फ़ीस सहायता के लिए आवेदन कर सकते हैं। हर आवेदन की हमारी टीम समीक्षा और सत्यापन करती है।",
      scholarship: "छात्रवृत्ति के लिए आवेदन",
      schoolFee: "स्कूल फ़ीस सहायता माँगें",
    },
    help: { kicker: "हम कैसे मदद करते हैं", title: "सरल और निष्पक्ष प्रक्रिया" },
    impact: { kicker: "हमारा प्रभाव", title: "साथ मिलकर आगे बढ़ते हुए", note: "जैसे-जैसे हमारा काम बढ़ेगा, सत्यापित आँकड़े यहाँ प्रकाशित किए जाएँगे। हम कभी अनुमानित या मनगढ़ंत संख्या नहीं दिखाते।" },
    involved: {
      kicker: "जुड़ें",
      title: "बदलाव का हिस्सा बनें",
      cards: [
        { kind: "volunteer", title: "स्वयंसेवक", text: "शिक्षा, पशु देखभाल, स्वास्थ्य शिविर या वृक्षारोपण में अपना समय और कौशल दें।", cta: "स्वयंसेवक पंजीकरण" },
        { kind: "partner", title: "साझेदार बनें", text: "स्कूल, कंपनियाँ और संस्थाएँ अपने क्षेत्र में हमारे साथ कार्यक्रम चला सकती हैं।", cta: "साझेदारी पूछताछ भेजें" },
        { kind: "donation_pledge", title: "दान", text: "अपना सहयोग संकल्प दें। हमारी टीम आधिकारिक दान विवरण के साथ आपसे संपर्क करेगी — इस वेबसाइट पर कोई पैसा नहीं लिया जाता।", cta: "दान का संकल्प दें" },
      ] as { kind: "volunteer" | "partner" | "donation_pledge"; title: string; text: string; cta: string }[],
    },
    faq: {
      kicker: "प्रश्न",
      title: "अक्सर पूछे जाने वाले प्रश्न",
      items: [
        ["सहायता के लिए कौन आवेदन कर सकता है?", "वास्तविक ज़रूरत वाले विद्यार्थी, परिवार और व्यक्ति आवेदन कर सकते हैं। किसी भी निर्णय से पहले हर आवेदन की समीक्षा और सत्यापन होता है।"],
        ["क्या आवेदन करने से सहायता पक्की हो जाती है?", "नहीं। आवेदन से समीक्षा शुरू होती है। ज़रूरत होने पर हमारी टीम आपसे संपर्क करेगी और निर्णय की जानकारी देगी।"],
        ["क्या इस वेबसाइट पर पैसा लिया जाता है?", "नहीं। दान फ़ॉर्म केवल आपका संकल्प दर्ज करता है। हमारी टीम आपको सीधे आधिकारिक दान विवरण देगी।"],
        ["कर्मचारी / कोऑर्डिनेटर कोड क्या है?", "यदि किसी RILOYD कर्मचारी या कोऑर्डिनेटर ने आपकी मदद की है, तो उनका कोड डालें ताकि आपका फ़ॉर्म सीधे उन तक पहुँचे। यह वैकल्पिक है।"],
      ] as [string, string][],
    },
    contact: { kicker: "संपर्क", title: "फ़ाउंडेशन टीम से बात करें", text: "कोई प्रश्न, सुझाव या मदद करना चाहते हैं? हमें संदेश भेजें, हमारी टीम जवाब देगी।", email: "ईमेल", message: "आपका संदेश", send: "संदेश भेजें", sending: "भेजा जा रहा है…", sent: "आपका संदेश RILOYD फ़ाउंडेशन टीम तक पहुँच गया है। हम जल्द जवाब देंगे।" },
    programs: {
      education: { title: "शिक्षा और छात्रवृत्ति", description: "योग्य विद्यार्थियों को स्कूल में बने रहने और उच्च शिक्षा जारी रखने में मदद।", items: ["स्कूल फ़ीस सहायता", "छात्रवृत्ति", "उच्च शिक्षा सहायता", "किताबें और स्टेशनरी", "यूनिफ़ॉर्म सहायता", "डिजिटल शिक्षा"], cta: "आवेदन करें" },
      "animal-welfare": { title: "पशु कल्याण और संरक्षण", description: "ज़रूरतमंद पशुओं के लिए देखभाल, भोजन और इलाज — हर जीवन के प्रति सम्मान के साथ।", items: ["पशु बचाव", "पशु भोजन सहायता", "चिकित्सा उपचार", "आश्रय सहायता", "पशु संरक्षण"], cta: "स्वयंसेवक बनें" },
      healthcare: { title: "स्वास्थ्य और चिकित्सा सहायता", description: "इलाज के खर्च से जूझ रहे परिवारों की मदद और बुनियादी स्वास्थ्य सेवा तक पहुँच।", items: ["चिकित्सा आर्थिक सहायता", "दवा सहायता", "आपातकालीन चिकित्सा सहायता", "स्वास्थ्य शिविर", "स्वास्थ्य जागरूकता"], cta: "सहायता माँगें" },
      humanitarian: { title: "मानवीय सेवा और राहत", description: "कठिन समय में लोगों और परिवारों के लिए भोजन, कपड़े और व्यावहारिक मदद।", items: ["भोजन वितरण", "कपड़ों की सहायता", "आर्थिक सहायता", "बुज़ुर्गों की सहायता", "आपातकालीन राहत"], cta: "सहायता माँगें" },
      environment: { title: "पर्यावरण और सामुदायिक विकास", description: "स्थानीय समुदायों के साथ मिलकर हरे-भरे और स्वच्छ मोहल्ले।", items: ["वृक्षारोपण", "पर्यावरण संरक्षण", "स्वच्छता अभियान", "जल संरक्षण", "सामुदायिक विकास"], cta: "स्वयंसेवक बनें" },
    } as Record<string, ProgramCopy>,
    steps: [
      ["सहायता के लिए आवेदन", "अपने विवरण और ज़रूरी सहायता के साथ छोटा आवेदन भेजें।"],
      ["आवेदन की समीक्षा", "हमारी टीम हर आवेदन पढ़ती है और कुछ कमी हो तो आपसे संपर्क करती है।"],
      ["सत्यापन और आकलन", "हम जानकारी का सत्यापन करते हैं और ज़रूरत का निष्पक्ष व गोपनीय आकलन करते हैं।"],
      ["सहायता का निर्णय", "आपको निर्णय और आगे के कदमों की जानकारी दी जाती है।"],
    ] as [string, string][],
    impactLabels: ["सहायता पाए विद्यार्थी", "मदद पाए पशु", "सहायता पाए लोग", "सहायता पाए परिवार"],
    footer: "RILOYD फ़ाउंडेशन — RILOYD की सामाजिक पहल।",
  },
};
