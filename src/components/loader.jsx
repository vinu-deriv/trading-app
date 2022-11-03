import Styles from "../styles/loader.module.scss";
import classNames from "classnames";

const Loader = (props) => {
  return <div class={classNames(Styles.loader, props.className)} />;
};

export default Loader;
