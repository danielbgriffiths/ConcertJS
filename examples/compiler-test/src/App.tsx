function Link(props) {
  return <a href={props.href}>{props.children}</a>;
}

function NavItem(props) {
  return (
    <li>
      <Link href={props.href}>{props.label}</Link>
    </li>
  );
}

function Navigation() {
  return (
    <nav>
      <ul>
        <NavItem href="/" label="Home" />
        <NavItem href="/dashboard" label="Dashboard" />
        <NavItem href="/login" label="Login" />
      </ul>
    </nav>
  );
}

export function App() {
  return (
    <div>
      <Navigation />
    </div>
  );
}
