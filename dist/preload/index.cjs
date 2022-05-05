"use strict";
var fs = require("fs");
var electron = require("electron");
function _interopDefaultLegacy(e) {
  return e && typeof e === "object" && "default" in e ? e : { "default": e };
}
var fs__default = /* @__PURE__ */ _interopDefaultLegacy(fs);
const domReady = (condition = ["complete", "interactive"]) => {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
};
function useLoading() {
  const className = `loaders-css__square-spin`;
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");
  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;
  return {
    appendLoading() {
      document.head.appendChild(oStyle);
      document.body.appendChild(oDiv);
    },
    removeLoading() {
      document.head.removeChild(oStyle);
      document.body.removeChild(oDiv);
    }
  };
}
const { appendLoading, removeLoading } = useLoading();
(async () => {
  await domReady();
  appendLoading();
})();
electron.contextBridge.exposeInMainWorld("fs", fs__default["default"]);
electron.contextBridge.exposeInMainWorld("removeLoading", removeLoading);
electron.contextBridge.exposeInMainWorld("ipcRenderer", withPrototype(electron.ipcRenderer));
function withPrototype(obj) {
  const protos = Object.getPrototypeOf(obj);
  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key))
      continue;
    if (typeof value === "function") {
      obj[key] = function(...args) {
        return value.call(obj, ...args);
      };
    } else {
      obj[key] = value;
    }
  }
  return obj;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguY2pzIiwic291cmNlcyI6WyIuLi8uLi9wYWNrYWdlcy9wcmVsb2FkL3V0aWxzLnRzIiwiLi4vLi4vcGFja2FnZXMvcHJlbG9hZC9sb2FkaW5nLnRzIiwiLi4vLi4vcGFja2FnZXMvcHJlbG9hZC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogRG9jdW1lbnQgcmVhZHkgKi9cbmV4cG9ydCBjb25zdCBkb21SZWFkeSA9IChcbiAgY29uZGl0aW9uOiBEb2N1bWVudFJlYWR5U3RhdGVbXSA9IFsnY29tcGxldGUnLCAnaW50ZXJhY3RpdmUnXVxuKSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGlmIChjb25kaXRpb24uaW5jbHVkZXMoZG9jdW1lbnQucmVhZHlTdGF0ZSkpIHtcbiAgICAgIHJlc29sdmUodHJ1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncmVhZHlzdGF0ZWNoYW5nZScsICgpID0+IHtcbiAgICAgICAgaWYgKGNvbmRpdGlvbi5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSkge1xuICAgICAgICAgIHJlc29sdmUodHJ1ZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH0pXG59XG4iLCIvKipcbiAqIGh0dHBzOi8vdG9iaWFzYWhsaW4uY29tL3NwaW5raXRcbiAqIGh0dHBzOi8vY29ubm9yYXRoZXJ0b24uY29tL2xvYWRlcnNcbiAqIGh0dHBzOi8vcHJvamVjdHMubHVrZWhhYXMubWUvY3NzLWxvYWRlcnNcbiAqIGh0dHBzOi8vbWF0ZWprdXN0ZWMuZ2l0aHViLmlvL1NwaW5UaGF0U2hpdFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlTG9hZGluZygpIHtcbiAgY29uc3QgY2xhc3NOYW1lID0gYGxvYWRlcnMtY3NzX19zcXVhcmUtc3BpbmBcbiAgY29uc3Qgc3R5bGVDb250ZW50ID0gYFxuQGtleWZyYW1lcyBzcXVhcmUtc3BpbiB7XG4gIDI1JSB7IHRyYW5zZm9ybTogcGVyc3BlY3RpdmUoMTAwcHgpIHJvdGF0ZVgoMTgwZGVnKSByb3RhdGVZKDApOyB9XG4gIDUwJSB7IHRyYW5zZm9ybTogcGVyc3BlY3RpdmUoMTAwcHgpIHJvdGF0ZVgoMTgwZGVnKSByb3RhdGVZKDE4MGRlZyk7IH1cbiAgNzUlIHsgdHJhbnNmb3JtOiBwZXJzcGVjdGl2ZSgxMDBweCkgcm90YXRlWCgwKSByb3RhdGVZKDE4MGRlZyk7IH1cbiAgMTAwJSB7IHRyYW5zZm9ybTogcGVyc3BlY3RpdmUoMTAwcHgpIHJvdGF0ZVgoMCkgcm90YXRlWSgwKTsgfVxufVxuLiR7Y2xhc3NOYW1lfSA+IGRpdiB7XG4gIGFuaW1hdGlvbi1maWxsLW1vZGU6IGJvdGg7XG4gIHdpZHRoOiA1MHB4O1xuICBoZWlnaHQ6IDUwcHg7XG4gIGJhY2tncm91bmQ6ICNmZmY7XG4gIGFuaW1hdGlvbjogc3F1YXJlLXNwaW4gM3MgMHMgY3ViaWMtYmV6aWVyKDAuMDksIDAuNTcsIDAuNDksIDAuOSkgaW5maW5pdGU7XG59XG4uYXBwLWxvYWRpbmctd3JhcCB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB3aWR0aDogMTAwdnc7XG4gIGhlaWdodDogMTAwdmg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBiYWNrZ3JvdW5kOiAjMjgyYzM0O1xuICB6LWluZGV4OiA5O1xufVxuICAgIGBcbiAgY29uc3Qgb1N0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICBjb25zdCBvRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICBvU3R5bGUuaWQgPSAnYXBwLWxvYWRpbmctc3R5bGUnXG4gIG9TdHlsZS5pbm5lckhUTUwgPSBzdHlsZUNvbnRlbnRcbiAgb0Rpdi5jbGFzc05hbWUgPSAnYXBwLWxvYWRpbmctd3JhcCdcbiAgb0Rpdi5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cIiR7Y2xhc3NOYW1lfVwiPjxkaXY+PC9kaXY+PC9kaXY+YFxuXG4gIHJldHVybiB7XG4gICAgYXBwZW5kTG9hZGluZygpIHtcbiAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQob1N0eWxlKVxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvRGl2KVxuICAgIH0sXG4gICAgcmVtb3ZlTG9hZGluZygpIHtcbiAgICAgIGRvY3VtZW50LmhlYWQucmVtb3ZlQ2hpbGQob1N0eWxlKVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChvRGl2KVxuICAgIH0sXG4gIH1cbn1cbiIsImltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCB7IGNvbnRleHRCcmlkZ2UsIGlwY1JlbmRlcmVyIH0gZnJvbSAnZWxlY3Ryb24nXG5pbXBvcnQgeyBkb21SZWFkeSB9IGZyb20gJy4vdXRpbHMnXG5pbXBvcnQgeyB1c2VMb2FkaW5nIH0gZnJvbSAnLi9sb2FkaW5nJ1xuXG5jb25zdCB7IGFwcGVuZExvYWRpbmcsIHJlbW92ZUxvYWRpbmcgfSA9IHVzZUxvYWRpbmcoKVxuXG47KGFzeW5jICgpID0+IHtcbiAgYXdhaXQgZG9tUmVhZHkoKVxuXG4gIGFwcGVuZExvYWRpbmcoKVxufSkoKVxuXG4vLyAtLS0tLS0tLS0gRXhwb3NlIHNvbWUgQVBJIHRvIHRoZSBSZW5kZXJlciBwcm9jZXNzLiAtLS0tLS0tLS1cbmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoJ2ZzJywgZnMpXG5jb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKCdyZW1vdmVMb2FkaW5nJywgcmVtb3ZlTG9hZGluZylcbmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoJ2lwY1JlbmRlcmVyJywgd2l0aFByb3RvdHlwZShpcGNSZW5kZXJlcikpXG5cbi8vIGBleHBvc2VJbk1haW5Xb3JsZGAgY2FuJ3QgZGV0ZWN0IGF0dHJpYnV0ZXMgYW5kIG1ldGhvZHMgb2YgYHByb3RvdHlwZWAsIG1hbnVhbGx5IHBhdGNoaW5nIGl0LlxuZnVuY3Rpb24gd2l0aFByb3RvdHlwZShvYmo6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgY29uc3QgcHJvdG9zID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iailcblxuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhwcm90b3MpKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIGNvbnRpbnVlXG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBTb21lIG5hdGl2ZSBBUElzLCBsaWtlIGBOb2RlSlMuRXZlbnRFbWl0dGVyWydvbiddYCwgZG9uJ3Qgd29yayBpbiB0aGUgUmVuZGVyZXIgcHJvY2Vzcy4gV3JhcHBpbmcgdGhlbSBpbnRvIGEgZnVuY3Rpb24uXG4gICAgICBvYmpba2V5XSA9IGZ1bmN0aW9uICguLi5hcmdzOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLmNhbGwob2JqLCAuLi5hcmdzKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvYmpba2V5XSA9IHZhbHVlXG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpcbn1cbiJdLCJuYW1lcyI6WyJjb250ZXh0QnJpZGdlIiwiZnMiLCJpcGNSZW5kZXJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNPLE1BQU0sV0FBVyxDQUN0QixZQUFrQyxDQUFDLFlBQVksYUFBYSxNQUN6RDtBQUNJLFNBQUEsSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM5QixRQUFJLFVBQVUsU0FBUyxTQUFTLFVBQVUsR0FBRztBQUMzQyxjQUFRLElBQUk7QUFBQSxJQUFBLE9BQ1A7QUFDSSxlQUFBLGlCQUFpQixvQkFBb0IsTUFBTTtBQUNsRCxZQUFJLFVBQVUsU0FBUyxTQUFTLFVBQVUsR0FBRztBQUMzQyxrQkFBUSxJQUFJO0FBQUEsUUFDZDtBQUFBLE1BQUEsQ0FDRDtBQUFBLElBQ0g7QUFBQSxFQUFBLENBQ0Q7QUFDSDtBQ1Q2QixzQkFBQTtBQUMzQixRQUFNLFlBQVk7QUFDbEIsUUFBTSxlQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FPcEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW9CSyxRQUFBLFNBQVMsU0FBUyxjQUFjLE9BQU87QUFDdkMsUUFBQSxPQUFPLFNBQVMsY0FBYyxLQUFLO0FBRXpDLFNBQU8sS0FBSztBQUNaLFNBQU8sWUFBWTtBQUNuQixPQUFLLFlBQVk7QUFDakIsT0FBSyxZQUFZLGVBQWU7QUFFekIsU0FBQTtBQUFBLElBQ0wsZ0JBQWdCO0FBQ0wsZUFBQSxLQUFLLFlBQVksTUFBTTtBQUN2QixlQUFBLEtBQUssWUFBWSxJQUFJO0FBQUEsSUFDaEM7QUFBQSxJQUNBLGdCQUFnQjtBQUNMLGVBQUEsS0FBSyxZQUFZLE1BQU07QUFDdkIsZUFBQSxLQUFLLFlBQVksSUFBSTtBQUFBLElBQ2hDO0FBQUEsRUFBQTtBQUVKO0FDaERBLE1BQU0sRUFBRSxlQUFlLGtCQUFrQjtBQUV2QyxBQUFZLGFBQUE7QUFDWixRQUFNLFNBQVM7QUFFRDtBQUNoQjtBQUdBQSxTQUFBQSxjQUFjLGtCQUFrQixNQUFNQyxZQUFBQSxVQUFFO0FBQ3hDRCxTQUFBQSxjQUFjLGtCQUFrQixpQkFBaUIsYUFBYTtBQUM5REEsU0FBQSxjQUFjLGtCQUFrQixlQUFlLGNBQWNFLFNBQUFBLFdBQVcsQ0FBQztBQUd6RSx1QkFBdUIsS0FBMEI7QUFDekMsUUFBQSxTQUFTLE9BQU8sZUFBZSxHQUFHO0FBRXhDLGFBQVcsQ0FBQyxLQUFLLFVBQVUsT0FBTyxRQUFRLE1BQU0sR0FBRztBQUNqRCxRQUFJLE9BQU8sVUFBVSxlQUFlLEtBQUssS0FBSyxHQUFHO0FBQUc7QUFFaEQsUUFBQSxPQUFPLFVBQVUsWUFBWTtBQUUzQixVQUFBLE9BQU8sWUFBYSxNQUFXO0FBQ2pDLGVBQU8sTUFBTSxLQUFLLEtBQUssR0FBRyxJQUFJO0FBQUEsTUFBQTtBQUFBLElBQ2hDLE9BQ0s7QUFDTCxVQUFJLE9BQU87QUFBQSxJQUNiO0FBQUEsRUFDRjtBQUNPLFNBQUE7QUFDVDsifQ==
