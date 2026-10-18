const services = [
  {
    id: "classico",
    name: "Fio a fio clássico",
    category: "extensao",
    description: "Um efeito delicado e natural para o dia a dia.",
    icon: "✦",
    image: "",
    price: 120,
  },
  {
    id: "brasileiro",
    name: "Volume brasileiro",
    category: "extensao",
    description: "Mais definição e charme para realçar o olhar.",
    icon: "✧",
    image: "",
    price: 120,
  },
  {
    id: "hibrido",
    name: "Volume híbrido",
    category: "extensao",
    description: "O equilíbrio perfeito entre leveza e volume.",
    icon: "❋",
    image: "",
    price: 120,
  },
  {
    id: "russo",
    name: "Volume russo",
    category: "extensao",
    description: "Um olhar marcante com acabamento sofisticado.",
    icon: "✺",
    image: "",
    price: 120,
  },
  {
    id: "manutencao",
    name: "Manutenção",
    category: "manutencao",
    description: "Renove a beleza dos seus fios com todo cuidado.",
    icon: "♡",
    image: "img/cilios1.jpg",
    price: 120,
  },
  {
    id: "remocao",
    name: "Remoção segura",
    category: "cuidados",
    description: "Remoção delicada para proteger seus fios naturais.",
    icon: "❀",
    image: "",
    price: 120,
  },
];

const storageKey = "studio-gabrielly-appointments";
const categoryLabels = {
  extensao: "Extensão",
  manutencao: "Manutenção",
  cuidados: "Cuidados",
};

const serviceGrid = document.querySelector("#service-grid");
const serviceCount = document.querySelector("#service-count");
const bookingDialog = document.querySelector("#booking-dialog");
const appointmentsDialog = document.querySelector("#appointments-dialog");
const bookingForm = document.querySelector("#booking-form");
const bookingSelect = document.querySelector("#booking-service");
const appointmentList = document.querySelector("#appointment-list");
const dateInput = document.querySelector("#booking-date");
const toast = document.querySelector("#toast");

function getAppointments() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Não foi possível ler os agendamentos salvos.", error);
    showToast("Não foi possível carregar os agendamentos salvos neste navegador.");
    return [];
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function renderServices(category = "todos") {
  const visibleServices = category === "todos"
    ? services
    : services.filter((service) => service.category === category);

  serviceGrid.replaceChildren();
  serviceCount.textContent = String(visibleServices.length);

  visibleServices.forEach((service) => {
    const card = document.createElement("article");
    card.className = "service-card";

    const photo = document.createElement("div");
    photo.className = "service-photo";
    if (service.image) {
      const image = document.createElement("img");
      image.src = service.image;
      image.alt = `Foto do serviço ${service.name}`;
      image.loading = "lazy";
      photo.append(image);
    } else {
      photo.classList.add("service-photo-placeholder");
      const placeholderIcon = document.createElement("span");
      placeholderIcon.className = "photo-placeholder-icon";
      placeholderIcon.setAttribute("aria-hidden", "true");
      placeholderIcon.textContent = "＋";
      const placeholderText = document.createElement("span");
      placeholderText.textContent = "Adicione uma foto do serviço";
      photo.append(placeholderIcon, placeholderText);
    }

    const top = document.createElement("div");
    top.className = "service-card-top";

    const icon = document.createElement("span");
    icon.className = "service-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = service.icon;

    const tag = document.createElement("span");
    tag.className = "service-tag";
    tag.textContent = categoryLabels[service.category];

    const title = document.createElement("h3");
    title.textContent = service.name;

    const description = document.createElement("p");
    description.textContent = service.description;

    const price = document.createElement("p");
    price.className = "service-price";
    const priceLabel = document.createElement("span");
    priceLabel.textContent = "Valor";
    const priceValue = document.createElement("strong");
    priceValue.textContent = typeof service.price === "number"
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(service.price)
      : "A confirmar";
    price.append(priceLabel, priceValue);

    const action = document.createElement("button");
    action.className = "service-action";
    action.type = "button";
    action.dataset.bookService = service.id;
    action.innerHTML = 'Agendar <span aria-hidden="true">→</span>';
    action.setAttribute("aria-label", `Agendar ${service.name}`);

    top.append(icon, tag);
    card.append(photo, top, title, description, price, action);
    serviceGrid.append(card);
  });
}

