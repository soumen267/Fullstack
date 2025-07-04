import Products from "../../components/ProductCard";

export default function Home() {
    return (
  <div className="w-full bg-white">
      {/* Hero Banner */}
    <div className="relative aspect-[2/1] overflow-hidden rounded-xl shadow-md mx-auto max-w-screen-xl mt-6">
      <img
        className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
        src="./images/banner.jpg"
        alt="Women"
        title="Women"
      />

      {/* Text + Button Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-lg">
          Explore Women's Collection
        </h2>
        
        {/* SHOP NOW BUTTON */}
        <button className="mt-6 bg-white text-black font-semibold py-2 px-6 rounded-full hover:bg-yellow-300 transition duration-300 shadow">
          Shop Now
        </button>
      </div>
    </div>
      

      {/* Product Section */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <Products />
      </div>
    </div>
    )
}