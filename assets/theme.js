/**
 * OOGA BOOGA! - Theme Interactive Engine
 * Three.js 3D Book Viewer, Parallax Engine, Video Player, Carousel & Cart Drawer
 */

(function () {
  'use strict';

  // 1. STATE & CART MANAGEMENT
  const state = {
    cart: [
      {
        id: 'book-hardcover',
        title: 'Ooga Booga! (Collector Hardcover)',
        price: 24.99,
        quantity: 1,
        image: 'assets/images/product/book_cover_spread.png'
      }
    ],
    selectedVariant: 'hardcover',
    variantPrices: {
      hardcover: 24.99,
      softcover: 16.99
    },
    soundEnabled: true,
    carouselIndex: 0
  };

  // Fun Cartoon Sound Effect using Web Audio API (No external sound file required!)
  function playCartoonPop(freq = 440, type = 'sine') {
    if (!state.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  // 2. MULTI-PLANE PARALLAX SCROLLING ENGINE (Inspired by Stepout Dribbble Reference)
  function initParallax() {
    const s1 = document.getElementById('cinema-hero');
    const s2 = document.getElementById('enchanted-forest');
    const s3 = document.getElementById('village-shopfront');

    const s1Layers = [
      { el: document.getElementById('l-bg'),         speed: 0.06  },
      { el: document.getElementById('l-frame'),      speed: 0.14  },
      { el: document.getElementById('l-palms'),      speed: 0.22  },
      { el: document.getElementById('l-stones'),     speed: 0.32  },
      { el: document.getElementById('l-projector'),  speed: 0.40  },
      { el: document.getElementById('l-character'),  speed: 0.50  },
    ];
    const s1Centered = ['l-stones', 'l-character'];

    const s2Bg = document.getElementById('s2LayerBg');
    const s2Trees = document.getElementById('s2LayerTrees');
    const s2Chars = document.getElementById('s2LayerChars');

    const s3Fg = document.getElementById('s3LayerFg');

    let ticking = false;

    function applyScroll(el, sy) {
      if (!el) return;
      el._scrollY = sy;
      const mx = el._mouseX || 0;
      const my = el._mouseY || 0;
      el.style.transform = `translate3d(${mx}px, ${my + sy}px, 0)`;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }

    function updateParallax() {
      const vh = window.innerHeight;

      // Section 1 Parallax (Outdoor Jungle Cinema - Frame-by-Frame System)
      if (s1) {
        const rect1 = s1.getBoundingClientRect();
        if (rect1.bottom > 0 && rect1.top < vh) {
          // As user scrolls down towards section 3, sy increases smoothly like the sample
          const sy = Math.max(0, -rect1.top);
          s1Layers.forEach(({ el, speed }) => {
            if (!el) return;
            const isCentered = s1Centered.includes(el.id);
            const ty = sy * speed;
            if (isCentered) {
              el.style.transform = `translateX(-50%) translateY(${ty}px)`;
            } else {
              el.style.transform = `translateY(${ty}px)`;
            }
          });
        }
      }

      // Section 2 Parallax (Enchanted Pink Forest)
      if (s2) {
        const rect2 = s2.getBoundingClientRect();
        if (rect2.bottom > 0 && rect2.top < vh) {
          const s2Center = (rect2.top + rect2.height / 2) - (vh / 2);
          const normalized = s2Center / (vh / 2);
          applyScroll(s2Bg, normalized * -32);
          applyScroll(s2Trees, normalized * -14);
          applyScroll(s2Chars, normalized * 22);
        }
      }

      // Section 3 Parallax (Village Storefront)
      if (s3) {
        const rect3 = s3.getBoundingClientRect();
        if (rect3.bottom > 0 && rect3.top < vh) {
          const s3Center = (rect3.top + rect3.height / 2) - (vh / 2);
          const normalized3 = s3Center / (vh / 2);
          applyScroll(s3Fg, normalized3 * 20);
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateParallax();

    // Desktop Mouse Move Dynamic 3D Depth
    if (window.innerWidth > 992) {
      function attachMouseParallax(section, layers) {
        if (!section) return;
        section.addEventListener('mousemove', function (e) {
          const rect = section.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;

          layers.forEach(function (layer) {
            if (layer.el) {
              layer.el._mouseX = relX * layer.xFactor;
              layer.el._mouseY = relY * layer.yFactor;
              const sy = layer.el._scrollY || 0;
              layer.el.style.transform = `translate3d(${layer.el._mouseX}px, ${layer.el._mouseY + sy}px, 0)`;
            }
          });
        });

        section.addEventListener('mouseleave', function () {
          layers.forEach(function (layer) {
            if (layer.el) {
              layer.el._mouseX = 0;
              layer.el._mouseY = 0;
              const sy = layer.el._scrollY || 0;
              layer.el.style.transform = `translate3d(0, ${sy}px, 0)`;
            }
          });
        });
      }

      attachMouseParallax(s2, [
        { el: s2Bg, xFactor: -16, yFactor: -12 },
        { el: s2Trees, xFactor: -8, yFactor: -5 },
        { el: s2Chars, xFactor: 24, yFactor: 16 }
      ]);

      attachMouseParallax(s3, [
        { el: s3Fg, xFactor: 22, yFactor: 14 }
      ]);
    }
  }

  // 3. THREE.JS 3D BOOK VIEWER (PRIMARY PRODUCT)
  function initThreeJsBookViewer(containerId, glbPath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
      console.warn('Three.js is loading asynchronously...');
      setTimeout(() => initThreeJsBookViewer(containerId, glbPath), 200);
      return;
    }

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();

    // Camera pointed straight at (0, 0, 0) so model is vertically and horizontally centered
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Warm Vintage Cartoon Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ea, 1.25);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffeedd, 2.4);
    mainKeyLight.position.set(3, 4, 3);
    mainKeyLight.castShadow = true;
    scene.add(mainKeyLight);

    const rimLight = new THREE.DirectionalLight(0x00d8c1, 1.6); // Whimsical teal rim
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    const pinkFillLight = new THREE.PointLight(0xf25287, 1.4, 10);
    pinkFillLight.position.set(0, -2, 2);
    scene.add(pinkFillLight);

    // Soft Shadow Plane Underneath (placed right at base of standing book)
    const shadowGeo = new THREE.PlaneGeometry(3, 3);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.72;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // MASTER PIVOT GROUP: Located at (0, 0, 0)
    // Rotates around the exact center of the container div without any wobble or offset
    const pivotGroup = new THREE.Group();
    pivotGroup.position.set(0, 0, 0);
    scene.add(pivotGroup);

    let bookModel = null;
    let uprightGroup = null;
    let autoRotate = true;
    let isDragging = false;
    let isTweening = false;
    let targetRotation = { x: 0, y: Math.PI, z: 0 };
    let prevMouseX = 0;
    let prevMouseY = 0;

    const modelUrl = container.dataset.modelUrl || glbPath || 'assets/models/Ooga_Booga_Hardcover_Render.glb';

    // Load actual GLB model
    const loader = new THREE.GLTFLoader();
    loader.load(
      modelUrl,
      function (gltf) {
        bookModel = gltf.scene;

        // Center vertices to origin inside an inner group
        const box = new THREE.Box3().setFromObject(bookModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.34 / maxDim;

        bookModel.scale.set(scale, scale, scale);
        // Shift bookModel so its geometric bounding center is at (0, 0, 0)
        bookModel.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        // uprightGroup: rotates the model +90 deg around X so it stands UPRIGHT vertically ("khari")
        // and is not lying flat horizontally like the raw model.
        uprightGroup = new THREE.Group();
        uprightGroup.add(bookModel);
        uprightGroup.rotation.x = Math.PI / 2;

        pivotGroup.add(uprightGroup);

        // Initial Hero Pose: Standing upright, front cover facing user at slight dynamic 3D angle
        pivotGroup.rotation.set(THREE.MathUtils.degToRad(8), THREE.MathUtils.degToRad(-25), 0);
        targetRotation = { x: THREE.MathUtils.degToRad(8), y: THREE.MathUtils.degToRad(-25), z: 0 };

        bookModel.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = 0.45;
              child.material.metalness = 0.15;
            }
          }
        });

        const hint = container.querySelector('.interaction-hint-badge');
        if (hint) {
          setTimeout(() => {
            hint.style.transition = 'opacity 0.6s ease';
            hint.style.opacity = '0.6';
          }, 3000);
        }
      },
      undefined,
      function (error) {
        console.error('Error loading book model:', error);
      }
    );

    // Mouse & Touch Drag Controls
    container.addEventListener('mousedown', function (e) {
      isDragging = true;
      autoRotate = false;
      isTweening = false;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        // Resume slow auto-rotate after 2.5 seconds idle
        setTimeout(() => { 
          if (!isDragging && !isTweening) autoRotate = true; 
        }, 2500);
      }
    });

    container.addEventListener('mousemove', function (e) {
      if (!isDragging || !pivotGroup) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      pivotGroup.rotation.y += deltaX * 0.012;
      // Allow subtle vertical tilt while keeping book standing upright
      pivotGroup.rotation.x = Math.max(-0.5, Math.min(0.5, pivotGroup.rotation.x + deltaY * 0.008));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    // Touch Support for Mobile
    container.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        autoRotate = false;
        isTweening = false;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    container.addEventListener('touchmove', function (e) {
      if (!isDragging || !pivotGroup || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      pivotGroup.rotation.y += deltaX * 0.015;
      pivotGroup.rotation.x = Math.max(-0.5, Math.min(0.5, pivotGroup.rotation.x + deltaY * 0.01));
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    }, { passive: true });

    container.addEventListener('touchend', function () {
      if (isDragging) {
        isDragging = false;
        setTimeout(() => { 
          if (!isDragging && !isTweening) autoRotate = true; 
        }, 2500);
      }
    });

    // Preset Angle Buttons
    const btnCover = document.getElementById('btn-view-cover');
    const btnSpine = document.getElementById('btn-view-spine');
    const btnBack = document.getElementById('btn-view-back');
    const btnReset = document.getElementById('btn-view-reset');

    function animateToRotation(x, y, z, resumeAuto = false) {
      if (!pivotGroup) return;
      autoRotate = false;
      isTweening = true;
      targetRotation = { x, y, z };
      
      // Normalize current rotation.y to be within [-PI, PI] relative to target for clean rotation
      let currentY = pivotGroup.rotation.y;
      while (currentY - y > Math.PI) currentY -= Math.PI * 2;
      while (currentY - y < -Math.PI) currentY += Math.PI * 2;
      pivotGroup.rotation.y = currentY;

      if (resumeAuto) {
        setTimeout(() => {
          autoRotate = true;
        }, 2200);
      }
    }

    if (btnCover) {
      btnCover.addEventListener('click', () => {
        playCartoonPop(520);
        // Front Cover: Standing upright vertically ("khari"), facing directly to camera
        animateToRotation(0, 0, 0);
      });
    }

    if (btnBack) {
      btnBack.addEventListener('click', () => {
        playCartoonPop(640);
        // Back Cover: Standing upright vertically ("khari"), back side facing directly to camera
        animateToRotation(0, Math.PI, 0);
      });
    }

    if (btnSpine) {
      btnSpine.addEventListener('click', () => {
        playCartoonPop(580);
        // Spine: Standing upright vertically ("khari"), spine text facing directly to camera
        animateToRotation(0, Math.PI / 2, 0);
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        playCartoonPop(480);
        // Reset View: Standing upright at dynamic 3D angle + resume auto-rotation
        animateToRotation(THREE.MathUtils.degToRad(8), THREE.MathUtils.degToRad(-25), 0, true);
      });
    }

    // Animation Loop
    let clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (pivotGroup) {
        if (isTweening) {
          pivotGroup.rotation.x += (targetRotation.x - pivotGroup.rotation.x) * 0.12;
          pivotGroup.rotation.y += (targetRotation.y - pivotGroup.rotation.y) * 0.12;
          pivotGroup.rotation.z += (targetRotation.z - pivotGroup.rotation.z) * 0.12;
          
          if (
            Math.abs(targetRotation.y - pivotGroup.rotation.y) < 0.005 &&
            Math.abs(targetRotation.x - pivotGroup.rotation.x) < 0.005
          ) {
            pivotGroup.rotation.set(targetRotation.x, targetRotation.y, targetRotation.z);
            isTweening = false;
          }
        } else if (autoRotate) {
          // Continuous 360 degree smooth rotation while standing upright in exact center
          pivotGroup.rotation.y += delta * 0.4;
        }

        // Subtle floating bobbing centered at Y = 0
        pivotGroup.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.025;
      }

      renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', function () {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
  }

  // 4. VILLAGE SHOPFRONT CAROUSEL (COMING SOON T-SHIRTS)
  function initShopfrontCarousel() {
    const track = document.getElementById('tshirtCarouselTrack');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');
    if (!track) return;

    const cards = track.querySelectorAll('.tshirt-card');
    const totalCards = cards.length;
    // Exactly 2 visible at a time
    const maxIndex = Math.max(0, totalCards - 2);

    function updateCarousel() {
      const offsetPct = state.carouselIndex * 50; // Each shift advances by 1 card
      track.style.transform = `translateX(-${offsetPct}%)`;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        playCartoonPop(480);
        state.carouselIndex = (state.carouselIndex > 0) ? state.carouselIndex - 1 : maxIndex;
        updateCarousel();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        playCartoonPop(540);
        state.carouselIndex = (state.carouselIndex < maxIndex) ? state.carouselIndex + 1 : 0;
        updateCarousel();
      });
    }
  }

  // 5. INTERACTIVE PLUSHIE BEHAVIOR
  function initPlushieInteraction() {
    const plushieZone = document.getElementById('plushieShopZone');
    const plushieModal = document.getElementById('plushieModal');
    if (!plushieZone || !plushieModal) return;

    plushieZone.addEventListener('click', function () {
      playCartoonPop(660);
      plushieModal.classList.add('active');
    });

    plushieZone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playCartoonPop(660);
        plushieModal.classList.add('active');
      }
    });

    const closeBtn = plushieModal.querySelector('.modal-close-icon');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        playCartoonPop(380);
        plushieModal.classList.remove('active');
      });
    }

    plushieModal.addEventListener('click', function (e) {
      if (e.target === plushieModal) {
        plushieModal.classList.remove('active');
      }
    });
  }

  // 6. VIDEO PLAYER CONTROLS
  function initVideoCinema() {
    const video = document.getElementById('cinemaVideo');
    const playBtn = document.getElementById('btnPlayVideo');
    const muteBtn = document.getElementById('btnMuteVideo');
    if (!video) return;

    // Mobile vs Desktop video source switch
    if (window.innerWidth < 768 && video.dataset.portraitSrc) {
      video.src = video.dataset.portraitSrc;
    }

    if (playBtn) {
      playBtn.addEventListener('click', function () {
        playCartoonPop(500);
        if (video.paused) {
          video.play();
          playBtn.innerHTML = '⏸ PAUSE FILM';
        } else {
          video.pause();
          playBtn.innerHTML = '▶ PLAY FILM';
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', function () {
        playCartoonPop(550);
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted ? '🔇 UNMUTE' : '🔊 MUTE';
      });
    }
  }

  // 7. CART DRAWER & VARIANT LOGIC
  function initCartAndVariants() {
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const addToCartBtn = document.getElementById('btnAddToCart');

    // Variant cards
    const variantCards = document.querySelectorAll('.variant-card');
    const bookPriceDisplay = document.getElementById('bookPriceDisplay');

    variantCards.forEach(card => {
      card.addEventListener('click', function () {
        playCartoonPop(520);
        variantCards.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        const variant = this.dataset.variant;
        state.selectedVariant = variant;
        if (bookPriceDisplay) {
          bookPriceDisplay.textContent = `$${state.variantPrices[variant].toFixed(2)}`;
        }
      });
    });

    // Quantity Stepper
    const qtyInput = document.getElementById('productQtyInput');
    const qtyMinus = document.getElementById('qtyMinusBtn');
    const qtyPlus = document.getElementById('qtyPlusBtn');

    if (qtyMinus && qtyInput) {
      qtyMinus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) {
          qtyInput.value = val - 1;
          playCartoonPop(400);
        }
      });
    }

    if (qtyPlus && qtyInput) {
      qtyPlus.addEventListener('click', () => {
        let val = parseInt(qtyInput.value) || 1;
        qtyInput.value = val + 1;
        playCartoonPop(600);
      });
    }

    // Open/Close Cart
    function openCart() {
      playCartoonPop(620);
      if (cartDrawer) cartDrawer.classList.add('active');
      if (cartOverlay) cartOverlay.classList.add('active');
    }

    function closeCart() {
      playCartoonPop(380);
      if (cartDrawer) cartDrawer.classList.remove('active');
      if (cartOverlay) cartOverlay.classList.remove('active');
    }

    if (openCartBtn) openCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Add To Cart
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', function () {
        const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
        const variantTitle = state.selectedVariant === 'hardcover' ? 'Hardcover (Collector Edition)' : 'Softcover (Classic Edition)';
        const variantPrice = state.variantPrices[state.selectedVariant];

        // Check if item already exists
        const existing = state.cart.find(i => i.id === state.selectedVariant);
        if (existing) {
          existing.quantity += qty;
        } else {
          state.cart.push({
            id: state.selectedVariant,
            title: `Ooga Booga! - ${variantTitle}`,
            price: variantPrice,
            quantity: qty,
            image: 'assets/images/product/book_cover_spread.png'
          });
        }

        renderCart();
        openCart();
      });
    }

    function renderCart() {
      const itemsContainer = document.getElementById('cartDrawerItems');
      const subtotalEl = document.getElementById('cartSubtotalAmount');
      const countEl = document.getElementById('cartCountBadge');
      if (!itemsContainer) return;

      itemsContainer.innerHTML = '';
      let subtotal = 0;
      let totalCount = 0;

      state.cart.forEach((item, idx) => {
        subtotal += item.price * item.quantity;
        totalCount += item.quantity;

        const card = document.createElement('div');
        card.className = 'cart-item-card';
        card.innerHTML = `
          <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 75px; object-fit: cover; border-radius: 8px; border: 2px solid var(--color-border-cartoon);">
          <div style="flex: 1;">
            <div style="font-family: var(--font-display); font-size: 0.95rem; color: var(--color-purple-deep);">${item.title}</div>
            <div style="font-family: var(--font-fun); font-weight: 700; color: var(--color-pink-primary);">$${item.price.toFixed(2)}</div>
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">Qty: ${item.quantity}</div>
          </div>
          <button class="cart-item-remove" data-index="${idx}" style="background:none; border:none; color: #ff3b30; font-size: 1.2rem; cursor: pointer;">✕</button>
        `;
        itemsContainer.appendChild(card);
      });

      if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      if (countEl) countEl.textContent = totalCount;

      // Attach remove handlers
      itemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function () {
          const idx = parseInt(this.dataset.index);
          state.cart.splice(idx, 1);
          renderCart();
        });
      });
    }

    renderCart();
  }

  // 8. NOTIFY MODAL LOGIC
  function initNotifyModal() {
    const notifyModal = document.getElementById('notifyModal');
    const notifyBtns = document.querySelectorAll('.btn-notify');
    if (!notifyModal) return;

    notifyBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        playCartoonPop(520);
        notifyModal.classList.add('active');
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playCartoonPop(520);
          notifyModal.classList.add('active');
        }
      });
    });

    const closeBtn = notifyModal.querySelector('.modal-close-icon');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        playCartoonPop(380);
        notifyModal.classList.remove('active');
      });
    }

    notifyModal.addEventListener('click', (e) => {
      if (e.target === notifyModal) {
        notifyModal.classList.remove('active');
      }
    });

    const form = notifyModal.querySelector('form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        playCartoonPop(680);
        alert('🎉 You are on the VIP waitlist for Ooga Booga merchandise!');
        notifyModal.classList.remove('active');
      });
    }
  }

  // DOM READY INITIALIZATION
  document.addEventListener('DOMContentLoaded', function () {
    initParallax();
    initThreeJsBookViewer('book3dContainer', 'assets/models/Ooga_Booga_Hardcover_Render.glb');
    initShopfrontCarousel();
    initPlushieInteraction();
    initVideoCinema();
    initCartAndVariants();
    initNotifyModal();
  });

})();
