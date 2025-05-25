import { Result, Button } from "antd";
import { useNavigate } from "react-router";

export const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="403"
      subTitle="У вас немає доступу до цієї сторінки."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          На головну
        </Button>
      }
    />
  );
};
