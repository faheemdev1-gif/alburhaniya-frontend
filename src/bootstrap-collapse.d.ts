declare module "bootstrap/js/dist/collapse" {
  interface CollapseInstance {
    hide(): void;
  }
  const Collapse: {
    getInstance(element: Element | null): CollapseInstance | null;
  };
  export default Collapse;
}
