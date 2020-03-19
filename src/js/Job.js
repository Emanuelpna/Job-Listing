export default class Job {
  constructor(Jobs, ListElement, FilterElement) {
    /** Full List of Jobs */
    this.Jobs = Jobs;

    /** Filters */
    this.JobsFiltered = [];
    this.Filters = [];

    /** Elements */
    this.ListJobs = ListElement;
    this.ListFilters = FilterElement;
  }

  getAllJobs() {
    return this.Jobs;
  }

  getJobsFiltered() {
    const filteredList = this.Jobs.filter(job => {
      const newJobList = Object.values(job);

      const filtered = this.Filters.filter(
        filter =>
          newJobList.find(jobListItem => {
            if (typeof jobListItem === 'string')
              return jobListItem.includes(filter);
            else if (typeof jobListItem === 'object')
              return jobListItem.find(item => {
                if (typeof item === 'string') return item.includes(filter);
              });
            else return false;
          }) !== undefined
      );

      if (filtered.length > 0) return filtered;
    });

    this.JobsFiltered.push(filteredList);

    return this.JobsFiltered;
  }

  getFilters() {
    return this.Filters;
  }

  getFiltersAsArray() {
    return this.Filters.split(',');
  }

  setFilters(newFilter) {
    const isRepated = this.Filters.includes(newFilter);

    if (!isRepated) this.Filters.push(newFilter);

    this.printFilters();

    return this.Filters;
  }

  clearFilter(filter) {
    this.Filters = this.Filters.filter(filterItem => filterItem !== filter);

    this.getJobsFiltered();

    this.printFilters();

    return this.Filters;
  }

  clearFilters() {
    this.Filters = [];
    this.JobsFiltered = [];

    this.printFilters();

    return true;
  }

  _translateDescription(descList) {
    let stringified = descList.join(' • ');

    let date = stringified.substr(0, 2);

    const rest = stringified.substr(2, stringified.length);

    date =
      Number(date) >= 7 ? `${Math.floor(date / 7)} w ago ` : `${date}d ago `;

    return date + rest;
  }

  _convertListToHTML(list) {
    return list.map(job => {
      const {
        isNew,
        isPinned,
        logo,
        company,
        role,
        description,
        roleBadge,
        roleLevel,
        roleLanguages,
        roleTools
      } = job;

      const roleLanguagesHTML =
        roleLanguages !== undefined && roleLanguages.length > 0
          ? roleLanguages.map(lang => `<span class="jobInfo">${lang}</span>`)
          : '';
      const roleToolsHTML =
        roleTools !== undefined && roleTools.length > 0
          ? roleTools.map(tool => `<span class="jobInfo">${tool}</span>`)
          : '';

      return `
        <li class="job">
          <section class="jobContainer">
            <img src="./images/${logo}.svg" alt="Photosnap Logo" />
            <div class="jobTitle">
              <span class="jobCompany">${company}</span>

              ${isNew ? `<span class="jobBadge new">New!</span>` : ''}
              ${isPinned ? `<span class="jobBadge pin">Featured</span>` : ''}

              <strong class="jobRole">
                ${role}
              </strong>

              <span class="jobDescription">
                ${this._translateDescription(description)}
              </span>
            </div>

            <div class="jobInfos">
              <!-- Role -->
              <span class="jobInfo">${roleBadge}</span>
              <!-- Level -->
              <span class="jobInfo">${roleLevel}</span>
              <!-- Languages -->
              ${roleLanguagesHTML.join('')}
              <!-- Tools -->
              ${roleToolsHTML.length > 0 ? roleToolsHTML.join('') : ''}
            </div>
          </section>
        </li>
      `;
    });
  }

  printFilters() {
    const filters = this.getFilters();

    if (filters.length === 0) {
      this.ListFilters.parentElement.classList.remove('active');
      return;
    }

    const filtersHTML = filters
      .map(
        filter =>
          `
            <div class="filter">
              <span class="filterName">${filter}</span>
              <button class="filterClear" data-filter="${filter}">&#10006;</button>
            </div>
          `
      )
      .join('');

    this.ListFilters.innerHTML = filtersHTML;

    this.ListFilters.parentElement.classList.add('active');

    const clearButtons = document.querySelectorAll('button.filterClear');

    [...clearButtons].forEach(element => {
      element.onclick = e => {
        this.clearFilter(e.target.dataset.filter);
        this.printList();
      };
    });

    const clearAllButton = document.querySelector('button.clearAllFilters');

    clearAllButton.onclick = () => {
      this.clearFilters();
      this.printList();
    };
  }

  printList() {
    let list;
    // Se já tem a lista filtrada pronta usa ela
    if (this.JobsFiltered.length > 0) list = this.JobsFiltered[0];
    // Se não, checa se os filtros existem e gera a lista novamente
    else if (this.Filters.length > 0) list = this.getJobsFiltered()[0];
    // Em último caso, mostra tudo
    else list = this.Jobs;

    // Aviso de carregando
    this.ListJobs.innerHTML = 'Carregando...';

    console.log('list :', list);

    // Cria o HTML
    const htmlList = this._convertListToHTML(list);

    // Zera a listagem
    this.ListJobs.innerHTML = '';
    this.ListJobs.innerHTML = htmlList.join('');

    const badges = document.querySelectorAll('span.jobInfo');

    [...badges].forEach(element => {
      element.onclick = e => {
        this.setFilters(e.target.innerHTML);

        this.printList();
      };
    });
  }
}
