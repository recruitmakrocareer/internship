// ==================== หน้าดูเนื้อหาแหล่งเรียนรู้ (Distraction-free Viewer) ====================

async function renderResourceView() {
  if (!checkAuth()) return;

  const app = document.getElementById('app');
  const user = getCurrentUser();
  const query = window.location.hash.split('?')[1] || '';
  const resourceId = new URLSearchParams(query).get('id');
  const backPage = (user.role === 'ADMIN') ? '#admin-resources' : '#student-resources';

  // ไม่พบ id
  if (!resourceId) {
    app.innerHTML = _rvErrorPage(backPage, 'ไม่พบรหัสเนื้อหา', 'กรุณาเลือกแหล่งเรียนรู้จากรายการ');
    return;
  }

  // แสดง loading
  app.innerHTML = `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center text-gray-400">
        <svg class="animate-spin h-8 w-8 mx-auto mb-3 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p>กำลังโหลดเนื้อหา...</p>
      </div>
    </div>`;

  let resource;
  try {
    const res = await callApi('getResource', { id: resourceId });
    if (!res.success && !res.data) {
      app.innerHTML = _rvErrorPage(backPage, 'ไม่พบเนื้อหา', 'เนื้อหานี้อาจถูกลบหรือไม่มีอยู่ในระบบ');
      return;
    }
    resource = res.data || res;
  } catch (e) {
    app.innerHTML = _rvErrorPage(backPage, 'เกิดข้อผิดพลาด', 'ไม่สามารถโหลดเนื้อหาได้ กรุณาลองใหม่อีกครั้ง');
    return;
  }

  if (!resource || !resource.id) {
    app.innerHTML = _rvErrorPage(backPage, 'ไม่พบเนื้อหา', 'เนื้อหานี้อาจถูกลบหรือไม่มีอยู่ในระบบ');
    return;
  }

  // Inject responsive styles for content padding
  _rvInjectStyles();

  // สร้าง layout หลัก
  app.innerHTML = `
    <!-- Top bar -->
    <div class="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-30 flex items-center px-4 gap-3">
      <button id="rv-back-btn" class="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        กลับ
      </button>
      <div class="h-6 w-px bg-gray-200 shrink-0"></div>
      <h1 class="text-sm font-semibold text-gray-800 truncate flex-1">${_rvEsc(resource.title || '')}</h1>
      ${resource.category ? `<span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 shrink-0">${_rvEsc(resource.category)}</span>` : ''}
      <button id="rv-sidebar-toggle" class="lg:hidden text-gray-500 hover:text-gray-700 shrink-0 ml-2" title="รายการบทเรียน">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
      </button>
    </div>

    <!-- Main body -->
    <div class="mt-14 flex h-[calc(100vh-3.5rem)]">
      <!-- Content area -->
      <div id="rv-content" class="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
        ${_rvRenderContent(resource)}
      </div>

      <!-- Curriculum sidebar -->
      <aside id="rv-curriculum" class="w-80 bg-white border-l border-gray-200 overflow-y-auto hidden lg:block">
        <div class="p-4 border-b border-gray-100">
          <h2 class="text-sm font-semibold text-gray-700">บทเรียนในหมวด ${_rvEsc(resource.category || 'ทั้งหมด')}</h2>
        </div>
        <div id="rv-curriculum-list" class="p-2">
          <div class="text-center py-6 text-gray-400 text-sm">กำลังโหลด...</div>
        </div>
      </aside>
    </div>

    <!-- Mobile sidebar overlay -->
    <div id="rv-sidebar-overlay" class="hidden fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"></div>
    <aside id="rv-curriculum-mobile" class="fixed top-14 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 transform translate-x-full transition-transform duration-300 lg:hidden overflow-y-auto">
      <div class="p-4 border-b border-gray-100">
        <h2 class="text-sm font-semibold text-gray-700">บทเรียนในหมวด ${_rvEsc(resource.category || 'ทั้งหมด')}</h2>
      </div>
      <div id="rv-curriculum-list-mobile" class="p-2"></div>
    </aside>
  `;

  // Back button
  document.getElementById('rv-back-btn').addEventListener('click', function () {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = backPage;
    }
  });

  // Mobile sidebar toggle
  var sidebarToggle = document.getElementById('rv-sidebar-toggle');
  var sidebarOverlay = document.getElementById('rv-sidebar-overlay');
  var sidebarMobile = document.getElementById('rv-curriculum-mobile');

  sidebarToggle.addEventListener('click', function () {
    sidebarMobile.classList.remove('translate-x-full');
    sidebarOverlay.classList.remove('hidden');
  });

  sidebarOverlay.addEventListener('click', function () {
    sidebarMobile.classList.add('translate-x-full');
    sidebarOverlay.classList.add('hidden');
  });

  // Setup video resume playback
  _rvSetupVideoResume(resource);

  // Load curriculum sidebar
  _rvLoadCurriculum(resource);
}

// ==================== Content Rendering ====================

function _rvRenderContent(resource) {
  var sourceUrl = resource.url || resource.fileUrl || '';
  var type = resource.type || '';

  // 1) YouTube
  if (_rvIsYouTube(sourceUrl)) {
    var videoId = _rvExtractYouTubeId(sourceUrl);
    return `
      <div class="max-w-5xl mx-auto rv-content-padding">
        <div class="relative w-full" style="padding-bottom:56.25%">
          <iframe class="absolute inset-0 w-full h-full rounded-xl shadow-lg"
            src="https://www.youtube.com/embed/${videoId}?autoplay=1"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>
        ${_rvDescriptionBlock(resource)}
      </div>`;
  }

  // 2) Google Drive
  if (_rvIsGoogleDrive(sourceUrl)) {
    var fileId = _rvExtractDriveId(sourceUrl);
    var isVideo = (type === 'video');
    if (isVideo) {
      return `
        <div class="max-w-5xl mx-auto rv-content-padding">
          <div class="relative w-full" style="padding-bottom:56.25%">
            <iframe class="absolute inset-0 w-full h-full rounded-xl shadow-lg"
              src="https://drive.google.com/file/d/${fileId}/preview?autoplay=1"
              frameborder="0" allow="autoplay; encrypted-media"
              allowfullscreen loading="lazy"></iframe>
          </div>
          ${_rvDescriptionBlock(resource)}
        </div>`;
    } else {
      return `
        <div class="max-w-5xl mx-auto rv-content-padding">
          <iframe class="w-full rounded-xl shadow-lg border" style="height:75vh"
            src="https://drive.google.com/file/d/${fileId}/preview"
            frameborder="0" allow="autoplay" loading="lazy"></iframe>
          ${_rvDescriptionBlock(resource)}
        </div>`;
    }
  }

  // 3) Google Docs / Sheets / Slides
  if (_rvIsGoogleDocs(sourceUrl)) {
    var previewUrl = _rvExtractGoogleDocsPreviewUrl(sourceUrl);
    return `
      <div class="max-w-5xl mx-auto rv-content-padding">
        <iframe class="w-full rounded-xl shadow-lg border" style="height:80vh"
          src="${_rvEsc(previewUrl)}"
          frameborder="0" loading="lazy"></iframe>
        ${_rvDescriptionBlock(resource)}
      </div>`;
  }

  // 4) Direct video file (.mp4/.webm/.ogg/.mov/.avi/.mkv)
  if (_rvIsDirectVideo(sourceUrl)) {
    return `
      <div class="max-w-5xl mx-auto rv-content-padding">
        <video id="rv-video-player" controls width="100%"
          class="w-full rounded-xl shadow-lg bg-black"
          style="max-height:75vh;object-fit:contain">
          <source src="${_rvEsc(sourceUrl)}" type="${_rvVideoMime(sourceUrl)}">
          เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
        </video>
        ${_rvDescriptionBlock(resource)}
      </div>`;
  }

  // 5) Unplayable video URL fallback (type is 'video' but not YouTube/Drive/direct file)
  if (type === 'video' && sourceUrl) {
    return `
      <div class="max-w-5xl mx-auto rv-content-padding space-y-4">
        <div class="relative w-full" style="padding-bottom:56.25%">
          <iframe class="absolute inset-0 w-full h-full rounded-xl shadow-lg"
            src="${_rvEsc(sourceUrl)}"
            frameborder="0" allow="autoplay; encrypted-media"
            allowfullscreen loading="lazy"></iframe>
        </div>
        <div class="text-center py-3">
          <p class="text-sm text-gray-500 mb-3">หากวิดีโอไม่แสดงผล สามารถเปิดลิงก์โดยตรง</p>
          <a href="${_rvEsc(sourceUrl)}" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-primary-700 transition-colors shadow-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            เปิดลิงก์
          </a>
        </div>
        ${_rvDescriptionBlock(resource)}
      </div>`;
  }

  // 6) Image
  if (_rvIsImage(sourceUrl)) {
    var imgSrc = _rvIsGoogleDrive(sourceUrl) ? driveImageUrl(sourceUrl) : sourceUrl;
    return `
      <div class="max-w-5xl mx-auto rv-content-padding text-center">
        <img src="${_rvEsc(imgSrc)}" alt="${_rvEsc(resource.title || '')}" class="max-w-full mx-auto rounded-xl shadow-lg" style="max-height:80vh;object-fit:contain" />
        ${_rvDescriptionBlock(resource)}
      </div>`;
  }

  // 7) Other link
  if (sourceUrl) {
    return `
      <div class="max-w-5xl mx-auto rv-content-padding space-y-4">
        <div class="text-center py-6">
          <a href="${_rvEsc(sourceUrl)}" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            เปิดลิงก์
          </a>
        </div>
        <iframe src="${_rvEsc(sourceUrl)}" class="w-full rounded-xl shadow-lg border" style="height:70vh"
          frameborder="0" loading="lazy"></iframe>
        ${_rvDescriptionBlock(resource)}
      </div>`;
  }

  // 8) Content text only
  if (resource.content) {
    return `
      <div class="max-w-3xl mx-auto rv-content-padding">
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 class="text-xl font-bold text-gray-800 mb-4">${_rvEsc(resource.title || '')}</h2>
          <div class="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">${_rvEsc(resource.content)}</div>
        </div>
        ${_rvDescriptionBlock(resource)}
      </div>`;
  }

  // Fallback: no content
  return `
    <div class="max-w-3xl mx-auto rv-content-padding text-center py-12">
      <div class="bg-white rounded-xl shadow-lg p-8">
        <p class="text-gray-400 text-lg">ไม่มีเนื้อหาสำหรับแหล่งเรียนรู้นี้</p>
      </div>
    </div>`;
}

function _rvDescriptionBlock(resource) {
  var parts = [];
  if (resource.description) {
    parts.push(`<p class="text-gray-600">${_rvEsc(resource.description)}</p>`);
  }
  if (resource.tags) {
    var tags = String(resource.tags).split(',').map(function (t) { return t.trim(); }).filter(Boolean);
    if (tags.length) {
      parts.push(`<div class="flex flex-wrap gap-2">${tags.map(function (t) {
        return '<span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">' + _rvEsc(t) + '</span>';
      }).join('')}</div>`);
    }
  }
  if (!parts.length) return '';
  return `<div class="mt-4 space-y-2">${parts.join('')}</div>`;
}

// ==================== Video Resume Playback ====================

function _rvSetupVideoResume(resource) {
  var video = document.getElementById('rv-video-player');
  if (!video) return;

  var storageKey = 'vdo-progress-' + resource.id;
  var savedTime = parseFloat(localStorage.getItem(storageKey) || '0');
  var resumed = false;

  video.addEventListener('loadedmetadata', function () {
    if (savedTime > 10 && savedTime < video.duration - 2) {
      video.currentTime = savedTime;
      resumed = true;
      showToast('ดูต่อจากครั้งก่อน', 'info');
    }
  });

  var lastSave = 0;
  video.addEventListener('timeupdate', function () {
    var now = Date.now();
    if (now - lastSave >= 5000) {
      lastSave = now;
      localStorage.setItem(storageKey, String(video.currentTime));
    }
  });

  video.addEventListener('ended', function () {
    localStorage.removeItem(storageKey);
  });
}

// ==================== Curriculum Sidebar ====================

async function _rvLoadCurriculum(currentResource) {
  try {
    var res = await callApi('getResources');
    var resources = res.data || res || [];
    if (!Array.isArray(resources)) resources = [];

    // Filter same category & sort by title
    var sameCat = resources.filter(function (r) {
      return r.category && currentResource.category && r.category === currentResource.category;
    }).sort(function (a, b) {
      return (a.title || '').localeCompare(b.title || '', 'th');
    });

    var html = _rvBuildCurriculumList(sameCat, currentResource.id);
    var listEl = document.getElementById('rv-curriculum-list');
    if (listEl) listEl.innerHTML = html;
    var listMobile = document.getElementById('rv-curriculum-list-mobile');
    if (listMobile) listMobile.innerHTML = html;
  } catch (e) {
    var errHtml = '<div class="text-center py-6 text-red-400 text-sm">โหลดรายการไม่สำเร็จ</div>';
    var listEl2 = document.getElementById('rv-curriculum-list');
    if (listEl2) listEl2.innerHTML = errHtml;
    var listMobile2 = document.getElementById('rv-curriculum-list-mobile');
    if (listMobile2) listMobile2.innerHTML = errHtml;
  }
}

function _rvBuildCurriculumList(resources, currentId) {
  if (!resources.length) {
    return '<div class="text-center py-6 text-gray-400 text-sm">ไม่มีบทเรียนในหมวดนี้</div>';
  }

  var typeIcons = { video: '🎬', document: '📄', link: '🔗' };

  return resources.map(function (r) {
    var isCurrent = (r.id === currentId);
    var icon = typeIcons[r.type] || '📁';
    var progressKey = 'vdo-progress-' + r.id;
    var hasProgress = localStorage.getItem(progressKey) !== null;
    var watchedBadge = (r.type === 'video' && hasProgress) ? '<span class="text-xs text-green-600 font-medium">ดูแล้ว</span>' : '';

    return `
      <a href="#resource-view?id=${r.id}" class="flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isCurrent ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}">
        <span class="text-base shrink-0 mt-0.5">${icon}</span>
        <div class="flex-1 min-w-0">
          <p class="truncate">${_rvEsc(r.title || '')}</p>
          ${watchedBadge}
        </div>
        ${isCurrent ? '<span class="text-xs text-primary-500 shrink-0 mt-0.5">กำลังดู</span>' : ''}
      </a>`;
  }).join('');
}

// ==================== URL Detection Helpers ====================

function _rvIsYouTube(url) {
  if (!url) return false;
  return /(?:youtube\.com\/watch\?|youtu\.be\/)/.test(url);
}

function _rvExtractYouTubeId(url) {
  var m = url.match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : '';
}

function _rvIsGoogleDrive(url) {
  if (!url) return false;
  // Match /file/d/ID, /d/ID, ?id=ID, open?id=ID, uc?id=ID
  return /drive\.google\.com/.test(url) &&
    (/\/(?:file\/)?d\/[a-zA-Z0-9_-]+/.test(url) || /[?&]id=[a-zA-Z0-9_-]+/.test(url));
}

function _rvExtractDriveId(url) {
  // Try /d/ID first
  var m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  // Try ?id=ID or &id=ID
  var m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m2 ? m2[1] : '';
}

function _rvIsGoogleDocs(url) {
  if (!url) return false;
  return /(?:docs|sheets|slides|presentations)\.google\.com\/(?:document|spreadsheets|presentation)\/d\/[a-zA-Z0-9_-]+/.test(url);
}

function _rvExtractGoogleDocsPreviewUrl(url) {
  // Convert edit/view URLs to embedded preview URLs
  // e.g. https://docs.google.com/document/d/DOC_ID/edit -> .../d/DOC_ID/preview
  var m = url.match(/(https:\/\/(?:docs|sheets|slides|presentations)\.google\.com\/(?:document|spreadsheets|presentation)\/d\/[a-zA-Z0-9_-]+)/);
  if (m) return m[1] + '/preview';
  return url;
}

function _rvIsDirectVideo(url) {
  if (!url) return false;
  if (_rvIsYouTube(url) || _rvIsGoogleDrive(url)) return false;
  return /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url);
}

function _rvIsImage(url) {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(url);
}

function _rvVideoMime(url) {
  if (/\.webm/i.test(url)) return 'video/webm';
  if (/\.ogg/i.test(url)) return 'video/ogg';
  return 'video/mp4';
}

// ==================== Shared Helpers ====================

function _rvEsc(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function _rvInjectStyles() {
  if (document.getElementById('rv-responsive-styles')) return;
  var style = document.createElement('style');
  style.id = 'rv-responsive-styles';
  style.textContent = `
    @media (max-width: 639px) {
      #rv-content { padding: 0.5rem !important; }
      .rv-content-padding { padding-left: 0; padding-right: 0; }
    }
  `;
  document.head.appendChild(style);
}

function _rvErrorPage(backPage, title, message) {
  return `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div class="text-4xl mb-4">😔</div>
        <h2 class="text-lg font-bold text-gray-800 mb-2">${title}</h2>
        <p class="text-sm text-gray-500 mb-6">${message}</p>
        <a href="${backPage}" class="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          กลับไปหน้าแหล่งเรียนรู้
        </a>
      </div>
    </div>`;
}
