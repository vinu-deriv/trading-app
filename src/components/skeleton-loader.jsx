import Styles from "../styles/skeleton-loader.module.scss";

const SkeletonLoader = () => {
  return (
    <div class={Styles.skeleton_loader}>
      <div>
        <span
          class={Styles.skeleton_box}
          style={{ width: "40px", height: "40px", "border-radius": "50%" }}
        />
      </div>
      <div class={Styles.skeleton_loader__body}>
        <span
          class={Styles.skeleton_box}
          style={{ width: "100%", height: "40px" }}
        />
      </div>
    </div>
  );
};

export default SkeletonLoader;
