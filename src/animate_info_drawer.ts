function toggleInformation() {
  let moreInfoDiv = document.querySelector<HTMLElement>(".more-information");
  if (moreInfoDiv === null) {
    return;
  }

  // Toggle the height and overflow properties
  if (moreInfoDiv.style.height === "0px" || moreInfoDiv.style.height === "") {
    moreInfoDiv.style.height = moreInfoDiv.scrollHeight + "px";
  } else {
    moreInfoDiv.style.height = "0";
  }
}

document
  .querySelector(".more-information-toggle")
  ?.addEventListener("click", toggleInformation);
