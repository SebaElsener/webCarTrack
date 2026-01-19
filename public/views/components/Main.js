const rootElement = document.getElementById("root");
const user = rootElement.dataset.user
  ? JSON.parse(rootElement.dataset.user)
  : null;
const admin = rootElement.dataset.admin
  ? JSON.parse(rootElement.dataset.admin)
  : null;

const root = ReactDOM.createRoot(rootElement);

root.render(<Home user={user} admin={admin} />);
