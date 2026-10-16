const services = [
  {
    id: "lash-lift",
    number: "01",
    name: "Lash lifting",
    price: 145,
    duration: "1h 15min",
    description: "Curvatura e definição para realçar seus cílios naturais.",
    image:
      "url('https://images.unsplash.com/photo-1583001809873-a128495da465?auto=format&fit=crop&w=700&q=80')",
  },
  {
    id: "volume-brasileiro",
    number: "02",
    name: "Volume brasileiro",
    price: 190,
    duration: "2h",
    description: "Leveza e volume na medida certa para o seu olhar.",
    image:
      "url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80')",
  },
  {
    id: "manutencao",
    number: "03",
    name: "Manutenção",
    price: 120,
    duration: "1h 30min",
    description: "Seu olhar renovado e bonito por mais tempo.",
    image:
      "url('https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=700&q=80')",
  },
];

const timeSlots = ["09:00", "10:30", "13:00", "14:30", "16:00"];
const bookingDialog = document.querySelector("#booking-dialog");
const authDialog = document.querySelector("#auth-dialog");
const bookingForm = document.querySelector("#booking-form");
const serviceSelect = document.querySelector("#booking-service");
const dateOptions = document.querySelector("#date-options");
const timeOptions = document.querySelector("#time-options");
const dateInput = document.querySelector("#booking-date");
const timeInput = document.querySelector("#booking-time");
const bookingPrice = document.querySelector("#booking-price");
const toast = document.querySelector("#toast");
let toastTimeout;
let authMode = "login";

