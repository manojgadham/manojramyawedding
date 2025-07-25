
// Wedding date configuration
const weddingDate = new Date("2025-08-13T00:00:00").getTime();

// Initialize everything when page loads
window.onload = function () {
  initializeGalleries();
  initializeNavigation();
  initializeModal();
  initializeAnimations();
  updateTimer();
};

// Timer functionality with enhanced styling
function updateTimer() {
  const now = new Date().getTime();
  const distance = weddingDate - now;
  
  if (distance < 0) {
    document.getElementById("countdown").innerHTML = "🎉 We're Married! 🎉";
    document.getElementById("countdown").style.background = "linear-gradient(135deg, #d4af37, #f4e4a6)";
    document.getElementById("countdown").style.webkitBackgroundClip = "text";
    document.getElementById("countdown").style.webkitTextFillColor = "transparent";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("countdown").innerHTML = 
    `<span class="time-unit">${days}<small>days</small></span> ` +
    `<span class="time-unit">${hours}<small>hrs</small></span> ` +
    `<span class="time-unit">${minutes}<small>mins</small></span> ` +
    `<span class="time-unit">${seconds}<small>secs</small></span>`;
}

setInterval(updateTimer, 1000);

// Enhanced image loading with dynamic image discovery and carousel for larger galleries
async function loadImages(eventName) {
  const container = document.getElementById(`${eventName}-gallery`);
  
  // Clear existing content
  container.innerHTML = '';
  
  const eventCaptions = {
    'PreWedding': ['Our love story begins', 'Capturing precious moments', 'Beautiful memories together', 'Romance in the air'],
    'Engagement': ['She said YES!', 'The beginning of forever', 'Ring ceremony moments', 'Pure joy and love'],
    'Haldi': ['Golden traditions', 'Blessed with turmeric', 'Colorful celebrations', 'Sacred rituals'],
    'Wedding': ['Our special day', 'Vows of eternal love', 'Sacred union', 'Forever begins', 'Wedding bliss'],
    'Reception': ['Celebrating with loved ones', 'Dancing the night away', 'Party time', 'Joyful celebration']
  };
  
  // Try to dynamically discover images from the folder
  const files = await discoverImages(eventName);
  
  // If there are more than 3 images, create a carousel
  if (files.length > 3) {
    createCarousel(container, eventName, files, eventCaptions[eventName]);
  } else {
    // Regular grid layout for 3 or fewer images
    createRegularGallery(container, eventName, files, eventCaptions[eventName]);
  }
}

// Function to dynamically discover images in a folder
async function discoverImages(eventName) {
  // Known image files for each event (as fallback)
  const knownFiles = {
    'PreWedding': ['1C9A5706.JPG', '1C9A5732.JPG', '1C9A5760.JPG', '1C9A5766.JPG'],
    'Engagement': ['1C9A4864.JPG', '1C9A5152.JPG'],
    'Haldi': ['1C9A4994.JPG', '1C9A5014.JPG', '1C9A5739.JPG'],
    'Wedding': ['1C9A5441.JPG', '1C9A5450.JPG', '1C9A5486.JPG', '1C9A5566.JPG', '1C9A5575.JPG'],
    'Reception': ['1C9A5315.JPG', '1C9A5405.JPG', '1C9A5434.JPG']
  };
  
  // If we have known files for this event, use them
  if (knownFiles[eventName]) {
    console.log(`Using known files for ${eventName}:`, knownFiles[eventName]);
    return knownFiles[eventName];
  }
  
  // Common image extensions
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'];
  const discoveredImages = [];
  
  // Try to load images by testing common naming patterns and extensions
  const testPatterns = [
    // Test numbered patterns
    ...Array.from({length: 20}, (_, i) => `${eventName.toLowerCase()}_${i + 1}`),
    ...Array.from({length: 20}, (_, i) => `${eventName}_${i + 1}`),
    ...Array.from({length: 20}, (_, i) => `image_${i + 1}`),
    ...Array.from({length: 20}, (_, i) => `img_${i + 1}`),
    ...Array.from({length: 20}, (_, i) => `photo_${i + 1}`),
    // Test camera-style naming (like your current files)
    ...Array.from({length: 100}, (_, i) => `1C9A${(5700 + i).toString().padStart(4, '0')}`),
    // Test simple patterns
    ...Array.from({length: 10}, (_, i) => `${i + 1}`),
    ...Array.from({length: 10}, (_, i) => `0${i + 1}`),
  ];
  
  // Test each pattern with each extension
  for (const pattern of testPatterns) {
    for (const ext of imageExtensions) {
      const filename = `${pattern}.${ext}`;
      
      try {
        // Test if image exists by trying to load it
        const imageExists = await testImageExists(`${eventName}/${filename}`);
        if (imageExists) {
          discoveredImages.push(filename);
        }
      } catch (error) {
        // Image doesn't exist, continue
        continue;
      }
    }
    
    // Stop if we found enough images (reasonable limit)
    if (discoveredImages.length >= 20) break;
  }
  
  // Sort the discovered images for consistent ordering
  discoveredImages.sort();
  
  console.log(`Discovered ${discoveredImages.length} images for ${eventName}:`, discoveredImages);
  
  return discoveredImages;
}

// Helper function to test if an image exists
function testImageExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
    
    // Timeout after 2 seconds to avoid hanging
    setTimeout(() => resolve(false), 2000);
  });
}

