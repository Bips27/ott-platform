export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">About OTT Platform</h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Your ultimate destination for premium entertainment, bringing you the best in movies, TV shows, and exclusive content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                We're committed to delivering high-quality entertainment that brings people together. 
                Our platform offers a diverse range of content to satisfy every viewer's taste.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                From blockbuster movies to critically acclaimed series, we curate the best content 
                to ensure you always have something amazing to watch.
              </p>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">What We Offer</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-400 text-lg">4K Ultra HD streaming quality</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-400 text-lg">Exclusive original content</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-400 text-lg">Multiple device support</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-400 text-lg">Offline download capability</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <span className="text-gray-400 text-lg">Personalized recommendations</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Story</h2>
            <p className="text-gray-400 text-lg leading-relaxed text-center">
              Founded in 2024, OTT Platform was born from a simple idea: to make premium entertainment 
              accessible to everyone. We believe that great stories have the power to inspire, entertain, 
              and bring people together across cultures and generations.
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Join Our Community</h2>
            <p className="text-gray-400 text-lg mb-8">
              Be part of millions of viewers who trust us for their entertainment needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/plans" className="btn-primary">
                Start Your Free Trial
              </a>
              <a href="/contact" className="btn-outline">
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
