import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <>
      <Header />
      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
}