function populateBookingServices(selectedId = "") {
  bookingSelect.replaceChildren();
  services.forEach((service) => {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = service.name;
    option.selected = service.id === selectedId;
    bookingSelect.append(option);
  });
}

function openBooking(serviceId = "") {
  populateBookingServices(serviceId);
  bookingDialog.showModal();
}

function formatAppointmentDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function renderAppointments() {
  const appointments = getAppointments();
  appointmentList.replaceChildren();

  if (appointments.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-appointments";
    emptyMessage.textContent = "Você ainda não tem solicitações salvas. Que tal escolher um serviço?";
    appointmentList.append(emptyMessage);
    return;
  }

  appointments
    .slice()
    .sort((first, second) => `${first.date}T${first.time}`.localeCompare(`${second.date}T${second.time}`))
    .forEach((appointment) => {
      const service = services.find((item) => item.id === appointment.serviceId);
      const entry = document.createElement("article");
      entry.className = "appointment-entry";

      const details = document.createElement("div");
      const name = document.createElement("h3");
      name.textContent = service ? service.name : "Serviço";
      const date = document.createElement("p");
      date.textContent = `${formatAppointmentDate(appointment.date)} às ${appointment.time} · ${appointment.name}`;
      const remove = document.createElement("button");
      remove.className = "appointment-remove";
      remove.type = "button";
      remove.dataset.removeAppointment = appointment.id;
      remove.textContent = "Remover";
      remove.setAttribute("aria-label", `Remover solicitação de ${service ? service.name : "serviço"}`);

      details.append(name, date);
      entry.append(details, remove);
      appointmentList.append(entry);
    });
}

document.querySelectorAll(".category-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const activeTab = document.querySelector(".category-tab.is-active");
    activeTab?.classList.remove("is-active");
    activeTab?.setAttribute("aria-selected", "false");
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    renderServices(tab.dataset.category);
  });
});

document.querySelector("[data-open-booking]").addEventListener("click", () => openBooking());
document.querySelector("[data-open-appointments]").addEventListener("click", () => {
  renderAppointments();
  appointmentsDialog.showModal();
});

serviceGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-book-service]");
  if (button) openBooking(button.dataset.bookService);
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

[bookingDialog, appointmentsDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(bookingForm);
  const appointments = getAppointments();
  appointments.push({
    id: crypto.randomUUID(),
    serviceId: formData.get("service"),
    name: String(formData.get("name")).trim(),
    date: formData.get("date"),
    time: formData.get("time"),
  });

  try {
    localStorage.setItem(storageKey, JSON.stringify(appointments));
  } catch (error) {
    console.error("Não foi possível salvar o agendamento no navegador.", error);
    showToast("Não foi possível salvar. Verifique o espaço disponível no navegador.");
    return;
  }

  bookingForm.reset();
  bookingDialog.close();
  showToast("Solicitação salva neste dispositivo. Confirme o horário com o estúdio.");
});

appointmentList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-appointment]");
  if (!button) return;

  const appointments = getAppointments().filter((appointment) => appointment.id !== button.dataset.removeAppointment);
  try {
    localStorage.setItem(storageKey, JSON.stringify(appointments));
    renderAppointments();
    showToast("Solicitação removida deste dispositivo.");
  } catch (error) {
    console.error("Não foi possível remover o agendamento salvo.", error);
    showToast("Não foi possível atualizar os agendamentos salvos.");
  }
});

dateInput.min = new Date().toISOString().slice(0, 10);
renderServices();
populateBookingServices();
