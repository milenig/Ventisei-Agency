/**
 * Auto language: browser preference on first visit, then localStorage (SR/EN switch).
 */
(function () {
  var STORAGE_KEY = 'ventisei-lang';

  function isEnPath(pathname) {
    return /(?:^|\/)en(?:\/|$)/.test(pathname);
  }

  function pageLang() {
    var htmlLang = (document.documentElement.lang || '').toLowerCase();
    if (htmlLang.indexOf('en') === 0) return 'en';
    return isEnPath(window.location.pathname) ? 'en' : 'sr';
  }

  function browserLang() {
    var list = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || 'sr'];
    for (var i = 0; i < list.length; i += 1) {
      var code = String(list[i]).toLowerCase();
      if (code.indexOf('en') === 0) return 'en';
      if (code.indexOf('sr') === 0) return 'sr';
    }
    return 'sr';
  }

  function savedLang() {
    var v = localStorage.getItem(STORAGE_KEY);
    return v === 'en' || v === 'sr' ? v : null;
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* ignore */
    }
  }

  function toEnglishPath(pathname) {
    if (isEnPath(pathname)) return pathname;
    var lastSlash = pathname.lastIndexOf('/');
    var dir = lastSlash >= 0 ? pathname.slice(0, lastSlash + 1) : '/';
    var file = lastSlash >= 0 ? pathname.slice(lastSlash + 1) : pathname;
    if (!file) file = 'index.html';
    return dir + 'en/' + file;
  }

  function toSerbianPath(pathname) {
    if (!isEnPath(pathname)) return pathname;
    var next = pathname.replace(/\/en\//, '/').replace(/\/en$/, '/');
    if (next === '/' || next === '') return '/index.html';
    return next;
  }

  function targetPath(targetLang) {
    var path = window.location.pathname;
    var current = pageLang();
    if (targetLang === current) return null;
    if (targetLang === 'en') return toEnglishPath(path);
    return toSerbianPath(path);
  }

  function inferLangFromNavigation() {
    try {
      var ref = document.referrer;
      if (!ref) return;
      var refUrl = new URL(ref);
      if (refUrl.origin !== window.location.origin) return;
      var fromEn = isEnPath(refUrl.pathname);
      var toEn = isEnPath(window.location.pathname);
      if (fromEn !== toEn) saveLang(toEn ? 'en' : 'sr');
    } catch (e) {
      /* ignore */
    }
  }

  function maybeRedirect() {
    var target = savedLang() || browserLang();
    var next = targetPath(target);
    if (!next || next === window.location.pathname) return;
    window.location.replace(next + window.location.search + window.location.hash);
  }

  inferLangFromNavigation();
  maybeRedirect();

  function onReady() {
    document.querySelectorAll('.lang-switch__link').forEach(function (link) {
      link.addEventListener('click', function () {
        var hreflang = (link.getAttribute('hreflang') || link.lang || '').toLowerCase();
        if (hreflang.indexOf('en') === 0) saveLang('en');
        else if (hreflang.indexOf('sr') === 0) saveLang('sr');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  window.VentiseiLang = { saveLang: saveLang, browserLang: browserLang };
})();
