(() => {
  const samples = [
    ['cs', 'Dobrý den, toto je zkouška českého hlasu.'],
    ['sk', 'Dobrý deň, toto je skúška slovenského hlasu.'],
    ['pl', 'Dzień dobry, to jest test polskiego głosu.'],
    ['uk', 'Добрий день, це перевірка українського голосу.'],
    ['ru', 'Добрый день, это проверка русского голоса.'],
    ['en', 'Hello, this is a test of the English voice.'],
    ['es', 'Hola, esta es una prueba de la voz española.'],
    ['it', 'Buongiorno, questa è una prova della voce italiana.'],
    ['de', 'Guten Tag, dies ist ein Test der deutschen Stimme.'],
    ['nl', 'Goedendag, dit is een test van de Nederlandse stem.'],
    ['da', 'Goddag, dette er en test af den danske stemme.'],
    ['fr', 'Bonjour, ceci est un test de la voix française.'],
    ['el', 'Καλημέρα, αυτή είναι μια δοκιμή της ελληνικής φωνής.'],
    ['no', 'God dag, dette er en test av den norske stemmen.'],
    ['sv', 'God dag, detta är ett test av den svenska rösten.'],
    ['fi', 'Hyvää päivää, tämä on suomalaisen äänen testi.'],
    ['hu', 'Jó napot, ez a magyar hang tesztje.']
  ];

  // Re-running the snippet stops and removes the previous test.
  window.stopVoiceTest?.();
  const synth = window.speechSynthesis;
  if (!synth || !window.SpeechSynthesisUtterance) {
    console.error('This browser does not support speech synthesis.');
    return;
  }

  console.info('[voice-test] Ready. Click the Test voices button on the page to start.');
  console.info('[voice-test] Browser:', navigator.userAgent);
  const button = document.createElement('button');
  button.textContent = 'Test voices';
  button.style.cssText =
    'position:fixed;top:12px;left:12px;z-index:2147483647;' +
    'padding:12px;background:white;color:black;border:2px solid black;';
  (document.querySelector('dialog[open]') || document.body).append(button);

  let stopped = false;
  let release = () => {};
  let currentUtterance = null;
  window.stopVoiceTest = () => {
    stopped = true;
    synth.cancel();
    release('stopped');
    button.remove();
  };

  button.onclick = async () => {
    if (button.dataset.running) {
      window.stopVoiceTest();
      return;
    }
    button.dataset.running = 'true';
    button.textContent = 'Stop voice test';
    synth.cancel();
    synth.resume();
    console.info('[voice-test] Click received', {active: navigator.userActivation?.isActive, paused: synth.paused});

    // Allow time for the browser's voice list to load.
    for (let i = 0; i < 30 && !synth.getVoices().length && !stopped; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const voices = synth.getVoices();
    console.info(`[voice-test] ${voices.length} browser voices available`);
    console.table(voices.map(v => ({name:v.name, language:v.lang, local:v.localService, default:v.default, id:v.voiceURI})));
    if (!voices.length) console.error('[voice-test] No browser voices found. Restart the browser after installing speech packs.');

    for (const [language, text] of samples) {
      if (stopped) break;

      const matching = synth.getVoices().filter(v => {
        const code = v.lang.toLowerCase().split(/[-_]/)[0];
        return code === language ||
          (language === 'no' && ['nb', 'nn'].includes(code));
      });

      const voice = matching.find(v => v.localService) || matching[0];
      if (!voice) {
        console.warn(`MISSING: ${language}`);
        continue;
      }

      console.log(`[voice-test] BEFORE ${language}`, {text, voice:voice.name, lang:voice.lang, local:voice.localService, paused:synth.paused, speaking:synth.speaking, pending:synth.pending});
      await new Promise(resolve => {
        const utterance = new SpeechSynthesisUtterance(text);
        currentUtterance = utterance; // Retain it until completion.
        utterance.voice = voice;
        utterance.lang = voice.lang;

        utterance.volume = 1;
        utterance.rate = 1;
        utterance.pitch = 1;
        let timer, finished = false;
        const finish = (status, details) => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          console.log(`[voice-test] AFTER ${language}: ${status}`, details || '');
          currentUtterance = null;
          resolve();
        };
        release = finish;
        utterance.onstart = () => console.log(`[voice-test] START ${language}: browser reports playback started`);
        utterance.onend = event => finish('ended', {elapsedTime:event.elapsedTime});
        utterance.onerror = event => {
          console.warn(`${language}: ${event.error}`);
          finish('error', {error:event.error});
        };
        // Avoid hanging indefinitely if the browser drops an event.
        timer = setTimeout(() => {
          console.warn(`${language}: timed out`);
          finish('timeout', {paused:synth.paused, speaking:synth.speaking, pending:synth.pending});
          synth.cancel();
        }, 20000);

        try { synth.resume(); synth.speak(utterance); }
        catch (error) { finish('exception', {message:error.message}); }
      });

      await new Promise(resolve => setTimeout(resolve, 400));
    }

    button.remove();
    console.log(stopped ? 'Voice test stopped.' : 'Voice test finished.');
  };
})();