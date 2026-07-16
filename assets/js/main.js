document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-carousel-modal');
    const carouselImage = document.getElementById('carousel-image');
    const btnClose = document.getElementById('carousel-close');
    const btnPrev = document.getElementById('carousel-prev');
    const btnNext = document.getElementById('carousel-next');
    const counter = document.getElementById('carousel-counter');

    let currentImages = [];
    let currentIndex = 0;

    const copyText = async (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const input = document.createElement('input');
        input.value = text;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
    };

    const enhancePostCards = () => {
        const postCards = Array.from(document.querySelectorAll('main .max-w-6xl.w-full > div'))
            .filter(card =>
                card.classList.contains('border') &&
                card.classList.contains('rounded-lg') &&
                card.classList.contains('bg-white') &&
                card.querySelector('.text-md.font-bold') &&
                (
                    card.querySelector('.text-lg.font-bold') ||
                    card.querySelector('.text-lg.font-semibold')
                )
            );

        postCards.forEach((card, index) => {
            const postHeader = card.firstElementChild;
            const postId = card.id || `post-${index + 1}`;
            const title = card.querySelector('.text-lg.font-bold')?.textContent.trim() || `Post ${index + 1}`;
            const pageUrl = `${window.location.origin}${window.location.pathname}#${postId}`;
            const encodedUrl = encodeURIComponent(pageUrl);
            const likeKey = `liked-${postId}`;

            card.id = postId;

            const actions = document.createElement('div');
            actions.className = 'post-actions';
            actions.innerHTML = `
                <button type="button" class="post-action-btn post-like-btn" aria-label="Like ${title}" title="Like">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                        <path class="heart-fill" fill="currentColor" stroke="currentColor" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"></path>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"></path>
                    </svg>
                </button>
                <div class="relative">
                    <button type="button" class="post-action-btn post-share-btn" aria-label="Share ${title}" title="Share">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <path d="m8.59 13.51 6.83 3.98"></path>
                            <path d="m15.41 6.51-6.82 3.98"></path>
                        </svg>
                    </button>
                    <div class="post-share-menu hidden" role="menu">
                        <button type="button" class="post-copy-link" role="menuitem">Copy link</button>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" rel="noopener" role="menuitem">Share to LinkedIn</a>
                    </div>
                </div>
            `;

            const likeBtn = actions.querySelector('.post-like-btn');
            const shareBtn = actions.querySelector('.post-share-btn');
            const shareMenu = actions.querySelector('.post-share-menu');
            const copyBtn = actions.querySelector('.post-copy-link');

            if (localStorage.getItem(likeKey) === 'true') {
                likeBtn.classList.add('is-liked');
                likeBtn.setAttribute('aria-pressed', 'true');
            } else {
                likeBtn.setAttribute('aria-pressed', 'false');
            }

            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isLiked = likeBtn.classList.toggle('is-liked');
                likeBtn.setAttribute('aria-pressed', String(isLiked));
                localStorage.setItem(likeKey, String(isLiked));
            });

            shareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.post-share-menu').forEach(menu => {
                    if (menu !== shareMenu) menu.classList.add('hidden');
                });
                shareMenu.classList.toggle('hidden');
            });

            copyBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await copyText(pageUrl);
                copyBtn.textContent = 'Link copied';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy link';
                    shareMenu.classList.add('hidden');
                }, 1100);
            });

            postHeader.appendChild(actions);
        });
    };

    enhancePostCards();

    const updateCarousel = () => {
        if (currentImages.length > 0) {
            carouselImage.src = currentImages[currentIndex].src;
            counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
        }
    };

    const openCarousel = (images, index) => {
        currentImages = Array.from(images);
        currentIndex = index;
        updateCarousel();
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    const closeCarousel = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    const nextImage = (e) => {
        if (e) e.stopPropagation();
        currentIndex = (currentIndex + 1) % currentImages.length;
        updateCarousel();
    };

    const prevImage = (e) => {
        if (e) e.stopPropagation();
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        updateCarousel();
    };

    const galleries = document.querySelectorAll('.project-gallery');
    galleries.forEach(gallery => {
        const images = gallery.querySelectorAll('img');
        images.forEach((img, index) => {
            img.addEventListener('click', () => openCarousel(images, index));
        });
    });

    btnClose.addEventListener('click', closeCarousel);
    btnNext.addEventListener('click', nextImage);
    btnPrev.addEventListener('click', prevImage);

    modal.addEventListener('click', (e) => {
        if (e.target === modal || (e.target.tagName === 'DIV' && e.target.classList.contains('flex-1'))) {
            closeCarousel();
        }
    });

    let touchStartX = 0;
    const wrapper = document.getElementById('carousel-image-wrapper');
    wrapper.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    wrapper.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) diff > 0 ? nextImage() : prevImage();
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('hidden')) {
            if (e.key === 'Escape') closeCarousel();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        }
    });

    const projectsBtn = document.getElementById('projects-dropdown-btn');
    const projectsMenu = document.getElementById('projects-dropdown-menu');
    const dropdownBtn = document.getElementById('socials-dropdown-btn');
    const dropdownMenu = document.getElementById('socials-dropdown-menu');
    const sendMessageBtn = document.getElementById('send-message-dropdown-btn');
    const sendMessageMenu = document.getElementById('send-message-dropdown-menu');

    const closeMenu = (menu) => {
        menu.classList.add('scale-95', 'opacity-0');
        menu.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 150);
    };

    const openMenu = (menu) => {
        menu.classList.remove('hidden');
        setTimeout(() => {
            menu.classList.remove('scale-95', 'opacity-0');
            menu.classList.add('scale-100', 'opacity-100');
        }, 10);
    };

    projectsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!dropdownMenu.classList.contains('hidden')) closeMenu(dropdownMenu);
        if (sendMessageMenu && !sendMessageMenu.classList.contains('hidden')) closeMenu(sendMessageMenu);

        if (projectsMenu.classList.contains('hidden')) {
            openMenu(projectsMenu);
        } else {
            closeMenu(projectsMenu);
        }
    });

    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!projectsMenu.classList.contains('hidden')) closeMenu(projectsMenu);
        if (sendMessageMenu && !sendMessageMenu.classList.contains('hidden')) closeMenu(sendMessageMenu);

        if (dropdownMenu.classList.contains('hidden')) {
            openMenu(dropdownMenu);
        } else {
            closeMenu(dropdownMenu);
        }
    });

    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!projectsMenu.classList.contains('hidden')) closeMenu(projectsMenu);
            if (!dropdownMenu.classList.contains('hidden')) closeMenu(dropdownMenu);

            if (sendMessageMenu.classList.contains('hidden')) {
                openMenu(sendMessageMenu);
            } else {
                closeMenu(sendMessageMenu);
            }
        });
    }

    document.addEventListener('click', (e) => {
        document.querySelectorAll('.post-share-menu').forEach(menu => {
            if (!menu.contains(e.target) && !menu.previousElementSibling?.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });

        if (!dropdownMenu.classList.contains('hidden') && !dropdownMenu.contains(e.target) && e.target !== dropdownBtn) {
            closeMenu(dropdownMenu);
        }
        if (!projectsMenu.classList.contains('hidden') && !projectsMenu.contains(e.target) && e.target !== projectsBtn) {
            closeMenu(projectsMenu);
        }
        if (sendMessageMenu && !sendMessageMenu.classList.contains('hidden') && !sendMessageMenu.contains(e.target) && e.target !== sendMessageBtn) {
            closeMenu(sendMessageMenu);
        }
    });
});

function togglePhotos() {
    const grid = document.getElementById('photos-grid');
    const btn = document.getElementById('toggle-photos-btn');

    if (grid.classList.contains('mobile-collapsed')) {
        grid.classList.remove('mobile-collapsed');
        btn.textContent = 'Show Less';
    } else {
        grid.classList.add('mobile-collapsed');
        btn.textContent = 'Show All Photos';

        setTimeout(() => {
            btn.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 50);
    }
}
