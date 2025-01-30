const prevention = () => {
  const head = document.head;
  if (head.lastChild.classList && head.lastChild.classList.contains("CopyProtection")) {
    head.removeChild(head.lastChild);
  }

  const style = document.createElement("style");
  style.classList.add("CopyProtection");
  style.innerHTML = `* {
-webkit-user-select: none !important;
-moz-user-select: none !important;
-ms-user-select: none !important;
user-select: none !important;
}`;

  head.appendChild(style);

}

setTimeout(prevention, 2000);


observer = new MutationObserver(function (mutationsList, observer) {
  // console.log("mutation");
  const head = document.head;
  if (head.lastChild.tagName === "STYLE" && !head.lastChild.classList.contains("CopyProtection")) {
    const style = document.createElement("style");
    style.classList.add("CopyProtection");
    style.innerHTML = `* {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
    }`;
    head.removeChild(head.getElementsByClassName("CopyProtection")[0]);
    head.appendChild(style);
  }
})
observer.observe(document.head, {attributes: false, childList: true, subtree: false});
