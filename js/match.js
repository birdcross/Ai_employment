const form = document.querySelector('#matchForm');
const formMessage = document.querySelector('#formMessage');
const loadingPanel = document.querySelector('#loadingPanel');
const resultPanel = document.querySelector('#resultPanel');
const recommendationList = document.querySelector('#recommendationList');
const analysisDetail = document.querySelector('#analysisDetail');
const retryButton = document.querySelector('#retryButton');
const recommendButton = document.querySelector('#recommendButton');
const jobs = window.JOBS ?? [];

const params = new URLSearchParams(location.search);
const selectedJobId = Number(params.get('job'));
if (selectedJobId) {
  const selectedJob = jobs.find((job) => job.id === selectedJobId);
  if (selectedJob) {
    document.querySelector('#desiredRole').value = selectedJob.title;
    document.querySelector('#desiredLocation').value = selectedJob.location;
  }
}

function showMessage(message, type = 'error') {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

function clearMessage() {
  formMessage.textContent = '';
  formMessage.className = 'form-message hidden';
}

function profileFromForm() {
  return {
    desired_role: document.querySelector('#desiredRole').value.trim(),
    career: document.querySelector('#career').value.trim(),
    desired_location: document.querySelector('#desiredLocation').value.trim(),
    certificates: document.querySelector('#certificates').value.trim(),
    skills: document.querySelector('#skills').value.trim(),
    education: document.querySelector('#education').value.trim(),
    note: document.querySelector('#note').value.trim()
  };
}

function validateProfile(profile) {
  if (!profile.desired_role || !profile.career || !profile.desired_location || !profile.skills) {
    return '필수 항목(*)을 모두 입력해주세요.';
  }
  return '';
}

function renderResults(data) {
  const recommendations = data.recommendations ?? [];
  recommendationList.innerHTML = recommendations.map((item, index) => `
    <button class="recommendation-card ${index === 0 ? 'selected' : ''}" type="button" data-index="${index}">
      <span class="rank">${index + 1}위</span>
      <div><strong>${escapeHtml(item.company)}</strong><h3>${escapeHtml(item.title)}</h3></div>
      <span class="score">${escapeHtml(item.score)}%</span>
    </button>`).join('');

  function renderDetail(index) {
    const item = recommendations[index];
    if (!item) return;
    document.querySelectorAll('.recommendation-card').forEach((card, cardIndex) => card.classList.toggle('selected', cardIndex === index));
    analysisDetail.innerHTML = `
      <span class="eyebrow">${index + 1}위 ANALYSIS</span>
      <h2>${escapeHtml(item.company)} · ${escapeHtml(item.title)}</h2>
      <h3>추천 이유</h3>
      <ul class="check-list">${(item.reasons ?? []).map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}</ul>
      <h3>현재 강점</h3>
      <div class="skill-tags large">${(item.strengths ?? []).map((strength) => `<span>${escapeHtml(strength)}</span>`).join('')}</div>
      <h3>보완하면 좋은 역량</h3>
      <ul class="gap-list">${(item.gaps ?? []).map((gap) => `<li>${escapeHtml(gap)}</li>`).join('')}</ul>
      <a class="btn btn-primary" href="job-detail.html?id=${item.job_id}">공고 상세보기</a>`;
  }

  document.querySelectorAll('.recommendation-card').forEach((card) => {
    card.addEventListener('click', () => renderDetail(Number(card.dataset.index)));
  });
  renderDetail(0);
  resultPanel.classList.remove('hidden');
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage();
  resultPanel.classList.add('hidden');

  const profile = profileFromForm();
  const validationError = validateProfile(profile);
  if (validationError) {
    showMessage(validationError);
    return;
  }

  loadingPanel.classList.remove('hidden');
  recommendButton.disabled = true;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, jobs }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || data.error || 'AI 추천 요청에 실패했습니다.');
    }
    renderResults(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      showMessage('AI 응답이 늦어지고 있습니다. 잠시 후 다시 시도해주세요.');
    } else {
      showMessage(`${error.message} 로컬에서 정적 화면만 확인 중이라면 Vercel 개발 서버가 필요합니다.`);
    }
  } finally {
    clearTimeout(timeoutId);
    loadingPanel.classList.add('hidden');
    recommendButton.disabled = false;
  }
});

retryButton.addEventListener('click', () => {
  resultPanel.classList.add('hidden');
  form.scrollIntoView({ behavior: 'smooth' });
});
