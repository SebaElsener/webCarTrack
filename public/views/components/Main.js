const rootElement = document.getElementById("root");
const user = rootElement.dataset.user
  ? JSON.parse(rootElement.dataset.user)
  : null;
const permissions = rootElement.dataset.permissions
  ? JSON.parse(rootElement.dataset.permissions)
  : null;

const root = ReactDOM.createRoot(rootElement);

root.render(<Home user={user} permissions={permissions} />);
