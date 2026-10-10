// Pre-loaded benchmark dossiers for instant demo and offline fallback testing

export const BENCHMARK_DOSSIERS = [
  {
    topic: "Public Health Dengue Surveillance & Outbreak Early Warning in India",
    country: "in",
    requestId: "orch_bench_in_dengue_01",
    timestamp: "2026-10-10T10:15:30.000Z",
    status: "success",
    report: {
      executiveSummary: "India experiences recurring seasonal dengue epidemics driven by monsoon climate patterns and rapid urbanization [S001]. Modern disease surveillance relies heavily on sentinel hospital networks under the National Center for Vector Borne Diseases Control (NCVBDC) [S003]. However, passive surveillance often results in significant case underreporting, with regional estimates indicating up to 282-fold disparities between reported cases and community infections [S004]. Digital news surveillance and machine learning early-warning models demonstrate substantial predictive value, capturing outbreak surges up to 3 weeks prior to laboratory confirmation [S005]. Integration of internal epidemiological bulletins [D001] confirms that vector density thresholds (Breteau Index > 20) are the strongest early indicators for targeted fogging and larval source reduction [D002].",
      keyFindings: [
        {
          point: "Underreporting Disparity: Passive sentinel surveillance captures less than 1% of total symptomatic dengue infections in endemic states like Tamil Nadu and Maharashtra [S004].",
          citations: ["S004"]
        },
        {
          point: "Predictive Digital Triggers: Online local vernacular news monitoring achieves 86.4% correlation with verified hospital admission peaks [S005].",
          citations: ["S005"]
        },
        {
          point: "Vector Control Timing: National long-term action guidelines mandate identifying private clinics and diagnostic laboratories as sentinel reporting nodes [S003].",
          citations: ["S003"]
        },
        {
          point: "Larval Threshold Management: Pre-monsoon larval abatement triggered when Breteau Index exceeds 20 reduces peak ward admissions by 43% [D001, D002].",
          citations: ["D001", "D002"]
        }
      ],
      contradictions: [
        {
          claimA: "Passive sentinel surveillance provides sufficient epidemiological trends for district-level resource allocation [S003].",
          claimB: "Sentinel reporting suffers from massive latency and 282-fold underreporting, misrepresenting actual transmission intensity [S004].",
          resolution: "Sentinel reporting accurately tracks serotype distribution (DEN-1 to DEN-4) but fails to capture localized case volumes. Hybrid digital and clinical surveillance is required."
        }
      ],
      researchGaps: [
        "Lack of real-time serotype genomic sequencing integration in primary health centers.",
        "Limited interoperability between private diagnostic lab registries and national IHIP (Integrated Health Information Platform) portals."
      ],
      limitations: [
        "Rural district surveillance data is disproportionately sparse compared to metropolitan centers.",
        "News-based digital signals can be skewed by media attention cycles during election or monsoon periods."
      ],
      claimCredibilityLedger: [
        {
          claim: "Community dengue infections are up to 282 times higher than officially recorded passive sentinel counts.",
          credibilityScore: 0.94,
          status: "VERIFIED",
          supportingSources: ["S004", "D001"],
          contradictingSources: [],
          notes: "Strong multi-cohort serological backing published in Lancet Infectious Diseases and tandem ICMR validation."
        },
        {
          claim: "Online news surveillance can forecast district outbreaks 3 weeks ahead of hospital admissions.",
          credibilityScore: 0.88,
          status: "VERIFIED",
          supportingSources: ["S005"],
          contradictingSources: [],
          notes: "Empirically validated across 12 Indian states by SpringerMedizin research team."
        },
        {
          claim: "Vector fogging alone is sufficient to arrest an established dengue cluster without larval reduction.",
          credibilityScore: 0.32,
          status: "DISPUTED",
          supportingSources: [],
          contradictingSources: ["S003", "D002"],
          notes: "Adulticiding only affects flying mosquitoes for 24-48 hours; standing water source reduction is paramount."
        }
      ],
      agenticReflection: {
        iterations: 2,
        initialConfidence: 0.74,
        refinedConfidence: 0.91,
        biasCheck: "Balanced clinical studies with public health policy directives and municipal ground guidelines.",
        hallucinationCheck: "PASSED: All 6 statements tied directly to verified S001-S005 and D001-D002 citations."
      }
    },
    sources: [
      {
        sourceId: "S001",
        engine: "google",
        title: "National Center for Vector Borne Diseases Control - Dengue Guidelines",
        url: "https://ncvbdc.mohfw.gov.in/index4.php?lang=1&level=0&linkid=431&lid=3715",
        snippet: "Comprehensive national guidelines on prevention, clinical management, and vector control for dengue fever in India.",
        displayedLink: "ncvbdc.mohfw.gov.in > Dengue",
        publication: "Ministry of Health and Family Welfare, Govt of India",
        citationCount: null
      },
      {
        sourceId: "S002",
        engine: "google_scholar",
        title: "Burden of dengue in India: A systematic review and meta-analysis",
        url: "https://scholar.google.com/citations?view_op=view_citation&id=1",
        snippet: "Systematic review synthesizing 143 community seroprevalence studies across 28 states, revealing extensive hyperendemic transmission.",
        displayedLink: "scholar.google.com > citations",
        authors: "Murhekar, M. et al.",
        publication: "The Lancet Global Health (2020)",
        citationCount: 312,
        pdfUrl: "https://www.thelancet.com/action/showPdf?pii=S2214-109X%2820%2930219-4"
      },
      {
        sourceId: "S003",
        engine: "google",
        title: "Long Term Action Plan for Prevention and Control of Dengue",
        url: "https://ncvbdc.mohfw.gov.in/Doc/Final_long_term_Action_Plan%20.pdf",
        snippet: "Mandatory protocols for sentinel surveillance hospitals, private nursing homes, and inter-sectoral municipal collaboration.",
        displayedLink: "ncvbdc.mohfw.gov.in > Doc",
        publication: "National Center for Vector Borne Diseases Control",
        citationCount: null
      },
      {
        sourceId: "S004",
        engine: "google_scholar",
        title: "Dengue burden in India: Recent trends and importance of laboratory-based surveillance",
        url: "https://www.tandfonline.com/doi/full/10.1038/emi.2017.57",
        snippet: "Demonstrating how passive surveillance obscures community infection waves and calculating empirical expansion factors.",
        displayedLink: "tandfonline.com > doi > full",
        authors: "Shepard, D. S., Undurraga, E. A., & Halasa, Y. A.",
        publication: "Emerging Microbes & Infections",
        citationCount: 185
      },
      {
        sourceId: "S005",
        engine: "google_news",
        title: "Disease surveillance using online news: An extended study of dengue fever in India",
        url: "https://www.springermedizin.de/disease-surveillance-using-online-news-an-extended-study-of-deng/52111704",
        snippet: "Natural language processing of digital newspapers as early proxy indicators for seasonal dengue outbreaks in urban India.",
        displayedLink: "springermedizin.de > disease-surveillance",
        publication: "Springer Health Informatics",
        publicationDate: "Dec 2024"
      },
      {
        sourceId: "D001",
        engine: "internal_docs",
        title: "ICMR Epidemiological Advisory Bulletin No. 42: Vector Density Indices",
        url: "#internal-d001",
        snippet: "Indian Council of Medical Research internal benchmark establishing Breteau Index > 20 and House Index > 10% as emergency intervention thresholds.",
        publication: "ICMR Vector Science Directorate",
        publicationDate: "2025"
      },
      {
        sourceId: "D002",
        engine: "internal_docs",
        title: "Municipal Mosquito Abatement Protocol & Bio-Larvicide Deployment SOP",
        url: "#internal-d002",
        snippet: "Standard operating procedure detailing Bacillus thuringiensis israelensis (BTI) application in overhead tanks and storm drains.",
        publication: "Urban Health Mission Technical Paper",
        publicationDate: "2025"
      }
    ],
    metadata: {
      enginesUsed: ["google", "google_scholar", "google_news", "google_patents", "internal_docs"],
      sourceCount: 7,
      maxSourcesConfigured: 20,
      researchDepth: "deep",
      confidenceIndex: 0.91,
      citationValidation: {
        valid: true,
        invalidCitationIds: [],
        unsupportedClaimCount: 0,
        totalCitations: 7,
        uniqueSourcesCited: 7,
        groundingIntegrity: "100% Grounded"
      },
      orchestration: {
        primaryPhase: "researchpilot-orchestrator",
        executedPhase: "researchpilot-phase5",
        fallbackEngaged: false,
        executionTimeMs: 11420
      }
    }
  },
  {
    topic: "Agrisolar Photovoltaic Systems & Dual Land-Use Farming in Semiarid India",
    country: "in",
    requestId: "orch_bench_in_agrisolar_02",
    timestamp: "2026-10-10T10:18:10.000Z",
    status: "success",
    report: {
      executiveSummary: "Agrisolar systems—co-locating solar photovoltaic panels with agricultural cultivation—offer transformative public benefits for India's dryland farming communities [S001]. Elevated bifacial module mounting structures allow light transmittance while reducing crop canopy evapotranspiration by 22% [S002]. Recent patent filings detail motorized dual-axis tilt mechanisms that optimize photosynthetically active radiation (PAR) during morning hours for shade-tolerant crops like turmeric and pulses [S003]. Economic assessments indicate farmer household income increases of 64% through clean power feed-in tariffs combined with high-value horticultural yields [S004].",
      keyFindings: [
        {
          point: "Water Conservation Dividend: Micro-climate shading underneath 3.2m elevated panels reduces irrigation water requirement by 18-28% [S002].",
          citations: ["S002"]
        },
        {
          point: "Mechanical Innovations: Modular tracking brackets allow standard farm tractors to operate beneath rows without obstruction [S003].",
          citations: ["S003"]
        },
        {
          point: "Grid Policy Integration: PM-KUSUM Component A and C subsidies accelerate farmer-owned distributed solar installations [S001, S004].",
          citations: ["S001", "S004"]
        }
      ],
      contradictions: [],
      researchGaps: [
        "Long-term soil micro-biome impact under partial continuous shading across multi-year crop rotations."
      ],
      limitations: [
        "Higher upfront capital expenditure required for elevated 3.5m mounting frames compared to standard ground-mount solar arrays."
      ],
      claimCredibilityLedger: [
        {
          claim: "Elevated agrisolar panels reduce soil moisture loss and crop evapotranspiration by over 20%.",
          credibilityScore: 0.93,
          status: "VERIFIED",
          supportingSources: ["S002"],
          contradictingSources: [],
          notes: "Corroborated by ICAR-CAZRI (Central Arid Zone Research Institute, Jodhpur) field trials."
        }
      ],
      agenticReflection: {
        iterations: 1,
        initialConfidence: 0.82,
        refinedConfidence: 0.93,
        biasCheck: "Verified agricultural agronomy data alongside renewable energy engineering specs.",
        hallucinationCheck: "PASSED: All claims mapped to published sources."
      }
    },
    sources: [
      {
        sourceId: "S001",
        engine: "google",
        title: "Ministry of New and Renewable Energy: Agri-PV Guidelines",
        url: "https://mnre.gov.in/agri-photovoltaics",
        snippet: "Policy framework and technical recommendations for agricultural solar projects in India.",
        publication: "MNRE Govt of India"
      },
      {
        sourceId: "S002",
        engine: "google_scholar",
        title: "Agrivoltaic system in arid zone: Microclimate dynamics and crop productivity",
        url: "https://scholar.google.com/citations?view_op=view_citation&id=2",
        snippet: "Field trials at ICAR Jodhpur demonstrating microclimate cooling and reduced water demand for horticulture.",
        authors: "Santra, P. et al.",
        publication: "Renewable Energy Journal (2021)",
        citationCount: 154
      },
      {
        sourceId: "S003",
        engine: "google_patents",
        title: "Elevated dual-axis tracking solar structure for mechanized agriculture",
        url: "https://patents.google.com/patent/IN202341052199A",
        patentNumber: "IN202341052199A",
        assignee: "Indian Institute of Science & Cleantech Energy Consortium",
        snippet: "Structural design of clearance frames exceeding 3.5 meters allowing continuous combined harvesting.",
        filingDate: "2023-08-14"
      },
      {
        sourceId: "S004",
        engine: "google_news",
        title: "Solar farming brings secondary income to farmers across Maharashtra and Rajasthan",
        url: "https://energy.economictimes.indiatimes.com/news/renewable/agrisolar-revolution",
        snippet: "Coverage of cooperative farmer groups earning steady revenues while sustaining crop productivity.",
        publication: "The Economic Times - Energy World"
      }
    ],
    metadata: {
      enginesUsed: ["google", "google_scholar", "google_patents", "google_news"],
      sourceCount: 4,
      maxSourcesConfigured: 20,
      researchDepth: "standard",
      confidenceIndex: 0.93,
      citationValidation: {
        valid: true,
        invalidCitationIds: [],
        unsupportedClaimCount: 0,
        totalCitations: 4,
        uniqueSourcesCited: 4,
        groundingIntegrity: "100% Grounded"
      },
      orchestration: {
        primaryPhase: "researchpilot-orchestrator",
        executedPhase: "researchpilot-phase5",
        fallbackEngaged: false,
        executionTimeMs: 8940
      }
    }
  }
];

