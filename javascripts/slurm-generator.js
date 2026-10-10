/**
 * slurm-generator.js
 * A Web Component that renders an interactive Slurm batch script generator.
 *
 * Usage in MkDocs markdown:
 *   <slurm-generator></slurm-generator>
 *
 * mkdocs.yml:
 *   extra_javascript:
 *     - javascripts/slurm-generator.js
 *
 * Place this file at: docs/javascripts/slurm-generator.js
 */

(function () {
  const CSS = `
    :host { display: block; font-family: var(--md-text-font, sans-serif); }

    .sg-wrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      padding: 4px 0 1rem;
    }
    @media (max-width: 680px) {
      .sg-wrap { grid-template-columns: 1fr; }
    }

    /* ── Header badge ── */
    .sg-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }
    .sg-badge {
      background: var(--md-primary-fg-color);
      color: var(--md-primary-bg-color, #fff);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .07em;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 20px;
    }
    .sg-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--md-default-fg-color);
    }

    /* ── Form panels ── */
    .sg-left { display: flex; flex-direction: column; gap: 0; }

    .sg-section {
      border: 1px solid var(--md-default-fg-color--lightest, rgba(0,0,0,.1));
      border-radius: .4rem;
      overflow: hidden;
      margin-bottom: 10px;
    }
    .sg-section:last-of-type { margin-bottom: 0; }

    .sg-sec-head {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 7px 12px;
      background: color-mix(in srgb, var(--md-primary-fg-color) 8%, var(--md-default-bg-color));
      border-bottom: 1px solid var(--md-default-fg-color--lightest, rgba(0,0,0,.08));
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .07em;
      text-transform: uppercase;
      color: var(--md-primary-fg-color);
    }
    .sg-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--md-primary-fg-color);
      opacity: .6;
    }
    .sg-sec-body {
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      background: var(--md-default-bg-color);
    }

    /* ── Form fields ── */
    .sg-lbl {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: var(--md-primary-fg-color);
      margin-bottom: 3px;
    }
    .sg-field input,
    .sg-field select {
      width: 100%;
      font-size: 13px;
      height: 30px;
      padding: 0 8px;
      border: 1.5px solid var(--md-default-fg-color--lighter, rgba(0,0,0,.2));
      border-radius: .25rem;
      background: var(--md-default-bg-color);
      color: var(--md-default-fg-color);
      font-family: inherit;
      transition: border-color .15s, box-shadow .15s;
    }
    .sg-field input:focus,
    .sg-field select:focus {
      outline: none;
      border-color: var(--md-primary-fg-color);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-primary-fg-color) 20%, transparent);
    }
    .sg-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .sg-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
    .sg-hint {
      font-size: 10px;
      margin-top: 2px;
      color: var(--md-default-fg-color--light);
    }
    .sg-check {
      display: flex; align-items: center; gap: 7px;
      font-size: 12px;
      color: var(--md-default-fg-color);
      cursor: pointer;
      user-select: none;
    }
    .sg-check input { width: 13px; height: 13px; accent-color: var(--md-primary-fg-color); cursor: pointer; }
    .sg-gpu-block { display: none; }
    .sg-email-block { display: none; }

    /* ── Generate button ── */
    .sg-btn {
      width: 100%;
      margin-top: 10px;
      padding: 10px 0;
      border: none;
      border-radius: .4rem;
      background: var(--md-primary-fg-color);
      color: var(--md-primary-bg-color, #fff);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: .03em;
      cursor: pointer;
      box-shadow: 0 3px 14px color-mix(in srgb, var(--md-primary-fg-color) 40%, transparent);
      transition: transform .1s, box-shadow .15s, filter .15s;
    }
    .sg-btn:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 5px 18px color-mix(in srgb, var(--md-primary-fg-color) 50%, transparent); }
    .sg-btn:active { transform: scale(.98); }
    .sg-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
    .sg-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

    /* ── Terminal panel ── */
    .sg-right { display: flex; flex-direction: column; }
    .sg-term {
      flex: 1;
      border-radius: .4rem;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,.07);
      box-shadow: 0 6px 28px rgba(0,0,0,.35);
      display: flex;
      flex-direction: column;
    }
    .sg-term-bar {
      background: #252838;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1px solid rgba(255,255,255,.06);
      flex-shrink: 0;
    }
    .sg-dot-r { width: 10px; height: 10px; border-radius: 50%; background: #f38ba8; flex-shrink: 0; }
    .sg-dot-y { width: 10px; height: 10px; border-radius: 50%; background: #f9e2af; flex-shrink: 0; }
    .sg-dot-g { width: 10px; height: 10px; border-radius: 50%; background: #a6e3a1; flex-shrink: 0; }
    .sg-term-name {
      font-family: 'Roboto Mono', 'Fira Code', monospace;
      font-size: 11px;
      color: #6c7086;
      margin-left: auto;
    }
    .sg-copy-btn {
      font-size: 10px;
      padding: 2px 8px;
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 3px;
      cursor: pointer;
      color: #cdd6f4;
      font-family: 'Roboto Mono', monospace;
      margin-left: 6px;
      transition: background .15s;
    }
    .sg-copy-btn:hover { background: rgba(255,255,255,.15); }

    .sg-pre {
      flex: 1;
      margin: 0;
      padding: 14px 16px;
      background: #1a1e2e;
      color: #cdd6f4;
      font-family: 'Roboto Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace;
      font-size: 11.5px;
      line-height: 1.75;
      white-space: pre;
      overflow-x: auto;
      min-height: 360px;
    }
    .sg-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 320px;
      color: #3d4166;
      font-size: 12px;
      text-align: center;
      gap: 6px;
      font-family: 'Roboto Mono', monospace;
    }
    .t-cmt  { color: #6c7086; }
    .t-dir  { color: #89b4fa; font-weight: 600; }
    .t-val  { color: #a6e3a1; }
    .t-kw   { color: #cba6f7; }
  `;

  const ICONS = {
    code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  };

  class SlurmGenerator extends HTMLElement {
    connectedCallback() {
      const shadow = this.attachShadow({ mode: 'open' });

      shadow.innerHTML = `
        <style>${CSS}</style>
        <div class="sg-wrap">
          <!-- ── LEFT: form ── -->
          <div class="sg-left">

            <div class="sg-section">
              <div class="sg-sec-head"><div class="sg-dot"></div>Job identity</div>
              <div class="sg-sec-body">
                <div class="sg-field">
                  <label class="sg-lbl">Job name</label>
                  <input id="s-name" type="text" value="my_job" maxlength="40">
                </div>
                <div class="sg-field">
                  <label class="sg-lbl">Partition</label>
                  <select id="s-part">
                    <option value="short">short — CPU, up to 30 h</option>
                    <option value="long">long — CPU, up to 240 h</option>
                    <option value="gpu_short">himem — CPU, up to 240 h</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="sg-section">
              <div class="sg-sec-head"><div class="sg-dot"></div>Resources</div>
              <div class="sg-sec-body">
                <div class="sg-field">
                  <label class="sg-lbl">Wall-clock time</label>
                  <div class="sg-3col">
                    <div><input id="s-hh" type="number" min="0" max="99" value="2"><div class="sg-hint">hours</div></div>
                    <div><input id="s-mm" type="number" min="0" max="59" value="0"><div class="sg-hint">mins</div></div>
                    <div><input id="s-ss" type="number" min="0" max="59" value="0"><div class="sg-hint">secs</div></div>
                  </div>
                </div>
                <div class="sg-field">
                  <label class="sg-lbl">CPUs per task</label>
                  <input id="s-cpu" type="number" min="1" max="64" value="4">
                  <div class="sg-hint">Number of threads your job will use</div>
                </div>
                <div class="sg-field">
                  <label class="sg-lbl">Memory</label>
                  <div class="sg-2col">
                    <input id="s-mem" type="number" min="1" max="2000" value="16">
                    <select id="s-mu"><option value="G">GB</option><option value="M">MB</option></select>
                  </div>
                </div>
                <div class="sg-gpu-block sg-field" id="s-gpu-block">
                  <label class="sg-lbl">GPU resources</label>
                  <div class="sg-2col">
                    <select id="s-gtype">
                      <option value="gpu">gpu (any)</option>
                      <option value="a100">a100</option>
                      <option value="h100">h100</option>
                      <option value="gh200">gh200</option>
                    </select>
                    <input id="s-gcnt" type="number" min="1" max="8" value="1">
                  </div>
                  <div class="sg-hint">Type · count</div>
                </div>
              </div>
            </div>

            <div class="sg-section">
              <div class="sg-sec-head"><div class="sg-dot"></div>Logging &amp; notifications</div>
              <div class="sg-sec-body">
                <div class="sg-field">
                  <label class="sg-lbl">Output log pattern</label>
                  <input id="s-out" type="text" value="%j_%x.out">
                  <div class="sg-hint">%j = job ID · %x = job name · %a = array index</div>
                </div>
                <label class="sg-check">
                  <input type="checkbox" id="s-echk">
                  Email on BEGIN / END / FAIL
                </label>
                <div class="sg-email-block" id="s-email-block">
                  <div class="sg-field">
                    <label class="sg-lbl">Email address</label>
                    <input id="s-email" type="email" placeholder="you@ox.ac.uk">
                  </div>
                </div>
              </div>
            </div>

            <button class="sg-btn" id="s-genbtn">
              <div class="sg-btn-inner">${ICONS.code} Generate script</div>
            </button>

          </div>

          <!-- ── RIGHT: terminal ── -->
          <div class="sg-right">
            <div class="sg-term">
              <div class="sg-term-bar">
                <div class="sg-dot-r"></div>
                <div class="sg-dot-y"></div>
                <div class="sg-dot-g"></div>
                <span class="sg-term-name">submit.sh</span>
                <button class="sg-copy-btn" id="s-copy">copy</button>
              </div>
              <pre class="sg-pre" id="s-pre"><div class="sg-empty">Fill in the parameters<br>then click <strong style="color:#6c7086">Generate script</strong></div></pre>
            </div>
          </div>
        </div>
      `;

      const root = shadow;
      const $ = id => root.getElementById(id);

      $('s-part').addEventListener('change', () => {
        $('s-gpu-block').style.display = $('s-part').value.startsWith('gpu') ? 'block' : 'none';
      });
      $('s-echk').addEventListener('change', () => {
        $('s-email-block').style.display = $('s-echk').checked ? 'block' : 'none';
      });
      $('s-genbtn').addEventListener('click', () => this._generate(shadow));
      $('s-copy').addEventListener('click', () => this._copy(shadow));
    }

    _pad(n) { return String(n || 0).padStart(2, '0'); }
    _e(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    _cm(t) { return `<span class="t-cmt">${t}</span>`; }
    _di(t) { return `<span class="t-dir">${this._e(t)}</span>`; }
    _va(t) { return `<span class="t-val">${this._e(t)}</span>`; }
    _kw(t) { return `<span class="t-kw">${this._e(t)}</span>`; }
    _sep() { return this._cm('# ─────────────────────────────────────────'); }

    _generate(shadow) {
      const $ = id => shadow.getElementById(id);
      const jn = ($('s-name').value || 'my_job').replace(/\s+/g, '_');
      const part = $('s-part').value;
      const hh = parseInt($('s-hh').value) || 0;
      const mm = parseInt($('s-mm').value) || 0;
      const ss = parseInt($('s-ss').value) || 0;
      const cpu = parseInt($('s-cpu').value) || 1;
      const mem = parseInt($('s-mem').value) || 1;
      const mu = $('s-mu').value;
      const out = $('s-out').value || '%j_%x.out';
      const err = out.replace(/\.out$/, '.err').replace(/(\.[^.]+)$/, '.err');
      const emailOn = $('s-echk').checked;
      const email = $('s-email').value;
      const isGpu = part.startsWith('gpu');
      const gtype = $('s-gtype').value;
      const gcnt = parseInt($('s-gcnt').value) || 1;
      const time = `${this._pad(hh)}:${this._pad(mm)}:${this._pad(ss)}`;

      const L = [];
      L.push(this._kw('#!/bin/bash'));
      L.push('');
      L.push(this._sep());
      L.push(this._cm('# Resource requests'));
      L.push(this._sep());
      L.push(this._di('#SBATCH') + ' --job-name=' + this._va(jn));
      L.push(this._di('#SBATCH') + ' --partition=' + this._va(part));
      L.push(this._di('#SBATCH') + ' --time=' + this._va(time));
      L.push(this._di('#SBATCH') + ' --cpus-per-task=' + this._va(cpu));
      L.push(this._di('#SBATCH') + ' --mem=' + this._va(mem + mu));
      if (isGpu) L.push(this._di('#SBATCH') + ' --gres=' + this._va(`gpu:${gtype}:${gcnt}`));
      L.push('');
      L.push(this._sep());
      L.push(this._cm('# Logging'));
      L.push(this._sep());
      L.push(this._di('#SBATCH') + ' --output=' + this._va(out));
      L.push(this._di('#SBATCH') + ' --error=' + this._va(err));
      if (emailOn && email) {
        L.push('');
        L.push(this._sep());
        L.push(this._cm('# Email notifications'));
        L.push(this._sep());
        L.push(this._di('#SBATCH') + ' --mail-type=' + this._va('BEGIN,END,FAIL'));
        L.push(this._di('#SBATCH') + ' --mail-user=' + this._va(email));
      }
      L.push('');
      L.push(this._sep());
      L.push(this._cm('# Environment'));
      L.push(this._sep());
      L.push(this._kw('module') + ' purge');
      L.push(this._cm('# module load &lt;YourModule&gt;'));
      L.push('');
      L.push(this._sep());
      L.push(this._cm('# Your commands go below'));
      L.push(this._sep());
      L.push(this._kw('echo') + ' ' + this._va(`"Running on $(hostname) — ${cpu} CPU(s), ${mem}${mu} RAM"`));

      $('s-pre').innerHTML = L.join('\n');

      // Button feedback
      const btn = $('s-genbtn');
      btn.querySelector('.sg-btn-inner').innerHTML =
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg> Script generated!`;
      setTimeout(() => {
        btn.querySelector('.sg-btn-inner').innerHTML =
          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> Generate script`;
      }, 2500);
    }

    _copy(shadow) {
      const pre = shadow.getElementById('s-pre');
      const text = pre.innerText || pre.textContent;
      if (!text.trim() || text.includes('Fill in')) return;
      navigator.clipboard && navigator.clipboard.writeText(text).then(() => {
        const btn = shadow.getElementById('s-copy');
        btn.textContent = 'copied!';
        setTimeout(() => btn.textContent = 'copy', 2000);
      });
    }
  }

  if (!customElements.get('slurm-generator')) {
    customElements.define('slurm-generator', SlurmGenerator);
  }
})();
