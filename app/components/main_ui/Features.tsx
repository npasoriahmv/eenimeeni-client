import Link from "next/link"
import { features } from "../../constants/features"
import { Sparkles } from "lucide-react"

export const FeaturesSection = () => {
   return(
     <section id="about" className="relative py-32 px-4 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-50 via-pink-50 to-orange-50">
              <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 opacity-20">
              <Sparkles className="w-12 h-12 text-purple-400 animate-spin-slow" />
            </div>
            <div className="absolute bottom-20 right-10 opacity-20">
              <Sparkles className="w-16 h-16 text-pink-400 animate-spin-slow" style={{animationDelay: '1s'}} />
            </div>

            <div className="relative max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-20 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-linear-to-r from-purple-100 via-pink-100 to-orange-100 text-purple-700 px-8 py-3 rounded-full font-bold mb-6 shadow-lg hover:shadow-xl transition-shadow border border-purple-200/50">
                  <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                  <span>Why Families Love Us</span>
                  <Sparkles className="w-5 h-5 text-pink-600 animate-pulse" />
                </div>
                
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
                  Everything Your Family
                  <br />
                  <span className="bg-linear-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                    Needs & Deserves
                  </span>
                </h2>
                
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  We've thought of everything to make your visit 
                  <span className="font-bold text-purple-600"> extraordinary and unforgettable</span>
                </p>
              </div>
    
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 border border-gray-100 overflow-hidden animate-fade-in-up"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
                    </div>

                    {/* Icon Container */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative w-20 h-20 bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <div className="group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative">
                      <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-base">
                        {feature.description}
                      </p>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 via-pink-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="text-center mt-20 animate-fade-in-up" style={{animationDelay: '600ms'}}>
                <button className="group relative px-10 py-5 bg-linear-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110 overflow-hidden">
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                  <span className="relative flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <Link href="#spaces">
                      Explore All Features
                    </Link>
                    <Sparkles className="w-5 h-5" />
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Animations */}
            <style>{`
              @keyframes fade-in-up {
                from {
                  opacity: 0;
                  transform: translateY(40px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              @keyframes spin-slow {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
              
              @keyframes shine {
                from {
                  transform: translateX(-100%);
                }
                to {
                  transform: translateX(200%);
                }
              }
              
              .animate-fade-in-up {
                animation: fade-in-up 0.8s ease-out forwards;
                opacity: 0;
              }
              
              .animate-spin-slow {
                animation: spin-slow 8s linear infinite;
              }
              
              .animate-shine {
                animation: shine 3s ease-in-out infinite;
              }
            `}</style>
          </section>
   )
}