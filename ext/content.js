(() => {
  const BIO = '[data-testid="profileHeaderDescription"]';
  const FOLLOWER_COUNT = '[data-testid="profileHeaderFollowersButton"]';
  const DISPLAY_NAME = '[data-testid="profileHeaderDisplayName"]';
  const SETTLE_MS = 150;

  let lastAskedSignals = null;
  let shownAnswer = null;
  let label = null;

  const profileUriHints = () =>
    [...document.querySelectorAll('link[rel="alternate"]')]
      .map((link) => link.getAttribute('href'))
      .filter((href) => href && href.startsWith('at://'));

  const pageSignals = () => ({
    url: location.href,
    hints: profileUriHints(),
    header: !!document.querySelector(DISPLAY_NAME),
  });

  const labelAnchor = () => document.querySelector(BIO) || document.querySelector(FOLLOWER_COUNT)?.parentElement;

  const parseAnswer = (url, answer) => {
    const shown = /^show (\S+) (\S+) (\S+) (.*)$/.exec(answer || '');
    return shown && { url, did: shown[1], tone: shown[2], date: shown[3], text: shown[4] };
  };

  function labelFor(answer) {
    label ??= Object.assign(document.createElement('div'), { className: 'alx-regdate' });
    label.dataset.tone = answer.tone;
    label.textContent = `📅 ${answer.text}`;
    label.title = `${answer.did}\nregistered ${answer.date}`;
    return label;
  }

  function render() {
    const stillOnThatPage = shownAnswer && shownAnswer.url === location.href;
    if (!stillOnThatPage) return label?.remove();
    const anchor = labelAnchor();
    const current = labelFor(shownAnswer);
    if (anchor && anchor.nextElementSibling !== current) anchor.after(current);
  }

  function ask(signals) {
    const key = JSON.stringify(signals);
    if (key === lastAskedSignals) return;
    lastAskedSignals = key;
    chrome.runtime.sendMessage({ type: 'regdate', signals }, (answer) => {
      if (chrome.runtime.lastError || key !== lastAskedSignals) return;
      if (answer?.startsWith('error')) console.debug('[regdate]', answer);
      shownAnswer = parseAnswer(signals.url, answer);
      render();
    });
  }

  function refresh() {
    ask(pageSignals());
    render();
  }

  let refreshQueued = false;
  function queueRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    setTimeout(() => {
      refreshQueued = false;
      refresh();
    }, SETTLE_MS);
  }

  new MutationObserver(queueRefresh).observe(document.documentElement, { childList: true, subtree: true });
  refresh();
})();
