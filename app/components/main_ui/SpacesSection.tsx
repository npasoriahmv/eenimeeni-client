import { Users, Baby, ArrowRight, Sparkles, Crown, Shield, Palette, Rocket } from "lucide-react"

const spaces = [
  {
    name: "Eeni Meeni",
    tagline: "Indoor Playarea",
    description: "A vibrant wonderland where imagination comes to life. Premium indoor play experiences with state-of-the-art equipment, climbing zones, and endless adventures for active little explorers.",
    image: "https://media.istockphoto.com/id/905278530/photo/modern-children-playground-indoor.jpg?s=612x612&w=0&k=20&c=Nuw_ji8Qf2jqUleA2UpI_InEg8fJPYiOb0CCVTJjsi4=",
    capacity: "60+ Kids",
    ageRange: "2-12 Years",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    icon: Rocket,
    highlights: [
      { title: "Multi-Level Play Zones", desc: "Endless exploration" },
      { title: "Safety First Design", desc: "Certified equipment" },
      { title: "Themed Adventures", desc: "Unique experiences" },
      { title: "Party Packages", desc: "Memorable celebrations" }
    ]
  },
  {
    name: "Miny Moe",
    tagline: "Recreational Space & Experiential Studio",
    description: "An innovative experiential studio designed for creative minds. Art workshops, sensory activities, and curated programs that inspire learning through hands-on exploration and discovery.",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80",
    capacity: "30+ Kids",
    ageRange: "3-14 Years",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    icon: Palette,
    highlights: [
      { title: "Creative Workshops", desc: "Art & craft sessions" },
      { title: "Sensory Experiences", desc: "Interactive learning" },
      { title: "Expert Facilitators", desc: "Guided activities" },
      { title: "Flexible Programs", desc: "Custom sessions" }
    ]
  }
]

export default function SpacesSection() {
  return (
    <section 
      id="spaces"
      className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-linear-to-b from-slate-50 via-white to-slate-50"
    >
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        
        {/* Premium Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-linear-to-r from-orange-500 to-purple-500 text-white rounded-full font-bold text-sm mb-6 shadow-lg">
            <Crown className="w-4 h-4" />
            <span>Premium Spaces</span>
            <Sparkles className="w-4 h-4" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight">
            Two Worlds of
            <span className="block bg-linear-to-r from-orange-500 via-rose-500 to-purple-600 bg-clip-text text-transparent mt-2">
              Wonder & Discovery
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Choose between energetic play or creative exploration—each space crafted to deliver exceptional experiences
          </p>
        </div>

        {/* Spaces Grid */}
        <div className="space-y-16 md:space-y-24 lg:space-y-32">
          {spaces.map((space, index) => {
            const Icon = space.icon
            return (
              <div 
                key={index}
                className={`group flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}
              >
                
                {/* Image Section */}
                <div className="w-full lg:w-[55%]">
                  <div className="relative">
                    {/* Glow effect */}
                    <div className={`absolute -inset-4 bg-linear-to-r ${space.gradient} rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-700`}></div>
                    
                    {/* Main card */}
                    <div className="relative bg-white rounded-4xl p-3 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                      <div className="relative overflow-hidden rounded-3xl">
                        <img
                          src={space.image}
                          alt={space.name}
                          className="w-full h-[280px] sm:h-[350px] md:h-[420px] lg:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        
                        {/* Gradient overlay */}
                        <div className={`absolute inset-0 bg-linear-to-t ${space.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                        
                        {/* Floating badge */}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-linear-to-r ${space.gradient} animate-pulse`}></div>
                            <span className="text-sm font-bold text-slate-900">Open Now</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="w-full lg:w-[45%] space-y-6 md:space-y-8">
                  
                  {/* Icon & Badge */}
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-linear-to-br ${space.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <div>
                      <div className="inline-block px-3 py-1 rounded-lg bg-slate-100 mb-2">
                        <span className={`text-xs md:text-sm font-bold bg-linear-to-r ${space.gradient} bg-clip-text text-transparent`} style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                          {space.tagline}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight leading-none">
                      {space.name}
                    </h3>
                    <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                      {space.description}
                    </p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="group/stat relative overflow-hidden bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-slate-200 rounded-2xl p-4 md:p-5 transition-all hover:shadow-xl">
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-linear-to-br ${space.gradient} opacity-5 rounded-full blur-2xl`}></div>
                      <div className={`w-6 h-6 md:w-7 md:h-7 mb-3 rounded-lg bg-linear-to-r ${space.gradient} flex items-center justify-center`}>
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="text-xs md:text-sm text-slate-500 font-semibold mb-1">Capacity</div>
                      <div className="text-lg md:text-xl font-black text-slate-900">{space.capacity}</div>
                    </div>
                    
                    <div className="group/stat relative overflow-hidden bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-slate-200 rounded-2xl p-4 md:p-5 transition-all hover:shadow-xl">
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-linear-to-br ${space.gradient} opacity-5 rounded-full blur-2xl`}></div>
                      <div className={`w-6 h-6 md:w-7 md:h-7 mb-3 rounded-lg bg-linear-to-r ${space.gradient} flex items-center justify-center`}>
                        <Baby className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="text-xs md:text-sm text-slate-500 font-semibold mb-1">Age Range</div>
                      <div className="text-lg md:text-xl font-black text-slate-900">{space.ageRange}</div>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {space.highlights.map((highlight, i) => (
                      <div 
                        key={i} 
                        className="group/highlight relative overflow-hidden bg-white border-2 border-slate-100 hover:border-slate-200 rounded-xl p-4 transition-all hover:shadow-lg"
                      >
                        <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-linear-to-br ${space.gradient} opacity-0 group-hover/highlight:opacity-5 rounded-full blur-2xl transition-opacity`}></div>
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full bg-linear-to-r ${space.gradient}`}></div>
                            <h4 className="font-bold text-slate-900 text-sm md:text-base">{highlight.title}</h4>
                          </div>
                          <p className="text-xs md:text-sm text-slate-500">{highlight.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Trust Badge */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-linear-to-br from-slate-200 to-slate-300 border-2 border-white"></div>
                      ))}
                    </div>
                    <span className="text-sm font-semibold">Trusted by 1000+ families</span>
                  </div>

                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}