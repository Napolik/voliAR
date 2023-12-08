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
    try {
      const response = await fetch('https://api.globkurier.pl/v1' + responseText);
      const data = await response.json();

      console.log(JSON.stringify(data));
    } catch (error) {
      console.error('Виникла помилка при отриманні даних:', error.message);
    }

  }

}

customElements.define('main-form', mainForm);
