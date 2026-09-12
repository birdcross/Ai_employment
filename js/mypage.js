const jobs = window.JOBS ?? [];
const favoriteJobs = document.querySelector('#favoriteJobs');
const favorites = jobs.filter((job) => [1, 8].includes(job.id));

favoriteJobs.innerHTML = favorites.map((job) => `
  <article class="favorite-card">
    <div><p class="company-name">${escapeHtml(job.company)}</p><h3>${escapeHtml(job.title)}</h3><p>${escapeHtml(job.location)} · ${escapeHtml(job.career)}</p></div>
    <a class="btn btn-small" href="job-detail.html?id=${job.id}">상세보기</a>
  </article>`).join('');
