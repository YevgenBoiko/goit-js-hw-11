import axios from 'axios';

export default async function fetchPictures(name, page) {
  const BASE_URL = 'https://pixabay.com/api/';
  const KEY = '32892374-a95000907ffe9110fe06b3122';

  const response = await axios.get(
    `${BASE_URL}?key=${KEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
  );

  return response.data;
}
