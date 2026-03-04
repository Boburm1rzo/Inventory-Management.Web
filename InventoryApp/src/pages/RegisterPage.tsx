import { Card, Form, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <Card className="p-4">
      <h3 className="mb-3">{t("register")}</h3>

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>{t("displayName")}</Form.Label>
          <Form.Control />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t("email")}</Form.Label>
          <Form.Control type="email" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t("password")}</Form.Label>
          <Form.Control type="password" />
        </Form.Group>

        <Button type="submit">{t("signUp")}</Button>
      </Form>
    </Card>
  );
}
