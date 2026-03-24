const originalFetch = window.fetch;

let isRedirecting = false;

window.fetch = async (url, options = {}) => {
  const res = await originalFetch(url, {
    credentials: "include",
    ...options,
  });

  if (res.status === 401 && !isRedirecting) {
    isRedirecting = true;

    let data = null;

    try {
      data = await res.clone().json();
    } catch {}

    if (data?.error === "session_expired") {
      window.location.href = "/api/timeout";
    } else {
      window.location.href = "/";
    }

    // 🔴 en vez de return
    throw new Error("UNAUTHORIZED");
  }

  return res;
};
