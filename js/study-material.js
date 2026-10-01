// ================================================================
// study-material.js — Class → Subject → Chapter → Resource flow, NCERT
// books, Entrance Exam content, and their admin editors.
// ================================================================
// ================================================================
// DEFAULT STUDY DATA (ALL CHAPTERS)
// ================================================================
const DEFAULT_STUDY_DATA = {
  "Class 6": {
    "Mathematics": ["Patterns in Mathematics","Lines and Angles","Number Play","Data Handling and Presentation","Prime Time","Perimeter and Area","Fractions","Playing with Constructions","Symmetry","The Other Side of Zero"],
    "Science": ["The Wonderful World of Science","Diversity in the Living World","Mindful Eating: A Path to a Healthy Body","Exploring Magnets","Measurement of Length and Motion","Materials Around Us","Temperature and its Measurement","A Journey through States of Water","Methods of Separation in Everyday Life","Living Creatures: Exploring their Characteristics","Nature's Treasures","Beyond Earth"],
    "English": ["A Bottle of Dew","The Raven and the Fox","Rama to the Rescue","The Unlikely Best Friends","A Friend's Prayer","The Chair","Neem Baba","What a Bird Thought","Spices That Heal Us","Change of Heart","The Winner","Yoga — A Way of Life","Hamara Bharat — Incredible India!","The Kites","Ila Sachani: Embroidering Dreams with Her Feet","National War Memorial"],
    "Hindi": ["मातृभूमि","गोल","पहली बूँद","हार की जीत","रहीम के दोहे","मेरी माँ","जलाते चलो","सत्रिया और बिहू नृत्य","मैया मैं नहिं माखन खायो","परीक्षा","चेतक की वीरता","हिंद महासागर में छोटा-सा हिंदुस्तान","पेड़ की बात"],
    "Social Science": ["Locating Places on the Earth","Oceans and Continents","Landforms and Life","Timeline and Sources of History","India, That Is Bharat","The Beginnings of Indian Civilisation","India's Cultural Roots","Unity in Diversity, or 'Many in the One'","Family and Community","Grassroots Democracy — Part 1: Governance","Grassroots Democracy — Part 2: Local Government in Rural Areas","Grassroots Democracy — Part 3: Local Government in Urban Areas","The Value of Work","Economic Activities Around Us"]
  },
  "Class 7": {
    "Mathematics": ["Large Numbers Around Us","Arithmetic Expressions","A Peek Beyond the Point","Expressions using Letter-Numbers","Parallel and Intersecting Lines","Number Play","A Tale of Three Intersecting Lines","Working with Fractions","Geometric Twins","Operations with Integers","Finding Common Ground","Another Peek Beyond the Point","Connecting the Dots","Constructions and Tilings","Finding the Unknown"],
    "Science": ["The Ever-Evolving World of Science","Exploring Substances: Acidic, Basic, and Neutral","Electricity: Circuits and Their Components","The World of Metals and Non-metals","Changes Around Us: Physical and Chemical","Adolescence: A Stage of Growth and Change","Heat Transfer in Nature","Measurement of Time and Motion","Life Processes in Animals","Life Processes in Plants","Light: Shadows and Reflections","Earth, Moon, and the Sun"],
    "English": ["The Wit that Won Hearts","A Concrete Example","Wisdom Paves the Way","A Tale of Valour: Major Somnath Sharma and the Battle of Badgam","Somebody's Mother","Verghese Kurien — I Too Had a Dream","The Case of the Fifth Word","The Magic Brush of Dreams","Spectacular Wonders","The Cherry Tree","Harvest Hymn","Waiting for the Rain","Feathered Friend","Magnifying Glass","Bibha Chowdhuri: The Beam of Light that Lit the Path for Women in Indian Science"],
    "Hindi": ["माँ, कह एक कहानी","तीन बुद्धिमान","फूल और काँटा","पानी रे पानी","नहीं होना बीमार","गिरिधर कविराय की कुंडलिया","वर्षा-बहार","बिरजू महाराज से साक्षात्कार","चिड़िया","मीरा के पद"],
    "Social Science": ["India and the World: Land and the People","The Earth's Interior and Surface","Our Changing Earth","The Medieval World","The Delhi Sultanate","The Mughal Empire","Tribes, Nomads and Settled Communities","Markets Around Us","Understanding the Constitution","From Barter to Money","Understanding Markets","The Making of India's Constitution"]
  },
  "Class 8": {
    "Mathematics": ["A Square and a Cube","Power Play","A Story of Numbers","Quadrilaterals","Number Play","We Distribute, Yet Things Multiply","Proportional Reasoning — 1","Proportional Reasoning — 2","Fractions in Disguise","Exploring Some Geometric Themes"],
    "Science": ["Exploring the Investigative World of Science","The Invisible Living World: Beyond Our Naked Eye","Health: The Ultimate Treasure","Electricity: Magnetic and Heating Effects","Exploring Forces","Pressure, Winds, Storms and Cyclones","Particles in Matter","The World of Light","Keeping Time with the Skies","The Living World","How Nature Works","Exploring the Universe","Our Home: Earth"],
    "English": ["The Wit that Won Hearts","A Concrete Example","Wisdom Paves the Way","A Tale of Valour: Major Somnath Sharma and the Battle of Badgam","Somebody's Mother","Verghese Kurien — I Too Had a Dream","The Case of the Fifth Word","The Magic Brush of Dreams","Spectacular Wonders","The Cherry Tree","Harvest Hymn","Waiting for the Rain","Feathered Friend","Magnifying Glass","Bibha Chowdhuri: The Beam of Light that Lit the Path for Women in Indian Science"],
    "Hindi": ["स्वदेश","दो गौरैया","एक आशीर्वाद","हरिद्वार","कबीर के दोहे","एक टोकरी भर मिट्टी","मत बाँधो","नए मेहमान","आदमी का अनुपात","तरुण के स्वप्न"],
    "Social Science": ["Natural Resources and Their Use","Reshaping India's Landforms","The Rise of the Marathas","The Delhi Sultanate","The Mughal Empire","Colonialism and the Indian Economy","The Making of the Indian Constitution","Parliament and the Making of Laws","Judiciary and the Rule of Law","Understanding Marginalisation","From Barter to Money","Understanding Markets"]
  },
  "Class 9": {
    "Mathematics": ["Number System","Introduction to Polynomials","Sequences and Progressions","Exploring Algebraic Identities","Linear Equations in Two Variables","Coordinate Geometry","Introduction to Euclid's Geometry: Axioms and Postulates","Lines and Angles","Triangles – Congruence Theorems","4-gons (Quadrilaterals)","Circles","Area and Perimeter","Surface Area and Volume","Statistics","Introduction to Probability"],
    "Science": ["Exploration: Entering the World of Secondary Science","Cell: The Building Block of Life","Tissues in Action","Describing Motion Around Us","Exploring Mixtures and Their Separation","How Forces Affect Motion","Work, Energy, and Simple Machines","Journey Inside the Atom","Atomic Foundations of Matter","Sound Waves: Characteristics and Applications","Reproduction: How Life Continues","Patterns in Life: Diversity and Classification","Earth as a System: Energy, Matter, and Life"],
    "English": ["How I Taught My Grandmother to Read","Bharat Our Land","The Pot Maker","Gifts of Grace: Honouring Our Vocations","Winds of Change","Canvas of Soil","Vitamin-M","I Cannot Remember My Mother","The World of Limitless Possibilities","Nine Gold Medals","Twin Melodies","A Friend Found in Music","Carrier of Words","Words","Follow That Dream","Believe in Yourself"],
    "Social Science": ["Understanding Social Science","Shaping the Earth's Surface","Atmosphere and Climate","Early Humans and Beginning of Civilisation","State and Society up to 1000 CE","Democracy","Elections","Building Blocks in Economics: The Problem of Choice","The Price Puzzle: What Drives the Market","India and the World","The Indian Constitution","Parliamentary Democracy","The Economy of India","Society and Culture","Environment and Sustainable Development","Governance and Citizenship"],
    "Hindi": ["दो बैलों की कथा","क्या लिखूँ?","संवादहीन","ऐसी भी बातें होती हैं","आखिरी चट्टान तक","रीढ़ की हड्डी","मैं और मेरा देश","पद","राम-लक्ष्मण-परशुराम संवाद","भारति, जय, विजय करे!","झाँसी की रानी","घर की याद"]
  },
  "Class 10": {
    "English": ["A Letter to God","Nelson Mandela: Long Walk to Freedom","Two Stories about Flying","From the Diary of Anne Frank","Glimpses of India","Mijbil the Otter","Madam Rides the Bus","The Sermon at Benares","The Proposal","Dust of Snow","Fire and Ice","A Tiger in the Zoo","How to Tell Wild Animals","The Ball Poem","Amanda!","The Trees","Fog","The Tale of Custard the Dragon","For Anne Gregory","A Triumph of Surgery","The Thief's Story","The Midnight Visitor","A Question of Trust","Footprints Without Feet","The Making of a Scientist","The Necklace","Bholi","The Book That Saved the Earth"],
    "Mathematics": ["Real Numbers","Polynomials","Pair of Linear Equations in Two Variables","Quadratic Equations","Arithmetic Progressions","Triangles","Coordinate Geometry","Introduction to Trigonometry","Some Applications of Trigonometry","Circles","Areas Related to Circles","Surface Areas and Volumes","Statistics","Probability"],
    "Science": ["Chemical Reactions and Equations","Acids, Bases and Salts","Metals and Non-metals","Carbon and Its Compounds","Periodic Classification of Elements","Life Processes","Control and Coordination","How do Organisms Reproduce?","Heredity","Light – Reflection and Refraction","Human Eye and the Colourful World","Electricity","Magnetic Effects of Electric Current","Sources of Energy","Our Environment","Sustainable Management of Natural Resources"],
    "Social Science": ["The Rise of Nationalism in Europe","Nationalism in India","The Making of a Global World","The Age of Industrialisation","Print Culture and the Modern World","Resources and Development","Forest and Wildlife Resources","Water Resources","Agriculture","Minerals and Energy Resources","Manufacturing Industries","Lifelines of National Economy","Power Sharing","Federalism","Gender, Religion and Caste","Political Parties","Outcomes of Democracy","Development","Sectors of the Indian Economy","Money and Credit","Globalisation and the Indian Economy","Consumer Rights"],
    "Hindi": ["नेताजी का चश्मा","बालगोबिन भगत","लखनवी अंदाज़","एक कहानी यह भी","नौबतखाने में इबादत","संस्कृति","पद","राम-लक्ष्मण-परशुराम संवाद","आत्मकथ्य","उत्साह और अट नहीं रही","यह दंतुरित मुस्कान और फसल","संगतकार","माता का अँचल","साना-साना हाथ जोड़ि...","मैं क्यों लिखता हूँ?"]
  },
  "Class 11": {
    "English": ["The Portrait of a Lady","A Photograph","We're Not Afraid to Die... if We Can All Be Together","Discovering Tut: The Saga Continues","The Laburnum Top","The Voice of the Rain","Childhood","The Adventure","Silk Road","Father to Son","The Summer of the Beautiful White Horse","The Address","Mother's Day","Birth","The Tale of Melon City"],
    "Mathematics": ["Sets","Relations and Functions","Trigonometric Functions","Complex Numbers and Quadratic Equations","Linear Inequalities","Permutations and Combinations","Binomial Theorem","Sequences and Series","Straight Lines","Conic Sections","Introduction to Three Dimensional Geometry","Limits and Derivatives","Statistics","Probability"],
    "Physics": ["Units and Measurements","Motion in a Straight Line","Motion in a Plane","Laws of Motion","Work, Energy and Power","System of Particles and Rotational Motion","Gravitation","Mechanical Properties of Solids","Mechanical Properties of Fluids","Thermal Properties of Matter","Thermodynamics","Kinetic Theory","Oscillations","Waves"],
    "Chemistry": ["Some Basic Concepts of Chemistry","Structure of Atom","Classification of Elements and Periodicity in Properties","Chemical Bonding and Molecular Structure","Thermodynamics","Equilibrium","Redox Reactions","Organic Chemistry – Some Basic Principles and Techniques","Hydrocarbons"],
    "Biology": ["The Living World","Biological Classification","Plant Kingdom","Animal Kingdom","Morphology of Flowering Plants","Anatomy of Flowering Plants","Structural Organisation in Animals","Cell: The Unit of Life","Biomolecules","Cell Cycle and Cell Division","Photosynthesis in Higher Plants","Respiration in Plants","Plant Growth and Development","Breathing and Exchange of Gases","Body Fluids and Circulation","Excretory Products and Their Elimination","Locomotion and Movement","Neural Control and Coordination","Chemical Coordination and Integration"],
    "Accountancy": ["Introduction to Accounting","Theory Base of Accounting","Recording of Business Transactions","Bank Reconciliation Statement","Trial Balance and Rectification of Errors","Depreciation, Provisions and Reserves","Bills of Exchange","Financial Statements – I","Financial Statements – II","Computerised Accounting System"],
    "Business Studies": ["Nature and Purpose of Business","Forms of Business Organisation","Private, Public and Global Enterprises","Business Services","Emerging Modes of Business","Social Responsibility of Business and Business Ethics","Sources of Business Finance","Small Business","Internal Trade","International Business"],
    "Economics": ["Introduction","Collection, Organisation and Presentation of Data","Statistical Tools and Interpretation","Consumer's Equilibrium and Demand","Producer Behaviour and Supply","Forms of Market and Price Determination under Perfect Competition with Simple Applications"],
    "Geography": ["Geography as a Discipline","The Origin and Evolution of the Earth","Interior of the Earth","Distribution of Oceans and Continents","Geomorphic Processes","Landforms and their Evolution","Composition and Structure of Atmosphere","Solar Radiation, Heat Balance and Temperature","Atmospheric Circulation and Weather Systems","Water in the Atmosphere","World Climate and Climate Change","Water (Oceans)","Movements of Ocean Water","Biodiversity and Conservation","India – Location","Structure and Physiography","Drainage System","Climate","Natural Vegetation","Natural Hazards and Disasters"],
    "History": ["Writing and City Life","An Empire Across Three Continents","Nomadic Empires","The Three Orders","Changing Cultural Traditions","Displacing Indigenous Peoples","Paths to Modernisation"],
    "Political Science": ["Constitution: Why and How?","Rights in the Indian Constitution","Election and Representation","Executive","Legislature","Judiciary","Federalism","Local Governments","Constitution as a Living Document","The Philosophy of the Constitution","Political Theory: An Introduction","Freedom","Equality","Social Justice","Rights","Citizenship","Nationalism","Secularism"],
    "Psychology": ["What is Psychology?","Methods of Enquiry in Psychology","Human Development","Sensory, Attentional and Perceptual Processes","Learning","Human Memory","Thinking","Motivation and Emotion"],
    "Sociology": ["Sociology and Society","Terms, Concepts and their Use in Sociology","Understanding Social Institutions","Culture and Socialisation","Doing Sociology: Research Methods"],
    "Physical Education": ["Changing Trends and Career in Physical Education","Olympic Value Education","Yoga","Physical Education and Sports for CWSN","Physical Fitness, Wellness and Lifestyle","Test, Measurement and Evaluation","Fundamentals of Anatomy and Physiology in Sports","Kinesiology, Biomechanics and Sports","Psychology and Sports","Training and Doping in Sports"]
  },
  "Class 12": {
    "English": ["The Last Lesson","Lost Spring","Deep Water","The Rattrap","Indigo","Poets and Pancakes","The Interview","Going Places","My Mother at Sixty-Six","An Elementary School Classroom in a Slum","Keeping Quiet","A Thing of Beauty","A Roadside Stand","Aunt Jennifer's Tigers","The Third Level","The Tiger King","Journey to the End of the Earth","The Enemy","On the Face of It","Memories of Childhood"],
    "Mathematics": ["Relations and Functions","Inverse Trigonometric Functions","Matrices","Determinants","Continuity and Differentiability","Application of Derivatives","Integrals","Application of Integrals","Differential Equations","Vector Algebra","Three Dimensional Geometry","Linear Programming","Probability"],
    "Physics": ["Electric Charges and Fields","Electrostatic Potential and Capacitance","Current Electricity","Moving Charges and Magnetism","Magnetism and Matter","Electromagnetic Induction","Alternating Current","Electromagnetic Waves","Ray Optics and Optical Instruments","Wave Optics","Dual Nature of Radiation and Matter","Atoms","Nuclei","Semiconductor Electronics: Materials, Devices and Simple Circuits"],
    "Chemistry": ["Solutions","Electrochemistry","Chemical Kinetics","The d- and f-Block Elements","Coordination Compounds","Haloalkanes and Haloarenes","Alcohols, Phenols and Ethers","Aldehydes, Ketones and Carboxylic Acids","Amines","Biomolecules"],
    "Biology": ["Sexual Reproduction in Flowering Plants","Human Reproduction","Reproductive Health","Principles of Inheritance and Variation","Molecular Basis of Inheritance","Evolution","Human Health and Disease","Microbes in Human Welfare","Biotechnology: Principles and Processes","Biotechnology and its Applications","Organisms and Populations","Ecosystem","Biodiversity and Conservation"],
    "Accountancy": ["Accounting for Partnership Firms – Basic Concepts","Reconstitution of a Partnership Firm – Admission of a Partner","Reconstitution of a Partnership Firm – Retirement/Death of a Partner","Dissolution of Partnership Firm","Accounting for Share Capital","Accounting for Debentures","Financial Statements of a Company","Analysis of Financial Statements","Accounting Ratios","Cash Flow Statement","Computerised Accounting System"],
    "Business Studies": ["Nature and Significance of Management","Principles of Management","Business Environment","Planning","Organising","Staffing","Directing","Controlling","Financial Management","Financial Markets","Marketing Management","Consumer Protection"],
    "Economics": ["Introduction","National Income Accounting","Money and Banking","Determination of Income and Employment","Government Budget and the Economy","Open Economy Macroeconomics","Indian Economy on the Eve of Independence","Indian Economy (1950–1990)","Liberalisation, Privatisation and Globalisation: An Appraisal","Human Capital Formation in India","Rural Development","Employment: Growth, Informalisation and Other Issues","Environment and Sustainable Economic Development","Comparative Development Experiences of India and its Neighbours"],
    "Geography": ["Human Geography","The World Population: Density, Distribution and Growth","Human Development","Primary Activities","Secondary Activities","Tertiary and Quaternary Activities","Transport, Communication and Trade","International Trade","Population Distribution, Density, Growth and Composition","Human Settlements","Land Resources and Agriculture","Water Resources","Mineral and Energy Resources","Planning and Sustainable Development in Indian Context","Transport and Communication","International Trade","Geographical Perspective on Selected Issues and Problems"],
    "History": ["Bricks, Beads and Bones – The Harappan Civilisation","Kings, Farmers and Towns – Early States and Economies","Kinship, Caste and Class – Early Societies","Thinkers, Beliefs and Buildings – Cultural Developments","Through the Eyes of Travellers – Perceptions of Society","Bhakti-Sufi Traditions – Changes in Religious Beliefs and Devotional Texts","An Imperial Capital – Vijayanagara","Peasants, Zamindars and the State – Agrarian Society and the Mughal Empire","Colonialism and the Countryside – Exploring Official Archives","Rebels and the Raj – 1857 Revolt and its Representations","Mahatma Gandhi and the Nationalist Movement – Civil Disobedience and Beyond","Framing the Constitution – The Beginning of a New Era"],
    "Political Science": ["The End of Bipolarity","Contemporary Centres of Power","Contemporary South Asia","International Organizations","Security in the Contemporary World","Environment and Natural Resources","Globalisation","Challenges of Nation-Building","Era of One-Party Dominance","Politics of Planned Development","India's External Relations","Challenges to and Restoration of the Congress System","The Crisis of Democratic Order","Regional Aspirations","Recent Developments in Indian Politics"],
    "Psychology": ["Variations in Psychological Attributes","Self and Personality","Meeting Life Challenges","Psychological Disorders","Therapeutic Approaches","Attitude and Social Cognition","Social Influence and Group Processes"],
    "Sociology": ["Introducing Indian Society","The Demographic Structure of Indian Society","Social Institutions: Continuity and Change","Market as a Social Institution","Patterns of Social Inequality and Exclusion","The Challenges of Cultural Diversity","Structural Change","Cultural Change","Change and Development in Rural Society","Change and Development in Industrial Society","Globalisation and Social Change","Mass Media and Communications","Social Movements"],
    "Physical Education": ["Management of Sporting Events","Children and Women in Sports","Yoga as Preventive Measure for Lifestyle Disease","Physical Education and Sports for CWSN","Sports and Nutrition","Test and Measurement in Sports","Physiology and Sports","Kinesiology, Biomechanics and Sports","Psychology and Sports","Training in Sports"]
  }
};
const DEFAULT_ENTRANCE_DATA = [
  { exam: "Sainik School — AISSEE", category: "syllabus", title: "AISSEE Syllabus", body: "📚 Mathematics, 🧠 Intelligence, 📖 Language, 🌍 General Knowledge" },
  { exam: "Sainik School — AISSEE", category: "pattern", title: "AISSEE Exam Pattern", body: "125 Questions, 300 Marks, 150 Minutes" },
  { exam: "Sainik School — AISSEE", category: "pyq", title: "AISSEE Previous Year Papers", body: "2024, 2023, 2022, 2021, 2020" },
  { exam: "Sainik School — AISSEE", category: "practice", title: "AISSEE Practice Papers", body: "Practice Set 1-5" },
  { exam: "Sainik School — AISSEE", category: "notes", title: "AISSEE Preparation Tips", body: "NCERT books, Mental Ability, GK, Mock tests" },
  { exam: "JNVST", category: "syllabus", title: "JNVST Syllabus", body: "Mental Ability, Arithmetic, Language" },
  { exam: "JNVST", category: "pattern", title: "JNVST Exam Pattern", body: "80 Questions, 100 Marks, 2 Hours" },
  { exam: "JNVST", category: "pyq", title: "JNVST Previous Year Papers", body: "2024, 2023, 2022, 2021, 2020" },
  { exam: "JNVST", category: "practice", title: "JNVST Practice Papers", body: "Practice Set 1-5" },
  { exam: "JNVST", category: "notes", title: "JNVST Preparation Tips", body: "Mental Ability, Arithmetic, Mock tests" },
  { exam: "RMS CET", category: "syllabus", title: "RMS CET Syllabus", body: "Mathematics, Intelligence, English, GK" },
  { exam: "RMS CET", category: "pattern", title: "RMS CET Exam Pattern", body: "200 Marks, No Negative Marking, Interview 20 Marks" },
  { exam: "RMS CET", category: "pyq", title: "RMS CET Previous Year Papers", body: "2024, 2023, 2022" },
  { exam: "AMU School Entrance", category: "syllabus", title: "AMU School Entrance Syllabus", body: "Mathematics, English, GK, Mental Ability" },
  { exam: "AMU School Entrance", category: "pattern", title: "AMU School Entrance Exam Pattern", body: "100 Questions, 2 Hours" },
  { exam: "BHU School Entrance", category: "syllabus", title: "BHU School Entrance Syllabus", body: "Mathematics, English, Hindi, GK, Mental Ability" },
  { exam: "BHU School Entrance", category: "pattern", title: "BHU School Entrance Exam Pattern", body: "100 Questions, 2 Hours" }
];
// One-time cleanup for any duplicate Study Material / Entrance Exam
// resources that were created by the old (racy) seeding code, before it
// switched to deterministic document ids. For each duplicate group, keeps
// the copy that has an actual uploaded file (fileData) if one exists,
// otherwise keeps the oldest, and deletes the rest.
async function dedupeStudyMaterial(silent) {
  let removed = 0;
  try {
    const studySnap = await fsDb.collection('studyContent').get();
    const groups = {};
    const toDelete = [];
    studySnap.forEach(doc => {
      const d = doc.data();
      // The auto-generated "Key topics will be added soon" placeholder
      // ("Overview" notes with isDefault true and no real file/body content
      // beyond the placeholder text) is no longer wanted at all — remove
      // every one of these outright, not just duplicate copies.
      if (d.isDefault && !d.fileData) {
        toDelete.push(doc.id);
        return;
      }
      const key = `${d.class}|||${d.subject}|||${d.chapter}|||${d.type}`;
      (groups[key] = groups[key] || []).push({ docId: doc.id, data: d });
    });
    Object.values(groups).forEach(group => {
      if (group.length < 2) return;
      group.sort((a, b) => {
        const aHasFile = a.data.fileData ? 1 : 0, bHasFile = b.data.fileData ? 1 : 0;
        if (aHasFile !== bHasFile) return bHasFile - aHasFile; // prefer the one with an actual file
        return (a.data.id || 0) - (b.data.id || 0); // else keep the oldest
      });
      group.slice(1).forEach(dupe => toDelete.push(dupe.docId));
    });
    // Firestore batches max out at 500 writes, so delete in chunks.
    const CHUNK = 450;
    for (let i = 0; i < toDelete.length; i += CHUNK) {
      const batch = fsDb.batch();
      toDelete.slice(i, i + CHUNK).forEach(docId => batch.delete(fsDb.collection('studyContent').doc(docId)));
      await batch.commit();
    }
    removed = toDelete.length;
  } catch (err) {
    console.error('Dedupe studyContent failed:', err);
    showToast('⚠️ Could not clean up Study Material duplicates.', 'error');
    return;
  }

  let removedEntrance = 0;
  try {
    const entranceSnap = await fsDb.collection('entranceContent').get();
    const groups2 = {};
    entranceSnap.forEach(doc => {
      const d = doc.data();
      const key = `${d.exam}|||${d.category}|||${d.title}`;
      (groups2[key] = groups2[key] || []).push({ docId: doc.id, data: d });
    });
    const batch2 = fsDb.batch();
    Object.values(groups2).forEach(group => {
      if (group.length < 2) return;
      group.sort((a, b) => {
        const aDefault = a.data.isDefault ? 1 : 0, bDefault = b.data.isDefault ? 1 : 0;
        if (aDefault !== bDefault) return aDefault - bDefault;
        const aHasFile = a.data.fileData ? 1 : 0, bHasFile = b.data.fileData ? 1 : 0;
        if (aHasFile !== bHasFile) return bHasFile - aHasFile;
        return (a.data.id || 0) - (b.data.id || 0);
      });
      group.slice(1).forEach(dupe => { batch2.delete(fsDb.collection('entranceContent').doc(dupe.docId)); removedEntrance++; });
    });
    if (removedEntrance) await batch2.commit();
  } catch (err) {
    console.error('Dedupe entranceContent failed:', err);
  }

  const total = removed + removedEntrance;
  if (!silent || total > 0) showToast(total > 0 ? `✅ Removed ${total} duplicate resource${total > 1 ? 's' : ''}.` : 'ℹ️ No duplicates found.');
  renderAll();
}
let editingStudyId = null;
let editingEntranceId = null;
const CLASS_OPTIONS = ['Nursery','LKG','UKG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12','Graduation','Post Graduation','Other'];
function renderAdminSubjectDropdown() {
  const cls = document.getElementById('sc_class').value;
  const sel = document.getElementById('sc_subject');
  document.getElementById('sc_subject_custom').style.display = 'none';
  document.getElementById('sc_subject_custom').value = '';
  if (!cls) {
    sel.innerHTML = '<option value="">Select Class First</option>';
    renderAdminChapterDropdown();
    renderAdminContent();
    return;
  }
  // Existing subjects = defaults for this class + any admin-added ones already saved
  const defaultSubjects = Object.keys(DEFAULT_STUDY_DATA[cls] || {});
  const savedSubjects = [...new Set(getData('studyContent').filter(c => c.class === cls).map(c => c.subject))];
  const allSubjects = [...new Set([...defaultSubjects, ...savedSubjects])];
  sel.innerHTML = '<option value="">Select Subject</option>' +
    allSubjects.map(s => `<option value="${s}">${s}</option>`).join('') +
    '<option value="__new__">➕ Add New Subject</option>';
  renderAdminChapterDropdown();
  renderAdminContent();
}
function onScSubjectChange() {
  const sel = document.getElementById('sc_subject');
  document.getElementById('sc_subject_custom').style.display = sel.value === '__new__' ? 'block' : 'none';
  renderAdminChapterDropdown();
  renderAdminContent();
}
// Chapter rename overrides — stored under the same 'settings' collection as
// Branding/Homepage Content (no new Firestore rule needed). Keyed by the
// chapter's ORIGINAL built-in name, so it renames the site's default
// curriculum chapters everywhere they're shown, even before anything has
// been uploaded under them — not just already-uploaded resources.
function chapterRenameKey(cls, subj, rawName) { return cls + '|||' + subj + '|||' + rawName; }
function getChapterRenames() {
  fsSettingsListen('chapterRenames');
  return fsSettingsGet('chapterRenames') || {};
}
function displayChapterName(cls, subj, rawName) {
  return getChapterRenames()[chapterRenameKey(cls, subj, rawName)] || rawName;
}
function saveChapterRename(cls, subj, rawName, newName) {
  const renames = getChapterRenames();
  renames[chapterRenameKey(cls, subj, rawName)] = newName;
  fsSettingsSave('chapterRenames', renames);
}
function renderAdminChapterDropdown() {
  const cls = document.getElementById('sc_class').value;
  const subjSel = document.getElementById('sc_subject');
  const subj = subjSel.value === '__new__' ? document.getElementById('sc_subject_custom').value.trim() : subjSel.value;
  const chSel = document.getElementById('sc_chapter');
  document.getElementById('sc_chapter_custom').style.display = 'none';
  document.getElementById('sc_chapter_custom').value = '';
  const renameBtn = document.getElementById('sc_rename_chapter_btn');
  if (renameBtn) renameBtn.style.display = 'none';
  if (!cls || !subj) {
    chSel.innerHTML = '<option value="">Select Subject First</option>';
    return;
  }
  const defaultChaptersRaw = (DEFAULT_STUDY_DATA[cls] && DEFAULT_STUDY_DATA[cls][subj]) ? DEFAULT_STUDY_DATA[cls][subj] : [];
  const savedChapters = [...new Set(getData('studyContent').filter(c => c.class === cls && c.subject === subj).map(c => c.chapter))];
  const seen = new Set();
  let optionsHtml = '';
  defaultChaptersRaw.forEach(raw => {
    const display = displayChapterName(cls, subj, raw);
    if (seen.has(display)) return;
    seen.add(display);
    optionsHtml += `<option value="${display}" data-raw="${raw}">${display}</option>`;
  });
  savedChapters.forEach(name => {
    if (seen.has(name)) return;
    seen.add(name);
    optionsHtml += `<option value="${name}">${name}</option>`;
  });
  chSel.innerHTML = '<option value="">Select Chapter</option>' + optionsHtml + '<option value="__new__">➕ Add New Chapter</option>';
}
function onScChapterChange() {
  const sel = document.getElementById('sc_chapter');
  document.getElementById('sc_chapter_custom').style.display = sel.value === '__new__' ? 'block' : 'none';
  const renameBtn = document.getElementById('sc_rename_chapter_btn');
  if (renameBtn) renameBtn.style.display = (sel.value && sel.value !== '__new__') ? 'inline-flex' : 'none';
}
// Renames the selected chapter — for a default curriculum chapter this
// saves a display-name override (works instantly, even with nothing
// uploaded yet); any resources already uploaded under the old name are
// also renamed so the data stays clean.
function renameSelectedChapter() {
  const cls = document.getElementById('sc_class').value;
  const subjSel = document.getElementById('sc_subject');
  const subj = subjSel.value === '__new__' ? document.getElementById('sc_subject_custom').value.trim() : subjSel.value;
  const chSel = document.getElementById('sc_chapter');
  const oldName = chSel.value;
  if (!cls || !subj || !oldName || oldName === '__new__') { showToast('⚠️ Select an existing chapter first.', 'error'); return; }
  const selectedOption = chSel.options[chSel.selectedIndex];
  const rawDefaultName = selectedOption ? selectedOption.getAttribute('data-raw') : null;
  const newName = prompt('Rename chapter "' + oldName + '" to:', oldName);
  if (!newName || !newName.trim() || newName.trim() === oldName) return;
  const finalName = newName.trim();

  if (rawDefaultName) saveChapterRename(cls, subj, rawDefaultName, finalName);

  const items = getData('studyContent').filter(c => c.class === cls && c.subject === subj && c.chapter === oldName);
  items.forEach(it => updateData('studyContent', it.id, { chapter: finalName }));

  showToast('✅ Renamed to "' + finalName + '"' + (items.length ? ' (' + items.length + ' item' + (items.length > 1 ? 's' : '') + ' updated).' : '.'));
  renderAdminChapterDropdown();
  renderAdminContent();
}
async function uploadStudyContent() {
  const subjectVal = getSelectOrCustomValue('sc_subject', 'sc_subject_custom');
  const chapterVal = getSelectOrCustomValue('sc_chapter', 'sc_chapter_custom');
  const file = document.getElementById('sc_file').files[0];
  let fileData = null, fileName = null, filePages = 1, fileIsPdf = false;
  if (file) {
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB — Cloudinary free tier handles this comfortably
    if (file.size > MAX_SIZE) {
      showToast('⚠️ File too big! Max 15MB allowed.', 'error');
      return;
    }
    showToast('⏳ Uploading file...');
    try {
      const uploaded = await uploadViewOnlyFile(file, 'althea-scholar/study-material');
      fileData = uploaded.url;
      filePages = uploaded.pages;
      fileIsPdf = uploaded.isPdf;
    } catch (err) {
      showToast('⚠️ File upload failed — check your internet connection.', 'error');
      return;
    }
    fileName = file.name;
  }
  const data = {
    class: document.getElementById('sc_class').value,
    subject: subjectVal,
    chapter: chapterVal,
    title: document.getElementById('sc_title').value,
    type: document.getElementById('sc_type').value,
    body: document.getElementById('sc_body').value,
    category: 'study',
    uploadedAt: new Date().toISOString()
  };
  if (!data.class || !data.subject || !data.chapter) { showToast('⚠️ Fill Class, Subject & Chapter!', 'error'); return; }
  try {
    if (editingStudyId) {
      // Keep existing file unless a new one was chosen
      if (file) { data.file = fileName; data.fileData = fileData; data.filePages = filePages; data.fileIsPdf = fileIsPdf; }
      updateData('studyContent', editingStudyId, data);
      showToast('✅ Study content updated!');
    } else {
      data.file = fileName;
      data.fileData = fileData;
      data.filePages = filePages;
      data.fileIsPdf = fileIsPdf;
      addData('studyContent', data);
      showToast('✅ Study content uploaded!');
    }
  } catch (e) {
    showToast('⚠️ Storage full! Delete old files or use a smaller file.', 'error');
    return;
  }
  renderAll();
  const clsKeep = document.getElementById('sc_class').value;
  renderAdminSubjectDropdown();
  document.getElementById('sc_class').value = clsKeep;
  document.getElementById('sc_subject').value = subjectVal;
  renderAdminChapterDropdown();
  document.getElementById('sc_chapter').value = chapterVal;
  document.querySelectorAll('#admin-study-content .admin-form input, #admin-study-content .admin-form textarea').forEach(el => { if (el.id !== 'sc_subject_custom' && el.id !== 'sc_chapter_custom') el.value = ''; });
  document.getElementById('sc_file').value = '';
  document.getElementById('sc_subject_custom').style.display = 'none';
  document.getElementById('sc_chapter_custom').style.display = 'none';
  cancelEditStudyContent();
}
function editStudyContent(id) {
  const item = getData('studyContent').find(c => c.id === id);
  if (!item) return;
  editingStudyId = id;
  document.getElementById('sc_class').value = item.class;
  renderAdminSubjectDropdown();
  document.getElementById('sc_subject').value = item.subject;
  renderAdminChapterDropdown();
  document.getElementById('sc_chapter').value = item.chapter;
  document.getElementById('sc_title').value = item.title || '';
  // Legacy items may still have one of the old fine-grained types
  // (mindmap/exercise/extra/pyq) from before the upload form had just 2
  // grouped options — map them onto the group they belong to so the
  // dropdown always has a valid selection.
  document.getElementById('sc_type').value = (STUDY_TYPE_GROUPS.practice.includes(item.type)) ? 'practice' : 'notes';
  document.getElementById('sc_body').value = item.body || '';
  document.getElementById('sc_file').value = '';
  document.getElementById('sc_file_note').style.display = item.fileData ? 'block' : 'none';
  document.getElementById('sc_edit_banner').style.display = 'block';
  document.getElementById('sc_submit_btn').innerHTML = '<i class="fas fa-save"></i> Update Content';
  showAdminTab('study-content');
  document.getElementById('admin-study-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function cancelEditStudyContent() {
  editingStudyId = null;
  document.getElementById('sc_edit_banner').style.display = 'none';
  document.getElementById('sc_file_note').style.display = 'none';
  document.getElementById('sc_submit_btn').innerHTML = '<i class="fas fa-upload"></i> Upload Content';
}
async function uploadEntranceContent() {
  const file = document.getElementById('ec_file').files[0];
  let fileData = null, fileName = null, filePages = 1, fileIsPdf = false;
  if (file) {
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('⚠️ File too big! Max 15MB allowed.', 'error');
      return;
    }
    showToast('⏳ Uploading file...');
    try {
      const uploaded = await uploadViewOnlyFile(file, 'althea-scholar/entrance-content');
      fileData = uploaded.url;
      filePages = uploaded.pages;
      fileIsPdf = uploaded.isPdf;
    } catch (err) {
      showToast('⚠️ File upload failed — check your internet connection.', 'error');
      return;
    }
    fileName = file.name;
  }
  const data = {
    exam: document.getElementById('ec_exam').value,
    category: document.getElementById('ec_category').value,
    title: document.getElementById('ec_title').value,
    body: document.getElementById('ec_body').value,
    categoryType: 'entrance',
    uploadedAt: new Date().toISOString()
  };
  if (!data.exam || !data.category) { showToast('⚠️ Fill Exam & Category!', 'error'); return; }
  try {
    if (editingEntranceId) {
      if (file) { data.file = fileName; data.fileData = fileData; data.filePages = filePages; data.fileIsPdf = fileIsPdf; }
      updateData('entranceContent', editingEntranceId, data);
      showToast('✅ Entrance content updated!');
    } else {
      data.file = fileName;
      data.fileData = fileData;
      data.filePages = filePages;
      data.fileIsPdf = fileIsPdf;
      addData('entranceContent', data);
      showToast('✅ Entrance content uploaded!');
    }
  } catch (e) {
    showToast('⚠️ Storage full! Delete old files or use a smaller file.', 'error');
    return;
  }
  renderAll();
  document.querySelectorAll('#admin-entrance-content .admin-form input, #admin-entrance-content .admin-form textarea, #admin-entrance-content .admin-form select').forEach(el => el.value = '');
  document.getElementById('ec_file').value = '';
  cancelEditEntranceContent();
}
function editEntranceContent(id) {
  const item = getData('entranceContent').find(c => String(c.id) === String(id));
  if (!item) return;
  editingEntranceId = item.id;
  document.getElementById('ec_exam').value = item.exam;
  document.getElementById('ec_category').value = item.category;
  document.getElementById('ec_title').value = item.title || '';
  document.getElementById('ec_body').value = item.body || '';
  document.getElementById('ec_file').value = '';
  document.getElementById('ec_file_note').style.display = item.fileData ? 'block' : 'none';
  document.getElementById('ec_edit_banner').style.display = 'block';
  document.getElementById('ec_submit_btn').innerHTML = '<i class="fas fa-save"></i> Update Content';
  showAdminTab('entrance-content');
  document.getElementById('admin-entrance-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function cancelEditEntranceContent() {
  editingEntranceId = null;
  document.getElementById('ec_edit_banner').style.display = 'none';
  document.getElementById('ec_file_note').style.display = 'none';
  document.getElementById('ec_submit_btn').innerHTML = '<i class="fas fa-upload"></i> Upload Entrance Content';
}
// ================================================================
// Resource Library (Syllabus / Sample Papers / Previous Year Question
// Papers / Toppers' Answer Sheets) — shown as "More Resources" on the
// Study Material page. Fully admin-managed: category, class, subject
// (free text so admin can add new subjects), title & a PDF per item.
// ================================================================
const SM_RES_CATS = {
  syllabus: { label: 'Syllabus', icon: 'fa-list-check', color: '#1e6be0', desc: 'Get the latest syllabus for your class and subject.' },
  sample: { label: 'Sample Papers', icon: 'fa-file-lines', color: '#7c3aed', desc: 'Download sample papers to practice and improve.' },
  pyq: { label: 'Previous Year Question Papers', icon: 'fa-folder-open', color: '#f07a10', desc: 'Get previous year papers with solutions (if available).' },
  toppers: { label: "Toppers' Answer Sheets", icon: 'fa-trophy', color: '#e11d74', desc: "Study toppers' answer sheets to understand the exam pattern and marking style." }
};
// ---------- Study Material hero image (admin-replaceable) ----------
const SM_HERO_DEFAULT_SVG = `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="95" width="90" height="14" rx="3" fill="var(--primary)"/>
  <rect x="38" y="79" width="74" height="14" rx="3" fill="#e05c8a"/>
  <rect x="46" y="63" width="58" height="14" rx="3" fill="#c9971f"/>
  <rect x="118" y="60" width="14" height="52" rx="3" fill="#c9971f"/>
  <rect x="136" y="65" width="10" height="47" rx="3" fill="var(--accent)"/>
</svg>`;
function renderSmHeroArt() {
  const el = document.getElementById('smHeroArt');
  if (!el) return;
  const s = fsSettingsGet('studyHero') || {};
  el.innerHTML = (s.image ? `<img src="${s.image}" alt="Study Material">` : SM_HERO_DEFAULT_SVG) + '<span class="sm-hero-txt">Better Learning<br>Brighter Future</span>';
}
let _smHeroImg = null;
function onSmHeroImg(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  compressImageToDataUrl(file, 500, 0.82).then(url => { _smHeroImg = url; document.getElementById('sm_hero_prev').src = url; });
}
function clearSmHeroImg() {
  _smHeroImg = '';
  document.getElementById('sm_hero_file').value = '';
  document.getElementById('sm_hero_prev').src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
}
function populateSmHeroForm() {
  const s = fsSettingsGet('studyHero') || {};
  _smHeroImg = s.image || null;
  document.getElementById('sm_hero_prev').src = s.image || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
}
function saveSmHero() {
  fsSettingsSave('studyHero', { image: _smHeroImg === null ? ((fsSettingsGet('studyHero') || {}).image || '') : (_smHeroImg || '') });
  renderSmHeroArt();
  showToast('✅ Study Material image saved!');
}
function renderStudyMoreResources() {
  const grid = document.getElementById('sm-more-grid');
  if (!grid) return;
  grid.innerHTML = Object.entries(SM_RES_CATS).map(([key, c]) =>
    `<div class="sm-more-card" onclick="openSmResModal('${key}')"><div class="ic" style="background:${c.color}"><i class="fas ${c.icon}"></i></div><h4>${c.label}</h4><p>${c.desc}</p><span class="view">View <i class="fas fa-arrow-right"></i></span></div>`
  ).join('');
}
let _smResCat = '';
function openSmResModal(cat) {
  _smResCat = cat;
  const c = SM_RES_CATS[cat];
  document.getElementById('smResModalTitle').innerHTML = `<i class="fas ${c.icon}" style="color:${c.color}"></i> ${c.label}`;
  const clsSel = document.getElementById('smres_class');
  if (!clsSel.dataset.ready) { clsSel.dataset.ready = '1'; clsSel.innerHTML = studyClassesList.map(x => `<option value="${x}">${x}</option>`).join(''); }
  document.getElementById('smres_subject').innerHTML = '<option value="">All subjects</option>';
  smResLoad();
  document.getElementById('smResModalOverlay').classList.add('show');
}
function closeSmResModal() { document.getElementById('smResModalOverlay').classList.remove('show'); }
function smResLoad() {
  const cls = document.getElementById('smres_class').value || studyClassesList[0];
  document.getElementById('smres_class').value = cls;
  const items = getData('studyExtras').filter(x => x.visible !== false && x.category === _smResCat && x.class === cls);
  const subjects = [...new Set(items.map(x => x.subject))];
  const subSel = document.getElementById('smres_subject');
  const curSub = subSel.value;
  subSel.innerHTML = '<option value="">All subjects</option>' + subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  if (subjects.includes(curSub)) subSel.value = curSub;
  const subFilter = subSel.value;
  const filtered = subFilter ? items.filter(x => x.subject === subFilter) : items;
  const list = document.getElementById('smResList');
  list.innerHTML = filtered.length
    ? filtered.map(x => `<div class="sm-res-item"><i class="fas fa-file-pdf" style="color:#c0392b"></i><div class="n">${x.title}<span class="sub">${x.subject}</span></div>${x.fileData ? `<button class="btn btn-primary btn-sm" onclick="openPageReader('studyExtras', ${x.id})"><i class="fas fa-eye"></i> View</button>` : ''}</div>`).join('')
    : '<p class="study-empty-msg" style="border:0;padding:20px 0;">No files uploaded yet for this selection.</p>';
}
// ---------- Admin: upload / list Resource Library items ----------
let _seCategory = 'syllabus';
let editingStudyExtraId = null;
function initStudyExtraChips() {
  const wrap = document.getElementById('seChips'), clsSel = document.getElementById('se_class');
  if (!wrap.dataset.ready) {
    wrap.dataset.ready = '1';
    wrap.innerHTML = Object.entries(SM_RES_CATS).map(([key, c]) => `<button type="button" data-c="${key}" style="background:${c.color}" onclick="seSetCategory('${key}')">${c.label}</button>`).join('');
    clsSel.innerHTML = studyClassesList.map(c => `<option value="${c}">${c}</option>`).join('');
  }
  seSetCategory(_seCategory);
  refreshSeSubjectList();
}
function seSetCategory(key) {
  _seCategory = key;
  document.querySelectorAll('#seChips button').forEach(b => b.classList.toggle('on', b.dataset.c === key));
}
function refreshSeSubjectList() {
  const dl = document.getElementById('se_subject_list');
  const subjects = [...new Set(getData('studyExtras').map(x => x.subject))];
  dl.innerHTML = subjects.map(s => `<option value="${s}">`).join('');
}
function resetStudyExtraForm() {
  editingStudyExtraId = null;
  document.getElementById('se_subject').value = '';
  document.getElementById('se_title').value = '';
  document.getElementById('se_file').value = '';
  document.getElementById('se_file_note').style.display = 'none';
  document.getElementById('se_visible').checked = true;
  document.getElementById('sePublishBtn').innerHTML = '<i class="fas fa-upload"></i> Upload';
}
async function uploadStudyExtra() {
  const cls = document.getElementById('se_class').value;
  const subject = document.getElementById('se_subject').value.trim();
  const title = document.getElementById('se_title').value.trim();
  const file = document.getElementById('se_file').files[0];
  if (!subject || !title) { showToast('⚠️ Fill Subject & Title!', 'error'); return; }
  if (!file && !editingStudyExtraId) { showToast('⚠️ Choose a PDF to upload!', 'error'); return; }
  let fileData = null, fileName = null, filePages = 1, fileIsPdf = false;
  if (file) {
    if (file.size > 15 * 1024 * 1024) { showToast('⚠️ File too big! Max 15MB allowed.', 'error'); return; }
    showToast('⏳ Uploading file...');
    try {
      const uploaded = await uploadViewOnlyFile(file, 'althea-scholar/study-extras');
      fileData = uploaded.url; filePages = uploaded.pages; fileIsPdf = uploaded.isPdf; fileName = file.name;
    } catch (err) { showToast('⚠️ File upload failed — check your internet connection.', 'error'); return; }
  }
  const data = { category: _seCategory, class: cls, subject, title, visible: document.getElementById('se_visible').checked };
  if (file) { data.file = fileName; data.fileData = fileData; data.filePages = filePages; data.fileIsPdf = fileIsPdf; }
  if (editingStudyExtraId) { updateData('studyExtras', editingStudyExtraId, data); showToast('✅ Resource updated!'); }
  else { addData('studyExtras', data); showToast('✅ Resource uploaded!'); }
  resetStudyExtraForm();
  refreshSeSubjectList();
  renderAdminStudyExtras();
}
function editStudyExtra(id) {
  const item = getData('studyExtras').find(x => x.id === id);
  if (!item) return;
  editingStudyExtraId = id;
  seSetCategory(item.category);
  document.getElementById('se_class').value = item.class;
  document.getElementById('se_subject').value = item.subject;
  document.getElementById('se_title').value = item.title;
  document.getElementById('se_visible').checked = item.visible !== false;
  document.getElementById('se_file').value = '';
  document.getElementById('se_file_note').style.display = item.fileData ? 'block' : 'none';
  document.getElementById('sePublishBtn').innerHTML = '<i class="fas fa-save"></i> Save Changes';
  document.getElementById('admin-study-extras').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function renderAdminStudyExtras() {
  const tbody = document.getElementById('adminStudyExtrasTable');
  if (!tbody) return;
  const items = getData('studyExtras').slice().sort((a, b) => b.id - a.id);
  tbody.innerHTML = items.length ? items.map(x => `
    <tr>
      <td>${SM_RES_CATS[x.category] ? SM_RES_CATS[x.category].label : x.category}</td>
      <td>${x.class}</td>
      <td>${x.subject}</td>
      <td><strong>${x.title}</strong></td>
      <td><label class="mini-toggle-row"><input type="checkbox" ${x.visible !== false ? 'checked' : ''} onchange="updateData('studyExtras', ${x.id}, {visible:this.checked}); renderAdminStudyExtras();"> ${x.visible !== false ? 'Visible' : 'Hidden'}</label></td>
      <td style="white-space:nowrap;"><button class="btn btn-accent btn-sm" onclick="editStudyExtra(${x.id})"><i class="fas fa-edit"></i></button>
      <button class="btn btn-danger btn-sm" onclick="if(confirm('Delete this file?')) deleteData('studyExtras', ${x.id})"><i class="fas fa-trash"></i></button></td>
    </tr>`).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--gray);">No files uploaded yet.</td></tr>';
}
function renderAdminContent() {
  const contents = getData('studyContent');
  const tbody = document.getElementById('adminContentTable');
  if (!tbody) return;
  // Filter the list below to match whatever Class/Subject is currently
  // picked in the upload form above, so uploading doesn't bury new items
  // in 70+ unrelated rows. A dropdown left on its placeholder ("Select
  // Class"/"Select Subject") means "don't filter by this field".
  const filterClass = document.getElementById('sc_class') ? document.getElementById('sc_class').value : '';
  const subjSel = document.getElementById('sc_subject');
  const filterSubject = (subjSel && subjSel.value && subjSel.value !== '__new__') ? subjSel.value : '';
  const filtered = contents.filter(c =>
    (!filterClass || c.class === filterClass) && (!filterSubject || c.subject === filterSubject)
  );
  const typeMap = { notes:'📝 Notes', mindmap:'🧠 Mind Map', exercise:'📖 Exercise', extra:'❓ Extra Q', practice:'📄 Practice', pyq:'📜 PYQ' };
  tbody.innerHTML = filtered.length ? filtered.map(c => `
    <tr>
      <td>${c.class}</td>
      <td>${c.subject}</td>
      <td>${c.chapter}</td>
      <td><strong>${c.title}</strong> ${c.isDefault ? '<span style="font-size:10px;background:#e9ecef;padding:2px 8px;border-radius:10px;">Default</span>' : ''}</td>
      <td><span class="content-type-tag type-${c.type}">${typeMap[c.type] || c.type}</span></td>
      <td style="white-space:nowrap;">
        <button class="btn btn-accent btn-sm" onclick="editStudyContent(${c.id})"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteData('studyContent', ${c.id})">Delete</button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6" style="text-align:center;color:var(--gray);">No study material for ${filterClass || 'any class'}${filterSubject ? ' / ' + filterSubject : ''} yet.</td></tr>`;
}
function renderAdminEntrance() {
  const contents = getData('entranceContent');
  const tbody = document.getElementById('adminEntranceTable');
  if (!tbody) return;
  tbody.innerHTML = contents.map(c => `
    <tr>
      <td><strong>${c.exam}</strong></td>
      <td>${c.category}</td>
      <td>${c.title || 'Untitled'} ${c.isDefault ? '<span style="font-size:10px;background:#e9ecef;padding:2px 8px;border-radius:10px;">Default</span>' : ''}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-accent btn-sm" onclick="editEntranceContent('${c.id}')"><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteData('entranceContent', '${c.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}
const NCERT_DEFAULT_LINK = 'https://ncert.nic.in/textbook.php';
const NCERT_CLASSES = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'];
const NCERT_BOOKS_DEFAULT = NCERT_CLASSES.reduce((acc, cls) => { acc[cls] = NCERT_DEFAULT_LINK; return acc; }, {});
function getNcertBooks() {
  fsSettingsListen('ncertBooks', renderNcertBooksPublic);
  const saved = fsSettingsGet('ncertBooks');
  return { ...NCERT_BOOKS_DEFAULT, ...(saved || {}) };
}
function renderNcertBooksPublic() {
  const grid = document.getElementById('ncert-books-grid');
  if (!grid) return;
  const links = getNcertBooks();
  grid.innerHTML = NCERT_CLASSES.map(cls => `
    <a class="study-tile ncert-tile${cls === studySelClass ? ' active' : ''}" data-cls="${cls}" href="${links[cls] || NCERT_DEFAULT_LINK}" target="_blank" rel="noopener">
      <i class="fas fa-book"></i>
      <span>${cls}</span>
      <small>View Book <i class="fas fa-external-link-alt"></i></small>
    </a>
  `).join('');
}
function renderNcertBooksAdmin() {
  const wrap = document.getElementById('ncertBooksAdminGrid');
  if (!wrap) return;
  const links = getNcertBooks();
  wrap.innerHTML = NCERT_CLASSES.map((cls, i) => `
    <div class="form-row">
      <label>${cls}</label>
      <input type="text" id="ncert_link_${i}" value="${(links[cls] || NCERT_DEFAULT_LINK).replace(/"/g, '&quot;')}" placeholder="${NCERT_DEFAULT_LINK}">
    </div>
  `).join('');
}
function saveNcertBooks() {
  const links = {};
  NCERT_CLASSES.forEach((cls, i) => {
    const el = document.getElementById('ncert_link_' + i);
    links[cls] = (el && el.value.trim()) || NCERT_DEFAULT_LINK;
  });
  fsSettingsSave('ncertBooks', links);
  renderNcertBooksPublic();
  showToast('✅ NCERT Book links updated!');
}
const studyClassesList = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
let studySelClass = '', studySelSub = '', studySelCh = '';
function smInitClassDropdown() {
  const sel = document.getElementById('sm_class');
  if (!sel || sel.dataset.ready) return;
  sel.dataset.ready = '1';
  sel.innerHTML = '<option value="">Choose class</option>' + studyClassesList.map(c => `<option value="${c}">${c}</option>`).join('');
}
// Class/Subject are picked from the two dropdowns above the chapter grid
// (always visible, so switching class/subject never needs a "back" tap);
// the Chapter grid below them is always shown together once a subject is
// picked, rather than one tile-click-through step at a time.
function smSelectClass(cls) {
  studySelClass = cls; studySelSub = ''; studySelCh = '';
  document.getElementById('study-chapter-section').style.display = 'none';
  document.getElementById('sm-chapters-wrap').style.display = 'none';
  document.querySelectorAll('#ncert-books-grid .ncert-tile').forEach(el => el.classList.toggle('active', el.dataset.cls === cls));
  const subSel = document.getElementById('sm_subject');
  if (!cls) { subSel.innerHTML = '<option value="">Choose subject</option>'; subSel.disabled = true; return; }
  // Subject list always comes from the fixed CBSE syllabus (DEFAULT_STUDY_DATA)
  // plus any extra subjects admin has added resources for — so the
  // Class/Subject/Chapter structure is always visible, even before any
  // actual resource has been uploaded for it.
  const defaultSubjects = Object.keys(DEFAULT_STUDY_DATA[cls] || {});
  const savedSubjects = [...new Set(getData('studyContent').filter(c => c.class === cls).map(c => c.subject))];
  const subjects = [...new Set([...defaultSubjects, ...savedSubjects])];
  subSel.disabled = false;
  subSel.innerHTML = '<option value="">Choose subject</option>' + subjects.map(s => `<option value="${s}">${s}</option>`).join('');
}
function smSelectSubject(sub) {
  studySelSub = sub; studySelCh = '';
  document.getElementById('study-chapter-section').style.display = 'none';
  const wrap = document.getElementById('sm-chapters-wrap');
  if (!sub) { wrap.style.display = 'none'; return; }
  const defaultChaptersRaw = (DEFAULT_STUDY_DATA[studySelClass] && DEFAULT_STUDY_DATA[studySelClass][sub]) ? DEFAULT_STUDY_DATA[studySelClass][sub] : [];
  const defaultChapters = defaultChaptersRaw.map(raw => displayChapterName(studySelClass, sub, raw));
  const savedChapters = [...new Set(getData('studyContent').filter(c => c.class === studySelClass && c.subject === sub).map(c => c.chapter))];
  const chapters = [...new Set([...defaultChapters, ...savedChapters])];
  document.getElementById('sm-chap-title').innerHTML = `<i class="fas fa-book"></i> ${studySelSub} <small>${studySelClass}</small>`;
  const grid = document.getElementById('study-chapter-grid');
  grid.innerHTML = chapters.length
    ? chapters.map(c => `<div class="study-tile" data-value="${String(c).replace(/"/g, '&quot;')}"><i class="fas fa-bookmark"></i><span>${c}</span></div>`).join('')
    : '<p class="study-empty-msg">No chapters yet for this subject.</p>';
  wrap.style.display = 'block';
}
function goStudyBackToChapters() {
  document.getElementById('study-chapter-section').style.display = 'none';
  document.getElementById('sm-chapters-wrap').style.display = 'block';
}
// Two clear, distinctly-coloured resource cards per chapter (the official
// Book is handled separately above — it isn't chapter-uploaded content).
const STUDY_RESOURCE_TYPES = [
  ['notes', 'fa-sticky-note', 'Notes, Exercise Solutions, Question Answer & Extra Questions', 'Get chapter-wise notes, textbook exercise solutions, question answers and extra questions for better preparation.'],
  ['practice', 'fa-file-pdf', 'Practice Question Papers', 'Download chapter-wise practice question papers to test your preparation.']
];
function selectStudyChapterDropdown(chapterName) {
  studySelCh = chapterName;
  const section = document.getElementById('study-chapter-section');
  document.getElementById('sm-chapters-wrap').style.display = 'none';
  document.getElementById('study-chapter-title').textContent = `${studySelClass} — ${studySelSub} — ${chapterName}`;
  document.getElementById('study-restypes').innerHTML = STUDY_RESOURCE_TYPES.map(([type, icon, title, desc]) =>
    `<div class="study-restype-btn" data-type="${type}" onclick="loadStudyContentInline('${type}')" id="study-restype-${type}">
      <div class="rt-ic"><i class="fas ${icon}"></i></div>
      <h5>${title}</h5>
      <p>${desc}</p>
      <span class="rt-view">View <i class="fas fa-arrow-right"></i></span>
    </div>`
  ).join('');
  section.style.display = 'block';
  document.getElementById('study-content-display').innerHTML = '';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
// Resource "type" values used when a piece of content is uploaded are kept
// as-is (Notes / Mind Map / Exercise / Extra Questions / Practice / PYQ) so
// admin uploads stay clearly labelled — the STUDENT-facing tabs just group
// them into 2 clear categories.
const STUDY_TYPE_GROUPS = { notes: ['notes', 'mindmap', 'extra', 'exercise'], practice: ['practice', 'pyq'] };
// A chapter's two resource cards are themselves the "View" action — no
// separate list-then-view-button step. Exactly one file per chapter/type is
// the normal case, so clicking a card opens its PDF directly as a full
// page (see openPageReader). Only the rare case of more than one file for
// the same chapter+type falls back to a short pick list.
function loadStudyContentInline(groupKey) {
  const display = document.getElementById('study-content-display');
  const typesInGroup = STUDY_TYPE_GROUPS[groupKey] || [groupKey];
  let contents = getData('studyContent').filter(c =>
    c.class === studySelClass && c.subject === studySelSub &&
    c.chapter === studySelCh && typesInGroup.includes(c.type)
  );
  // Don't show the auto-generated "coming soon" placeholder for a chapter
  // once real content has actually been uploaded for it.
  const hasRealContent = contents.some(c => !c.isDefault);
  if (hasRealContent) contents = contents.filter(c => !c.isDefault);

  const withFile = contents.filter(c => c.fileData);
  if (withFile.length === 1) {
    display.innerHTML = '';
    openPageReader('studyContent', withFile[0].id);
    return;
  }
  if (withFile.length > 1) {
    display.innerHTML = withFile.map(c => `
      <div class="content-file-chip">
        <i class="fas fa-file-pdf" style="color:var(--primary);"></i>
        <span>${c.title || c.file || 'Untitled'}</span>
        <button class="btn btn-primary btn-sm" onclick="openPageReader('studyContent', ${c.id})"><i class="fas fa-eye"></i> View</button>
      </div>`).join('');
    return;
  }
  display.innerHTML = `<div style="padding:20px;text-align:center;color:var(--gray);border:2px dashed var(--border);border-radius:12px;">
      <i class="fas fa-file-alt" style="font-size:40px;display:block;margin-bottom:10px;color:var(--primary-light);"></i>
      <p>No resources available yet.</p>
      <p style="font-size:12px;color:#999;margin-top:4px;">Admin can upload from Admin Panel.</p>
    </div>`;
}
function renderFilePreview(filename, fileData, uid) {
  const isImage = filename && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  const isPdf = filename && /\.(pdf)$/i.test(filename);
  const previewId = `filepreview-${uid}`;
  const safeName = (filename || 'file').replace(/'/g, "\\'");
  if (isImage) {
    return `<div class="file-preview" id="${previewId}" oncontextmenu="return false;">
      <div class="file-preview-toolbar">
        <span><i class="fas fa-image"></i> ${filename}</span>
        <button onclick="openFileViewModal('${fileData}', '${safeName}', 'image')"><i class="fas fa-expand"></i> View Full</button>
      </div>
      <img src="${fileData}" alt="${filename}" style="user-select:none;pointer-events:none;" draggable="false">
    </div>`;
  }
  if (isPdf) {
    return `<div class="file-preview" id="${previewId}" oncontextmenu="return false;">
      <div class="file-preview-toolbar">
        <span><i class="fas fa-file-pdf" style="color:#dc3545;"></i> ${filename}</span>
        <button onclick="openFileViewModal('${fileData}', '${safeName}', 'pdf')"><i class="fas fa-expand"></i> View Full</button>
      </div>
      <iframe src="${fileData}#toolbar=0&navpanes=0&scrollbar=1" oncontextmenu="return false;"></iframe>
    </div>`;
  }
  return `<div class="file-preview" style="max-height:none;">
    <div class="file-info">
      <i class="fas fa-paperclip"></i>
      <span style="font-weight:600;margin-left:8px;">${filename || 'Attached file'}</span>
      <p style="font-size:11px;color:var(--gray);margin-top:6px;">Preview not supported for this file type — shown on this page only.</p>
    </div>
  </div>`;
}
// Compact "chip" for a view-only Study Material / Entrance Exam resource —
// no download link anywhere, just a View button that opens the page reader.
function renderViewOnlyChip(item, collection) {
  if (!item.fileData) return '';
  const canPage = item.fileIsPdf || (item.file && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.file));
  return `<div class="content-file-chip">
    <i class="fas fa-${item.fileIsPdf ? 'file-pdf' : 'image'}" style="color:var(--primary);"></i>
    <span>${item.file || 'Attached file'}</span>
    ${canPage
      ? `<button class="btn btn-primary btn-sm" onclick="openPageReader('${collection}', ${item.id})"><i class="fas fa-eye"></i> View</button>`
      : `<span style="font-size:11px;color:var(--gray);">Preview not available for this file type</span>`}
  </div>`;
}
function openPageReader(collection, id) {
  const item = getData(collection).find(c => c.id === id);
  if (!item || !item.fileData) return;
  window._pdfViewerState = { collection, id };
  history.pushState({ page: 'page-pdf-viewer', pdfCollection: collection, pdfId: id }, '', '#doc-' + id);
  activatePage('page-pdf-viewer');
}
function renderPdfViewerPage() {
  const s = window._pdfViewerState;
  const box = document.getElementById('pdfViewerBody');
  if (!box) return;
  if (!s) { box.innerHTML = '<div class="upd-empty">This document is not available.</div>'; return; }
  const item = getData(s.collection).find(c => c.id === s.id);
  if (!item || !item.fileData) { box.innerHTML = '<div class="upd-empty">This document is not available.</div>'; return; }
  const pages = item.filePages || 1;
  const watermark = pageReaderWatermarkHtml();
  let pagesHtml = '';
  for (let p = 1; p <= pages; p++) {
    const imgUrl = pages > 1 ? cloudinaryPageUrl(item.fileData, p) : item.fileData;
    pagesHtml += `<div class="view-only-wrap" oncontextmenu="return false;"><img src="${imgUrl}" style="user-select:none;pointer-events:none;" draggable="false" alt="Page ${p}" loading="${p <= 2 ? 'eager' : 'lazy'}"><div class="view-only-watermark">${watermark}</div>${pages > 1 ? `<span class="pdfv-page-num">Page ${p} of ${pages}</span>` : ''}</div>`;
  }
  const title = item.title || item.file || 'Document';
  box.innerHTML = `
    <div class="udt-crumb"><a onclick="showPage('page-home')">Home</a> / <a onclick="history.back()">Back</a></div>
    <div class="pdfv-head"><h1><i class="fas fa-file-pdf"></i> ${title}</h1>${pages > 1 ? `<span class="pdfv-pages">${pages} pages</span>` : ''}</div>
    <div class="pdfv-pages-wrap">${pagesHtml}</div>
  `;
  document.title = title + ' | Althea Scholar';
}
// Tiled watermark shown over every viewed page — deterrent + traceability if
// a screenshot does leak out. Uses the admin's brand text; nothing here can
// technically stop a phone camera or the OS's own screenshot tool (no
// website can — that's outside what a browser lets JavaScript control),
// but it does block right-click save, text selection, drag, and printing
// from inside this viewer, and it marks anything that is captured.
function pageReaderWatermarkHtml() {
  const label = 'Althea Scholar — View Only';
  let tiles = '';
  for (let i = 0; i < 10; i++) tiles += `<span>${label}</span>`;
  return tiles;
}
// Opens the file ON the site as a small popup — not a new browser tab/page.
function openFileViewModal(fileData, filename, kind) {
  document.getElementById('fileViewModalTitle').innerHTML = `<i class="fas fa-${kind === 'pdf' ? 'file-pdf' : 'image'}"></i> ${filename}`;
  document.getElementById('fileViewModalPager').style.display = 'none';
  const body = document.getElementById('fileViewModalBody');
  body.innerHTML = kind === 'pdf'
    ? `<iframe src="${fileData}#toolbar=0&navpanes=0&scrollbar=1"></iframe>`
    : `<img src="${fileData}" alt="${filename}">`;
  document.getElementById('fileViewModalOverlay').classList.add('show');
}
function closeFileViewModal() {
  document.getElementById('fileViewModalOverlay').classList.remove('show');
  document.getElementById('fileViewModalBody').innerHTML = '';
  document.getElementById('fileViewModalPager').style.display = 'none';
}
const entranceList = ['Sainik School — AISSEE', 'JNVST', 'RMS CET', 'AMU School Entrance', 'BHU School Entrance'];
const ENTRANCE_EXAM_ICONS = { 'Sainik School — AISSEE': 'fa-shield-alt', 'JNVST': 'fa-tree', 'RMS CET': 'fa-medal', 'AMU School Entrance': 'fa-university', 'BHU School Entrance': 'fa-landmark' };
let entranceSel = '';
function renderEntranceExamGrid() {
  const grid = document.getElementById('entrance-exam-grid');
  if (!grid) return;
  grid.innerHTML = entranceList.map(exam => `
    <div id="entrance-exam-card-${fsSlugKey(exam)}" onclick="selectEntranceExam('${exam.replace(/'/g, "\\'")}')">
      <i class="fas ${ENTRANCE_EXAM_ICONS[exam] || 'fa-graduation-cap'}"></i> ${exam}
    </div>
  `).join('');
  highlightSelectedEntranceExam();
}
function highlightSelectedEntranceExam() {
  document.querySelectorAll('#entrance-exam-grid > div').forEach(el => { el.style.background = ''; el.style.color = ''; el.style.borderColor = ''; });
  if (!entranceSel) return;
  const activeCard = document.getElementById(`entrance-exam-card-${fsSlugKey(entranceSel)}`);
  if (activeCard) { activeCard.style.background = 'var(--primary)'; activeCard.style.color = '#fff'; activeCard.style.borderColor = 'var(--primary)'; }
}
function selectEntranceExam(exam) {
  entranceSel = exam;
  highlightSelectedEntranceExam();
  const section = document.getElementById('entrance-resource-section');
  if (!exam) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  document.getElementById('entrance-resource-title').textContent = `${exam} — Resources`;
  document.getElementById('entrance-content-display').innerHTML = '';
  loadEntranceContent('syllabus');
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function loadEntranceContent(category) {
  document.querySelectorAll('#entrance-resource-types > div').forEach(el => { el.style.background = ''; el.style.color = ''; });
  const activeBtn = document.getElementById(`entrance-restype-${category}`);
  if (activeBtn) { activeBtn.style.background = 'var(--primary)'; activeBtn.style.color = '#fff'; }

  const contents = getData('entranceContent').filter(c => c.exam === entranceSel && c.category === category);
  const display = document.getElementById('entrance-content-display');
  if (contents.length === 0) {
    display.innerHTML = `<div style="padding:20px;text-align:center;color:var(--gray);border:2px dashed var(--border);border-radius:12px;">
      <i class="fas fa-file-alt" style="font-size:40px;display:block;margin-bottom:10px;color:var(--primary-light);"></i>
      <p>No ${category} available.</p>
    </div>`;
    return;
  }
  display.innerHTML = contents.map(c => `
    <div class="content-item" style="border-left:4px solid var(--accent);">
      <div class="title">
        <span>${c.title || 'Untitled'}</span>
        ${c.isDefault ? '<span style="font-size:10px;background:#e9ecef;padding:2px 8px;border-radius:10px;">Default</span>' : ''}
      </div>
      <div class="body">${c.body}</div>
      ${c.fileData ? renderViewOnlyChip(c, 'entranceContent') : ''}
    </div>
  `).join('');
}
