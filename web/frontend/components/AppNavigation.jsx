import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NavMenu } from "@shopify/app-bridge-react";

function NavLink({ href, children, rel }) {
  const navigate = useNavigate();

  const handleClick = useCallback(
    (event) => {
      event.preventDefault();
      navigate(href);
    },
    [href, navigate]
  );

  return (
    <a href={href} rel={rel} onClick={handleClick}>
      {children}
    </a>
  );
}

export function AppNavigation() {
  return (
    <NavMenu>
      <NavLink href="/" rel="home">
        Valutatore iStore
      </NavLink>
      <NavLink href="/history">History</NavLink>
    </NavMenu>
  );
}
