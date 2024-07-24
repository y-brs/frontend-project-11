const renderForm = (state, elements, status, i18nextInstance) => {
  const { form } = state;
  const { input, feedback, sendButton } = elements;

  if (status === 'processing') {
    input.setAttribute('disabled', '');
    sendButton.setAttribute('disabled', '');
    feedback.textContent = '';
    feedback.classList.remove('text-danger');
    input.classList.remove('is-invalid');
  }

  if (status === 'failed') {
    feedback.textContent = i18nextInstance.t(form.error);
    feedback.classList.add('text-danger');
    input.classList.add('is-invalid');
    input.removeAttribute('disabled');
    sendButton.removeAttribute('disabled');
    input.focus();
  }
};

const handleCard = (title) => {
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const titleCard = document.createElement('h2');
  const list = document.createElement('ul');

  card.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  titleCard.classList.add('card-title', 'h4');
  titleCard.textContent = title;
  list.classList.add('list-group', 'border-0', 'rounded-0');

  cardBody.append(titleCard);
  card.append(cardBody, list);

  return card;
};

const renderFeeds = (state, elements, i18nextInstance) => {
  const { feedsCol } = elements;
  const { feeds } = state;

  feedsCol.innerHTML = '';

  if (!feedsCol.hasChildNodes()) {
    const card = handleCard(i18nextInstance.t('sectionTitle.feeds'));
    feedsCol.append(card);
  }

  const card = feedsCol.querySelector('.card');
  const list = card.querySelector('ul');

  const items = feeds.map((feed) => {
    const li = document.createElement('li');
    const title = document.createElement('h3');
    const description = document.createElement('p');

    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    list.append(li);
    title.classList.add('h6', 'm-0');
    title.textContent = feed.feedTitle;
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.feedDescription;
    li.append(title, description);

    return li;
  });

  list.append(...items);
};

const renderPosts = (state, elements, i18nextInstance) => {
  const { postsCol } = elements;
  const { posts } = state;

  postsCol.innerHTML = '';

  if (!postsCol.hasChildNodes()) {
    const card = handleCard(i18nextInstance.t('sectionTitle.posts'));
    postsCol.append(card);
  }

  const card = postsCol.querySelector('.card');
  const list = card.querySelector('ul');

  const items = posts.map((item) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    link.classList.add('fw-bold');
    link.setAttribute('href', `${item.postLink}`);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'nofollow noreferrer');
    link.textContent = item.postTitle;
    li.append(link);

    return li;
  });

  list.append(...items);
};

const renderLoading = (state, elements, status, i18nextInstance) => {
  const { downloadProcess } = state;
  const { input, feedback, sendButton } = elements;

  if (status === 'succsess') {
    feedback.textContent = i18nextInstance.t('success');
    feedback.classList.add('text-success');
    sendButton.removeAttribute('disabled');
    input.removeAttribute('disabled');
    input.value = '';
    input.focus();
  }

  if (status === 'failed') {
    feedback.textContent = i18nextInstance.t(downloadProcess.error);
    console.log(downloadProcess.error);
    feedback.classList.add('text-danger');
    input.classList.add('is-invalid');
    input.removeAttribute('disabled');
    sendButton.removeAttribute('disabled');
  }
};

export default (state, elements, i18nextInstance) => (path, value) => {
  if (path === 'form.status') {
    renderForm(state, elements, value, i18nextInstance);
  }

  if (path === 'downloadProcess.status') {
    renderLoading(state, elements, value, i18nextInstance);
  }

  if (path === 'feeds') {
    renderFeeds(state, elements, i18nextInstance);
  }

  if (path === 'posts') {
    renderPosts(state, elements, i18nextInstance);
  }
};