import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
    const location = useLocation();
    const user_id = useSelector((state) => state.userDetails.id);
    
    // Split the pathname into parts and filter out empty strings
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    // Route name mapping for better display names
    const routeNameMap = {
        'HomePage': 'Home',
        'productDetails': 'Product Details',
        'userReviews': 'Reviews',
        'checkoutPage': 'Checkout',
        'userProfile': 'Profile',
        'wishlist': 'Wishlist',
        'cart': 'Cart',
        'orders': 'Orders',
        'login': 'Login',
        'register': 'Sign Up',
        'categories': 'Categories',
        'search': 'Search Results',
        'contact': 'Contact Us',
        'about': 'About Us',
        'terms': 'Terms & Conditions',
        'privacy': 'Privacy Policy'
    };

    // Function to get display name for route
    const getDisplayName = (routeName) => {
        return routeNameMap[routeName] || routeName.charAt(0).toUpperCase() + routeName.slice(1);
    };

    // Don't show breadcrumbs on home page or if no pathnames
    if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'HomePage')) {
        return null;
    }

    return (
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-6 py-4">
                <nav aria-label="Breadcrumb navigation" className="flex items-center">
                    <ol className="flex items-center space-x-2 text-sm">
                        {/* Home Link */}
                        <li className="flex items-center">
                            <Link
                                to={user_id ? "/HomePage" : "/"}
                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium group"
                                aria-label="Go to home page"
                            >
                                <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                <span className="hidden sm:inline">Home</span>
                            </Link>
                        </li>

                        {/* Dynamic breadcrumb items */}
                        {pathnames.map((value, index) => {
                            const pathTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                            const isLast = index === pathnames.length - 1;
                            const displayName = getDisplayName(value);

                            return (
                                <React.Fragment key={index}>
                                    {/* Separator */}
                                    <li className="flex items-center">
                                        <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                                    </li>

                                    {/* Breadcrumb item */}
                                    <li className="flex items-center">
                                        {isLast ? (
                                            <span
                                                className="text-gray-900 font-semibold bg-blue-50 px-3 py-1 rounded-full text-xs sm:text-sm border border-blue-200 max-w-32 sm:max-w-none truncate"
                                                aria-current="page"
                                                title={displayName}
                                            >
                                                {displayName}
                                            </span>
                                        ) : (
                                            <Link
                                                to={pathTo}
                                                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium px-2 py-1 rounded-md hover:bg-gray-50 text-xs sm:text-sm max-w-24 sm:max-w-none truncate"
                                                title={displayName}
                                            >
                                                {displayName}
                                            </Link>
                                        )}
                                    </li>
                                </React.Fragment>
                            );
                        })}
                    </ol>
                </nav>
            </div>
        </div>
    );
};

export default Breadcrumbs;