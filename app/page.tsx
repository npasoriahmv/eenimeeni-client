import { BookingButton } from './components/main_ui/BookingButton';
import { HeroSection } from './components/main_ui/HeroSection';
import { FeaturesSection } from './components/main_ui/Features';
import SpacesSection from './components/main_ui/SpacesSection';
import { TestimonialsSection } from './components/main_ui/Testimonials';
import ContactSection from './components/main_ui/ContactSection';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      {/* Floating Book Now Button */}
      <BookingButton />

      {/* Hero Section - Full Screen */}
      <HeroSection/>

      {/* Features Section */}
      {/* <FeaturesSection/> */}

      {/* Spaces Section */}
      <SpacesSection/>

      {/* Gallery Section */}
      {/* <GallerySection/> */}

      {/* Testimonials Carousel */}
      <TestimonialsSection/>
      
      {/* Contact Section */}
      {/* <ContactSection/> */}
      {/* Footer */}
    </div>
  );
};

export default HomePage;

