const jobs = window.JOBS ?? [];
const container = document.querySelector('#jobDetail');
const params = new URLSearchParams(location.search);
const id = Number(params.get('id')) || 1;
const job = jobs.find((item) => item.id === id);

if (!job) {
  container.innerHTML = '<div class="empty-state">존재하지 않는 공고입니다.</div>';
} else {
  const list = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const skills = job.skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join('');

  container.innerHTML = `
    <article class="detail-main">
      <p class="company-name">${escapeHtml(job.company)}</p>
      <h1>${escapeHtml(job.title)}</h1>
      <div class="skill-tags large">${skills}</div>
      <section class="detail-section"><h2>주요 업무</h2><ul>${list(job.duties)}</ul></section>
      <section class="detail-section"><h2>필수 역량</h2><ul>${list(job.requirements)}</ul></section>
      <section class="detail-section"><h2>우대 사항</h2><ul>${list(job.preferred)}</ul></section>
    </article>
    <aside class="detail-sidebar">
      <h2>요약 정보</h2>
      <dl>
        <div><dt>직무</dt><dd>${escapeHtml(job.category)}</dd></div>
        <div><dt>위치</dt><dd>${escapeHtml(job.location)}</dd></div>
        <div><dt>경력</dt><dd>${escapeHtml(job.career)}</dd></div>
        <div><dt>고용형태</dt><dd>${escapeHtml(job.employment)}</dd></div>
        <div><dt>마감</dt><dd>${escapeHtml(job.deadline)}</dd></div>
      </dl>
      <a class="btn btn-primary btn-wide" href="match.html?job=${job.id}">이 공고 AI 분석</a>
      <button class="btn btn-light btn-wide" type="button" id="favoriteButton">관심공고 저장</button>
    </aside>`;

  document.querySelector('#favoriteButton').addEventListener('click', (event) => {
    event.currentTarget.textContent = '관심공고 저장됨 ✓';
  });
}
