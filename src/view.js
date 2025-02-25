/* eslint implicit-arrow-linebreak: off */

import onChange from 'on-change';

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

const renderLoading = (state, elements, status, i18nextInstance) => {
  const { downloadProcess } = state;
  const { input, feedback, sendButton } = elements;

  if (status === 'success') {
    feedback.textContent = i18nextInstance.t('loading.success');
    feedback.classList.add('text-success');
    sendButton.removeAttribute('disabled');
    input.removeAttribute('disabled');
    input.value = '';
    input.focus();
  }

  if (status === 'failed') {
    feedback.textContent = i18nextInstance.t(downloadProcess.error);
    feedback.classList.add('text-danger');
    input.classList.add('is-invalid');
    input.removeAttribute('disabled');
    sendButton.removeAttribute('disabled');
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
    const card = handleCard(i18nextInstance.t('feeds'));
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
    title.textContent = feed.title;
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;
    li.append(title, description);

    return li;
  });

  list.append(...items);
};

const renderPosts = (state, elements, i18nextInstance) => {
  const { postsCol } = elements;
  const { posts, ui } = state;

  postsCol.innerHTML = '';

  if (!postsCol.hasChildNodes()) {
    const card = handleCard(i18nextInstance.t('posts'));
    postsCol.append(card);
  }

  const card = postsCol.querySelector('.card');
  const list = card.querySelector('ul');

  const items = posts.map((item) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    const link = document.createElement('a');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    link.classList.add('fw-bold');
    link.setAttribute('href', `${item.link}`);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'nofollow noreferrer');
    link.setAttribute('data-id', `${item.id}`);
    link.textContent = item.title;

    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = item.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18nextInstance.t('preview');

    if (ui.viewedPosts.has(item.id)) {
      link.classList.add('fw-normal', 'link-secondary');
      link.classList.remove('fw-bold');
    }

    li.append(link, button);
    return li;
  });

  list.append(...items);
};

const renderModal = (state, elements) => {
  const { modal } = elements;
  const { posts, ui } = state;

  const title = modal.querySelector('.modal-title');
  const description = modal.querySelector('.modal-body');
  const button = modal.querySelector('.modal-footer > a');
  const viewPost = posts.find((post) => post.id === ui.id);

  title.textContent = viewPost.title;
  description.textContent = viewPost.description;
  button.setAttribute('href', `${viewPost.link}`);
};

export default (state, elements, i18nextInstance) =>
  onChange(state, (path, value) => {
    switch (path) {
      case 'form.status':
        renderForm(state, elements, value, i18nextInstance);
        break;

      case 'downloadProcess.status':
        renderLoading(state, elements, value, i18nextInstance);
        break;

      case 'feeds':
        renderFeeds(state, elements, i18nextInstance);
        break;

      case 'posts':
        renderPosts(state, elements, i18nextInstance);
        break;

      case 'ui.id':
        renderPosts(state, elements, i18nextInstance);
        renderModal(state, elements);
        break;

      default:
        break;
    }
  });
