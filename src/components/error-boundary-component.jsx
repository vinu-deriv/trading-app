import { Button } from "Components";
import styles from "../styles/error-boundary-component.module.scss";

const ErrorBoundaryComponent = (props) => {
  return (
    <div class={styles["wrapper"]}>
      <p>Something is not right. Please refresh</p>
      <Button category="flat" onClick={() => window.location.reload()}>
        Refresh
      </Button>
    </div>
  );
};
export default ErrorBoundaryComponent;