function formatPrice(price) {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function renderServices() {
  const serviceList = document.querySelector("#service-list");

  serviceList.innerHTML = services
    .map(
      (service) => `
        <article class="service-card">
          <div class="service-image" style="background-image: ${service.image}" role="img" aria-label="${service.name}">
            <span class="service-number">${service.number}</span>
          </div>
          <div class="service-content">
            <div class="service-topline">
              <h3>${service.name}</h3>
              <span class="service-price">${formatPrice(service.price)}</span>
            </div>
            <p class="service-description">${service.description}</p>
            <div class="service-footer">
              <span>◷ &nbsp;${service.duration}</span>
              <button class="service-book" type="button" data-service-id="${service.id}">Agendar</button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  serviceSelect.innerHTML = services
    .map(
      (service) =>
        `<option value="${service.id}">${service.name} · ${formatPrice(service.price)} · ${service.duration}</option>`,
    )
    .join("");
}

function getLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderDateOptions() {
  const dates = [];
  const currentDate = new Date();
  const dateCursor = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

  while (dates.length < 7) {
    if (dateCursor.getDay() !== 0) {
      dates.push(new Date(dateCursor));
    }
    dateCursor.setDate(dateCursor.getDate() + 1);
  }

  dateOptions.innerHTML = dates
    .map((date, index) => {
      const dateValue = getLocalDate(date);
      const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
        .format(date)
        .replace(".", "");
      const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date);
      const month = new Intl.DateTimeFormat("pt-BR", { month: "short" })
        .format(date)
        .replace(".", "");
      const selected = index === 0 ? " selected" : "";

      return `<button class="option-button${selected}" type="button" data-date="${dateValue}" aria-pressed="${index === 0}">${weekday}<span>${day} ${month}</span></button>`;
    })
    .join("");

  dateInput.value = getLocalDate(dates[0]);
}

function renderTimeOptions() {
  timeOptions.innerHTML = timeSlots
    .map(
      (time, index) =>
        `<button class="option-button${index === 0 ? " selected" : ""}" type="button" data-time="${time}" aria-pressed="${index === 0}">${time}</button>`,
    )
    .join("");

  timeInput.value = timeSlots[0];
}

function updateBookingPrice() {
  const service = services.find((item) => item.id === serviceSelect.value);
  bookingPrice.textContent = service ? formatPrice(service.price) : "—";
}

function openBooking(serviceId) {
  if (serviceId && services.some((service) => service.id === serviceId)) {
    serviceSelect.value = serviceId;
  }
  updateBookingPrice();
  if (!dateInput.value) renderDateOptions();
  if (!timeInput.value) renderTimeOptions();
  bookingDialog.showModal();
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 4200);
}

function updateAppointment(service, date, time) {
  const appointmentDate = new Date(`${date}T12:00:00`);
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(appointmentDate);
  const title = document.querySelector("#appointment-title");
  const description = document.querySelector("#appointment-description");
  const status = document.querySelector("#appointment-status");

  title.innerHTML = `Seu próximo cuidado<br /><em>está marcado.</em>`;
  description.textContent = `${service.name} · ${formattedDate} às ${time}. Este horário está salvo apenas nesta demonstração.`;
  status.innerHTML = `
    <div class="status-icon" aria-hidden="true">✳</div>
    <span class="status-label">PRÉ-AGENDAMENTO</span>
    <strong>${formattedDate}<br />às ${time}</strong>
    <span class="status-decoration" aria-hidden="true">GO</span>
  `;
}

function setAuthMode(mode) {
  authMode = mode;
  const isRegister = mode === "register";
  const nameInput = document.querySelector("#auth-name");
  const nameLabel = document.querySelector("#auth-name-label");
  const passwordInput = document.querySelector("#auth-password");
  const passwordToggle = document.querySelector("[data-toggle-password]");

  document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
    const isActive = tab.dataset.authMode === mode;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  document.querySelector("#auth-title").innerHTML = isRegister
    ? "Crie sua conta <em>Gabrielly Opuszka.</em>"
    : "Sua conta <em>Gabrielly Opuszka.</em>";
  document.querySelector(".auth-dialog .dialog-heading .eyebrow").innerHTML =
    `<span class="eyebrow-line"></span> ${isRegister ? "SEU MOMENTO COMEÇA AQUI" : "BEM-VINDA DE VOLTA"}`;
  document.querySelector(".auth-dialog .dialog-heading > p:last-child").textContent =
    isRegister ? "Cadastre-se para organizar seus atendimentos." : "Acesse para acompanhar seus horários e cuidados.";
  nameInput.hidden = !isRegister;
  nameLabel.hidden = !isRegister;
  nameInput.required = isRegister;
  passwordInput.autocomplete = isRegister ? "new-password" : "current-password";
  passwordInput.type = "password";
  passwordToggle.hidden = !isRegister;
  passwordToggle.setAttribute("aria-label", "Mostrar senha");
  passwordToggle.setAttribute("aria-pressed", "false");
  passwordToggle.querySelector(".password-eye").hidden = false;
  passwordToggle.querySelector(".password-eye-off").hidden = true;
  document.querySelector("#auth-submit").innerHTML = isRegister
    ? "Criar minha conta <span aria-hidden=\"true\">↗</span>"
    : "Entrar na minha conta <span aria-hidden=\"true\">↗</span>";
}

renderServices();
renderDateOptions();
renderTimeOptions();
updateBookingPrice();

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const passwordToggle = target.closest("[data-toggle-password]");
  if (passwordToggle) {
    const passwordInput = document.querySelector("#auth-password");
    const isVisible = passwordInput.type === "password";
    passwordInput.type = isVisible ? "text" : "password";
    passwordToggle.setAttribute("aria-label", isVisible ? "Ocultar senha" : "Mostrar senha");
    passwordToggle.setAttribute("aria-pressed", String(isVisible));
    passwordToggle.querySelector(".password-eye").hidden = isVisible;
    passwordToggle.querySelector(".password-eye-off").hidden = !isVisible;
    return;
  }

  const serviceButton = target.closest("[data-service-id]");
  if (serviceButton) {
    openBooking(serviceButton.dataset.serviceId);
    return;
  }

  if (target.closest("[data-open-booking]")) {
    openBooking();
    return;
  }

  if (target.closest("[data-open-auth]")) {
    authDialog.showModal();
    return;
  }

  const dateButton = target.closest("[data-date]");
  if (dateButton) {
    dateOptions.querySelectorAll(".option-button").forEach((button) => {
      const selected = button === dateButton;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    dateInput.value = dateButton.dataset.date;
    return;
  }

  const timeButton = target.closest("[data-time]");
  if (timeButton) {
    timeOptions.querySelectorAll(".option-button").forEach((button) => {
      const selected = button === timeButton;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    timeInput.value = timeButton.dataset.time;
    return;
  }

  const authTab = target.closest("[data-auth-mode]");
  if (authTab) {
    setAuthMode(authTab.dataset.authMode);
    return;
  }

  if (target.closest("[data-close-dialog]")) {
    target.closest("dialog").close();
  }
});

serviceSelect.addEventListener("change", updateBookingPrice);

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;

  const service = services.find((item) => item.id === serviceSelect.value);
  const date = dateInput.value;
  const time = timeInput.value;
  if (!service || !date || !time) {
    showToast("Selecione o serviço, o dia e o horário para continuar.");
    return;
  }

  updateAppointment(service, date, time);
  bookingDialog.close();
  showToast("Pré-agendamento salvo nesta demonstração. Para confirmar, conecte o app ao estúdio.");
  document.querySelector("#agendamentos").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#auth-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  showToast(
    authMode === "register"
      ? "Cadastro demonstrativo: a autenticação ainda precisa de um servidor."
      : "Acesso demonstrativo: conecte a autenticação ao servidor para entrar.",
  );
  authDialog.close();
});

[bookingDialog, authDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});
