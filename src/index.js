import fetchPictures from './fetchPictures';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');

form.addEventListener('submit', onFetchPictures);

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onLoad, options);

let value = '';
let total = 0;
let galleryModal = '';
let page = 1;

function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;

      fetchPictures(form.searchQuery.value.trim(), page)
        .then(data => {
          total += data.hits.length;

          gallery.insertAdjacentHTML('beforeend', addMarkup(data.hits));
          galleryModal.refresh();

          if (total >= data.totalHits) {
            observer.unobserve(guard);
            Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
          }
        })
        .catch(err => Notify.failure(err));
    }
  });
}

async function onFetchPictures(e) {
  e.preventDefault();

  if (e.currentTarget.elements.searchQuery.value === '') {
    Notify.failure('Enter something to search');
    gallery.innerHTML = '';
    value = '';
    observer.unobserve(guard);
    return;
  }

  if (form.searchQuery.value.trim() !== value) {
    observer.unobserve(guard);
    gallery.innerHTML = '';
    value = form.searchQuery.value.trim();
    total = 0;
    page = 1;
  }
  try {
    const response = await fetchPictures(value, page);
    if (response.totalHits) {
      Notify.success(`Hooray! We found ${response.totalHits} images.`);
      gallery.insertAdjacentHTML('beforeend', addMarkup(response.hits));

      galleryModal = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionClass: 'caption',
        captionDelay: 250,
        scrollZoom: false,
      });

      total += response.hits.length;
      observer.observe(guard);
    } else {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (err) {
    Notify.failure(err);
  }
}

function addMarkup(data) {
  return data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
   <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}"  loading='lazy/></a>

  <div class="info">
    <p class="info-item">
      Likes
      <span>${likes}</span>
    </p>
    <p class="info-item">
      Views
      <span>${views}</span>
      
    </p>
    <p class="info-item">
      Comments
      <span>${comments}</span>
      
    </p>
    <p class="info-item">
      Downloads
      <span>${downloads}</span>
      
    </p>
  </div>
</div>`
    )
    .join('');
}
