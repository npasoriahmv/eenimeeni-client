import { Camera } from "lucide-react"
import { gallery } from "../../constants/gallery"
export const GallerySection = () => {
    return(
        <section id="gallery" className="py-24 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full font-semibold mb-4">
              <Camera className="w-4 h-4 inline mr-2" />
              Moments Captured
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              See The Magic Yourself
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real moments from real celebrations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-2xl aspect-4/3 cursor-pointer">
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
}