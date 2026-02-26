"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "../../constants/testimonials";
import { Award, Star } from "lucide-react";

export const TestimonialsSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 px-6 bg-linear-to-br from-purple-100 via-pink-50 to-blue-50 overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-300/30 blur-3xl rounded-full -z-10"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-300/30 blur-3xl rounded-full -z-10"></div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-14">
          <div className="inline-flex items-center bg-yellow-100 text-yellow-700 px-6 py-2 rounded-full font-semibold shadow-sm mb-4">
            <Award className="w-4 h-4 mr-2" />
            Loved by Families
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            What Parents Say
          </h2>
          <p className="text-gray-600 mt-3 text-base md:text-lg">
            Real experiences shared by parents from across the country.
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 md:p-12 max-w-3xl mx-auto border border-white/40"
            >
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-sm"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-xl md:text-2xl text-gray-700 italic leading-relaxed mb-8">
                “{testimonials[activeTestimonial].text}”
              </p>

              {/* User info */}
              <div className="flex justify-center items-center space-x-4">
                <img
                  src={testimonials[activeTestimonial].image}
                  alt={testimonials[activeTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-lg">
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {testimonials[activeTestimonial].location}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence> 

          {/* Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === activeTestimonial
                    ? "bg-purple-600 w-8 h-3"
                    : "bg-gray-300 hover:bg-purple-300 w-3 h-3"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