function createCarousel(container, eventName, files, captions) {
  container.className = 'gallery carousel-gallery';
  
  // Create carousel wrapper
  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'carousel-wrapper';
  
  // Create carousel container
  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'carousel-container';
  carouselContainer.id = `carousel-${eventName}`;
  
  // Create carousel track
  const carouselTrack = document.createElement('div');
  carouselTrack.className = 'carousel-track';
  
  // Determine slides to show based on screen size
  function getSlidesToShow() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    return 3;
  }
  
  // Create slides with loop functionality - duplicate images for seamless loop
  const totalSlides = files.length;
  let slidesToShow = getSlidesToShow();
  
  // Add original images
  files.forEach((filename, index) => {
    const slide = createSlide(eventName, filename, index, captions);
    carouselTrack.appendChild(slide);
  });
  
  // Add enough duplicates to ensure seamless loop
  // We need at least slidesToShow duplicates to avoid empty spaces
  for (let i = 0; i < slidesToShow; i++) {
    const slide = createSlide(eventName, files[i % totalSlides], i, captions, true);
    slide.classList.add('duplicate-slide');
    carouselTrack.appendChild(slide);
  }
  
  carouselContainer.appendChild(carouselTrack);
  
  // Create navigation buttons
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-btn carousel-prev';
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.addEventListener('click', () => {
    pauseAutoScroll(eventName);
    slideCarousel(eventName, -1);
    resumeAutoScrollAfterDelay(eventName);
  });
  
  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-btn carousel-next';
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.addEventListener('click', () => {
    pauseAutoScroll(eventName);
    slideCarousel(eventName, 1);
    resumeAutoScrollAfterDelay(eventName);
  });
  
  carouselContainer.appendChild(prevBtn);
  carouselContainer.appendChild(nextBtn);
  
  // Create dots indicator
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';
  
  files.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      pauseAutoScroll(eventName);
      goToSlide(eventName, index);
      resumeAutoScrollAfterDelay(eventName);
    });
    dotsContainer.appendChild(dot);
  });
  
  // Add pause/play button
  const autoScrollBtn = document.createElement('button');
  autoScrollBtn.className = 'auto-scroll-btn';
  autoScrollBtn.innerHTML = '<i class="fas fa-pause"></i>';
  autoScrollBtn.title = 'Pause/Resume Auto-scroll';
  autoScrollBtn.addEventListener('click', () => toggleAutoScroll(eventName));
  carouselContainer.appendChild(autoScrollBtn);
  
  carouselWrapper.appendChild(carouselContainer);
  carouselWrapper.appendChild(dotsContainer);
  container.appendChild(carouselWrapper);
  
  // Initialize carousel state
  window.carouselStates = window.carouselStates || {};
  window.carouselStates[eventName] = {
    currentIndex: 0,
    totalSlides: totalSlides,
    totalSlidesWithDuplicates: totalSlides + slidesToShow,
    slidesToShow: slidesToShow,
    autoScrollInterval: null,
    isAutoScrollActive: true,
    isPaused: false,
    isTransitioning: false
  };
  
  // Handle window resize
  window.addEventListener('resize', () => {
    const newSlidesToShow = getSlidesToShow();
    if (newSlidesToShow !== window.carouselStates[eventName].slidesToShow) {
      // Reinitialize carousel with new slides count
      window.carouselStates[eventName].slidesToShow = newSlidesToShow;
      // Reset to first slide to avoid positioning issues
      window.carouselStates[eventName].currentIndex = 0;
      const track = document.querySelector(`#carousel-${eventName} .carousel-track`);
      if (track) {
        track.style.transform = 'translateX(0%)';
      }
    }
  });
  
  // Start auto-scroll after a short delay
  setTimeout(() => {
    startAutoScroll(eventName);
  }, 2000);
  
  // Pause auto-scroll when user hovers over carousel
  carouselContainer.addEventListener('mouseenter', () => {
    pauseAutoScroll(eventName);
  });
  
  carouselContainer.addEventListener('mouseleave', () => {
    if (window.carouselStates[eventName].isAutoScrollActive) {
      resumeAutoScrollAfterDelay(eventName);
    }
  });
}

