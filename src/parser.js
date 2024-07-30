/* eslint no-shadow: off */

export default (url) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(url, 'application/xml');
  const rss = document.querySelector('rss');

  if (!document.contains(rss)) {
    const error = new Error('parserError');
    error.isParserError = true;
    throw error;
  }

  const title = rss.querySelector('title').textContent;
  const description = rss.querySelector('description').textContent;
  const feed = { title, description };

  const items = [...document.querySelectorAll('item')];
  const posts = items.map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;

    const post = { title, description, link };

    return post;
  });

  return { feed, posts };
};
