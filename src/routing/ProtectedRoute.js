import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/user/userSlice";
import { NavLink, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const currentUser = useSelector(selectCurrentUser);

  // show unauthorized message if user is not logged in
  if (!currentUser) {
    return (
      <div>
        <h1>Unauthorized</h1>
        <span>
          <NavLink to="/login">Login</NavLink> to gain access
        </span>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
