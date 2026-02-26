export type SessionPlan = {
  title: string;
  duration: string;
  details?: string;
};

export type Workshop = {
  id: string;
  title: string;
  shortTagline: string;

  // NEW REAL datetime fields
  startAt: string; // UTC ISO
  endAt: string;   // UTC ISO

  ageGroup: string;
  fee: number;
  bannerImage: string;
  description: string;
  maxkids:number;
  whatKidsLearn: string[];
  inclusions: string[];
  sessionPlan: SessionPlan[];
  importantInstructions?: string[];
  cancellationPolicy?: string;
};

export const workshops: Workshop[] = [
  {
    id: "wrk-cyanotype-2025",
    title: "Sun Print Cyanotype Art Workshop",
    shortTagline: "Create magical sunlight-powered art!",
    startAt: "2025-12-27T05:30:00Z",
    endAt: "2025-12-27T07:30:00Z",
    ageGroup: "5+ years",
    fee: 600,
    maxkids:100,
    bannerImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200",
    description: "Let your child step into the magical world of sunlight-powered art! 🌞 In this hands-on Cyanotype Printing workshop, kids will discover an enchanting photographic technique from the 1800s, used by early botanists to document plant shapes long before cameras existed. With just sunlight, special paper, and their imagination, children will create beautiful deep blue artworks known as sun prints. Children will experiment with leaves, flowers, cut-outs, and everyday objects to design their prints. As they expose their creations to sunlight, they'll watch the images emerge slowly, magically — right before their eyes. It's a perfect mix of curiosity, creativity, science, and wonder.",
    inclusions: [
      "All materials provided",
      "Kids take home their sun prints",
      "Expert mentor guidance",
      "Certificate of participation"
    ],
    sessionPlan: [
      { 
        title: "Introduction to Cyanotype Printing", 
        duration: "15 mins",
        details: "Kids will discover how cyanotype — one of the oldest photographic processes — works & the science behind it. They'll learn about its history and why it creates the beautiful Prussian blue colour."
      },
      { 
        title: "Hands-On Sun Printing Activity", 
        duration: "90 mins",
        details: "Every child gets their own setup and tools to experiment with sunprinting, supported throughout by guided, easy-to-follow mentoring."
      },
      { 
        title: "Showcase & Closing", 
        duration: "15 mins",
        details: "After the prints are ready & dry, we'll wrap up with a discussion, appreciation and a cheerful group photo."
      }
    ],
    whatKidsLearn: [
      "Hands-on cyanotype printing using sunlight",
      "Understanding how light + chemistry create images",
      "Observation, patience & scientific curiosity",
      "Creative exploration through composition",
      "Take home a beautiful collection of sun prints"
    ],
    importantInstructions: [
      "Parents are requested to drop off and pick up after the session",
      "Please arrive 5–10 minutes early so your child can settle in comfortably",
      "Carry a water bottle and dress your child in comfortable clothes — it might get a little dirty!",
      "Make sure your child eats well before the session, as there won't be a snack break",
      "We're located on the 2nd floor inside EuroKids Pre-School"
    ],
    cancellationPolicy: "If you can't make it and let us know at least 24 hours in advance, we'd be happy to provide a credit to book another workshop within 60 days. Last-minute cancellations (less than 24 hours) or no-shows are non-refundable."
  },
  {
    id: "wrk-robotics-jan2026",
    title: "Junior Robotics & Simple Machines Workshop",
    shortTagline: "Build, create & understand how machines work!",
    startAt: "2026-01-10T05:00:00Z",
    endAt: "2026-01-10T07:30:00Z",
    ageGroup: "7–12 years",
    maxkids:100,
    fee: 900,
    bannerImage: "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=1200",
    description: "Unleash your child's inner engineer! 🤖 In this exciting robotics workshop, kids dive into the fascinating world of mechanics, gears, and motors. They'll learn the fundamentals of how machines work while building their own functional robotic models. Through hands-on construction and experimentation, children will understand concepts like force, motion, energy transfer, and basic programming. This workshop combines STEM learning with creative problem-solving, encouraging kids to think like engineers and innovators.",
    inclusions: [
      "Complete robotics kit provided",
      "Take-home robotic model",
      "STEM learning materials",
      "Certificate & achievement badge"
    ],
    sessionPlan: [
      { 
        title: "Introduction to Robotics & Simple Machines", 
        duration: "20 mins",
        details: "Understanding gears, pulleys, motors and basic mechanical principles through fun demonstrations."
      },
      { 
        title: "Build Your Robot", 
        duration: "90 mins",
        details: "Step-by-step guided construction of a functional robotic model with mentor support."
      },
      { 
        title: "Testing & Troubleshooting", 
        duration: "20 mins",
        details: "Testing the robots, fixing issues, and understanding how modifications affect performance."
      },
      { 
        title: "Showcase & Discussion", 
        duration: "20 mins",
        details: "Demonstration time where each child presents their robot and shares what they learned."
      }
    ],
    whatKidsLearn: [
      "Fundamentals of robotics and mechanics",
      "How gears, pulleys and motors work together",
      "Problem-solving and logical thinking",
      "Basic engineering and design principles",
      "Hands-on construction skills"
    ],
    importantInstructions: [
      "Suitable for kids with any or no prior robotics experience",
      "Small group size ensures individual attention",
      "Kids take home their completed robot",
      "Parents welcome to stay for the final showcase",
      "Comfortable clothing recommended"
    ],
    cancellationPolicy: "Full refund if cancelled 48 hours before the workshop. Credit note valid for 90 days if cancelled within 48 hours."
  },
  {
    id: "wrk-pottery-feb2026",
    title: "Clay Magic: Pottery & Sculpture Workshop",
    shortTagline: "Mold, shape & create with your hands!",
    startAt: "2026-02-14T08:30:00Z",
    endAt: "2026-02-14T11:00:00Z",
    ageGroup: "6–14 years",
    maxkids:100,
    fee: 750,
    bannerImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200",
    description: "Get ready to get your hands dirty! 🎨 This pottery workshop introduces children to the ancient and therapeutic art of working with clay. Kids will learn hand-building techniques including pinching, coiling, and slab construction to create their own unique pottery pieces. From decorative bowls to quirky sculptures, each child will craft multiple items while developing fine motor skills, spatial awareness, and artistic expression. It's messy, it's fun, and it's incredibly satisfying!",
    inclusions: [
      "All clay and tools provided",
      "2-3 completed pottery pieces per child",
      "Pieces will be fired and ready for pickup in 7 days",
      "Aprons provided (but dress for mess!)"
    ],
    sessionPlan: [
      { 
        title: "Introduction to Clay & Pottery", 
        duration: "20 mins",
        details: "Understanding different types of clay, basic techniques, and inspiring examples."
      },
      { 
        title: "Hand-Building Techniques", 
        duration: "40 mins",
        details: "Learning pinching, coiling, and slab methods through guided practice."
      },
      { 
        title: "Create Your Masterpieces", 
        duration: "60 mins",
        details: "Children create 2-3 pottery items with continuous mentor support and encouragement."
      },
      { 
        title: "Decoration & Finishing", 
        duration: "30 mins",
        details: "Adding textures, patterns, and final touches to their creations."
      }
    ],
    whatKidsLearn: [
      "Traditional pottery hand-building techniques",
      "3D thinking and spatial reasoning",
      "Patience and focus through meditative work",
      "Fine motor skills and hand-eye coordination",
      "Creative expression through tactile art"
    ],
    importantInstructions: [
      "Wear old clothes that can get messy!",
      "Short nails recommended for better clay work",
      "Completed pieces need 7 days for drying and firing",
      "Parents can schedule pickup or arrange delivery",
      "Each child creates multiple pieces to take home"
    ],
    cancellationPolicy: "Cancellations 48+ hours before: full refund. Within 48 hours: 50% credit note. No-shows are non-refundable."
  },
  {
    id: "wrk-coding-scratch-mar2026",
    title: "Game Design with Scratch Coding",
    shortTagline: "Code your own games and animations!",
    startAt: "2026-03-07T04:00:00Z",
    endAt: "2026-03-07T07:00:00Z",
    ageGroup: "8–13 years",
    fee: 850,
    maxkids:100,
    bannerImage: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200",
    description: "Turn screen time into learning time! 💻 In this beginner-friendly coding workshop, kids will learn programming fundamentals using Scratch, a visual programming language developed by MIT. They'll create their own interactive games and animations while learning core concepts like loops, conditionals, variables, and events. No prior coding experience needed — just curiosity and creativity! By the end, each child will have built functional games they can share with friends and family.",
    inclusions: [
      "Laptop provided (or bring your own)",
      "Access to Scratch projects after the workshop",
      "Coding workbook and resources",
      "Digital certificate"
    ],
    sessionPlan: [
      { 
        title: "Introduction to Scratch & Coding Basics", 
        duration: "30 mins",
        details: "Understanding the Scratch interface, sprites, blocks, and basic programming concepts."
      },
      { 
        title: "Building Your First Game", 
        duration: "60 mins",
        details: "Step-by-step creation of a simple interactive game with guidance."
      },
      { 
        title: "Advanced Features & Customization", 
        duration: "45 mins",
        details: "Adding scores, levels, sound effects, and making the game uniquely yours."
      },
      { 
        title: "Game Testing & Sharing", 
        duration: "30 mins",
        details: "Testing each other's games, debugging, and learning to share projects online."
      },
      { 
        title: "Showcase & Next Steps", 
        duration: "15 mins",
        details: "Presenting games and discussing how to continue coding at home."
      }
    ],
    whatKidsLearn: [
      "Programming fundamentals: loops, conditions, variables",
      "Logical thinking and problem decomposition",
      "Game design principles and user experience",
      "Debugging and troubleshooting skills",
      "How to continue learning coding independently"
    ],
    importantInstructions: [
      "No prior coding experience required",
      "Laptops provided or bring your own (Windows/Mac)",
      "Kids should know basic computer navigation",
      "Parents can create a free Scratch account at home to continue",
      "Small batch size for personalized attention"
    ],
    cancellationPolicy: "Flexible cancellation up to 24 hours before with full credit. Same-day cancellations receive 50% credit."
  },
  {
    id: "wrk-storytelling-art-apr2026",
    title: "Visual Storytelling & Comic Creation",
    shortTagline: "Write & illustrate your own comic book!",
    startAt: "2025-12-27T05:30:00Z",
    endAt: "2025-12-27T07:30:00Z",
    ageGroup: "7–12 years",
    fee: 700,
    maxkids:100,
    bannerImage: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1200",
    description: "Every child has stories to tell! 📚✨ This workshop combines creative writing with visual art as children learn to create their own comic strips and short graphic stories. They'll explore character development, plot structure, panel composition, and dialogue writing. Using both traditional drawing techniques and digital tools, kids will bring their imagination to life on the page. Perfect for young artists, writers, and storytellers who want to express themselves through sequential art.",
    inclusions: [
      "Complete art supplies kit",
      "Printed copy of their comic book",
      "Digital storytelling tools access",
      "Character design templates"
    ],
    sessionPlan: [
      { 
        title: "Introduction to Visual Storytelling", 
        duration: "25 mins",
        details: "Exploring famous comics, understanding panels, speech bubbles, and narrative flow."
      },
      { 
        title: "Story & Character Development", 
        duration: "35 mins",
        details: "Brainstorming ideas, creating characters, and outlining the story structure."
      },
      { 
        title: "Drawing & Panel Creation", 
        duration: "60 mins",
        details: "Sketching characters, creating panels, and bringing the story to life visually."
      },
      { 
        title: "Adding Dialogue & Details", 
        duration: "30 mins",
        details: "Writing dialogue, adding speech bubbles, and finishing touches."
      },
      { 
        title: "Story Sharing Circle", 
        duration: "20 mins",
        details: "Each child presents their comic to the group and celebrates creativity."
      }
    ],
    whatKidsLearn: [
      "Story structure and character development",
      "Visual communication through sequential art",
      "Panel composition and layout design",
      "Dialogue writing and creative expression",
      "Confidence in sharing their creative work"
    ],
    importantInstructions: [
      "No drawing experience necessary — all levels welcome!",
      "Kids can create stories in any genre they love",
      "Printed comic books ready for pickup in 3 days",
      "Encourage kids to think of story ideas beforehand",
      "Parents invited for the final story sharing"
    ],
    cancellationPolicy: "Cancel 3+ days before for full refund. Within 3 days: workshop credit valid for 60 days."
  }
];