function createSlide(eventName, filename, index, captions, isDuplicate = false) {
  const slide = document.createElement('div');
  slide.className = 'carousel-slide';
  
  const img = document.createElement('img');
  img.src = `${eventName}/${filename}`;
  img.alt = `${eventName} photo ${index + 1}`;
  img.loading = 'lazy';
  
  // Add click event for modal (only for non-duplicate slides to avoid confusion)
  if (!isDuplicate) {
    img.addEventListener('click', function() {
      const caption = captions[index] || `${eventName} Memory ${index + 1}`;
      openModal(this.src, caption);
    });
  }
  
  // Add error handling
  img.onerror = function() {
    slide.style.display = 'none';
    console.log(`Image not found: ${this.src}`);
  };
  
  slide.appendChild(img);
  return slide;
}

function createRegularGallery(container, eventName, files, captions) {
  files.forEach((filename, index) => {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'img-container';
    
    const img = document.createElement('img');
    img.src = `${eventName}/${filename}`;
    img.alt = `${eventName} photo ${index + 1}`;
    img.loading = 'lazy';
    
    // Add click event for modal
    img.addEventListener('click', function() {
      const caption = captions[index] || `${eventName} Memory ${index + 1}`;
      openModal(this.src, caption);
    });
    
    // Add error handling
    img.onerror = function() {
      this.style.display = 'none';
      console.log(`Image not found: ${this.src}`);
    };
    
    // Add load event for animation
    img.onload = function() {
      this.style.opacity = '1';
      this.style.transform = 'scale(1)';
    };
    
    // Initial state for animation
    img.style.opacity = '0';
    img.style.transform = 'scale(0.8)';
    img.style.transition = 'all 0.6s ease';
    
    imgContainer.appendChild(img);
    container.appendChild(imgContainer);
  });
}

function slideCarousel(eventName, direction) {
  const state = window.carouselStates[eventName];
  const track = document.querySelector(`#carousel-${eventName} .carousel-track`);
  const dots = document.querySelectorAll(`#${eventName}-gallery .carousel-dot`);
  
  state.currentIndex += direction;
  
  // Loop around
  if (state.currentIndex >= state.totalSlides) {
    state.currentIndex = 0;
  } else if (state.currentIndex < 0) {
    state.currentIndex = state.totalSlides - 1;
  }
  
  // Update track position
  const translateX = -state.currentIndex * (100 / 3); // Show 3 slides at a time
  track.style.transform = `translateX(${translateX}%)`;
  
  // Update dots
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === state.currentIndex);
  });
}

function goToSlide(eventName, index) {
  const state = window.carouselStates[eventName];
  const track = document.querySelector(`#carousel-${eventName} .carousel-track`);
  const dots = document.querySelectorAll(`#${eventName}-gallery .carousel-dot`);
  
  if (!state || !track || state.isTransitioning) return;
  
  state.isTransitioning = true;
  state.currentIndex = index;
  
  // Update track position using dynamic slide width
  track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  const slideWidth = 100 / state.slidesToShow;
  const translateX = -state.currentIndex * slideWidth;
  track.style.transform = `translateX(${translateX}%)`;
  
  // Update dots
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === index);
  });
  
  // Reset transition flag after animation completes
  setTimeout(() => {
    state.isTransitioning = false;
  }, 600);
}

// Auto-scroll functionality
function startAutoScroll(eventName) {
  const state = window.carouselStates[eventName];
  if (!state || state.autoScrollInterval) return;
  
  state.autoScrollInterval = setInterval(() => {
    if (!state.isPaused) {
      slideCarousel(eventName, 1, true);
    }
  }, 3500); // Pause for 3.5 seconds between slides
}

