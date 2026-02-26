"use client";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Navigation } from "lucide-react";
import { useState } from "react";

export default function ContactSection() {
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'map'

  return (
    <section id="contact" className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-full font-bold text-sm mb-6 shadow-lg">
            <MessageCircle className="w-4 h-4" />
            <span>Get In Touch</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
            Let's Plan Your
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mt-2">
              Perfect Day!
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Ready for an unforgettable experience? We're here to help make it happen
          </p>
        </div>

        {/* Main Contact Card */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl md:rounded-[2.5rem] blur-2xl opacity-20"></div>
          
          {/* Card */}
          <div className="relative bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden">
            
            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-4 px-6 font-bold text-sm transition-all ${
                  activeTab === 'info'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Contact Info
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`flex-1 py-4 px-6 font-bold text-sm transition-all ${
                  activeTab === 'map'
                    ? 'bg-gradient-to-r from-pink-600 to-orange-500 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Location Map
              </button>
            </div>

            <div className="grid md:grid-cols-2">
              
              {/* Left Side - Contact Info */}
              <div className={`p-8 md:p-12 lg:p-16 ${activeTab === 'info' ? 'block' : 'hidden md:block'}`}>
                <div className="h-full flex flex-col">
                  
                  {/* Gradient background for desktop */}
                  <div className="hidden md:block absolute inset-0 bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 opacity-5 rounded-[2.5rem]"></div>
                  
                  <div className="relative z-10">
                    <div className="mb-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold mb-4">
                        <Send className="w-4 h-4" />
                        <span>Contact Details</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
                        We'd Love to Hear From You
                      </h3>
                      <p className="text-slate-600 text-base md:text-lg">
                        Reach out for bookings, questions, or just to say hello!
                      </p>
                    </div>

                    <div className="space-y-6">
                      
                      {/* Address */}
                      <div className="group relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity"></div>
                        <div className="relative flex items-start gap-4 p-4 bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-slate-200 rounded-2xl transition-all">
                          <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <MapPin className="w-6 h-6 md:w-7 md:h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 mb-1 text-sm md:text-base">Visit Us</p>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                              MV Electrosystems<br />
                              123 Fun Street, Happy Town<br />
                              Mumbai, Maharashtra 400001
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="group relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity"></div>
                        <div className="relative flex items-start gap-4 p-4 bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-slate-200 rounded-2xl transition-all">
                          <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-linear-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Phone className="w-6 h-6 md:w-7 md:h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 mb-1 text-sm md:text-base">Call Us</p>
                            <a href="tel:+919876543210" className="block text-slate-600 hover:text-purple-600 text-sm md:text-base transition-colors">
                              +91 98765 
                            </a>
                            <a href="tel:+918765432109" className="block text-slate-600 hover:text-purple-600 text-sm md:text-base transition-colors">
                              +91 87654 
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="group relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity"></div>
                        <div className="relative flex items-start gap-4 p-4 bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-slate-200 rounded-2xl transition-all">
                          <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-linear-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Mail className="w-6 h-6 md:w-7 md:h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 mb-1 text-sm md:text-base">Email Us</p>
                            <a href="mailto:hello@eenimeeni.com" className="block text-slate-600 hover:text-purple-600 text-sm md:text-base transition-colors break-all">
                              hello@eenimeeni.com
                            </a>
                            <a href="mailto:bookings@eenimeeni.com" className="block text-slate-600 hover:text-purple-600 text-sm md:text-base transition-colors break-all">
                              bookings@eenimeeni.com
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Hours */}
                      <div className="group relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity"></div>
                        <div className="relative flex items-start gap-4 p-4 bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-slate-200 rounded-2xl transition-all">
                          <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-linear-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Clock className="w-6 h-6 md:w-7 md:h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 mb-1 text-sm md:text-base">Opening Hours</p>
                            <div className="text-slate-600 text-sm md:text-base leading-relaxed">
                              <p className="mb-1">Mon–Sun: 9:00 AM – 9:00 PM</p>
                              <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
                                Open on all holidays!
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* CTA Button */}
                    <div className="mt-8">
                      <a
                        href="https://www.google.com/maps/dir/?api=1&destination=MV+Electrosystems"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
                      >
                        <Navigation className="w-5 h-5" />
                        <span>Get Directions</span>
                        <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Google Map */}
              <div className={`relative ${activeTab === 'map' ? 'block' : 'hidden md:block'} min-h-[400px] md:min-h-[600px]`}>
                <div className="absolute inset-0 bg-slate-100">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.954163588612!2d77.30796247611882!3d28.45079909230907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce7c275bd0137%3A0xe59e260d2b3e60d7!2sMV%20Electrosystems!5e0!3m2!1sen!2sin!4v1762618640326!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  ></iframe>
                </div>
                
                {/* Map overlay badge - desktop only */}
                <div className="hidden md:block absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-slate-500 font-semibold">Find us here</p>
                      <p className="text-sm font-bold text-slate-900">Mumbai, Maharashtra</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Trust Section */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-white border-2 border-slate-100 rounded-2xl px-6 md:px-10 py-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-semibold">Quick Response</p>
                <p className="text-sm font-bold text-slate-900">24/7 Support</p>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-10 bg-slate-200"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-semibold">Instant Booking</p>
                <p className="text-sm font-bold text-slate-900">Easy & Fast</p>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-10 bg-slate-200"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-semibold">Easy to Find</p>
                <p className="text-sm font-bold text-slate-900">Prime Location</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}