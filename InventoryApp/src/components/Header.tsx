import { Navbar, Container, Nav, Form, Button } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../store/ThemeContext";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { theme, toggle } = useTheme();
  const { t, i18n } = useTranslation();

  const setLang = (lng: "en" | "uz") => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  return (
    <Navbar expand="lg" className="border-bottom bg-body">
      <Container>
        <Navbar.Brand as={Link} to="/login">
          MyApp
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/login">
              {t("login")}
            </Nav.Link>
            <Nav.Link as={NavLink} to="/register">
              {t("register")}
            </Nav.Link>
          </Nav>

          <Form className="d-flex me-2">
            <Form.Control placeholder="Search (UI only)" />
          </Form>

          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={() => setLang("en")}
          >
            EN
          </Button>
          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={() => setLang("uz")}
          >
            UZ
          </Button>

          <Button variant="outline-primary" onClick={toggle}>
            {theme === "light" ? "🌙" : "☀️"}
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
