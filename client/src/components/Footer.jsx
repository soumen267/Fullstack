const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="bg-white border-t border-gray-200 text-gray-600 py-6 px-6 mt-10 text-sm shadow-sm">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            
            {/* Left Section */}
            <div className="text-center sm:text-left">
            <strong className="text-gray-800 font-semibold">
                &copy; {year}{' '}
                <a
                href="https://adminlte.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                >
                Ecommerce-Store
                </a>
            </strong>{' '}
            – All rights reserved.
            </div>

            {/* Right Section */}
            <div className="text-center sm:text-right text-gray-500">
            <span className="font-medium text-gray-700">Version</span> 3.2.0
            </div>
        </div>
        </footer>
    )
}
export default Footer;