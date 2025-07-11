import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 md:px-12  p-4 md:p-6 mt-4 md:mt-6 lg:mt-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Your Wishlist
      </h2>

      {wishlistItems.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          Your wishlist is empty.
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlistItems.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-xl shadow hover:shadow-lg transition duration-300 flex flex-col overflow-hidden"
            >
              <img
                src={item.image || 'https://via.placeholder.com/300'}
                alt={item.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-green-600 font-bold text-md mb-4">${item.price}</p>

                <button
                  onClick={() => removeFromWishlist(item.productId)}
                  className="mt-auto px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;