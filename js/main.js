class CustomSelect extends HTMLElement {
  constructor() {
    super();

    this.countries = '';
    this.init();
  }

  init() {
    this.getCountries();
  }

  async getCountries() {
    try {
      // Перевірка, чи вже є дані про країни в localStorage
      const storedCountriesData = localStorage.getItem('countriesData');

      if (storedCountriesData) {
        // Використовуємо збережені дані з localStorage
        this.processedData = JSON.parse(storedCountriesData);

        this.createCountriesSelect(this.processedData);

      } else {
        // Якщо дані відсутні в localStorage або застарілі, виконуємо новий запит до API
        const response = await fetch('https://test.api.globkurier.pl/v1/countries');
        const data = await response.json();

        if (data) {
          this.processedData = [];

          // Обробляємо дані про країни
          data.forEach(country => {
            this.processedData.push({
              countryId: country.id,
              countryName: country.name
            });
          });

          // Зберігаємо оброблені дані в localStorage
          localStorage.setItem('countriesData', JSON.stringify(this.processedData));
          this.createCountriesSelect(this.processedData);

        } else {
          console.log('Відповідь не містить даних про країни.');
          console.log(data);
        }
      }
    } catch (error) {
      console.error('Виникла помилка при отриманні даних:', error.message);
    }
  }

  createCountriesSelect(countries) {
    const customSelect = document.createElement('select');
    customSelect.classList.add('hero__input');
    customSelect.name = this.getAttribute('data-name');

    countries.forEach(country => {
      const option = document.createElement('option');

      option.textContent = country.countryName;
      option.value = country.countryId;
      option.setAttribute("data-country-id", country.countryId);

      customSelect.append(option);
    });

    this.append(customSelect);
  }

}

customElements.define('custom-select', CustomSelect);


class mainForm extends HTMLElement {
  constructor() {
    super();

    this.eventListener();
  }

  eventListener() {
    const form = this.querySelector('form');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = {};

      for (let i = 0; i < form.elements.length; i++) {
        const element = form.elements[i];

        if (element.tagName === "INPUT" || element.tagName === "SELECT") {
          formData[element.name] = element.value;
        }
      }

      const responseText = `/products?width=${formData.width}&height=${formData.height}&length=${formData.length}&weight=${formData.weight}&quantity=${formData.count}&senderCountryId=${formData.from}&receiverCountryId=${formData.to}`;

      this.getProducts(responseText);
    });
  }

  async getProducts(responseText) {
    this.querySelector('.spinner').classList.remove('hidden');
    this.querySelector('form').classList.add('hidden');

    try {
      const response = await fetch('https://api.globkurier.pl/v1' + responseText);
      const data = await response.json();
      const mainDialog = document.querySelector('#main');
      const mainContent = document.querySelector('#main > .modal-dialog__content');
      //const contentEl = document.createElement('div');

      mainContent.innerHTML = '';

      if (this.isEmptyResponse(data)) {
        mainContent.innerText = 'Варіантів доставки не існує';
      } else {
        mainContent.append(this.createProductCard(this.processData(data)));
      }

      mainDialog.show();

    } catch (error) {
      console.error('Виникла помилка при отриманні даних:', error.message);
    } finally {
      // Приберіть індікатор завантаження після отримання відповіді
      this.querySelector('.spinner').classList.add('hidden');
      this.querySelector('form').classList.remove('hidden');
    }

  }

  isEmptyResponse(data) {
    // Перевірка на порожню відповідь
    return (
      Object.keys(data).every(key => Array.isArray(data[key]) && data[key].length === 0)
    );
  }

  processData(data) {
    // Створення нового масиву об'єктів з необхідними полями
    return data.standard.map(item => ({
      id: item.id,
      name: item.name,
      carrierName: item.carrierName,
      transport: item.transport ? item.transport.name : '',
      grossPrice: item.grossPrice,
      currency: item.currency,
      carrierLogoLink: item.carrierLogoLink,
      deliveryTime: item.deliveryTime
    }));
  }

  createProductCard(processedData) {
    const containerEl = document.createElement('div');

    processedData.forEach(product => {
      const cardEl = document.createElement('div');
      const imageWrapEl = document.createElement('div');
      const imageEl = document.createElement('img');


      imageEl.src = product.carrierLogoLink;
      containerEl.classList.add('results__cards');
      cardEl.classList.add('results__card');
      imageEl.classList.add('results__card-image');
      imageWrapEl.classList.add('results__card-image-wrapper');

      imageWrapEl.append(imageEl);
      cardEl.append(imageWrapEl);
      containerEl.append(cardEl);
    });

    return containerEl;
  }

}

customElements.define('main-form', mainForm);

class ModalDialog extends HTMLElement {
  constructor() {
    super();

    this.closeButton = this.querySelector('button.close');
  }

  connectedCallback() {
    this.closeButton.addEventListener('click', () => {
      this.hide();
    });
  }

  blockScroll() {
    document.querySelector('body').style.overflow = "hidden";
  }

  unblockScroll() {
    document.querySelector('body').style.overflow = "visible";
  }

  show() {
    this.setAttribute("aria-expanded", true);
    //this.blockScroll();
  }

  hide() {
    this.setAttribute("aria-expanded", false);
    //this.unblockScroll();
  }
}

customElements.define('modal-dialog', ModalDialog);


class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');
    const modal = this.getAttribute('data-modal');
    this.dialog = document.querySelector('#' + modal);

    if (!button) return;
    button.addEventListener('click', () => {
      if (this.dialog.getAttribute("aria-expanded") === 'false') {
        this.dialog.show();
      } else {
        this.dialog.hide();
      }
    });
  }
}

customElements.define('modal-opener', ModalOpener);
