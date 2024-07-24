import { uniqueId } from 'lodash';

export default (data) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'application/xml');
  const rss = document.querySelector('rss');

  if (!document.contains(rss)) {
    const error = new Error('parserError');
    error.isParserError = true;
    throw error;
  }

  const feedTitle = rss.querySelector('title').textContent;
  const feedDescription = rss.querySelector('description').textContent;
  const feed = { feedTitle, feedDescription, feedId: uniqueId() };
  const { feedId } = feed;

  const items = [...document.querySelectorAll('item')];

  const posts = items.map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const postLink = item.querySelector('link').textContent;
    const postId = uniqueId();

    const post = {
      postTitle,
      postDescription,
      postLink,
      postId,
      feedId,
    };

    return post;
  });

  return { feed, posts };
};
