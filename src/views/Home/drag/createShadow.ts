/**
 * 创建拖拽阴影（参考 Craft.js createShadow 实现）
 */
export function createShadow(e: DragEvent, el: HTMLElement): HTMLElement {
  const { width, height } = el.getBoundingClientRect();
  const shadow = el.cloneNode(true) as HTMLElement;

  shadow.style.position = "absolute";
  shadow.style.left = "-100%";
  shadow.style.top = "-100%";
  shadow.style.width = `${width}px`;
  shadow.style.height = `${height}px`;
  shadow.style.pointerEvents = "none";
  shadow.style.opacity = "0.8";
  shadow.classList.add("drag-shadow");

  document.body.appendChild(shadow);
  e.dataTransfer!.setDragImage(shadow, 0, 0);

  return shadow;
}
