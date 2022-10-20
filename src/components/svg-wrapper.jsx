import { onMount } from "solid-js";

const SVGWrapper = (props) => {
  onMount(() => {
    const ref_element = document.getElementById(props.id)?.children[0];
    ref_element.style["fill"] = props.fill;
    ref_element.style["stroke"] = props.stroke;
  });

  return (
    <div id={props.id} class={props.className}>
      {props.icon}
    </div>
  );
};

export default SVGWrapper;