function pauseAutoScroll(eventName) {
  const state = window.carouselStates[eventName];
  if (!state) return;
  
  state.isPaused = true;
  if (state.autoScrollInterval) {
    clearInterval(state.autoScrollInterval);
    state.autoScrollInterval = null;
  }
}

function resumeAutoScrollAfterDelay(eventName) {
  const state = window.carouselStates[eventName];
  if (!state || !state.isAutoScrollActive) return;
  
  setTimeout(() => {
    state.isPaused = false;
    startAutoScroll(eventName);
  }, 1500); // Resume after 1.5 seconds of user inactivity
}

function toggleAutoScroll(eventName) {
  const state = window.carouselStates[eventName];
  const btn = document.querySelector(`#carousel-${eventName} .auto-scroll-btn`);
  
  if (!state || !btn) return;
  
  state.isAutoScrollActive = !state.isAutoScrollActive;
  
  if (state.isAutoScrollActive) {
    btn.innerHTML = '<i class="fas fa-pause"></i>';
    btn.title = 'Pause Auto-scroll';
    state.isPaused = false;
    startAutoScroll(eventName);
  } else {
    btn.innerHTML = '<i class="fas fa-play"></i>';
    btn.title = 'Resume Auto-scroll';
    pauseAutoScroll(eventName);
  }
}

// Enhanced slide function with seamless loop support
function slideCarousel(eventName, direction, isAutoScroll = false) {
  const state = window.carouselStates[eventName];
  const track = document.querySelector(`#carousel-${eventName} .carousel-track`);
  const dots = document.querySelectorAll(`#${eventName}-gallery .carousel-dot`);
  
  if (!state || !track || state.isTransitioning) return;
  
  state.isTransitioning = true;
  
  if (direction > 0) {
    // Moving forward
    state.currentIndex++;
    
    // Check if we need to loop back
    if (state.currentIndex >= state.totalSlides) {
      // Move to the first duplicate slide
      const slideWidth = 100 / state.slidesToShow;
      const translateX = -state.currentIndex * slideWidth;
      track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      track.style.transform = `translateX(${translateX}%)`;
      
      // After transition, snap to real first slide
      setTimeout(() => {
        state.currentIndex = 0;
        track.style.transition = 'none';
        track.style.transform = `translateX(0%)`;
        // Force reflow
        track.offsetHeight;
        state.isTransitioning = false;
      }, 600);
    } else {
      // Normal forward movement
      const slideWidth = 100 / state.slidesToShow;
      const translateX = -state.currentIndex * slideWidth;
      track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      track.style.transform = `translateX(${translateX}%)`;
      
      setTimeout(() => {
        state.isTransitioning = false;
      }, 600);
    }
  } else {
    // Moving backward
    if (state.currentIndex <= 0) {
      // We're at the beginning, jump to the last real slide
      state.currentIndex = state.totalSlides - 1;
      const slideWidth = 100 / state.slidesToShow;
      const translateX = -state.currentIndex * slideWidth;
      track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      track.style.transform = `translateX(${translateX}%)`;
      
      setTimeout(() => {
        state.isTransitioning = false;
      }, 600);
    } else {
      state.currentIndex--;
      const slideWidth = 100 / state.slidesToShow;
      const translateX = -state.currentIndex * slideWidth;
      track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      track.style.transform = `translateX(${translateX}%)`;
      
      setTimeout(() => {
        state.isTransitioning = false;
      }, 600);
    }
  }
  
  // Update dots (always based on actual slide index, not including duplicates)
  const actualIndex = state.currentIndex % state.totalSlides;
  dots.forEach((dot, index) => {
    const isActive = index === actualIndex;
    dot.classList.toggle('active', isActive);
    
    if (isActive && isAutoScroll) {
      // Add a subtle pulse effect to active dot during auto-scroll
      dot.style.animation = 'dotPulse 0.6s ease-out';
      setTimeout(() => {
        dot.style.animation = '';
      }, 600);
    }
  });
}

// Clean up auto-scroll when page is hidden or user navigates away
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Pause all auto-scroll when page is not visible
    Object.keys(window.carouselStates || {}).forEach(eventName => {
      pauseAutoScroll(eventName);
    });
  } else {
    // Resume auto-scroll when page becomes visible again
    Object.keys(window.carouselStates || {}).forEach(eventName => {
      const state = window.carouselStates[eventName];
      if (state.isAutoScrollActive) {
        resumeAutoScrollAfterDelay(eventName);
      }
    });
  }
});

