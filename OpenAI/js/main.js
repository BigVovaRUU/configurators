
    const state = {
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4.1-mini',
      temperature: 0.7,
      max_output_tokens: 1024,
      top_p: 1,
      seed: '',
      stream: false,
      messages: [] // {role: 'system'|'user'|'assistant'|'developer', content: '...'}
      ,saving: {
        concise: true,
        skipAssistant: true,
        historyDepth: 4,
        truncateChars: 0,
        stripMarkdown: false,
        hardCap: 512,
        preferMini: true,
      }
      ,format: {
        stop: [],
        responseFormat: 'none',
        jsonSchema: ''
      }
      ,reliability: {
        timeoutMs: 20000,
        retries: 1,
        backoffMs: 1500,
        onLength: 'none'
      }
      ,profiles: {},
      currentProfileName: '',
      vars: {},
      pricing: {
        "gpt-4.1": { in: 0.0, out: 0.0 },
        "gpt-4.1-mini": { in: 0.0, out: 0.0 },
        "o4-mini": { in: 0.0, out: 0.0 },
        "o3": { in: 0.0, out: 0.0 },
        "o3-mini": { in: 0.0, out: 0.0 }
      }
    };

    const els = {
      useEnv: document.getElementById('useEnv'),
      keyRow: document.getElementById('keyRow'),
      apiKey: document.getElementById('apiKey'),
      baseUrl: document.getElementById('baseUrl'),
      model: document.getElementById('model'),
      temperature: document.getElementById('temperature'),
      maxTokens: document.getElementById('maxTokens'),
      topP: document.getElementById('topP'),
      seed: document.getElementById('seed'),
      stream: document.getElementById('stream'),
      system: document.getElementById('system'),
      user: document.getElementById('user'),
      addMsg: document.getElementById('addMsg'),
      clearMsg: document.getElementById('clearMsg'),
      payload: document.getElementById('payload'),
      copyJson: document.getElementById('copyJson'),
      tabs: Array.from(document.querySelectorAll('.tab')),
      code: document.getElementById('code'),
      copyCode: document.getElementById('copyCode'),
      darkToggle: document.getElementById('darkToggle'),
      helpBody: null,
      insertPromptExample: null,
      demoFill: null,
      svConcise: null,
      svSkipAssistant: null,
      svHistory: null,
      svTrunc: null,
      svStripMd: null,
      svCap: null,
      svPreferMini: null,
      presetEco: null,
      presetBalance: null,
      presetQuality: null,
      priceIn: null,
      priceOut: null,
      estOutput: null,
      estTokens: null,
      estCost: null,
      stopSeq: null,
      respFormat: null,
      jsonSchema: null,
      timeoutMs: null,
      retries: null,
      backoffMs: null,
      onLength: null,
      // Профили и переменные
      profileName: null,
      saveProfile: null,
      loadProfile: null,
      deleteProfile: null,
      exportProfile: null,
      importProfile: null,
      applyImport: null,
      varsScan: null,
      varsList: null,
      varsApply: null,
      // Тарифы
      pricingTable: null,
      autoPriceOnModel: null,
      applyModelPrice: null,
      // Валидатор JSON
      jsonToValidate: null,
      validateJson: null,
      jsonValidResult: null,
    };

    // Инициализация новых элементов помощи
    els.helpBody = document.getElementById('helpBody');
    els.insertPromptExample = document.getElementById('insertPromptExample');
    els.demoFill = document.getElementById('demoFill');
    const toggleHelpBtn = document.getElementById('toggleHelp');

    // Экономия токенов — ссылки на элементы
    els.svConcise = document.getElementById('svConcise');
    els.svSkipAssistant = document.getElementById('svSkipAssistant');
    els.svHistory = document.getElementById('svHistory');
    els.svTrunc = document.getElementById('svTrunc');
    els.svStripMd = document.getElementById('svStripMd');
    els.svCap = document.getElementById('svCap');
    els.svPreferMini = document.getElementById('svPreferMini');

    function bindSavingEvents() {
      if (!els.svConcise) return;
      els.svConcise.addEventListener('change', () => { state.saving.concise = !!els.svConcise.checked; render(); });
      els.svSkipAssistant.addEventListener('change', () => { state.saving.skipAssistant = !!els.svSkipAssistant.checked; render(); });
      els.svHistory.addEventListener('input', () => { state.saving.historyDepth = Math.max(1, parseInt(els.svHistory.value||'1',10)); render(); });
      els.svTrunc.addEventListener('input', () => { state.saving.truncateChars = Math.max(0, parseInt(els.svTrunc.value||'0',10)); render(); });
      els.svStripMd.addEventListener('change', () => { state.saving.stripMarkdown = !!els.svStripMd.checked; render(); });
      els.svCap.addEventListener('input', () => { state.saving.hardCap = Math.max(64, parseInt(els.svCap.value||'64',10)); render(); });
      els.svPreferMini.addEventListener('change', () => { state.saving.preferMini = !!els.svPreferMini.checked; render(); });
    }

    bindSavingEvents();

    // Пресеты экономии токенов
    els.presetEco = document.getElementById('presetEco');
    els.presetBalance = document.getElementById('presetBalance');
    els.presetQuality = document.getElementById('presetQuality');

    function applyPreset(p) {
      if (p === 'eco') {
        state.saving = { concise: true, skipAssistant: true, historyDepth: 3, truncateChars: 1000, stripMarkdown: true, hardCap: 384, preferMini: true };
      } else if (p === 'balance') {
        state.saving = { concise: true, skipAssistant: true, historyDepth: 4, truncateChars: 0, stripMarkdown: false, hardCap: 640, preferMini: true };
      } else if (p === 'quality') {
        state.saving = { concise: false, skipAssistant: false, historyDepth: 8, truncateChars: 0, stripMarkdown: false, hardCap: Math.max(768, state.max_output_tokens), preferMini: false };
      }
      if (els.svConcise) els.svConcise.checked = state.saving.concise;
      if (els.svSkipAssistant) els.svSkipAssistant.checked = state.saving.skipAssistant;
      if (els.svHistory) els.svHistory.value = String(state.saving.historyDepth);
      if (els.svTrunc) els.svTrunc.value = String(state.saving.truncateChars);
      if (els.svStripMd) els.svStripMd.checked = state.saving.stripMarkdown;
      if (els.svCap) els.svCap.value = String(state.saving.hardCap);
      if (els.svPreferMini) els.svPreferMini.checked = state.saving.preferMini;
      render();
      toast('Пресет применён: ' + (p==='eco' ? 'Эконом' : p==='balance' ? 'Баланс' : 'Качество'));
    }

    if (els.presetEco) els.presetEco.addEventListener('click', () => applyPreset('eco'));
    if (els.presetBalance) els.presetBalance.addEventListener('click', () => applyPreset('balance'));
    if (els.presetQuality) els.presetQuality.addEventListener('click', () => applyPreset('quality'));

    // Элементы оценщика стоимости
    els.priceIn = document.getElementById('priceIn');
    els.priceOut = document.getElementById('priceOut');
    els.estOutput = document.getElementById('estOutput');
    els.estTokens = document.getElementById('estTokens');
    els.estCost = document.getElementById('estCost');
    ;['input','change'].forEach(ev => {
      if (els.priceIn) els.priceIn.addEventListener(ev, render);
      if (els.priceOut) els.priceOut.addEventListener(ev, render);
      if (els.estOutput) els.estOutput.addEventListener(ev, render);
    });

    // Формат и контроль
    els.stopSeq = document.getElementById('stopSeq');
    els.respFormat = document.getElementById('respFormat');
    els.jsonSchema = document.getElementById('jsonSchema');
    els.stopSeq.addEventListener('input', () => { render(); });
    els.respFormat.addEventListener('change', () => {
      const v = els.respFormat.value;
      state.format.responseFormat = v;
      document.getElementById('schemaWrap').classList.toggle('hidden', v !== 'json_schema');
      render();
    });
    els.jsonSchema.addEventListener('input', () => { state.format.jsonSchema = els.jsonSchema.value; render(); });

    // Надёжность
    els.timeoutMs = document.getElementById('timeoutMs');
    els.retries = document.getElementById('retries');
    els.backoffMs = document.getElementById('backoffMs');
    els.onLength = document.getElementById('onLength');
    ;['input','change'].forEach(ev => {
      els.timeoutMs.addEventListener(ev, () => { state.reliability.timeoutMs = Math.max(0, parseInt(els.timeoutMs.value||'0',10)); });
      els.retries.addEventListener(ev, () => { state.reliability.retries = Math.max(0, parseInt(els.retries.value||'0',10)); });
      els.backoffMs.addEventListener(ev, () => { state.reliability.backoffMs = Math.max(0, parseInt(els.backoffMs.value||'0',10)); });
      els.onLength.addEventListener(ev, () => { state.reliability.onLength = els.onLength.value; });
    });
    function approxTokensFromInputArray(inputArr) {
      try {
        const text = inputArr.map(m => (m.content||[]).map(c => c.text || '').join('\n')).join('\n');
        const chars = text.length;
        return Math.max(1, Math.ceil(chars / 4)); // ~4 символа на токен
      } catch { return 0; }
    }

    function renderEstimator(payload) {
      if (!els.estTokens || !els.estCost) return;
      const inTok = approxTokensFromInputArray(payload.input);
      const outTok = Math.max(0, parseInt((els.estOutput && els.estOutput.value) ? els.estOutput.value : payload.max_output_tokens || 0, 10));
      els.estTokens.textContent = `Оценка входа: ~${inTok.toLocaleString()} токенов, выхода: ~${outTok.toLocaleString()} токенов`;

      const pin = parseFloat((els.priceIn && els.priceIn.value) ? els.priceIn.value : '0') || 0;
      const pout = parseFloat((els.priceOut && els.priceOut.value) ? els.priceOut.value : '0') || 0;
      if (pin === 0 && pout === 0) {
        els.estCost.textContent = 'Стоимость: укажите цены за 1K токенов, чтобы увидеть расчёт.';
        return;
      }
      const cost = (inTok/1000)*pin + (outTok/1000)*pout;
      els.estCost.textContent = `Оценочная стоимость: ~$${cost.toFixed(4)} (вход $${pin}/1K, выход $${pout}/1K)`;
    }

    if (toggleHelpBtn && els.helpBody) {
      toggleHelpBtn.addEventListener('click', () => {
        const hidden = els.helpBody.classList.toggle('hidden');
        toggleHelpBtn.textContent = hidden ? 'Показать' : 'Скрыть';
      });
    }

    if (els.insertPromptExample) {
      els.insertPromptExample.addEventListener('click', () => {
        els.system.value = 'Ты дружелюбный помощник. Объясняй простыми словами. Если есть список шагов — выводи нумерованный список.';
        els.user.value = 'Мне нужно понять, как сделать запрос к OpenAI. Объясни по шагам и сгенерируй пример кода на JavaScript.';
      });
    }

    if (els.demoFill) {
      els.demoFill.addEventListener('click', () => {
        els.model.value = 'gpt-4.1-mini';
        els.temperature.value = '0.6';
        els.maxTokens.value = '800';
        els.topP.value = '1';
        els.seed.value = '';
        els.stream.checked = false;

        state.messages = [
          { role: 'developer', content: 'Ты дружелюбный помощник. Отвечай кратко и по шагам.' },
          { role: 'user', content: 'Объясни, как отправить запрос к OpenAI Responses API и дай пример.' }
        ];

        // Обновить state из элементов
        state.model = els.model.value;
        state.temperature = parseFloat(els.temperature.value);
        state.max_output_tokens = parseInt(els.maxTokens.value, 10);
        state.top_p = parseFloat(els.topP.value);
        state.seed = els.seed.value;
        state.stream = !!els.stream.checked;

        // Новые настройки saving
        state.saving = { concise: true, skipAssistant: true, historyDepth: 4, truncateChars: 0, stripMarkdown: false, hardCap: 512, preferMini: true };
        if (els.svConcise) els.svConcise.checked = true;
        if (els.svSkipAssistant) els.svSkipAssistant.checked = true;
        if (els.svHistory) els.svHistory.value = '4';
        if (els.svTrunc) els.svTrunc.value = '0';
        if (els.svStripMd) els.svStripMd.checked = false;
        if (els.svCap) els.svCap.value = '512';
        if (els.svPreferMini) els.svPreferMini.checked = true;

        render();
        toast('Пример заполнен');
      });
    }

    // Тема (darkMode: 'class' + сохранение в localStorage)
    (function initTheme() {
      const ls = localStorage.getItem('theme');
      const preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldDark = ls ? (ls === 'dark') : preferDark;
      document.documentElement.classList.toggle('dark', shouldDark);
      updateThemeButton();
    })();

    function updateThemeButton() {
      const isDark = document.documentElement.classList.contains('dark');
      els.darkToggle.textContent = isDark ? 'Светлая тема' : 'Тёмная тема';
    }

    els.darkToggle.addEventListener('click', () => {
      const nextIsDark = !document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark', nextIsDark);
      localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
      updateThemeButton();
    });

    // Переключение способа указания API-ключа
    els.useEnv.addEventListener('change', () => {
      els.keyRow.classList.toggle('hidden', els.useEnv.checked);
      render();
    });

    // Базовая инициализация
    [els.baseUrl, els.model, els.temperature, els.maxTokens, els.topP, els.seed].forEach((el) => {
      el.addEventListener('input', () => {
        state.baseUrl = els.baseUrl.value.trim();
        state.model = els.model.value;
        state.temperature = parseFloat(els.temperature.value || '0');
        state.max_output_tokens = parseInt(els.maxTokens.value || '0', 10);
        state.top_p = parseFloat(els.topP.value || '1');
        state.seed = els.seed.value;
        render();
      });
    });

    els.stream.addEventListener('change', () => {
      state.stream = !!els.stream.checked;
      render();
    });

    // Работа с промптами
    els.addMsg.addEventListener('click', () => {
      const sys = els.system.value.trim();
      const usr = els.user.value.trim();
      if (sys) state.messages.push({ role: 'developer', content: sys }); // в Responses API system трактуется как developer
      if (usr) state.messages.push({ role: 'user', content: usr });
      els.system.value = '';
      els.user.value = '';
      render();
    });

    els.clearMsg.addEventListener('click', () => {
      state.messages = [];
      render();
    });

    function stripMarkdown(text) {
      if (!text) return text;
      // Удаляем коды блоков и инлайн-маркдаун по-простому (без тяжёлых зависимостей)
      return text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/^\s{0,3}[-*+]\s+/gm, '')
        .replace(/^\s{0,3}\d+\.\s+/gm, '')
        .replace(/^\s{0,3}#{1,6}\s+/gm, '')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
        .replace(/\n{3,}/g, '\n\n');
    }

    function buildResponsesPayload() {
      // 1) Подготовка списка сообщений
      let msgs = Array.from(state.messages);
      // Подстановка переменных {{var}}
      msgs = msgs.map(m => ({ ...m, content: applyVars(m.content||'') }));
      if (state.saving.skipAssistant) {
        msgs = msgs.filter(m => m.role !== 'assistant');
      }
      // 2) Глубина истории
      const depth = Math.max(1, state.saving.historyDepth|0);
      if (msgs.length > depth) msgs = msgs.slice(-depth);

      // 3) Трансформации текста
      const transformed = msgs.map(m => {
        let text = m.content || '';
        if (state.saving.stripMarkdown) text = stripMarkdown(text);
        const lim = state.saving.truncateChars|0;
        if (lim > 0 && text.length > lim) text = text.slice(0, lim) + '…';
        return { role: m.role, content: [ { type: 'text', text } ] };
      });

      const input = [];
      if (state.saving.concise) {
        input.push({ role: 'developer', content: [ { type: 'text', text: 'Отвечай максимально кратко, по делу, без пояснений не по теме. Если можно — списком, без лишней воды.' } ] });
      }

      if (transformed.length === 0) {
        input.push({ role: 'user', content: [ { type: 'text', text: 'Скажи привет и перечисли параметры запроса.' } ] });
      } else {
        input.push(...transformed);
      }

      // 4) Модель (mini-переключение на лету)
      let model = state.model;
      if (state.saving.preferMini && !/mini$/i.test(model)) {
        const candidate = model + '-mini';
        // Не знаем списка допустимых моделей здесь — просто подставляем вариант -mini
        model = candidate;
      }

      // 5) Жёсткий потолок токенов
      const maxTokens = Math.min(state.max_output_tokens, Math.max(64, state.saving.hardCap|0));

      const payload = {
        model,
        input,
        temperature: state.temperature,
        max_output_tokens: maxTokens,
        top_p: state.top_p,
      };
      // Stop-последовательности
      const stopRaw = (els.stopSeq && els.stopSeq.value ? els.stopSeq.value : '').trim();
      if (stopRaw) {
        const list = stopRaw.split(/\n|,/).map(s => s.trim()).filter(Boolean);
        if (list.length) payload.stop = list;
      }
      // Формат вывода
      if (state.format.responseFormat === 'json_schema') {
        try {
          const schema = state.format.jsonSchema && state.format.jsonSchema.trim() ? JSON.parse(state.format.jsonSchema) : null;
          if (schema) payload.response_format = { type: 'json_schema', json_schema: schema };
        } catch (e) {
          // если схема битая — просто не добавляем её, чтобы не ломать вызов
        }
      }
      if (state.seed !== '' && !Number.isNaN(Number(state.seed))) payload.seed = Number(state.seed);
      if (state.stream) payload.stream = true;
      return payload;
    }

    function codeJsSdk(payload) {
      const apiKeyLine = els.useEnv.checked
        ? 'const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: "' + state.baseUrl + '" });'
        : 'const client = new OpenAI({ apiKey: "' + (els.apiKey.value || 'YOUR_API_KEY') + '", baseURL: "' + state.baseUrl + '" });';

      const lengthRetries = 2;
      const payloadStr = JSON.stringify(payload, null, 2);

      if (state.stream) {
        return `import OpenAI from "openai";
${apiKeyLine}
const onLength = ${JSON.stringify(state.reliability.onLength)};

function needsMore(data){
  try{
    if (data?.response?.status === 'incomplete') return true;
    const fr = data?.output?.[0]?.finish_reason || data?.finish_reason || data?.response?.output?.[0]?.finish_reason;
    return fr === 'length';
  }catch{return false}
}

async function run() {
  let attempt = 0, lengthAtt = 0;
  let payload = ${payloadStr};
  while (true) {
    try {
      const stream = await client.responses.stream(payload);
      for await (const event of stream) {
        if (event.type === 'response.output_text.delta') process.stdout.write(event.delta);
      }
      const data = await stream.final();
      if (onLength === 'retry_more' && lengthAtt < ${lengthRetries} && needsMore(data)){
        lengthAtt++;
        payload.max_output_tokens = Math.min(8192, Math.round((payload.max_output_tokens||512)*1.5));
        continue;
      }
      return; // success
    } catch (err) {
      if (attempt++ >= ${state.reliability.retries|0}) throw err;
      await new Promise(r => setTimeout(r, ${state.reliability.backoffMs|0} * attempt));
    }
  }
}

run().catch(err => { console.error(err); if (typeof process !== 'undefined' && process.exit) process.exit(1); });`;
      }

      return `import OpenAI from "openai";
${apiKeyLine}
const onLength = ${JSON.stringify(state.reliability.onLength)};

function needsMore(data){
  try{
    if (data?.response?.status === 'incomplete') return true;
    const fr = data?.output?.[0]?.finish_reason || data?.finish_reason || data?.response?.output?.[0]?.finish_reason;
    return fr === 'length';
  }catch{return false}
}

async function run() {
  let attempt = 0, lengthAtt = 0;
  let payload = ${payloadStr};
  while (true) {
    try {
      const response = await client.responses.create(payload);
      console.log(response.output_text);
      const data = response;
      if (onLength === 'retry_more' && lengthAtt < ${lengthRetries} && needsMore(data)){
        lengthAtt++;
        payload.max_output_tokens = Math.min(8192, Math.round((payload.max_output_tokens||512)*1.5));
        continue;
      }
      return; // success
    } catch (err) {
      if (attempt++ >= ${state.reliability.retries|0}) throw err;
      await new Promise(r => setTimeout(r, ${state.reliability.backoffMs|0} * attempt));
    }
  }
}

run().catch(err => { console.error(err); if (typeof process !== 'undefined' && process.exit) process.exit(1); });`;
    }

    function codeJsFetch(payload) {
      const lengthRetries = 2;
      const payloadStr = JSON.stringify(payload, null, 2);
      return `const timeout = ${state.reliability.timeoutMs|0};
const retries = ${state.reliability.retries|0};
const backoff = ${state.reliability.backoffMs|0};
const key = ${els.useEnv.checked ? 'process.env.OPENAI_API_KEY' : '"' + (els.apiKey.value || 'YOUR_API_KEY') + '"'};
const onLength = ${JSON.stringify(state.reliability.onLength)};

function needsMore(data){
  try{
    if (data?.response?.status === 'incomplete') return true;
    const fr = data?.output?.[0]?.finish_reason || data?.finish_reason || data?.response?.output?.[0]?.finish_reason;
    return fr === 'length';
  }catch{return false}
}

async function callOnce(signal, payload) {
  const res = await fetch("${state.baseUrl}/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + key,
    },
    body: JSON.stringify(payload),
    signal
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function withRetry() {
  let attempt = 0, lengthAtt = 0;
  let payload = ${payloadStr};
  while (true) {
    const supportsAbort = (typeof AbortController !== 'undefined');
    const ac = supportsAbort ? new AbortController() : null;
    const signal = ac ? ac.signal : undefined;
    const to = supportsAbort && timeout > 0 ? setTimeout(() => ac.abort(), timeout) : null;
    try {
      const data = await callOnce(signal, payload);
      if (onLength === 'retry_more' && lengthAtt < ${lengthRetries} && needsMore(data)){
        lengthAtt++;
        payload.max_output_tokens = Math.min(8192, Math.round((payload.max_output_tokens||512)*1.5));
        continue;
      }
      return data;
    } catch (err) {
      if (attempt >= retries) throw err;
      attempt++;
      if (to) clearTimeout(to);
      await new Promise(r => setTimeout(r, backoff * attempt));
    } finally {
      if (to) clearTimeout(to);
    }
  }
}

async function run() {
  const data = await withRetry();
  console.log(data.output_text ?? data);
}

run().catch(err => { console.error(err); if (typeof process !== 'undefined' && process.exit) process.exit(1); });`;
    }

    function codePython(payload) {
      return `from openai import OpenAI\nclient = OpenAI()\n\nresp = client.responses.create(${JSON.stringify(payload, null, 2)})\nprint(resp.output_text)`;
    }

    let currentTab = 'js-sdk';
    els.tabs.forEach(btn => btn.addEventListener('click', (e) => {
      currentTab = e.target.getAttribute('data-tab');
      render();
    }));

    els.copyJson.addEventListener('click', async () => {
      const text = els.payload.textContent;
      await navigator.clipboard.writeText(text);
      toast('JSON скопирован');
    });

    els.copyCode.addEventListener('click', async () => {
      const text = els.code.textContent;
      await navigator.clipboard.writeText(text);
      toast('Код скопирован');
    });

    function render() {
      const schemaWrap = document.getElementById('schemaWrap');
      if (schemaWrap) schemaWrap.classList.toggle('hidden', state.format.responseFormat !== 'json_schema');
      const payload = buildResponsesPayload();
      els.payload.textContent = JSON.stringify(payload, null, 2);

      let snippet = '';
      if (currentTab === 'js-sdk') snippet = codeJsSdk(payload);
      if (currentTab === 'js-fetch') snippet = codeJsFetch(payload);
      if (currentTab === 'py') snippet = codePython(payload);
      els.code.textContent = snippet;
      renderEstimator(payload);
      // Обновляем список профилей (на случай внешних изменений)
      refreshProfilesSelect();
    }

    function toast(msg) {
      const el = document.createElement('div');
      el.textContent = msg;
      el.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 card px-3 py-2 text-sm';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }

    // ===== Профили (LocalStorage) =====
    els.profileName = document.getElementById('profileName');
    els.saveProfile = document.getElementById('saveProfile');
    els.loadProfile = document.getElementById('loadProfile');
    els.deleteProfile = document.getElementById('deleteProfile');
    els.exportProfile = document.getElementById('exportProfile');
    els.importProfile = document.getElementById('importProfile');
    els.applyImport = document.getElementById('applyImport');

    function getProfilesLS() {
      try { return JSON.parse(localStorage.getItem('oa_profiles')||'{}'); } catch { return {}; }
    }
    function setProfilesLS(obj) {
      localStorage.setItem('oa_profiles', JSON.stringify(obj));
    }
    function refreshProfilesSelect() {
      const data = getProfilesLS();
      els.loadProfile.innerHTML = '';
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '— выберите профиль —';
      els.loadProfile.appendChild(opt);
      Object.keys(data).forEach(name => {
        const o = document.createElement('option');
        o.value = name; o.textContent = name; els.loadProfile.appendChild(o);
      });
    }
    refreshProfilesSelect();

    function captureConfig() {
      return {
        baseUrl: state.baseUrl,
        model: state.model,
        temperature: state.temperature,
        max_output_tokens: state.max_output_tokens,
        top_p: state.top_p,
        seed: state.seed,
        stream: state.stream,
        messages: state.messages,
        saving: state.saving,
        format: state.format,
        reliability: state.reliability,
        vars: state.vars,
        pricing: state.pricing
      };
    }
    function applyConfig(cfg) {
      try {
        state.baseUrl = cfg.baseUrl ?? state.baseUrl;
        state.model = cfg.model ?? state.model;
        state.temperature = cfg.temperature ?? state.temperature;
        state.max_output_tokens = cfg.max_output_tokens ?? state.max_output_tokens;
        state.top_p = cfg.top_p ?? state.top_p;
        state.seed = cfg.seed ?? state.seed;
        state.stream = !!cfg.stream;
        state.messages = Array.isArray(cfg.messages) ? cfg.messages : state.messages;
        state.saving = Object.assign({}, state.saving, cfg.saving||{});
        state.format = Object.assign({}, state.format, cfg.format||{});
        state.reliability = Object.assign({}, state.reliability, cfg.reliability||{});
        state.vars = Object.assign({}, state.vars, cfg.vars||{});
        state.pricing = Object.assign({}, state.pricing, cfg.pricing||{});
        // синхронизируем UI основные поля
        els.baseUrl.value = state.baseUrl;
        els.model.value = state.model;
        els.temperature.value = String(state.temperature);
        els.maxTokens.value = String(state.max_output_tokens);
        els.topP.value = String(state.top_p);
        els.seed.value = String(state.seed);
        els.stream.checked = !!state.stream;
        // saving UI
        if (els.svConcise) els.svConcise.checked = !!state.saving.concise;
        if (els.svSkipAssistant) els.svSkipAssistant.checked = !!state.saving.skipAssistant;
        if (els.svHistory) els.svHistory.value = String(state.saving.historyDepth);
        if (els.svTrunc) els.svTrunc.value = String(state.saving.truncateChars);
        if (els.svStripMd) els.svStripMd.checked = !!state.saving.stripMarkdown;
        if (els.svCap) els.svCap.value = String(state.saving.hardCap);
        if (els.svPreferMini) els.svPreferMini.checked = !!state.saving.preferMini;
        // format UI
        if (els.respFormat) els.respFormat.value = state.format.responseFormat || 'none';
        if (els.jsonSchema) els.jsonSchema.value = state.format.jsonSchema || '';
        render();
      } catch (e) { toast('Ошибка применения профиля'); }
    }

    els.saveProfile.addEventListener('click', () => {
      const name = (els.profileName.value||'').trim();
      if (!name) return toast('Укажите имя профиля');
      const data = getProfilesLS();
      data[name] = captureConfig();
      setProfilesLS(data);
      refreshProfilesSelect();
      toast('Профиль сохранён');
    });
    els.loadProfile.addEventListener('change', () => {
      const name = els.loadProfile.value;
      if (!name) return;
      const data = getProfilesLS();
      if (!data[name]) return toast('Профиль не найден');
      applyConfig(data[name]);
      toast('Профиль загружен');
    });
    els.deleteProfile.addEventListener('click', () => {
      const name = els.loadProfile.value;
      if (!name) return toast('Выберите профиль');
      const data = getProfilesLS();
      delete data[name];
      setProfilesLS(data);
      refreshProfilesSelect();
      toast('Профиль удалён');
    });
    els.exportProfile.addEventListener('click', () => {
      const cfg = captureConfig();
      const blob = new Blob([JSON.stringify(cfg, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = (els.profileName.value||'profile') + '.json';
      a.click();
      URL.revokeObjectURL(url);
    });
    els.applyImport.addEventListener('click', () => {
      try {
        const cfg = JSON.parse(els.importProfile.value||'{}');
        applyConfig(cfg);
        toast('Импорт выполнен');
      } catch { toast('Некорректный JSON при импорте'); }
    });

    // ===== Переменные в промпте =====
    els.varsScan = document.getElementById('varsScan');
    els.varsList = document.getElementById('varsList');
    els.varsApply = document.getElementById('varsApply');

    function findPlaceholders() {
      const texts = [];
      state.messages.forEach(m => { texts.push(m.content||''); });
      const joined = texts.join('\n');
      const re = /\{\{([a-zA-Z0-9_.-]+)\}\}/g;
      const out = new Set();
      let m;
      while ((m = re.exec(joined)) !== null) { out.add(m[1]); }
      return Array.from(out);
    }
    function renderVarsList(names) {
      els.varsList.innerHTML = '';
      names.forEach(n => {
        const wrap = document.createElement('div');
        wrap.innerHTML = `<label class="block text-xs mb-1">${n}</label><input data-var="${n}" class="w-full card px-3 py-2" placeholder="значение для {{${n}}}" value="${state.vars[n]||''}" />`;
        els.varsList.appendChild(wrap);
      });
      els.varsList.querySelectorAll('input[data-var]').forEach(inp => {
        inp.addEventListener('input', () => { state.vars[inp.getAttribute('data-var')] = inp.value; });
      });
    }
    els.varsScan.addEventListener('click', () => {
      const names = findPlaceholders();
      if (names.length === 0) { toast('Плейсхолдеры не найдены'); return; }
      renderVarsList(names);
      toast('Найдены переменные: ' + names.join(', '));
    });
    els.varsApply.addEventListener('click', () => { render(); toast('Значения применены'); });

    function applyVars(text) {
      if (!text) return text;
      return text.replace(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, (_, k) => (state.vars[k] ?? `{{${k}}}`));
    }

    // ===== Тарифы моделей =====
    els.pricingTable = document.getElementById('pricingTable');
    els.autoPriceOnModel = document.getElementById('autoPriceOnModel');
    els.applyModelPrice = document.getElementById('applyModelPrice');

    function renderPricingTable() {
      els.pricingTable.innerHTML = '';
      Object.keys(state.pricing).forEach(model => {
        const row = document.createElement('tr');
        row.innerHTML = `<td class="py-1 pr-2 whitespace-nowrap">${model}</td>
          <td class="py-1 pr-2"><input data-price="in" data-model="${model}" type="number" step="0.0001" min="0" value="${state.pricing[model].in}" class="w-full card px-2 py-1"/></td>
          <td class="py-1 pr-2"><input data-price="out" data-model="${model}" type="number" step="0.0001" min="0" value="${state.pricing[model].out}" class="w-full card px-2 py-1"/></td>`;
        els.pricingTable.appendChild(row);
      });
      els.pricingTable.querySelectorAll('input[data-price]').forEach(inp => {
        inp.addEventListener('input', () => {
          const model = inp.getAttribute('data-model');
          const kind = inp.getAttribute('data-price');
          state.pricing[model][kind] = parseFloat(inp.value||'0')||0;
        });
      });
    }
    renderPricingTable();

    function applyPricesForCurrentModel() {
      const m = state.model;
      const p = state.pricing[m];
      if (!p) { toast('Нет тарифов для выбранной модели'); return; }
      if (els.priceIn) els.priceIn.value = String(p.in||0);
      if (els.priceOut) els.priceOut.value = String(p.out||0);
      render();
      toast('Цены подставлены для ' + m);
    }
    els.applyModelPrice.addEventListener('click', applyPricesForCurrentModel);

    // авто-подстановка при смене модели
    els.model.addEventListener('change', () => {
      state.model = els.model.value;
      if (els.autoPriceOnModel && els.autoPriceOnModel.checked) applyPricesForCurrentModel();
    });

    // ===== Валидатор JSON против схемы =====
    els.jsonToValidate = document.getElementById('jsonToValidate');
    els.validateJson = document.getElementById('validateJson');
    els.jsonValidResult = document.getElementById('jsonValidResult');

    function simpleValidate(schema, data, path = '') {
      const errs = [];
      if (!schema || typeof schema !== 'object') return errs;
      if (schema.type && schema.type !== typeof data && !(schema.type === 'array' && Array.isArray(data))) {
        errs.push(`${path||'root'}: тип ${typeof data} != ${schema.type}`);
        return errs;
      }
      if (schema.type === 'object' && schema.properties) {
        const req = Array.isArray(schema.required) ? schema.required : [];
        req.forEach(k => { if (!(k in data)) errs.push(`${path||'root'}: отсутствует обязательное поле ${k}`); });
        Object.keys(schema.properties).forEach(k => {
          if (k in data) errs.push(...simpleValidate(schema.properties[k], data[k], path ? path + '.' + k : k));
        });
      }
      if (schema.type === 'array' && schema.items && Array.isArray(data)) {
        data.forEach((v,i) => { errs.push(...simpleValidate(schema.items, v, path + `[${i}]`)); });
      }
      if (schema.enum && !schema.enum.includes(data)) {
        errs.push(`${path||'root'}: значение не входит в enum`);
      }
      return errs;
    }

    els.validateJson.addEventListener('click', () => {
      els.jsonValidResult.textContent = '';
      if (!els.jsonSchema || !els.jsonSchema.value.trim()) {
        els.jsonValidResult.textContent = 'Нет схемы: включите «Строгий JSON по схеме» и задайте JSON Schema.';
        return;
      }
      try {
        const schema = JSON.parse(els.jsonSchema.value);
        const data = JSON.parse(els.jsonToValidate.value||'{}');
        const errs = simpleValidate(schema, data);
        els.jsonValidResult.textContent = errs.length ? 'Ошибки: ' + errs.join('; ') : 'OK: JSON соответствует схеме';
      } catch (e) {
        els.jsonValidResult.textContent = 'Ошибка парсинга JSON или схемы';
      }
    });

    // Первичный рендер
    render();
  