export const PRESET_DOCUMENTS = [
  {
    title: "ICMR Epidemiological Advisory Bulletin No. 42: Vector Density Indices",
    content: "The Indian Council of Medical Research (ICMR) issues revised alert thresholds for seasonal arboviral containment. Field officers must maintain Breteau Index (BI) below 20 and House Index (HI) below 10%. Whenever BI exceeds 20 in pre-monsoon larval surveys, emergency source reduction and Bacillus thuringiensis israelensis (BTI) bio-larvicide spraying must commence immediately to prevent explosive clinical outbreak curves.",
    category: "Public Health"
  },
  {
    title: "National Health Mission: Primary Health Center Diagnostic Protocol",
    content: "Standard operating procedure for decentralized dengue diagnosis: All PHCs equipped with NS1 antigen rapid card tests must notify every positive result within 24 hours on the IHIP portal. Confirmatory IgM antibody capture ELISA must be scheduled between days 5 to 7 of acute febrile illness onset.",
    category: "Clinical Protocol"
  },
  {
    title: "Ministry of New and Renewable Energy: Agri-PV Structural Safety Directive",
    content: "Technical standards for elevated agrivoltaic installations: Frameworks must guarantee minimum ground clearance of 3.2 meters to permit tractor and mechanized tiller movement. Structural foundations must withstand wind speeds up to 150 km/h in semiarid wind corridors.",
    category: "Renewable Energy"
  }
];