// Initialize all galleries
async function initializeGalleries() {
  const events = ['PreWedding', 'Engagement', 'Haldi', 'Wedding', 'Reception'];
  
  // Show loading message
  events.forEach(event => {
    const container = document.getElementById(`${event}-gallery`);
    if (container) {
      container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--deep-pink); font-size: 1.2rem;"><i class="fas fa-spinner fa-spin"></i> Loading images...</div>';
    }
  });
  
  // Load images for each event with staggered timing
  for (let i = 0; i < events.length; i++) {
    setTimeout(async () => {
      await loadImages(events[i]);
    }, i * 300); // Stagger loading for smooth effect
  }
}

// Navigation functionality
function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.event-section');
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
      
      // Get target section
      const targetEvent = this.getAttribute('data-event');
      const targetSection = document.getElementById(targetEvent.toLowerCase());
      
      if (targetSection) {
        // Smooth scroll to section
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Add highlight effect
        targetSection.style.transform = 'scale(1.02)';
        targetSection.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
          targetSection.style.transform = 'scale(1)';
        }, 300);
      }
    });
  });
  
  // Update active nav on scroll
  window.addEventListener('scroll', updateActiveNav);
}

function updateActiveNav() {
  const sections = document.querySelectorAll('.event-section');
  const navItems = document.querySelectorAll('.nav-item');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (pageYOffset >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  
  navItems.forEach(item => {
    item.classList.remove('active');
    const eventName = item.getAttribute('data-event').toLowerCase();
    if (eventName === current) {
      item.classList.add('active');
    }
  });
}

// Modal functionality
function initializeModal() {
  const modal = document.getElementById('photoModal');
  const modalImg = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  const closeBtn = document.querySelector('.close');
  
  // Close modal events
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      closeModal();
    }
  });
}

function openModal(src, caption) {
  const modal = document.getElementById('photoModal');
  const modalImg = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  
  modal.style.display = 'block';
  modalImg.src = src;
  modalCaption.textContent = caption;
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('photoModal');
  modal.style.display = 'none';
  
  // Restore body scroll
  document.body.style.overflow = 'auto';
}

// Scroll animations
function initializeAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe all event sections
  document.querySelectorAll('.event-section').forEach(section => {
    observer.observe(section);
  });
  
  // Add staggered animation to gallery images
  setTimeout(() => {
    document.querySelectorAll('.gallery img').forEach((img, index) => {
      setTimeout(() => {
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      }, index * 100);
    });
  }, 500);
}
 
// Add parallax effect to hero roses
window.addEventListener('scroll', function() {
  const scrolled = window.pageYOffset;
  const roses = document.querySelectorAll('.rose');
  
  roses.forEach((rose, index) => {
    const speed = 0.5 + (index * 0.1);
    rose.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// Add floating hearts periodically
setInterval(() => {
  createFloatingHeart();
}, 3000);

function createFloatingHeart() {
  const heartsContainer = document.querySelector('.floating-hearts');
  const heart = document.createElement('span');
  heart.className = 'heart';
  heart.textContent = ['💕', '💖', '💗', '💝', '💘'][Math.floor(Math.random() * 5)];
  heart.style.left = Math.random() * 100 + '%';
  heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
  
  heartsContainer.appendChild(heart);
  
  // Remove heart after animation
  setTimeout(() => {
    if (heart.parentNode) {
      heart.parentNode.removeChild(heart);
    }
  }, 8000);
}

// Enhanced timer styling
const style = document.createElement('style');
style.textContent = `
  .time-unit {
    display: inline-block;
    margin: 0 10px;
    padding: 10px 15px;
    background: linear-gradient(135deg, #ff6b9d, #ffc1dc);
    border-radius: 12px;
    color: white;
    font-weight: 600;
    box-shadow: 0 5px 15px rgba(255, 107, 157, 0.3);
    transition: transform 0.3s ease;
  }
  
  .time-unit:hover {
    transform: scale(1.1);
  }
  
  .time-unit small {
    display: block;
    font-size: 0.7em;
    font-weight: 300;
    margin-top: 5px;
    opacity: 0.9;
  }
  
  @media (max-width: 768px) {
    .time-unit {
      margin: 5px;
      padding: 8px 12px;
      font-size: 0.9em;
    }
  }
`;
document.head.appendChild(style);
