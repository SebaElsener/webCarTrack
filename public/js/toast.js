function showToast({ text, type = "info", duration = 4000 }) {
  Toastify({
    text,
    duration,
    gravity: "top",
    position: "center",
    offset: {
      x: 0,
      y: 60,
    },
    close: true,
    stopOnFocus: true,
    className: `toast-app toast-${type}`,
  }).showToast();
}

function toastSuccess(text) {
  showToast({ text, type: "success" });
}

function toastError(text) {
  showToast({ text, type: "error" });
}

function toastInfo(text) {
  showToast({ text, type: "info" });
}

function toastWarn(text) {
  showToast({ text, type: "warn" });
}
