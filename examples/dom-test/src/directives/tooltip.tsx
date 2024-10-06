export function TooltipDirective(element, props) {
  console.log("element, props: ", element, props);

  const { content } = props;

  const tooltipEl = document.createElement("div");
  tooltipEl.className = "tooltip-wrapper";
  tooltipEl.textContent = content;

  tooltipEl.style.position = "absolute";
  tooltipEl.style.display = "none";

  element.style.position = "relative";
  element.appendChild(tooltipEl);

  element.addEventListener("mouseenter", () => {
    tooltipEl.style.display = "block";
  });
  element.addEventListener("mouseleave", () => {
    tooltipEl.style.display = "none";
  });
}
