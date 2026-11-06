class BoxShadowGenerator {
  constructor() {
    this.controls = {
      horizontal: document.querySelector("#horizontal"),
      vertical: document.querySelector("#vertical"),
      blur: document.querySelector("#blur"),
      spread: document.querySelector("#spread"),
      color: document.querySelector("#color"),
      opacity: document.querySelector("#opacity"),
      inset: document.querySelector("#inset")
    };
    this.values = {
      horizontal: document.querySelector("#horizontal-value"),
      vertical: document.querySelector("#vertical-value"),
      blur: document.querySelector("#blur-value"),
      spread: document.querySelector("#spread-value"),
      color: document.querySelector("#color-value"),
      opacity: document.querySelector("#opacity-value")
    };
    this.previewBox = document.querySelector("#box");
    this.rules = {
      standard: document.querySelector("#rule"),
      webkit: document.querySelector("#webkit-rule"),
      moz: document.querySelector("#moz-rule")
    };
    this.copyInstructions = document.querySelector("#copy-instructions");
    this.currentRule = "";
  }

  initialize() {
    Object.entries(this.controls).forEach(([name, control]) => {
      if (name === "inset") {
        control.addEventListener("change", () => this.update());
      } else {
        control.addEventListener("input", () => {
          this.values[name].value = control.value;
          this.update();
        });
      }
    });

    Object.entries(this.values).forEach(([name, input]) => {
      input.addEventListener("input", () => this.updateFromNumber(name));
      input.addEventListener("change", () => this.commitNumber(name));
    });

    document.querySelectorAll("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => this.applyPreset(button.dataset.preset));
    });

    const rulesArea = document.querySelector("#rules-area");
    rulesArea.addEventListener("click", () => this.copyRules());
    rulesArea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.copyRules();
      }
    });
    document.querySelector("#copy-code").addEventListener("click", (event) => {
      event.stopPropagation();
      this.copyRules();
    });

    this.update();
  }

  updateFromNumber(name) {
    const input = this.values[name];
    if (name === "color") {
      const value = input.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(value)) {
        this.controls.color.value = value;
        this.update();
      }
      return;
    }
    if (input.value.trim() === "" || !Number.isFinite(Number(input.value))) return;
    const min = Number(this.controls[name].min);
    const max = Number(this.controls[name].max);
    const value = Math.min(max, Math.max(min, Number(input.value)));
    this.controls[name].value = value;
    this.update();
  }

  commitNumber(name) {
    const input = this.values[name];
    if (name === "color") {
      if (!/^#[0-9a-fA-F]{6}$/.test(input.value.trim())) input.value = this.controls.color.value;
      return;
    }
    const control = this.controls[name];
    const min = Number(control.min);
    const max = Number(control.max);
    const parsed = Number(input.value);
    const value = input.value.trim() === "" || !Number.isFinite(parsed)
      ? Number(control.value)
      : Math.min(max, Math.max(min, parsed));
    control.value = value;
    input.value = value;
    this.update();
  }

  update() {
    const read = (name) => this.controls[name].value;
    const hex = read("color");
    const alpha = Number(read("opacity"));
    const rgb = this.hexToRgb(hex);
    const inset = this.controls.inset.checked ? "inset " : "";
    const rule = `${inset}${read("horizontal")}px ${read("vertical")}px ${read("blur")}px ${read("spread")}px rgba(${rgb}, ${alpha})`;

    this.currentRule = rule;
    this.previewBox.style.boxShadow = rule;
    this.rules.standard.textContent = rule + ";";
    this.rules.webkit.textContent = rule + ";";
    this.rules.moz.textContent = rule + ";";

    Object.entries(this.controls).forEach(([name, control]) => {
      if (name !== "inset" && document.activeElement !== this.values[name]) {
        this.values[name].value = control.value;
      }
    });
    this.updateSliderTrack("horizontal", -100, 100);
    this.updateSliderTrack("vertical", -100, 100);
    this.updateSliderTrack("blur", 0, 100);
    this.updateSliderTrack("spread", -100, 100);
    this.updateSliderTrack("opacity", 0, 1);
  }

  updateSliderTrack(name, min, max) {
    const input = this.controls[name];
    const percentage = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.background = `linear-gradient(90deg, #344fbb 0%, #344fbb ${percentage}%, #b8bdd2 ${percentage}%, #b8bdd2 100%)`;
  }

  hexToRgb(hex) {
    const clean = hex.replace("#", "");
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16)
    ].join(", ");
  }

  applyPreset(preset) {
    const presets = {
      soft: { horizontal: 0, vertical: 8, blur: 24, spread: 0, color: "#344fbb", opacity: 0.18, inset: false },
      float: { horizontal: 0, vertical: 18, blur: 28, spread: -4, color: "#20262a", opacity: 0.28, inset: false },
      hard: { horizontal: 10, vertical: 10, blur: 0, spread: 0, color: "#20262a", opacity: 0.8, inset: false },
      inset: { horizontal: 0, vertical: 5, blur: 15, spread: 0, color: "#20262a", opacity: 0.35, inset: true }
    };
    const values = presets[preset];
    if (!values) return;
    Object.entries(values).forEach(([name, value]) => {
      if (name === "inset") this.controls.inset.checked = value;
      else {
        this.controls[name].value = value;
        this.values[name].value = value;
      }
    });
    this.update();
  }

  async copyRules() {
    const text = `box-shadow: ${this.currentRule};\n-webkit-box-shadow: ${this.currentRule};\n-moz-box-shadow: ${this.currentRule};`;
    try {
      await navigator.clipboard.writeText(text);
      this.copyInstructions.textContent = "CSS COPIADO PARA A ÁREA DE TRANSFERÊNCIA.";
    } catch {
      this.copyInstructions.textContent = "NÃO FOI POSSÍVEL COPIAR AUTOMATICAMENTE. SELECIONE O CÓDIGO MANUALMENTE.";
    }
  }
}

new BoxShadowGenerator().initialize();
