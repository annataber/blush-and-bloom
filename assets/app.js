function storeData(dataType, element) {

  // remove selected from any previously chosen item
  const items = document.querySelectorAll(`#view-${dataType} li`);
  Array.from(items).forEach((item) => {
    item.classList.remove('selected')
  });

  // add selected class so the user knows what they've chosen
  element.classList.add('selected');

  // store the color in localStorage
  const choice = element.getAttribute('data-choice');
  window.localStorage.setItem(dataType, Number(choice));
}

function loadData(dataType) {
  const choice = window.localStorage.getItem(dataType);

  if (choice) {
    storeData(dataType, document.querySelector(`#view-${dataType} li[data-choice='${choice}']`));
  }
}

async function fade(element, targetOpacity) {
  // yes yes better to do with css but where's the fun in that?
  let opacity = Number(element.style.opacity) * 100;

  const step = (opacity > targetOpacity) ? -1 : 1;

  while (opacity !== targetOpacity) {
    opacity += step;
    element.style.opacity = opacity / 100;
    await new Promise(r => setTimeout(r, (100 - opacity) / 10 * 0.75)); // tween it!
  }
}

async function setView(view, button) {
  const current = document.querySelector('div.view-selected');
  const next = document.querySelector(`div#view-${view}`);

  button?.classList.add('selected');

  if (current) {
    await fade(current, 0);
    current.classList.remove('view-selected');
  }

  button?.classList.remove('selected');
  next.style.opacity = 0;
  next.classList.add('view-selected');
  await fade(next, 100);
}
