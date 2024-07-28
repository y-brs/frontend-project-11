/* eslint implicit-arrow-linebreak: off */

import axios from 'axios';

export default (url) =>
  axios
    .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
    .then((response) => {
      if (response.status >= 200 && response.status < 400) return response;
      throw new Error(axios.isAxiosError);
    })
    .catch((error) => {
      throw error;
    });
