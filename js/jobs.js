const jobs = window.JOBS ?? [];

const jobList = document.querySelector('#jobList');
const resultCount = document.querySelector('#resultCount');
const emptyState = document.querySelector('#emptyState');

const keywordInput = document.querySelector('#keywordInput');
const locationFilter = document.querySelector('#locationFilter');
const careerFilter = document.querySelector('#careerFilter');
const categoryFilter = document.querySelector('#categoryFilter');

const resetButton = document.querySelector('#resetButton');


/* =========================================================
   SELECT OPTION 생성
========================================================= */

function fillOptions(select, values) {

  [...new Set(values)].forEach((value) => {

    const option = document.createElement('option');

    option.value = value;
    option.textContent = value;

    select.append(option);

  });

}


fillOptions(
  locationFilter,
  jobs.map((job) => job.location)
);

fillOptions(
  careerFilter,
  jobs.map((job) => job.career)
);

fillOptions(
  categoryFilter,
  jobs.map((job) => job.category)
);


/* =========================================================
   JOB CARD 생성
========================================================= */

function createJobCard(job) {

  const skills = job.skills
    .map(
      (skill) =>
        `<span>${escapeHtml(skill)}</span>`
    )
    .join('');


  return `
    <article
      class="job-card"
      data-job-id="${job.id}"
      role="link"
      tabindex="0"
      aria-label="${escapeHtml(job.company)} ${escapeHtml(job.title)} 상세보기"
    >

      <div class="job-card-top">

        <div class="company-badge">
          ${escapeHtml(job.company.charAt(0))}
        </div>

        <div>

          <p class="company-name">
            ${escapeHtml(job.company)}
          </p>

          <h2>
            ${escapeHtml(job.title)}
          </h2>

        </div>

      </div>


      <p class="job-meta">
        ${escapeHtml(job.location)}
        ·
        ${escapeHtml(job.career)}
        ·
        ${escapeHtml(job.employment ?? '')}
      </p>


      <div class="skill-tags">
        ${skills}
      </div>


      <div class="job-card-actions">

        <span>
          ${escapeHtml(job.category)}
        </span>


        <a
          class="btn btn-small detail-button"
          href="job-detail.html?id=${job.id}"
        >
          상세보기
        </a>

      </div>

    </article>
  `;

}


/* =========================================================
   ★ 카드 전체 클릭 → 상세페이지
========================================================= */

jobList.addEventListener('click', function (event) {

  const card = event.target.closest('.job-card');

  if (!card) {
    return;
  }


  /*
   상세보기 링크를 직접 클릭한 경우에는
   <a href> 기본 동작 사용
  */
  if (event.target.closest('a')) {
    return;
  }


  const jobId = card.dataset.jobId;

  if (!jobId) {
    return;
  }


  window.location.href =
    `job-detail.html?id=${jobId}`;

});


/* =========================================================
   키보드 Enter / Space → 상세페이지
========================================================= */

jobList.addEventListener('keydown', function (event) {

  const card = event.target.closest('.job-card');

  if (!card) {
    return;
  }


  if (
    event.key !== 'Enter' &&
    event.key !== ' '
  ) {
    return;
  }


  /*
   상세보기 링크에 포커스된 상태라면
   링크 기본 동작 사용
  */
  if (event.target.closest('a')) {
    return;
  }


  event.preventDefault();


  const jobId = card.dataset.jobId;

  if (!jobId) {
    return;
  }


  window.location.href =
    `job-detail.html?id=${jobId}`;

});


/* =========================================================
   JOB FILTER
========================================================= */

function filterJobs() {

  const keyword =
    keywordInput.value
      .trim()
      .toLowerCase();


  const location =
    locationFilter.value;


  const career =
    careerFilter.value;


  const category =
    categoryFilter.value;


  const filtered = jobs.filter((job) => {

    const haystack = [

      job.company,
      job.title,
      job.location,
      job.category,
      ...job.skills

    ]
      .join(' ')
      .toLowerCase();


    return (

      (!keyword ||
        haystack.includes(keyword))

      &&

      (!location ||
        job.location === location)

      &&

      (!career ||
        job.career === career)

      &&

      (!category ||
        job.category === category)

    );

  });


  /* 결과 개수 */

  resultCount.textContent =
    filtered.length;


  /* 카드 출력 */

  jobList.innerHTML =
    filtered
      .map(createJobCard)
      .join('');


  /* 결과 없음 */

  emptyState.classList.toggle(
    'hidden',
    filtered.length !== 0
  );

}


/* =========================================================
   검색 Event
========================================================= */

[
  keywordInput,
  locationFilter,
  careerFilter,
  categoryFilter

].forEach((element) => {

  element.addEventListener(

    element.tagName === 'INPUT'
      ? 'input'
      : 'change',

    filterJobs

  );

});


/* =========================================================
   초기화
========================================================= */

resetButton.addEventListener(
  'click',
  function () {

    keywordInput.value = '';
    locationFilter.value = '';
    careerFilter.value = '';
    categoryFilter.value = '';

    filterJobs();

  }
);


/* =========================================================
   최초 실행
========================================================= */

filterJobs();