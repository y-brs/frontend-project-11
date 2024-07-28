/* eslint implicit-arrow-linebreak: off, function-paren-newline: off */

import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import watch from './view.js';
import proxy from './proxy.js';
import parser from './parser.js';

const state = {
  form: {
    status: 'idle',
    error: '',
  },
  downloadProcess: {
    status: 'idle',
    error: '',
  },
  feeds: [],
  posts: [],
  ui: {
    id: null,
    viewedPosts: new Set(),
  },
};

const handleError = (error) => {
  if (error.isAxiosError) {
    return 'errors.network';
  }
  if (error.isParserError) {
    return 'errors.noRss';
  }

  return 'errors.unknown';
};

const checkNewPosts = (watchedState) => {
  const { feeds } = watchedState;

  const promises = feeds.map((feed) =>
    proxy(feed.url)
      .then((response) => {
        const { posts } = parser(response.data.contents);
        const newPosts = posts.filter(
          (post) =>
            !watchedState.posts.some(
              (item) => post.postTitle === item.postTitle,
            ),
        );

        watchedState.posts.unshift(...newPosts);
      })
      .catch(() => {}),
  );
  Promise.all(promises).then(() => {
    setTimeout(() => checkNewPosts(watchedState), 5000);
  });
};

const download = (watchedState, url) => {
  const { downloadProcess } = watchedState;

  proxy(url)
    .then((response) => {
      const { feed, posts } = parser(response.data.contents);
      feed.url = url;
      downloadProcess.status = 'succsess';
      watchedState.feeds.unshift(feed);
      watchedState.posts.unshift(...posts);
    })
    .catch((error) => {
      downloadProcess.error = handleError(error);
      downloadProcess.status = 'failed';
    });
};

const validate = (url, urlList) => {
  const schema = yup
    .string()
    .url('errors.notUrl')
    .required('errors.required')
    .notOneOf(urlList, 'errors.exists');

  return schema
    .validate(url)
    .then(() => {})
    .catch((e) => e);
};

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    sendButton: document.querySelector('[type="submit"]'),
    feedsCol: document.querySelector('.feeds'),
    postsCol: document.querySelector('.posts'),
    modal: document.querySelector('.modal'),
  };

  const i18nextInstance = i18next.createInstance();

  i18nextInstance
    .init({
      debug: false,
      lng: 'ru',
      resources: {
        ru: resources.russian,
      },
    })
    .then(() => {
      const watchedState = watch(state, elements, i18nextInstance);

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const url = data.get('url').trim();

        watchedState.form.status = 'processing';
        const urlList = watchedState.feeds.map((feed) => feed.url);

        validate(url, urlList).then((error) => {
          if (error) {
            watchedState.form.error = error.message;
            watchedState.form.status = 'failed';
            return;
          }

          watchedState.form.error = '';
          download(watchedState, url);
        });
      });

      elements.postsCol.addEventListener('click', (event) => {
        const { id } = event.target.dataset;

        if (id) {
          watchedState.ui.viewedPosts.add(id);
          watchedState.ui.id = id;
        }
      });

      checkNewPosts(watchedState);
    });
};
