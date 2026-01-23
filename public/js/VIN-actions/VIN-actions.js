const vinAction = async (
  actionBtn,
  textConfirm,
  textSuccess,
  textError,
  fetchUrl,
) => {
  const confirmed = await confirmModal({
    body: textConfirm,
  });
  if (!confirmed) return;

  setButtonLoading(actionBtn, true);

  try {
    await fetch(fetchUrl, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        setTimeout(() => {
          toastSuccess(textSuccess + json);
          renderSinDaniosCascada();
        }, 1000);
      });
  } catch (err) {
    console.error(err);
    toastError(textError);
  } finally {
    setButtonLoading(actionBtn, false);
  }
};
