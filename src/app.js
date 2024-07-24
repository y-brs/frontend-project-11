import * as yup from 'yup';
import onChange from 'on-change';
import view from './view.js';
import i18next from 'i18next';
import resources from './locales/index.js';
import proxy from './proxy.js';
import parser from './parser.js';

const state = {
  form: {
    status: '',
    error: '',
  },
  loadingProcess: {
    status: '',
    error: '',
  },
  feeds: [],
  posts: [],
  urls: [],
};

const checkNewPosts = (watchedState) => {
  const { feeds } = watchedState;

  const promises = feeds.map((feed) => proxy(feed.url)
    .then((response) => {
      const { posts } = parser(response.data.contents);
      const newPosts = posts.filter((post) => !watchedState.posts.some((item) => item.postTitle === post.postTitle));
      watchedState.posts.push(...newPosts);
    })
    .catch(() => {}));

  Promise.all(promises)
    .then(() => {
      setTimeout(() => checkNewPosts(watchedState), 5000);
    });
};

const loading = (watchedState, url) => {
  const { loadingProcess } = watchedState;

  proxy(url)
    .then((response) => {
      const { feed, posts } = parser(response.data.contents);

      feed.url = url;
      loadingProcess.status = 'succsess';
      watchedState.urls.push(url);
      watchedState.feeds.push(feed);
      watchedState.posts.push(...posts);
      loadingProcess.status = '';
    })
    .catch(() => {
      loadingProcess.error = 'errorNetwork';
      loadingProcess.status = 'failed';
    });
};

const validate = (url, urlList) => {
  const schema = yup.string().url('errorNotValid').required('errorNotFilledIn').notOneOf(urlList, 'errorNotUnique');

  return schema
    .validate(url)
    .then(() => { })
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
  };

  const i18nextInstance = i18next.createInstance();

  i18nextInstance.init({
    lng: 'ru',
    resources: {
      ru: resources.russian,
    },
  }).then(() => {
    const watchedState = onChange(state, view(state, elements, i18nextInstance));

    elements.form.addEventListener('submit', ((event) => {
      event.preventDefault();

      const data = new FormData(event.target);
      const url = data.get('url').trim();

      watchedState.form.status = 'processing';
      const urlList = watchedState.urls.map((urls) => urls);

      validate(url, urlList).then((error) => {
        if (error) {
          watchedState.form.error = error.message;
          watchedState.form.status = 'failed';
          return;
        }

        watchedState.form.error = '';
        loading(watchedState, url);
        watchedState.form.status = '';
      });
    }));

    checkNewPosts(watchedState);
  });
};