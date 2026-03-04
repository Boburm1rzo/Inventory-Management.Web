import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { loginApi } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiBase = import.meta.env.VITE_API_ORIGIN ?? "https://localhost:7030";

  function loginWithGoogle() {
    window.location.href = `${apiBase}/api/auth/login-google`;
  }

  function loginWithFacebook() {
    window.location.href = `${apiBase}/api/auth/login-facebook`;
  }
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const data = await loginApi({ email, password });

      const token = (data as any).token ?? (data as any).accessToken;
      if (!token) throw new Error("Token response topilmadi.");

      localStorage.setItem("token", token);
      nav("/");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <h3 className="mb-3">{t("login")}</h3>

      {err && <Alert variant="danger">{err}</Alert>}

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t("email")}</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t("password")}</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {loading ? "..." : t("signIn")}
        </Button>

        <div className="mt-3 d-flex gap-2">
          <Button
            variant="outline-danger"
            type="button"
            onClick={loginWithGoogle}
          >
            Google
          </Button>
          <Button
            variant="outline-primary"
            type="button"
            onClick={loginWithFacebook}
          >
            Facebook
          </Button>
        </div>
      </Form>
    </Card>
  );
}
