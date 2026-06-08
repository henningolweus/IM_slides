// helpers/z-order.js — stable sort emit order by (z ascending, domIndex ascending)
// so that pptxgenjs add-order matches CSS paint order.

export function stableSortByZ(elements) {
  return elements
    .map((el, i) => ({ el, i }))
    .sort((a, b) => {
      const za = a.el.z || 0;
      const zb = b.el.z || 0;
      if (za !== zb) return za - zb;
      // tie-break: domIndex if set, else input order
      const da = a.el.domIndex !== undefined ? a.el.domIndex : a.i;
      const db = b.el.domIndex !== undefined ? b.el.domIndex : b.i;
      return da - db;
    })
    .map(x => x.el);
}
