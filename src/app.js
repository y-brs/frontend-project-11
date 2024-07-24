import * as yup from 'yup';
import onChange from 'on-change';
import view from './view.js';
import i18next from 'i18next';
import ru from './russian.js';
import proxy from './proxy.js';
import parser from './parser.js';

const state = {
  form: {
    status: '',
    error: '',
  },
  statusLoading: {
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
  const { statusLoading } = watchedState;

  proxy(url)
    .then((response) => {
      const { feed, posts } = parser(response.data.contents);

      feed.url = url;
      statusLoading.status = 'succsess';
      watchedState.urls.push(url);
      watchedState.feeds.push(feed);
      watchedState.posts.push(...posts);
      statusLoading.status = '';
    })
    .catch(() => {
      statusLoading.error = 'errorNetwork';
      statusLoading.status = 'failed';
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
      ru,
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