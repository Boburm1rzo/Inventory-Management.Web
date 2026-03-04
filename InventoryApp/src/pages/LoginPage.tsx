import { Card, Form, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <Card className="p-4">
      <h3 className="mb-3">{t("login")}</h3>

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>{t("email")}</Form.Label>
          <Form.Control type="email" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t("password")}</Form.Label>
          <Form.Control type="password" />
        </Form.Group>

        <Button type="submit">{t("signIn")}</Button>

        <div className="mt-3 d-flex gap-2">
          <Button variant="outline-danger">Google</Button>
          <Button variant="outline-primary">Facebook</Button>
        </div>
      </Form>
    </Card>
  );
}
