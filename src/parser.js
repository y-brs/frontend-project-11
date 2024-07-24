import _ from 'lodash';

export default (data) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'application/xml');
  const rss = document.querySelector('rss');

  if (!document.contains(rss)) throw new Error('invalidRSS');

  const feedTitle = rss.querySelector('title').textContent;
  const feedDescription = rss.querySelector('description').textContent;
  const feedId = _.uniqueId();
  const feed = { feedTitle, feedDescription, feedId };

  const items = [...document.querySelectorAll('item')];

  const posts = items.map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const postLink = item.querySelector('link').textContent;
    const postId = _.uniqueId();

    const post = {
      postTitle,
      postDescription,
      postLink,
      postId,
    };

    return post;
  });

  // console.log(feed, posts);
  return { feed, posts };
};