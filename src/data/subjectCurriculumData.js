export const subjectCurriculumData = {
  phy: {
    id: "phy",
    title: "Physics",
    code: "SCI-PHY10",
    classLevel: "Class 10",
    academicSession: "2024-2025",
    teacher: "Mrs. Priya Sharma",
    description: "This subject develops an understanding of the natural world, including light, electricity, and magnetic effects of current.",
    objectives: [
      "Understand the laws of reflection and refraction.",
      "Analyze electrical circuits and Ohm's law.",
      "Understand the magnetic effects of electric current."
    ],
    curriculum: [
      { unit: "Light - Reflection and Refraction", topics: "Reflection by spherical mirrors, Refraction, Lenses" },
      { unit: "The Human Eye and the Colourful World", topics: "Structure of eye, Defects of vision, Dispersion of light" },
      { unit: "Electricity", topics: "Electric current, Ohm's law, Resistance, Heating effect" },
      { unit: "Magnetic Effects of Electric Current", topics: "Magnetic field, Electromagnetic induction, Generators" }
    ],
    outcomes: [
      "Apply laws of physics to real-world scenarios.",
      "Calculate electrical parameters in circuits.",
      "Explain the working of optical instruments."
    ],
    textbooks: [
      { type: "main", title: "Science Textbook for Class X", author: "NCERT" },
      { type: "reference", title: "Science for Tenth Class Part 1 Physics", author: "Lakhmir Singh & Manjit Kaur" }
    ]
  },
  chem: {
    id: "chem",
    title: "Chemistry",
    code: "SCI-CHM10",
    classLevel: "Class 10",
    academicSession: "2024-2025",
    teacher: "Mr. Suresh Nair",
    description: "This subject explores chemical reactions, acids, bases, salts, metals, non-metals, and carbon compounds.",
    objectives: [
      "Understand types of chemical reactions.",
      "Identify properties of acids, bases, and salts.",
      "Understand the versatile nature of carbon."
    ],
    curriculum: [
      { unit: "Chemical Reactions and Equations", topics: "Balancing equations, Types of reactions, Oxidation and reduction" },
      { unit: "Acids, Bases and Salts", topics: "pH scale, Properties of acids and bases, Common salts" },
      { unit: "Metals and Non-metals", topics: "Physical and chemical properties, Reactivity series, Metallurgy" },
      { unit: "Carbon and its Compounds", topics: "Covalent bonding, Homologous series, Functional groups" }
    ],
    outcomes: [
      "Balance complex chemical equations.",
      "Analyze the behavior of elements and compounds.",
      "Understand the application of chemistry in daily life."
    ],
    textbooks: [
      { type: "main", title: "Science Textbook for Class X", author: "NCERT" },
      { type: "reference", title: "Science for Tenth Class Part 2 Chemistry", author: "Lakhmir Singh & Manjit Kaur" }
    ]
  },
  math: {
    id: "math",
    title: "Mathematics",
    code: "SCI-MTH10",
    classLevel: "Class 10",
    academicSession: "2024-2025",
    teacher: "Mr. Rajan Mehta",
    description: "This subject develops problem-solving, logical reasoning, and practical mathematical understanding.",
    objectives: [
      "Understand algebraic concepts.",
      "Improve logical reasoning.",
      "Solve practical mathematical problems."
    ],
    curriculum: [
      { unit: "Algebra", topics: "Polynomials, Linear Equations, Quadratic Equations, Arithmetic Progressions" },
      { unit: "Geometry", topics: "Triangles, Circles, Constructions" },
      { unit: "Trigonometry", topics: "Introduction to Trigonometry, Heights and Distances" },
      { unit: "Statistics and Probability", topics: "Mean, Median, Mode, Probability" }
    ],
    outcomes: [
      "Solve complex algebraic equations.",
      "Understand and apply geometric and trigonometric concepts.",
      "Analyze statistical data."
    ],
    textbooks: [
      { type: "main", title: "Mathematics Textbook for Class X", author: "NCERT" },
      { type: "reference", title: "Mathematics for Class 10", author: "R.D. Sharma" },
      { type: "reference", title: "Secondary School Mathematics", author: "R.S. Aggarwal" }
    ]
  },
  cs: {
    id: "cs",
    title: "Computer Science",
    code: "SCI-CS10",
    classLevel: "Class 10",
    academicSession: "2024-2025",
    teacher: "Mrs. Neha Singh",
    description: "This subject introduces information technology, internet basics, and foundational programming concepts.",
    objectives: [
      "Understand internet basics and cyber safety.",
      "Learn HTML and CSS basics.",
      "Understand the societal impacts of IT."
    ],
    curriculum: [
      { unit: "Networking", topics: "Internet, Web Services, Communication protocols" },
      { unit: "HTML", topics: "HTML tags, Attributes, Forms, Multimedia" },
      { unit: "Cyber Ethics", topics: "Netiquettes, Data protection, Cybercrime" },
      { unit: "Scratch/Python", topics: "Basic programming constructs, Logic building" }
    ],
    outcomes: [
      "Design basic web pages using HTML.",
      "Navigate the internet safely and ethically.",
      "Write simple logical programs."
    ],
    textbooks: [
      { type: "main", title: "Information Technology Class X", author: "NCERT" },
      { type: "reference", title: "Foundation of Information Technology", author: "Sumita Arora" }
    ]
  },
  eng: {
    id: "eng",
    title: "English",
    code: "LNG-ENG10",
    classLevel: "Class 10",
    academicSession: "2024-2025",
    teacher: "Mrs. Anita Verma",
    description: "This subject enhances reading, writing, and communication skills through literature and grammar.",
    objectives: [
      "Improve reading comprehension.",
      "Develop analytical writing skills.",
      "Enhance spoken communication."
    ],
    curriculum: [
      { unit: "Literature - Prose", topics: "A Letter to God, Nelson Mandela, Two Stories about Flying" },
      { unit: "Literature - Poetry", topics: "Dust of Snow, Fire and Ice, A Tiger in the Zoo" },
      { unit: "Supplementary Reader", topics: "A Triumph of Surgery, The Thief's Story" },
      { unit: "Grammar & Writing", topics: "Tenses, Modals, Formal Letters, Analytical Paragraph" }
    ],
    outcomes: [
      "Analyze literary texts critically.",
      "Write coherent and structured paragraphs and letters.",
      "Communicate fluently and confidently."
    ],
    textbooks: [
      { type: "main", title: "First Flight", author: "NCERT" },
      { type: "main", title: "Footprints Without Feet", author: "NCERT" },
      { type: "reference", title: "Together With English Class 10", author: "Rachna Sagar" }
    ]
  },
  pe: {
    id: "pe",
    title: "Physical Education",
    code: "SPT-PE10",
    classLevel: "Class 10",
    academicSession: "2024-2025",
    teacher: "Mr. Hans Mueller",
    description: "This subject promotes physical fitness, health education, and understanding of sports and yoga.",
    objectives: [
      "Understand the importance of physical fitness.",
      "Learn basic rules of major sports.",
      "Practice yoga for mental and physical well-being."
    ],
    curriculum: [
      { unit: "Human Body and Health", topics: "Growth and development, Personal hygiene, Diet" },
      { unit: "Physical Fitness", topics: "Components of fitness, Warming up and cooling down" },
      { unit: "Sports and Games", topics: "Athletics, Basketball, Football, Volleyball" },
      { unit: "Yoga", topics: "Asanas, Pranayama, Meditation" }
    ],
    outcomes: [
      "Maintain personal health and fitness.",
      "Participate effectively in team sports.",
      "Perform basic yoga asanas correctly."
    ],
    textbooks: [
      { type: "main", title: "Health and Physical Education Class X", author: "NCERT" }
    ]
  }
};
