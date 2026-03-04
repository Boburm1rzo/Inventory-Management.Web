import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, Spinner, Alert } from "react-bootstrap";

export default function AuthCallbackPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (!token) return;

    localStorage.setItem("token", token);
    nav("/", { replace: true });
  }, [params, nav]);

  const token = params.get("token");

  return (
    <Card className="p-4">
      {!token ? (
        <Alert variant="danger">Token topilmadi. Qaytadan login qiling.</Alert>
      ) : (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <div>Login qilinyapti...</div>
        </div>
      )}
    </Card>
  );
}
