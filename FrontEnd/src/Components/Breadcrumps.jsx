import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
    const location = useLocation();
    const user_id= useSelector((state)=>state.userDetails.id)
    

    // Split the pathname into parts
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item">
                    {user_id ? <Link to="/HomePage">Home</Link> : <Link to="/">Home</Link> }
                    {/* <Link to="/HomePage">Home</Link> */}
                </li>
                {pathnames.map((value, index) => {
                    const pathTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;

                    return isLast ? (
                        <li key={index} className="breadcrumb-item active" aria-current="page">
                            {value.charAt(0).toUpperCase() + value.slice(1)}
                        </li>
                    ) : (
                        <li key={index} className="breadcrumb-item">
                            <Link to={pathTo}>
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
