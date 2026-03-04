import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { registerApi } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const data = await registerApi({ displayName, email, password });

      const token = (data as any).token ?? (data as any).accessToken;
      if (token) localStorage.setItem("token", token);

      nav("/login");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.message ?? "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <h3 className="mb-3">{t("register")}</h3>

      {err && <Alert variant="danger">{err}</Alert>}

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t("displayName")}</Form.Label>
          <Form.Control
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </Form.Group>

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
            autoComplete="new-password"
          />
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {loading ? "..." : t("signUp")}
        </Button>
      </Form>
    </Card>
  );
}
