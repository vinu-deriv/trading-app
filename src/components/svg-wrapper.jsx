const SVGWrapper = (props) => {
  const getIconRef = (icon) => icon.split("/").pop().split(".").shift();

  return (
    <div id={props.id} class={props.class}>
      <svg
        xmlnsXlink="http://www.w3.org/1999/xlink"
        xmlns="http://www.w3.org/2000/svg"
        fill={props.fill}
        stroke={props.stroke}
        height={props.height ?? "24"}
        width={props.width ? props.width : props.height ?? "24"}
      >
        <use href={`${props.icon}#i-${getIconRef(props.icon)}`} />
      </svg>
    </div>
  );
};

export default SVGWrapper;
