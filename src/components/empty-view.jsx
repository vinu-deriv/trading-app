import styles from "Styles/empty-view.module.scss";

const EmptyView = () => {
  return (
    <div class={styles["wrapper"]}>
      This App currently does not support desktop view. Please switch to mobile
      view.
    </div>
  );
};

export default EmptyView;
